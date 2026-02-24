import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient, hasSupabaseServerEnv, resolveServerPlan } from '@/lib/supabase/server';

const FEEDBACK_TABLE = process.env.SUPABASE_FEEDBACK_TABLE || 'cv_feedback';
const ANON_COOKIE_NAME = 'easycv_anon_id';

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

export async function POST(req: NextRequest) {
    const { anonId, shouldSetCookie } = buildAnonId(req.cookies.get(ANON_COOKIE_NAME)?.value);
    try {
        const payload = await req.json().catch(() => ({}));
        const message = typeof payload?.message === 'string' ? payload.message.trim() : '';
        const source = typeof payload?.source === 'string' ? payload.source.trim() : 'builder';
        const language = typeof payload?.language === 'string' ? payload.language : 'en';
        const ratingRaw = Number(payload?.rating);
        const rating = Number.isFinite(ratingRaw) ? Math.max(1, Math.min(5, Math.floor(ratingRaw))) : 5;

        if (!hasSupabaseServerEnv()) {
            return withAnonCookie(
                NextResponse.json({ ok: true, stored: false, warning: 'Supabase not configured.' }),
                anonId,
                shouldSetCookie
            );
        }

        const plan = await resolveServerPlan(req);
        const supabase = getSupabaseServiceClient();
        if (!supabase) {
            return withAnonCookie(
                NextResponse.json({ ok: true, stored: false, warning: 'Supabase client unavailable.' }),
                anonId,
                shouldSetCookie
            );
        }

        const { error } = await supabase.from(FEEDBACK_TABLE).insert({
            anon_id: anonId,
            user_id: plan.userId,
            rating,
            message,
            source,
            language,
            user_agent: req.headers.get('user-agent') || null,
        });

        if (error) {
            return withAnonCookie(
                NextResponse.json({ ok: true, stored: false, warning: error.message }),
                anonId,
                shouldSetCookie
            );
        }

        return withAnonCookie(NextResponse.json({ ok: true, stored: true }), anonId, shouldSetCookie);
    } catch {
        return withAnonCookie(
            NextResponse.json({ ok: false, error: 'Failed to save feedback.' }, { status: 500 }),
            anonId,
            shouldSetCookie
        );
    }
}
