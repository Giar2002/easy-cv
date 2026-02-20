'use client';

import { useState } from 'react';
import { useCVStore } from '@/store/useCVStore';
import AIImportModal from '@/components/modals/AIImportModal';

export default function AppHeader() {
    const resetAll = useCVStore(s => s.resetAll);
    const settings = useCVStore(s => s.settings);
    const setSettings = useCVStore(s => s.setSettings);
    const [showImportModal, setShowImportModal] = useState(false);

    function toggleLanguage() {
        setSettings({ language: settings.language === 'en' ? 'id' : 'en' });
    }

    function handleReset() {
        if (confirm('Hapus semua data CV? Tindakan ini tidak bisa dibatalkan.')) {
            resetAll();
        }
    }

    function handleDownloadPDF() {
        window.print();
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
                        <h1>CV Builder</h1>
                    </a>
                    <div className="header-actions">
                        <button className="btn btn-ghost" onClick={toggleLanguage} title={settings.language === 'en' ? 'Switch to Indonesian' : 'Ganti ke Bahasa Inggris'}>
                            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{settings.language === 'en' ? '🇬🇧' : '🇮🇩'}</span>
                            <span>{settings.language === 'en' ? 'EN' : 'ID'}</span>
                        </button>
                        <button className="btn btn-ghost" onClick={handleReset} title="Hapus Semua Data">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            <span>Reset</span>
                        </button>
                        <button className="btn btn-secondary" onClick={() => setShowImportModal(true)} title="Import dari AI Chat">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span>Import Json</span>
                        </button>
                        <button id="btn-download-pdf" className="btn btn-primary" onClick={handleDownloadPDF}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span>Download PDF</span>
                        </button>
                    </div>
                </div>
            </header>
            {showImportModal && <AIImportModal onClose={() => setShowImportModal(false)} />}
        </>
    );
}
