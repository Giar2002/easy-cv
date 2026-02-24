import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient, hasSupabaseServerEnv } from '@/lib/supabase/server';

const ANON_COOKIE_NAME = 'easycv_anon_id';
const USAGE_TABLE = process.env.SUPABASE_AI_USAGE_TABLE || 'ai_usage_daily';
const FREE_DAILY_DOWNLOAD_LIMIT = Number(process.env.FREE_DAILY_DOWNLOAD_LIMIT || 1);
const DOWNLOAD_LIMIT_SAFE =
    Number.isFinite(FREE_DAILY_DOWNLOAD_LIMIT) && FREE_DAILY_DOWNLOAD_LIMIT > 0
        ? Math.min(Math.floor(FREE_DAILY_DOWNLOAD_LIMIT), 20)
        : 1;
const ALLOW_CLIENT_PREMIUM_SIM = process.env.DOWNLOAD_ALLOW_CLIENT_PREMIUM_SIM !== 'false';

function getTodayUtc(): string {
    return new Date().toISOString().slice(0, 10);
}

function buildAnonId(seed?: string): { anonId: string; shouldSetCookie: boolean } {
    const safeSeed = (seed || '').trim();
    if (safeSeed && /^[a-zA-Z0-9_-]{8,64}$/.test(safeSeed)) {
        return { anonId: safeSeed, shouldSetCookie: false };
    }
    return { anonId: crypto.randomUUID().replace(/-/g, ''), shouldSetCookie: true };
}

function withAnonCookie(
    response: NextResponse,
    anonId: string,
    shouldSetCookie: boolean
): NextResponse {
    if (shouldSetCookie) {
        response.cookies.set({
            name: ANON_COOKIE_NAME,
            value: anonId,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 365,
            path: '/',
        });
    }
    return response;
}

function isPremiumRequest(rawValue: unknown): boolean {
    if (!ALLOW_CLIENT_PREMIUM_SIM) return false;
    return rawValue === true;
}

type DownloadQuotaResult =
    | { ok: true; remaining: number | null; warning?: string }
    | { ok: false; message: string };

async function consumeDownloadQuota(anonId: string, isEn: boolean): Promise<DownloadQuotaResult> {
    if (!hasSupabaseServerEnv()) {
        return {
            ok: true,
            remaining: null,
            warning: 'Supabase not configured for download quota; allowing download.',
        };
    }

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
        return {
            ok: true,
            remaining: null,
            warning: 'Supabase client init failed for download quota; allowing download.',
        };
    }

    const today = getTodayUtc();
    const { data: existing, error: readError } = await supabase
        .from(USAGE_TABLE)
        .select('download_requests')
        .eq('anon_id', anonId)
        .eq('usage_date', today)
        .maybeSingle();

    if (readError) {
        const missingColumn = readError.message.includes('download_requests');
        return {
            ok: true,
            remaining: null,
            warning: missingColumn
                ? 'Missing column download_requests. Re-run supabase/ai_usage_daily.sql.'
                : `Download quota read error: ${readError.message}`,
        };
    }

    if (!existing) {
        const { error: insertError } = await supabase.from(USAGE_TABLE).insert({
            anon_id: anonId,
            usage_date: today,
            requests: 0,
            download_requests: 1,
        });

        if (insertError) {
            return {
                ok: true,
                remaining: null,
                warning: `Download quota insert error: ${insertError.message}`,
            };
        }

        return { ok: true, remaining: Math.max(0, DOWNLOAD_LIMIT_SAFE - 1) };
    }

    const current = Number(existing.download_requests) || 0;
    if (current >= DOWNLOAD_LIMIT_SAFE) {
        return {
            ok: false,
            message: isEn
                ? `Free limit reached: ${DOWNLOAD_LIMIT_SAFE} PDF download/day. Upgrade for unlimited.`
                : `Batas gratis tercapai: ${DOWNLOAD_LIMIT_SAFE} download PDF/hari. Upgrade untuk unlimited.`,
        };
    }

    const next = current + 1;
    const { error: updateError } = await supabase
        .from(USAGE_TABLE)
        .update({ download_requests: next })
        .eq('anon_id', anonId)
        .eq('usage_date', today);

    if (updateError) {
        return {
            ok: true,
            remaining: null,
            warning: `Download quota update error: ${updateError.message}`,
        };
    }

    return { ok: true, remaining: Math.max(0, DOWNLOAD_LIMIT_SAFE - next) };
}

export async function POST(req: NextRequest) {
    try {
        const { anonId, shouldSetCookie } = buildAnonId(req.cookies.get(ANON_COOKIE_NAME)?.value);
        const payload = await req.json().catch(() => ({}));
        const isPremiumUser = isPremiumRequest(payload?.isPremiumUser);
        const isEn = payload?.language === 'en';

        if (isPremiumUser) {
            return withAnonCookie(
                NextResponse.json({ allowed: true, premium: true, remaining: null }),
                anonId,
                shouldSetCookie
            );
        }

        const quota = await consumeDownloadQuota(anonId, isEn);
        if (!quota.ok) {
            return withAnonCookie(
                NextResponse.json({ allowed: false, error: quota.message }, { status: 429 }),
                anonId,
                shouldSetCookie
            );
        }

        if (quota.warning) {
            console.warn('[Download quota] fallback mode:', quota.warning);
        }

        return withAnonCookie(
            NextResponse.json({ allowed: true, premium: false, remaining: quota.remaining }),
            anonId,
            shouldSetCookie
        );
    } catch (error) {
        const message =
            error instanceof Error && error.message
                ? error.message
                : 'Failed to validate download quota.';
        return NextResponse.json({ allowed: false, error: message }, { status: 500 });
    }
}
