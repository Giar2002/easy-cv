'use client';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export async function getSupabaseAuthHeader(): Promise<Record<string, string>> {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return {};

    try {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        if (!token) return {};
        return { Authorization: `Bearer ${token}` };
    } catch {
        return {};
    }
}
