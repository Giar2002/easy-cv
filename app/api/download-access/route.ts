import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient, hasSupabaseServerEnv, resolveServerPlan } from '@/lib/supabase/server';

const DOWNLOAD_USAGE_TABLE = process.env.SUPABASE_DOWNLOAD_USAGE_TABLE || 'download_usage_monthly';
const FREE_MONTHLY_DOWNLOAD_LIMIT = Number(
    process.env.FREE_MONTHLY_DOWNLOAD_LIMIT || process.env.FREE_DAILY_DOWNLOAD_LIMIT || 1
);
const DOWNLOAD_LIMIT_SAFE =
    Number.isFinite(FREE_MONTHLY_DOWNLOAD_LIMIT) && FREE_MONTHLY_DOWNLOAD_LIMIT > 0
        ? Math.min(Math.floor(FREE_MONTHLY_DOWNLOAD_LIMIT), 20)
        : 1;

function getMonthUtc(): string {
    return `${new Date().toISOString().slice(0, 7)}-01`;
}

type DownloadQuotaResult =
    | { ok: true; remaining: number }
    | { ok: false; status: 429 | 503; message: string };

function infraError(isEn: boolean): DownloadQuotaResult {
    return {
        ok: false,
        status: 503,
        message: isEn
            ? 'Download quota service is unavailable. Please try again later.'
            : 'Layanan kuota download sedang tidak tersedia. Coba lagi nanti.',
    };
}

async function consumeMonthlyDownloadQuota(userId: string, isEn: boolean): Promise<DownloadQuotaResult> {
    if (!hasSupabaseServerEnv()) {
        return infraError(isEn);
    }

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
        return infraError(isEn);
    }

    const month = getMonthUtc();
    const { data: existing, error: readError } = await supabase
        .from(DOWNLOAD_USAGE_TABLE)
        .select('requests')
        .eq('user_id', userId)
        .eq('usage_month', month)
        .maybeSingle();

    if (readError) {
        return infraError(isEn);
    }

    if (!existing) {
        const { error: insertError } = await supabase.from(DOWNLOAD_USAGE_TABLE).insert({
            user_id: userId,
            usage_month: month,
            requests: 1,
        });

        if (insertError) {
            return infraError(isEn);
        }

        return { ok: true, remaining: Math.max(0, DOWNLOAD_LIMIT_SAFE - 1) };
    }

    const current = Number(existing.requests) || 0;
    if (current >= DOWNLOAD_LIMIT_SAFE) {
        return {
            ok: false,
            status: 429,
            message: isEn
                ? `Free limit reached: ${DOWNLOAD_LIMIT_SAFE} PDF download/month. Upgrade for unlimited downloads.`
                : `Batas gratis tercapai: ${DOWNLOAD_LIMIT_SAFE} download PDF/bulan. Upgrade untuk download tanpa batas.`,
        };
    }

    const next = current + 1;
    const { error: updateError } = await supabase
        .from(DOWNLOAD_USAGE_TABLE)
        .update({ requests: next })
        .eq('user_id', userId)
        .eq('usage_month', month);

    if (updateError) {
        return infraError(isEn);
    }

    return { ok: true, remaining: Math.max(0, DOWNLOAD_LIMIT_SAFE - next) };
}

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json().catch(() => ({}));
        const isEn = payload?.language === 'en';

        const serverPlan = await resolveServerPlan(req);

        if (serverPlan.reason === 'unavailable') {
            return NextResponse.json(
                {
                    allowed: false,
                    error: isEn
                        ? 'Download service is not configured yet. Please contact admin.'
                        : 'Layanan download belum dikonfigurasi. Hubungi admin.',
                },
                { status: 503 }
            );
        }

        if (!serverPlan.userId) {
            return NextResponse.json(
                {
                    allowed: false,
                    error: isEn
                        ? 'Please login first to download your CV.'
                        : 'Silakan login dulu untuk download CV.',
                },
                { status: 401 }
            );
        }

        if (serverPlan.isPremium) {
            return NextResponse.json({ allowed: true, premium: true, remaining: null, source: serverPlan.reason });
        }

        const quota = await consumeMonthlyDownloadQuota(serverPlan.userId, isEn);
        if (!quota.ok) {
            return NextResponse.json({ allowed: false, error: quota.message }, { status: quota.status });
        }

        return NextResponse.json({ allowed: true, premium: false, remaining: quota.remaining, period: 'monthly' });
    } catch (error) {
        const message =
            error instanceof Error && error.message
                ? error.message
                : 'Failed to validate download quota.';
        return NextResponse.json({ allowed: false, error: message }, { status: 500 });
    }
}
