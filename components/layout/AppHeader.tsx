'use client';

import { useState, useEffect, useRef } from 'react';
import { useCVStore } from '@/store/useCVStore';
import { getTranslations } from '@/lib/i18n';
import AIImportModal from '@/components/modals/AIImportModal';
import ResetModal from '@/components/modals/ResetModal';
import toast from 'react-hot-toast';
import { isPlanLimitMessage } from '@/lib/planLimit';
import { useUpgradeModalStore } from '@/store/useUpgradeModalStore';

export default function AppHeader() {
    const settings = useCVStore(s => s.settings);
    const setSettings = useCVStore(s => s.setSettings);
    const language = settings.language;
    const t = getTranslations(language);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [downloadChecking, setDownloadChecking] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const openUpgradeModal = useUpgradeModalStore(s => s.openModal);

    function toggleLanguage() {
        setSettings({ language: settings.language === 'en' ? 'id' : 'en' });
    }

    function toggleTheme() {
        setSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
    }

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', settings.theme || 'light');
    }, [settings.theme]);

    function handleReset() {
        setShowResetModal(true);
    }

    async function handleDownloadPDF() {
        if (downloadChecking) return;
        setDownloadChecking(true);
        try {
            const res = await fetch('/api/download-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isPremiumUser: Boolean(settings.isPremiumUser),
                    language: settings.language || 'en',
                }),
            });
            const data = await res.json();

            if (!res.ok || !data?.allowed) {
                const errorMessage =
                    data?.error ||
                    (language === 'en'
                        ? 'Download blocked by current plan limit.'
                        : 'Download diblokir oleh limit paket saat ini.');
                toast.error(errorMessage);
                if (res.status === 429 && isPlanLimitMessage(errorMessage)) {
                    openUpgradeModal('download', errorMessage);
                }
                return;
            }

            window.print();
            if (!data?.premium && typeof data?.remaining === 'number' && data.remaining >= 0) {
                toast.success(
                    language === 'en'
                        ? `Download success. Remaining free downloads today: ${data.remaining}.`
                        : `Download berhasil. Sisa download gratis hari ini: ${data.remaining}.`
                );
            }
        } catch {
            toast.error(
                language === 'en'
                    ? 'Failed to validate download quota.'
                    : 'Gagal memvalidasi kuota download.'
            );
        } finally {
            setDownloadChecking(false);
        }
    }

    function handleExportJson() {
        const state = useCVStore.getState();
        const exportData = {
            personal: state.personal,
            experience: state.experience,
            education: state.education,
            skills: state.skills,
            projects: state.projects,
            certifications: state.certifications,
            languages: state.languages,
            settings: state.settings
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "cv-data.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    useEffect(() => {
        if (!isMobileMenuOpen) return;
        const onPointerDown = (event: MouseEvent) => {
            if (!mobileMenuRef.current) return;
            if (!mobileMenuRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };
        const onEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsMobileMenuOpen(false);
        };

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onEscape);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onEscape);
        };
    }, [isMobileMenuOpen]);

    return (
        <>
            <header className="app-header">
                <div className="header-content">
                    <a href="/" className="logo" style={{ textDecoration: 'none' }}>
                        <div className="logo-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                        </div>
                        <h1>EasY CV</h1>
                    </a>
                    <div className="header-actions">
                        <button className="btn btn-ghost" onClick={toggleTheme} title={settings.theme === 'light' ? 'Beralih ke Mode Gelap' : 'Switch to Light Mode'}>
                            {settings.theme === 'light' ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="5"></circle>
                                    <line x1="12" y1="1" x2="12" y2="3"></line>
                                    <line x1="12" y1="21" x2="12" y2="23"></line>
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                    <line x1="1" y1="12" x2="3" y2="12"></line>
                                    <line x1="21" y1="12" x2="23" y2="12"></line>
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                                </svg>
                            )}
                            <span className="btn-label">{language === 'en' ? 'Theme' : 'Tema'}</span>
                        </button>
                        <button className="btn btn-ghost btn-language" onClick={toggleLanguage} title={settings.language === 'en' ? 'Switch to Indonesian' : 'Ganti ke Bahasa Inggris'}>
                            <span className="btn-emoji">{settings.language === 'en' ? '🇬🇧' : '🇮🇩'}</span>
                            <span className="btn-label">{settings.language === 'en' ? 'EN' : 'ID'}</span>
                        </button>
                        <button className="btn btn-ghost btn-hide-mobile" onClick={handleReset} title={t.resetCVData}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            <span className="btn-label">Reset</span>
                        </button>
                        <button className="btn btn-secondary btn-hide-mobile" onClick={() => setShowImportModal(true)} title={t.importJson}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span className="btn-label">Import Json</span>
                        </button>
                        <button className="btn btn-secondary btn-hide-mobile" onClick={handleExportJson} title={t.exportJson}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <span className="btn-label">Export Json</span>
                        </button>
                        <a className="btn btn-ghost btn-hide-mobile" href="/pricing">
                            <span className="btn-label">{language === 'en' ? 'Pricing' : 'Harga'}</span>
                        </a>
                        <button id="btn-download-pdf" className="btn btn-primary btn-download-pdf" onClick={handleDownloadPDF} disabled={downloadChecking}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span className="btn-label">
                                {downloadChecking ? (language === 'en' ? 'Checking...' : 'Memeriksa...') : t.downloadPdf}
                            </span>
                        </button>
                        <div ref={mobileMenuRef} className="header-mobile-menu-wrap">
                            <button
                                className="btn btn-ghost header-more-btn"
                                type="button"
                                title={language === 'en' ? 'More actions' : 'Aksi lainnya'}
                                aria-expanded={isMobileMenuOpen}
                                onClick={() => setIsMobileMenuOpen(v => !v)}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <circle cx="12" cy="5" r="1.8" />
                                    <circle cx="12" cy="12" r="1.8" />
                                    <circle cx="12" cy="19" r="1.8" />
                                </svg>
                            </button>
                            <div className={`header-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                                <button
                                    className="btn btn-ghost"
                                    type="button"
                                    onClick={() => { window.location.href = '/pricing'; setIsMobileMenuOpen(false); }}
                                >
                                    <span>{language === 'en' ? 'Pricing' : 'Harga'}</span>
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    type="button"
                                    onClick={() => { handleReset(); setIsMobileMenuOpen(false); }}
                                >
                                    <span>{language === 'en' ? 'Reset Data' : 'Reset Data'}</span>
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    type="button"
                                    onClick={() => { setShowImportModal(true); setIsMobileMenuOpen(false); }}
                                >
                                    <span>Import Json</span>
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    type="button"
                                    onClick={() => { handleExportJson(); setIsMobileMenuOpen(false); }}
                                >
                                    <span>Export Json</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            {showImportModal && <AIImportModal onClose={() => setShowImportModal(false)} />}
            {showResetModal && <ResetModal onClose={() => setShowResetModal(false)} />}
        </>
    );
}
