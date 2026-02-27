'use client';

import Link from 'next/link';
import { useUpgradeModalStore } from '@/store/useUpgradeModalStore';
import { useCVStore } from '@/store/useCVStore';

export default function UpgradeModal() {
    const { isOpen, source, message, closeModal } = useUpgradeModalStore();
    const language = useCVStore(s => s.settings.language) || 'en';
    const isEn = language === 'en';

    if (!isOpen) return null;

    const sourceLabel = isEn
        ? source === 'ai'
            ? 'AI limit reached'
            : source === 'download'
                ? 'Download limit reached'
                : source === 'template'
                    ? 'Premium template'
                    : 'Upgrade required'
        : source === 'ai'
            ? 'Limit AI tercapai'
            : source === 'download'
                ? 'Limit download tercapai'
                : source === 'template'
                    ? 'Template premium'
                    : 'Perlu upgrade';

    return (
        <div className="upgrade-modal-wrap" style={{ display: 'flex' }}>
            <div className="modal-overlay" onClick={closeModal} />
            <div className="modal-content upgrade-modal-content">
                <div className="modal-header">
                    <h3>{isEn ? 'Choose Your Plan' : 'Pilih Paket Anda'}</h3>
                    <button className="modal-close" onClick={closeModal}>×</button>
                </div>
                <div className="modal-body">
                    <div className="upgrade-pill">{sourceLabel}</div>
                    {message && <p className="upgrade-message">{message}</p>}
                    <div className="upgrade-compare">
                        <div className="upgrade-col">
                            <h4>{isEn ? 'Free' : 'Gratis'}</h4>
                            <ul>
                                <li>{isEn ? '1 active CV' : '1 CV aktif'}</li>
                                <li>{isEn ? 'AI quota 1/2/2 per day' : 'Kuota AI 1/2/2 per hari'}</li>
                                <li>{isEn ? '1 PDF/month (login required)' : '1 PDF/bulan (wajib login)'}</li>
                                <li>{isEn ? 'Standard templates only' : 'Hanya template standar'}</li>
                            </ul>
                        </div>
                        <div className="upgrade-col featured">
                            <h4>{isEn ? 'Pro Daily' : 'Pro Harian'}</h4>
                            <ul>
                                <li>{isEn ? 'All templates unlocked' : 'Semua template terbuka'}</li>
                                <li>{isEn ? 'Unlimited AI usage' : 'Akses AI tanpa batas'}</li>
                                <li>{isEn ? 'Limited PDF/day (default 3)' : 'PDF harian terbatas (default 3)'}</li>
                                <li>{isEn ? 'Best for short-term use' : 'Cocok untuk pemakaian singkat'}</li>
                            </ul>
                        </div>
                        <div className="upgrade-col">
                            <h4>{isEn ? 'Premium Monthly' : 'Premium Bulanan'}</h4>
                            <ul>
                                <li>{isEn ? 'Up to 10 CVs' : 'Maks 10 CV'}</li>
                                <li>{isEn ? 'Unlimited AI usage' : 'Akses AI tanpa batas'}</li>
                                <li>{isEn ? 'Unlimited PDF downloads' : 'Download PDF tanpa batas'}</li>
                                <li>{isEn ? 'ATS + premium templates' : 'Template ATS + premium'}</li>
                            </ul>
                        </div>
                    </div>
                    <div className="upgrade-actions">
                        <button className="btn btn-ghost" onClick={closeModal}>
                            {isEn ? 'Later' : 'Nanti'}
                        </button>
                        <Link href="/pricing" className="btn btn-primary" onClick={closeModal}>
                            {isEn ? 'See Pricing' : 'Lihat Harga'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
