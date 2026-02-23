import { createClient, SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null | undefined;

function getPublicEnv() {
    return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
}

export function hasSupabaseClientEnv(): boolean {
    const { url, anonKey } = getPublicEnv();
    return Boolean(url && anonKey);
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
    const { url, anonKey } = getPublicEnv();
    if (!url || !anonKey) return null;

    if (browserClient !== undefined) return browserClient;
    browserClient = createClient(url, anonKey);
    return browserClient;
}
