'use client';

import { useState, useEffect, useRef } from 'react';
import { useCVStore } from '@/store/useCVStore';
import { getTranslations } from '@/lib/i18n';
import AIImportModal from '@/components/modals/AIImportModal';
import ResetModal from '@/components/modals/ResetModal';
import toast from 'react-hot-toast';
import { isPlanLimitMessage } from '@/lib/planLimit';
import { useUpgradeModalStore } from '@/store/useUpgradeModalStore';
import { getSupabaseAuthHeader } from '@/lib/supabase/authHeader';
import { getSupabaseBrowserClient, hasSupabaseClientEnv } from '@/lib/supabase/client';

const SUBSCRIPTIONS_TABLE = process.env.NEXT_PUBLIC_SUPABASE_SUBSCRIPTIONS_TABLE || 'user_subscriptions';

export default function AppHeader() {
    const settings = useCVStore(s => s.settings);
    const setSettings = useCVStore(s => s.setSettings);
    const language = settings.language;
    const t = getTranslations(language);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [downloadChecking, setDownloadChecking] = useState(false);
    const [authEmailInput, setAuthEmailInput] = useState('');
    const [authBusy, setAuthBusy] = useState(false);
    const [authUserEmail, setAuthUserEmail] = useState<string | null>(null);
    const [authPlan, setAuthPlan] = useState<'free' | 'pro' | 'premium'>('free');
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackRating, setFeedbackRating] = useState(5);
    const [feedbackBusy, setFeedbackBusy] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const openUpgradeModal = useUpgradeModalStore(s => s.openModal);
    const authEnabled = hasSupabaseClientEnv();
    const isEn = language === 'en';
    const authText = {
        login: isEn ? 'Login' : 'Masuk',
        logout: isEn ? 'Logout' : 'Keluar',
        free: isEn ? 'Free' : 'Gratis',
        proDaily: isEn ? 'Pro Daily' : 'Pro Harian',
        premiumMonthly: isEn ? 'Premium Monthly' : 'Premium Bulanan',
        openAuth: isEn ? 'Open login modal' : 'Buka modal login',
        authTitle: isEn ? 'Account Access' : 'Akses Akun',
        authDesc: isEn ? 'Login with magic link to sync your premium plan.' : 'Masuk dengan magic link untuk sinkronisasi paket premium.',
        emailLabel: isEn ? 'Email' : 'Email',
        emailPlaceholder: isEn ? 'you@example.com' : 'kamu@email.com',
        sendMagic: isEn ? 'Send Magic Link' : 'Kirim Magic Link',
        continueWithGoogle: isEn ? 'Continue with Google' : 'Lanjutkan dengan Google',
        googleFailed: isEn ? 'Google login failed.' : 'Login Google gagal.',
        orMagicLink: isEn ? 'or use magic link' : 'atau gunakan magic link',
        close: isEn ? 'Close' : 'Tutup',
        checkMail: isEn ? 'Magic link sent. Check your email inbox.' : 'Magic link terkirim. Cek inbox email kamu.',
        logoutSuccess: isEn ? 'Logged out successfully.' : 'Berhasil logout.',
        authNotReady: isEn ? 'Supabase auth is not configured yet.' : 'Supabase auth belum dikonfigurasi.',
        authFailed: isEn ? 'Failed to authenticate.' : 'Gagal autentikasi.',
        feedbackTitle: isEn ? 'Thanks for using EasY CV' : 'Terima kasih sudah pakai EasY CV',
        feedbackDesc: isEn ? 'Please share your feedback so we can improve.' : 'Bantu kami improve dengan kritik dan saran kamu.',
        feedbackPlaceholder: isEn ? 'Write your suggestion or issue here...' : 'Tulis kritik/saran atau kendala kamu di sini...',
        feedbackSkip: isEn ? 'Skip' : 'Lewati',
        feedbackSubmit: isEn ? 'Send Feedback' : 'Kirim Feedback',
        feedbackSuccess: isEn ? 'Feedback sent. Thank you.' : 'Feedback terkirim. Terima kasih.',
        feedbackError: isEn ? 'Failed to send feedback.' : 'Gagal kirim feedback.',
    };

    function isActivePremium(status: unknown, currentPeriodEnd: unknown): boolean {
        const normalizedStatus = String(status || '').toLowerCase();
        const activeStatus = normalizedStatus === 'active' || normalizedStatus === 'trialing';
        if (!activeStatus) return false;
        if (!currentPeriodEnd) return true;
        const endMs = new Date(String(currentPeriodEnd)).getTime();
        if (Number.isNaN(endMs)) return true;
        return endMs >= Date.now();
    }

    function normalizeAuthPlan(rawPlan: unknown): 'free' | 'pro' | 'premium' {
        const normalized = String(rawPlan || '').toLowerCase();
        if (normalized === 'pro') return 'pro';
        if (normalized === 'premium' || normalized === 'business') return 'premium';
        return 'free';
    }

    function getPlanChipLabel(): string {
        if (authPlan === 'pro') return authText.proDaily;
        if (authPlan === 'premium') return authText.premiumMonthly;
        return authText.free;
    }

    function getPlanChipClass(): 'free' | 'pro' | 'premium' {
        if (authPlan === 'pro') return 'pro';
        if (authPlan === 'premium') return 'premium';
        return 'free';
    }

    async function syncAuthSession() {
        if (!authEnabled) return;
        const supabase = getSupabaseBrowserClient();
        if (!supabase) return;

        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        if (!session?.user) {
            setAuthUserEmail(null);
            setAuthPlan('free');
            setSettings({ isPremiumUser: false });
            return;
        }

        setAuthUserEmail(session.user.email || null);
        let premium = false;
        let plan: 'free' | 'pro' | 'premium' = 'free';
        try {
            const { data: subData } = await supabase
                .from(SUBSCRIPTIONS_TABLE)
                .select('plan,status,current_period_end')
                .eq('user_id', session.user.id)
                .maybeSingle();
            premium = isActivePremium(subData?.status, subData?.current_period_end);
            plan = premium ? normalizeAuthPlan(subData?.plan) : 'free';
        } catch {
            premium = false;
            plan = 'free';
        }

        setAuthPlan(plan);
        setSettings({ isPremiumUser: premium });
    }

    function toggleLanguage() {
        setSettings({ language: settings.language === 'en' ? 'id' : 'en' });
    }

    function toggleTheme() {
        setSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
    }

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', settings.theme || 'light');
    }, [settings.theme]);

    useEffect(() => {
        if (!authEnabled) return;
        const supabase = getSupabaseBrowserClient();
        if (!supabase) return;

        void syncAuthSession();
        const { data: authListener } = supabase.auth.onAuthStateChange(() => {
            void syncAuthSession();
        });
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [authEnabled]);

    function handleReset() {
        setShowResetModal(true);
    }

    async function handleSendMagicLink() {
        if (!authEnabled) {
            toast.error(authText.authNotReady);
            return;
        }
        if (!authEmailInput.trim()) return;
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
            toast.error(authText.authNotReady);
            return;
        }

        setAuthBusy(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: authEmailInput.trim(),
                options: {
                    emailRedirectTo: `${window.location.origin}/builder`,
                },
            });
            if (error) throw error;
            toast.success(authText.checkMail);
            setShowAuthModal(false);
        } catch {
            toast.error(authText.authFailed);
        } finally {
            setAuthBusy(false);
        }
    }

    async function handleLogout() {
        if (!authEnabled) return;
        const supabase = getSupabaseBrowserClient();
        if (!supabase) return;
        setAuthBusy(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setAuthPlan('free');
            setAuthUserEmail(null);
            setSettings({ isPremiumUser: false });
            toast.success(authText.logoutSuccess);
            setShowAuthModal(false);
        } catch {
            toast.error(authText.authFailed);
        } finally {
            setAuthBusy(false);
        }
    }

    async function handleGoogleLogin() {
        if (!authEnabled) {
            toast.error(authText.authNotReady);
            return;
        }
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
            toast.error(authText.authNotReady);
            return;
        }
        setAuthBusy(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/builder`,
                },
            });
            if (error) throw error;
            setShowAuthModal(false);
        } catch {
            toast.error(authText.googleFailed);
        } finally {
            setAuthBusy(false);
        }
    }

    async function handleDownloadPDF() {
        if (downloadChecking) return;
        setDownloadChecking(true);
        try {
            const authHeader = await getSupabaseAuthHeader();
            const res = await fetch('/api/download-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeader },
                body: JSON.stringify({
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
            setShowFeedbackModal(true);
            if (typeof data?.remaining === 'number' && data.remaining >= 0) {
                const period = data?.period === 'daily' ? 'daily' : 'monthly';
                toast.success(
                    period === 'daily'
                        ? (language === 'en'
                            ? `Download success. Remaining downloads today: ${data.remaining}.`
                            : `Download berhasil. Sisa download hari ini: ${data.remaining}.`)
                        : (language === 'en'
                            ? `Download success. Remaining downloads this month: ${data.remaining}.`
                            : `Download berhasil. Sisa download bulan ini: ${data.remaining}.`)
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

    async function handleSubmitFeedback() {
        if (feedbackBusy) return;
        setFeedbackBusy(true);
        try {
            const authHeader = await getSupabaseAuthHeader();
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeader,
                },
                body: JSON.stringify({
                    message: feedbackText.trim(),
                    rating: feedbackRating,
                    source: 'builder-after-download',
                    language,
                }),
            });
            if (!res.ok) {
                throw new Error('feedback-failed');
            }
            toast.success(authText.feedbackSuccess);
            setShowFeedbackModal(false);
            setFeedbackText('');
            setFeedbackRating(5);
        } catch {
            toast.error(authText.feedbackError);
        } finally {
            setFeedbackBusy(false);
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
                        <button
                            className="btn btn-ghost"
                            onClick={toggleTheme}
                            title={
                                isEn
                                    ? (settings.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode')
                                    : (settings.theme === 'light' ? 'Beralih ke mode gelap' : 'Beralih ke mode terang')
                            }
                        >
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
                        <button
                            className="btn btn-ghost btn-language"
                            onClick={toggleLanguage}
                            title={settings.language === 'en' ? 'Switch to Indonesian' : 'Beralih ke Bahasa Inggris'}
                        >
                            <span className="btn-emoji">{settings.language === 'en' ? '🇬🇧' : '🇮🇩'}</span>
                            <span className="btn-label">{settings.language === 'en' ? 'EN' : 'ID'}</span>
                        </button>
                        <button className="btn btn-ghost btn-hide-mobile btn-collapse-xl" onClick={handleReset} title={t.resetCVData}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            <span className="btn-label">{isEn ? 'Reset' : 'Reset'}</span>
                        </button>
                        <button className="btn btn-secondary btn-hide-mobile btn-collapse-xl" onClick={() => setShowImportModal(true)} title={t.importJson}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span className="btn-label">{t.importJson}</span>
                        </button>
                        <button className="btn btn-secondary btn-hide-mobile btn-collapse-xl" onClick={handleExportJson} title={t.exportJson}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <span className="btn-label">{t.exportJson}</span>
                        </button>
                        <a className="btn btn-ghost btn-hide-mobile btn-collapse-xl" href="/pricing">
                            <span className="btn-label">{language === 'en' ? 'Pricing' : 'Harga'}</span>
                        </a>
                        {authEnabled && (
                            <button className="btn btn-ghost btn-hide-mobile btn-collapse-xl auth-account-btn" onClick={() => setShowAuthModal(true)} title={authText.openAuth}>
                                <span className="btn-label">{authUserEmail ? authUserEmail : authText.login}</span>
                                <span className={`auth-plan-chip ${getPlanChipClass()}`}>
                                    {getPlanChipLabel()}
                                </span>
                            </button>
                        )}
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
                                    <span>{t.resetCVData}</span>
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    type="button"
                                    onClick={() => { setShowImportModal(true); setIsMobileMenuOpen(false); }}
                                >
                                    <span>{t.importJson}</span>
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    type="button"
                                    onClick={() => { handleExportJson(); setIsMobileMenuOpen(false); }}
                                >
                                    <span>{t.exportJson}</span>
                                </button>
                                {authEnabled && (
                                    <button
                                        className="btn btn-ghost"
                                        type="button"
                                        onClick={() => { setShowAuthModal(true); setIsMobileMenuOpen(false); }}
                                    >
                                        <span>{authUserEmail ? (isEn ? 'Account' : 'Akun') : authText.login}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            {showImportModal && <AIImportModal onClose={() => setShowImportModal(false)} />}
            {showResetModal && <ResetModal onClose={() => setShowResetModal(false)} />}
            {showAuthModal && (
                <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
                    <div className="modal-content auth-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{authText.authTitle}</h3>
                            <button className="modal-close" onClick={() => setShowAuthModal(false)}>×</button>
                        </div>
                        <div className="auth-modal-body">
                            <p className="section-desc">{authText.authDesc}</p>

                            {authUserEmail ? (
                                <>
                                    <div className="auth-user-row">
                                        <span>{authUserEmail}</span>
                                        <span className={`auth-plan-chip ${getPlanChipClass()}`}>
                                            {getPlanChipLabel()}
                                        </span>
                                    </div>
                                    <button className="btn btn-ghost" onClick={handleLogout} disabled={authBusy}>
                                        {authBusy ? '...' : authText.logout}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="btn btn-ghost auth-google-btn" onClick={handleGoogleLogin} disabled={authBusy}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                                            <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.8-2.7-5.8-6s2.6-6 5.8-6c1.8 0 3 0.8 3.7 1.4l2.5-2.4C16.6 3.5 14.5 2.7 12 2.7 7.2 2.7 3.3 6.8 3.3 12s3.9 9.3 8.7 9.3c5 0 8.3-3.5 8.3-8.5 0-.6-.1-1-.2-1.5H12z" />
                                            <path fill="#34A853" d="M3.3 7.9l3.2 2.3C7.3 8 9.5 6.7 12 6.7c1.8 0 3 0.8 3.7 1.4l2.5-2.4C16.6 3.5 14.5 2.7 12 2.7 8 2.7 4.6 4.9 3.3 7.9z" />
                                            <path fill="#FBBC05" d="M12 21.3c2.4 0 4.5-.8 6-2.2l-2.8-2.2c-.8.6-1.8 1-3.2 1-2.5 0-4.6-1.7-5.4-4l-3.2 2.5c1.4 3 4.5 4.9 8.6 4.9z" />
                                            <path fill="#4285F4" d="M20.3 12.8c0-.6-.1-1-.2-1.5H12v3.9h5.4c-.3 1.1-.9 2-1.9 2.7l2.8 2.2c1.7-1.6 2.7-4 2.7-7.3z" />
                                        </svg>
                                        <span>{authText.continueWithGoogle}</span>
                                    </button>
                                    <div className="auth-divider"><span>{authText.orMagicLink}</span></div>
                                    <label className="auth-modal-label">{authText.emailLabel}</label>
                                    <input
                                        className="form-input"
                                        type="email"
                                        value={authEmailInput}
                                        onChange={e => setAuthEmailInput(e.target.value)}
                                        placeholder={authText.emailPlaceholder}
                                        disabled={authBusy}
                                    />
                                    <div className="auth-modal-actions">
                                        <button className="btn btn-ghost" onClick={() => setShowAuthModal(false)}>{authText.close}</button>
                                        <button className="btn btn-primary" onClick={handleSendMagicLink} disabled={authBusy || !authEmailInput.trim()}>
                                            {authBusy ? '...' : authText.sendMagic}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {showFeedbackModal && (
                <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
                    <div className="modal-content auth-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{authText.feedbackTitle}</h3>
                            <button className="modal-close" onClick={() => setShowFeedbackModal(false)}>×</button>
                        </div>
                        <div className="auth-modal-body">
                            <p className="section-desc">{authText.feedbackDesc}</p>
                            <label className="auth-modal-label">{isEn ? 'Rating' : 'Rating'}</label>
                            <select
                                className="form-input"
                                value={feedbackRating}
                                onChange={e => setFeedbackRating(Number(e.target.value))}
                                disabled={feedbackBusy}
                            >
                                <option value={5}>5 - Excellent</option>
                                <option value={4}>4 - Good</option>
                                <option value={3}>3 - Okay</option>
                                <option value={2}>2 - Needs improvement</option>
                                <option value={1}>1 - Poor</option>
                            </select>
                            <label className="auth-modal-label">{isEn ? 'Feedback' : 'Feedback'}</label>
                            <textarea
                                className="form-input"
                                value={feedbackText}
                                onChange={e => setFeedbackText(e.target.value)}
                                placeholder={authText.feedbackPlaceholder}
                                rows={4}
                                disabled={feedbackBusy}
                            />
                            <div className="auth-modal-actions">
                                <button className="btn btn-ghost" onClick={() => setShowFeedbackModal(false)}>{authText.feedbackSkip}</button>
                                <button className="btn btn-primary" onClick={handleSubmitFeedback} disabled={feedbackBusy}>
                                    {feedbackBusy ? '...' : authText.feedbackSubmit}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
