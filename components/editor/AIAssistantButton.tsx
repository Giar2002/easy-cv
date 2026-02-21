'use client';

import { useState } from 'react';
import { Sparkles, Check, Wand2, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface AIAssistantButtonProps {
    value: string;
    onApply: (newValue: string) => void;
}

export default function AIAssistantButton({ value, onApply }: AIAssistantButtonProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [open, setOpen] = useState(false);

    const handleAction = async (action: 'grammar' | 'enhance') => {
        const strippedValue = value.replace(/<[^>]*>?/gm, '').trim();
        if (!strippedValue) return;

        if (strippedValue.length > 2000) {
            toast.error('Teks terlalu panjang (Maksimal 2000 karakter)');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: value, action: action })
            });
            const data = await res.json();

            if (res.status === 429) {
                toast.error(data.error || 'Terlalu banyak permintaan. Silakan tunggu sebentar.');
            } else if (data.result) {
                setResult(data.result);
                setOpen(true);
            } else if (data.error) {
                toast.error('AI Error: ' + data.error);
            }
        } catch (e) {
            toast.error('Gagal menghubungi AI Server');
        }
        setLoading(false);
    };

    return (
        <div style={{ position: 'relative', display: 'inline-flex', marginLeft: 'auto' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" onClick={() => handleAction('grammar')} disabled={loading || !value.replace(/<[^>]*>?/gm, '').trim()} className="btn-ai" title="Tata Bahasa">
                    {loading ? <Loader2 size={12} className="spin" /> : <Check size={12} />} Fix
                </button>
                <button type="button" onClick={() => handleAction('enhance')} disabled={loading || !value.replace(/<[^>]*>?/gm, '').trim()} className="btn-ai" title="Percantik">
                    {loading ? <Loader2 size={12} className="spin" /> : <Wand2 size={12} />} Enhance
                </button>
            </div>

            {open && (
                <div className="ai-dropdown">
                    <div className="ai-dropdown-header">
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Sparkles size={12} /> Saran AI
                        </span>
                        <button type="button" onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}><X size={14} /></button>
                    </div>
                    <div className="ai-dropdown-body" dangerouslySetInnerHTML={{ __html: result }} />
                    <div className="ai-dropdown-footer">
                        <button type="button" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => { onApply(result); setOpen(false); }}>Ganti Teks Asli</button>
                    </div>
                </div>
            )}
        </div>
    );
}
