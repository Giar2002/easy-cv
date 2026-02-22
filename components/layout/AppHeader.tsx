'use client';

import { useState, useEffect } from 'react';
import { useCVStore } from '@/store/useCVStore';
import { getTranslations } from '@/lib/i18n';
import AIImportModal from '@/components/modals/AIImportModal';
import ResetModal from '@/components/modals/ResetModal';

export default function AppHeader() {
    const settings = useCVStore(s => s.settings);
    const setSettings = useCVStore(s => s.setSettings);
    const language = settings.language;
    const t = getTranslations(language);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);

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

    function handleDownloadPDF() {
        window.print();
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
                        </button>
                        <button className="btn btn-ghost" onClick={toggleLanguage} title={settings.language === 'en' ? 'Switch to Indonesian' : 'Ganti ke Bahasa Inggris'}>
                            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{settings.language === 'en' ? '🇬🇧' : '🇮🇩'}</span>
                            <span>{settings.language === 'en' ? 'EN' : 'ID'}</span>
                        </button>
                        <button className="btn btn-ghost" onClick={handleReset} title={t.resetCVData}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            <span>Reset</span>
                        </button>
                        <button className="btn btn-secondary" onClick={() => setShowImportModal(true)} title={t.importJson}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span>Import Json</span>
                        </button>
                        <button className="btn btn-secondary" onClick={handleExportJson} title={t.exportJson}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <span>Export Json</span>
                        </button>
                        <button id="btn-download-pdf" className="btn btn-primary" onClick={handleDownloadPDF}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span>{t.downloadPdf}</span>
                        </button>
                    </div>
                </div>
            </header>
            {showImportModal && <AIImportModal onClose={() => setShowImportModal(false)} />}
            {showResetModal && <ResetModal onClose={() => setShowResetModal(false)} />}
        </>
    );
}
