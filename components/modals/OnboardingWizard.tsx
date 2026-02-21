'use client';

import { useState, useEffect } from 'react';
import { useCVStore } from '@/store/useCVStore';
import { getTranslations } from '@/lib/i18n';
import { Sparkles, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OnboardingWizard() {
    const { settings, personal, setPersonal, completeOnboarding } = useCVStore();
    const t = getTranslations(settings.language);

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
            toast.error(settings.language === 'id' ? 'Silakan isi Profesi terlebih dahulu' : 'Please fill your Job Title first');
            return;
        }

        setLoading(true);
        try {
            // Setup two requests: Profile and Skills
            const [profileRes, skillsRes] = await Promise.all([
                fetch('/api/ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: `Buatkan summary profesional singkat (2-3 kalimat) untuk profesi: ${jobTitle}. Jangan pakai bahasa kaku.`,
                        action: 'enhance'
                    })
                }),
                fetch('/api/ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: `Profesi: ${jobTitle}`,
                        action: 'generate-skills'
                    })
                })
            ]);

            const pData = await profileRes.json();
            const sData = await skillsRes.json();

            if (pData.result) {
                // Strip HTML p tags safely
                const cleanSummary = pData.result.replace(/<\/?p>/g, '').trim();
                setPersonal({ summary: cleanSummary });
            }

            if (sData.result) {
                // Extract commas
                const parts = sData.result.replace(/<[^>]*>?/gm, '').split(',').map((s: string) => s.trim()).filter(Boolean);
                // Inject skills via zustand external api
                useCVStore.setState(state => {
                    const newSkills = parts.map((name: string) => ({
                        id: Math.random().toString(36).slice(2, 9),
                        name,
                        level: 3 as const
                    }));
                    return { skills: [...state.skills, ...newSkills] };
                });
            }

            toast.success(settings.language === 'id' ? 'Profil & Keahlian berhasil digenerate!' : 'Profile & Skills generated successfully!');
        } catch (e) {
            toast.error('AI error. Data disimpan tanpa AI.');
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
