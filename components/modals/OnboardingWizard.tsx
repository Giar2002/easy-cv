'use client';

import { useState, useEffect } from 'react';
import { useCVStore } from '@/store/useCVStore';
import { getTranslations } from '@/lib/i18n';
import { Sparkles, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { isPlanLimitMessage } from '@/lib/planLimit';
import { useUpgradeModalStore } from '@/store/useUpgradeModalStore';
import { getSupabaseAuthHeader } from '@/lib/supabase/authHeader';

export default function OnboardingWizard() {
    const { settings, personal, setPersonal, completeOnboarding } = useCVStore();
    const openUpgradeModal = useUpgradeModalStore(s => s.openModal);
    const t = getTranslations(settings.language);
    const isEn = settings.language === 'en';

    // Internal state
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form fields mapped
    const [fullName, setFullName] = useState(personal.fullName);
    const [jobTitle, setJobTitle] = useState(personal.jobTitle);
    const [email, setEmail] = useState(personal.email);
    const [phone, setPhone] = useState(personal.phone);

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Initial check to pop the wizard open
    useEffect(() => {
        if (!isMounted) return;

        const timer = setTimeout(() => {
            if (!settings.hasCompletedOnboarding) {
                setIsOpen(true);
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [settings.hasCompletedOnboarding, isMounted]);

    const handleSkip = () => {
        completeOnboarding();
        setIsOpen(false);
    };

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleFinalize = async (useAI: boolean) => {
        // Save current inputs
        setPersonal({ fullName, jobTitle, email, phone });

        if (!useAI) {
            completeOnboarding();
            setIsOpen(false);
            return;
        }

        if (!jobTitle) {
            toast.error(isEn ? 'Please fill your Job Title first' : 'Silakan isi Profesi terlebih dahulu');
            return;
        }

        setLoading(true);
        try {
            const summaryPrompt = isEn
                ? `Write a concise professional summary (2-3 sentences) for this role: ${jobTitle}. Keep it natural and not too formal.`
                : `Buatkan summary profesional singkat (2-3 kalimat) untuk profesi: ${jobTitle}. Jangan pakai bahasa kaku.`;
            const skillsPrompt = isEn ? `Role: ${jobTitle}` : `Profesi: ${jobTitle}`;
            const authHeader = await getSupabaseAuthHeader();

            // Setup two requests: Profile and Skills
            const [profileRes, skillsRes] = await Promise.all([
                fetch('/api/ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...authHeader },
                    body: JSON.stringify({
                        text: summaryPrompt,
                        action: 'enhance',
                        feature: 'survey',
                        language: isEn ? 'en' : 'id',
                    })
                }),
                fetch('/api/ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...authHeader },
                    body: JSON.stringify({
                        text: skillsPrompt,
                        action: 'generate-skills',
                        feature: 'skills',
                        language: isEn ? 'en' : 'id',
                    })
                })
            ]);

            const pData = await profileRes.json();
            const sData = await skillsRes.json();
            const profileError = !profileRes.ok ? pData?.error : null;
            const skillsError = !skillsRes.ok ? sData?.error : null;
            let hasAppliedData = false;

            if (profileRes.ok && typeof pData?.result === 'string' && pData.result.trim()) {
                const summaryResult = pData.result.trim();
                const summaryHtml = summaryResult.startsWith('<') ? summaryResult : `<p>${summaryResult}</p>`;
                setPersonal({ summary: summaryHtml });
                hasAppliedData = true;
            }

            if (skillsRes.ok && sData?.result) {
                // Extract commas
                const parts: string[] = sData.result
                    .replace(/<[^>]*>?/gm, '')
                    .split(',')
                    .map((s: string) => s.trim())
                    .filter(Boolean);
                // Inject skills via zustand external api
                useCVStore.setState(state => {
                    const existingNames = new Set(
                        state.skills.map(skill => skill.name.trim().toLowerCase()).filter(Boolean)
                    );
                    const filtered = parts.filter(name => !existingNames.has(name.toLowerCase()));
                    const newSkills = filtered.map((name: string) => ({
                        id: Math.random().toString(36).slice(2, 9),
                        name,
                        level: 3 as const
                    }));
                    if (newSkills.length === 0) return {};
                    hasAppliedData = true;
                    return { skills: [...state.skills, ...newSkills] };
                });
            }

            if (profileError || skillsError) {
                const errorMessage = profileError || skillsError || (isEn ? 'AI request failed.' : 'Permintaan AI gagal.');
                toast.error(errorMessage);
                if (isPlanLimitMessage(errorMessage)) {
                    openUpgradeModal('ai', errorMessage);
                }
            } else if (hasAppliedData) {
                toast.success(isEn ? 'Profile & Skills generated successfully!' : 'Profil & Keahlian berhasil digenerate!');
            } else {
                toast.error(isEn ? 'AI did not return any usable content.' : 'AI tidak mengembalikan konten yang bisa dipakai.');
            }
        } catch {
            toast.error(isEn ? 'AI error. Data saved without AI output.' : 'Terjadi error AI. Data tersimpan tanpa output AI.');
        } finally {
            setLoading(false);
            completeOnboarding();
            setIsOpen(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '450px', padding: '2.5rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                {step === 1 && (
                    <div className="wizard-step">
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                            {t.wizardWelcome}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
                            {t.wizardWelcomeDesc}
                        </p>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>{t.fullName}</label>
                            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label>{t.jobTitle}</label>
                            <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Software Engineer" />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button className="btn btn-ghost" onClick={handleSkip}>{t.wizardSkip}</button>
                            <button className="btn btn-primary" onClick={handleNext} disabled={!fullName || !jobTitle}>
                                {t.wizardNext} <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="wizard-step">
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                            {t.wizardContact}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
                            {t.wizardContactDesc}
                        </p>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>{t.email}</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="hello@johndoe.com" />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label>{t.phone}</label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+62 812 3456" />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button className="btn btn-ghost" onClick={handleBack}>{t.wizardBack}</button>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <button className="btn btn-ghost" onClick={handleSkip}>{t.wizardSkip}</button>
                                <button className="btn btn-primary" onClick={handleNext}>
                                    {t.wizardNext} <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="wizard-step" style={{ textAlign: 'center' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(108, 99, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--accent)' }}>
                            <Sparkles size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                            {t.wizardMagic}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
                            {t.wizardMagicDesc?.replace('{jobTitle}', jobTitle)}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button className="btn btn-ai" onClick={() => handleFinalize(true)} disabled={loading} style={{ justifyContent: 'center', padding: '0.8rem', fontSize: '1rem' }}>
                                {loading ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
                                {loading ? t.wizardGenerating : t.wizardGenerateBtn}
                            </button>

                            <button className="btn btn-secondary" onClick={() => handleFinalize(false)} disabled={loading} style={{ justifyContent: 'center', padding: '0.8rem', fontSize: '1rem', width: '100%', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                                <CheckCircle2 size={18} style={{ marginRight: '6px' }} />
                                {t.wizardManualBtn}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
