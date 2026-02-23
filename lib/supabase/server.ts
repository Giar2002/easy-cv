import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
