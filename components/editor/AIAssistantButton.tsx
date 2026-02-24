'use client';

import { useState } from 'react';
import { Sparkles, Check, Wand2, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCVStore } from '@/store/useCVStore';
import { isPlanLimitMessage } from '@/lib/planLimit';
import { useUpgradeModalStore } from '@/store/useUpgradeModalStore';
import { getSupabaseAuthHeader } from '@/lib/supabase/authHeader';

interface AIAssistantButtonProps {
    value: string;
    onApply: (newValue: string) => void;
    feature?: 'summary' | 'experience' | 'survey' | 'skills' | 'project' | 'general';
}

export default function AIAssistantButton({ value, onApply, feature = 'general' }: AIAssistantButtonProps) {
    const language = useCVStore(s => s.settings.language) || 'id';
    const isPremiumUser = Boolean(useCVStore(s => s.settings.isPremiumUser));
    const openUpgradeModal = useUpgradeModalStore(s => s.openModal);
    const isEn = language === 'en';
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [open, setOpen] = useState(false);
    const ui = {
        tooLong: isEn ? 'Text is too long (max 2000 characters).' : 'Teks terlalu panjang (maksimal 2000 karakter).',
        tooManyReq: isEn ? 'Too many requests. Please wait a moment.' : 'Terlalu banyak permintaan. Silakan tunggu sebentar.',
        serverError: isEn ? 'Failed to reach AI server.' : 'Gagal menghubungi AI server.',
        grammarTitle: isEn ? 'Grammar' : 'Tata Bahasa',
        enhanceTitle: isEn ? 'Enhance' : 'Percantik',
        panelTitle: isEn ? 'AI Suggestions' : 'Saran AI',
        apply: isEn ? 'Replace Original Text' : 'Ganti Teks Asli',
    };

    const handleAction = async (action: 'grammar' | 'enhance') => {
        const strippedValue = value.replace(/<[^>]*>?/gm, '').trim();
        if (!strippedValue) return;

        if (strippedValue.length > 2000) {
            toast.error(ui.tooLong);
            return;
        }

        setOpen(false);
        setLoading(true);
        try {
            const authHeader = await getSupabaseAuthHeader();
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeader },
                body: JSON.stringify({ text: value, action: action, feature, isPremiumUser })
            });
            const data = await res.json();

            if (res.status === 429) {
                const errorMessage = data.error || ui.tooManyReq;
                toast.error(errorMessage);
                if (isPlanLimitMessage(errorMessage)) {
                    openUpgradeModal('ai', errorMessage);
                }
            } else if (data.result) {
                setResult(data.result);
                setOpen(true);
            } else if (data.error) {
                toast.error('AI Error: ' + data.error);
            }
        } catch {
            toast.error(ui.serverError);
        }
        setLoading(false);
    };

    function applySuggestion() {
        const nextValue = result;
        setOpen(false);
        setResult('');
        onApply(nextValue);
    }

    return (
        <div style={{ position: 'relative', display: 'inline-flex', marginLeft: 'auto' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" onClick={() => handleAction('grammar')} disabled={loading || !value.replace(/<[^>]*>?/gm, '').trim()} className="btn-ai" title={ui.grammarTitle}>
                    {loading ? <Loader2 size={12} className="spin" /> : <Check size={12} />} Fix
                </button>
                <button type="button" onClick={() => handleAction('enhance')} disabled={loading || !value.replace(/<[^>]*>?/gm, '').trim()} className="btn-ai" title={ui.enhanceTitle}>
                    {loading ? <Loader2 size={12} className="spin" /> : <Wand2 size={12} />} Enhance
                </button>
            </div>

            {open && (
                <div className="ai-dropdown">
                    <div className="ai-dropdown-header">
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Sparkles size={12} /> {ui.panelTitle}
                        </span>
                        <button type="button" onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}><X size={14} /></button>
                    </div>
                    <div className="ai-dropdown-body" dangerouslySetInnerHTML={{ __html: result }} />
                    <div className="ai-dropdown-footer">
                        <button type="button" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={applySuggestion}>{ui.apply}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
