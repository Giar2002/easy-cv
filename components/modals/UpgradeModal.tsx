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
                    <h3>{isEn ? 'Unlock Pro Features' : 'Buka Fitur Pro'}</h3>
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
                                <li>{isEn ? 'Limited AI quota' : 'Kuota AI terbatas'}</li>
                                <li>{isEn ? '1 PDF/day' : '1 PDF/hari'}</li>
                            </ul>
                        </div>
                        <div className="upgrade-col featured">
                            <h4>Pro</h4>
                            <ul>
                                <li>{isEn ? 'Up to 10 CVs' : 'Maks 10 CV'}</li>
                                <li>{isEn ? 'Higher AI limit' : 'Limit AI lebih tinggi'}</li>
                                <li>{isEn ? 'Unlimited PDF' : 'PDF tanpa batas'}</li>
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
