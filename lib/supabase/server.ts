import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const SUBSCRIPTIONS_TABLE = process.env.SUPABASE_SUBSCRIPTIONS_TABLE || 'user_subscriptions';
const PREMIUM_TEST_EMAILS = (process.env.PREMIUM_TEST_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);

function getServerEnv() {
    return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
}

export function hasSupabaseServerEnv(): boolean {
    const { url, serviceRole } = getServerEnv();
    return Boolean(url && serviceRole);
}

export function getSupabaseServiceClient(): SupabaseClient | null {
    const { url, serviceRole } = getServerEnv();
    if (!url || !serviceRole) return null;

    return createClient(url, serviceRole, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}

function getBearerToken(req: NextRequest): string | null {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader) return null;
    const [scheme, token] = authHeader.split(' ');
    if (!scheme || !token) return null;
    if (scheme.toLowerCase() !== 'bearer') return null;
    return token.trim() || null;
}

export type ServerPlanResult = {
    isPremium: boolean;
    tier: 'free' | 'pro-daily' | 'premium-monthly';
    subscriptionPlan: string | null;
    userId: string | null;
    reason: 'server-premium' | 'server-free' | 'no-token' | 'unavailable' | 'error';
};

function resolveTierFromPlan(plan: unknown): 'free' | 'pro-daily' | 'premium-monthly' {
    const normalized = String(plan || '').trim().toLowerCase();
    if (normalized === 'pro') return 'pro-daily';
    if (normalized === 'premium' || normalized === 'business') return 'premium-monthly';
    return 'free';
}

export async function resolveServerPlan(req: NextRequest): Promise<ServerPlanResult> {
    if (!hasSupabaseServerEnv()) {
        return { isPremium: false, tier: 'free', subscriptionPlan: null, userId: null, reason: 'unavailable' };
    }

    const token = getBearerToken(req);
    if (!token) {
        return { isPremium: false, tier: 'free', subscriptionPlan: null, userId: null, reason: 'no-token' };
    }

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
        return { isPremium: false, tier: 'free', subscriptionPlan: null, userId: null, reason: 'unavailable' };
    }

    try {
        const { data: authData, error: userError } = await supabase.auth.getUser(token);
        if (userError || !authData?.user?.id) {
            return { isPremium: false, tier: 'free', subscriptionPlan: null, userId: null, reason: 'error' };
        }

        const userId = authData.user.id;
        const userEmail = String(authData.user.email || '').toLowerCase();
        if (userEmail && PREMIUM_TEST_EMAILS.includes(userEmail)) {
            return { isPremium: true, tier: 'premium-monthly', subscriptionPlan: 'premium-test', userId, reason: 'server-premium' };
        }

        const { data: subData, error: subError } = await supabase
            .from(SUBSCRIPTIONS_TABLE)
            .select('plan,status,current_period_end')
            .eq('user_id', userId)
            .maybeSingle();

        if (subError || !subData) {
            return { isPremium: false, tier: 'free', subscriptionPlan: null, userId, reason: 'server-free' };
        }

        const subscriptionPlan = String(subData.plan || '').toLowerCase() || null;
        const status = String(subData.status || '').toLowerCase();
        const allowedStatus = status === 'active' || status === 'trialing';
        const periodEnd = subData.current_period_end ? new Date(subData.current_period_end).getTime() : null;
        const notExpired = periodEnd === null || Number.isNaN(periodEnd) || periodEnd >= Date.now();

        if (allowedStatus && notExpired) {
            const tier = resolveTierFromPlan(subData.plan);
            const isPremium = tier !== 'free';
            return { isPremium, tier, subscriptionPlan, userId, reason: isPremium ? 'server-premium' : 'server-free' };
        }

        return { isPremium: false, tier: 'free', subscriptionPlan, userId, reason: 'server-free' };
    } catch {
        return { isPremium: false, tier: 'free', subscriptionPlan: null, userId: null, reason: 'error' };
    }
}
