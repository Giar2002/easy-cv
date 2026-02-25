'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCVStore } from '@/store/useCVStore';
import { TEMPLATES, TEMPLATE_CATEGORIES, canUseTemplate, isPremiumTemplate } from '@/lib/templates';
import { TemplateCategory } from '@/types/cv';
import TemplateThumbnail from '@/components/editor/TemplateThumbnails';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TemplatesPage() {
    const settings = useCVStore(s => s.settings);
    const router = useRouter();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', settings.theme || 'light');
    }, [settings.theme]);
    const setSettings = useCVStore(s => s.setSettings);
    const language = useCVStore(s => s.settings.language) || 'id';

    const [selectedCat, setSelectedCat] = useState<TemplateCategory>('all');
    const isPremiumUser = Boolean(settings.isPremiumUser);

    const handleSelectTemplate = (id: string) => {
        if (!canUseTemplate(id, isPremiumUser)) {
            toast.error(
                language === 'en'
                    ? 'This is a premium template. Please login with a premium account to use it.'
                    : 'Ini template premium. Silakan login dengan akun premium untuk memakainya.'
            );
            return;
        }
        setSettings({ template: id });
        router.push('/builder');
    };

    const filteredTemplates = selectedCat === 'all'
        ? TEMPLATES
        : selectedCat === 'popular'
            ? TEMPLATES.filter(tpl => tpl.popular)
            : TEMPLATES.filter(tpl => tpl.category === selectedCat);

    const isEn = language === 'en';

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-app)', padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Header */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', width: 'fit-content' }}>
                        <ArrowLeft size={16} /> {isEn ? 'Back to Home' : 'Kembali ke Beranda'}
                    </Link>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                            {isEn ? 'Choose Your CV Template' : 'Pilih Template CV Anda'}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
                            {isEn ? 'All templates are ATS-friendly and professionally designed.' : 'Semua template dioptimalkan untuk ATS dan desain profesional.'}
                        </p>
                    </div>
                </div>

                {/* Categories */}
                <div className="template-categories" style={{ display: 'flex', overflowX: 'auto', gap: '0.5rem', paddingBottom: '0.5rem' }}>
                    {Object.entries(TEMPLATE_CATEGORIES).map(([key, cat]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedCat(key as TemplateCategory)}
                            style={{
                                padding: '0.6rem 1.2rem',
                                borderRadius: '100px',
                                border: '1px solid',
                                borderColor: selectedCat === key ? 'var(--accent)' : 'var(--border)',
                                background: selectedCat === key ? 'var(--accent)' : 'var(--bg-card)',
                                color: selectedCat === key ? '#fff' : 'var(--text-primary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                fontWeight: 500
                            }}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2rem' }}>
                    {filteredTemplates.map(tpl => {
                        const isLocked = isPremiumTemplate(tpl.id) && !isPremiumUser;
                        return (
                        <div
                            key={tpl.id}
                            className={`template-card ${isLocked ? 'locked' : ''}`}
                            onClick={() => handleSelectTemplate(tpl.id)}
                            style={{
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                        >
                            <div className="template-preview" style={{
                                height: '280px',
                                background: 'var(--bg-panel)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                padding: '1.5rem',
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }}>
                                <TemplateThumbnail tpl={tpl} />
                                {isLocked && <span className="template-lock-indicator">🔒</span>}
                                {tpl.popular && <div style={{ position: 'absolute', top: 12, right: 12, background: '#f43f5e', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>Popular</div>}
                                {tpl.badge && <div style={{ position: 'absolute', top: 12, left: 12, background: 'var(--accent)', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>{tpl.badge}</div>}
                            </div>
                            <div className="template-info" style={{ textAlign: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{tpl.name}</h3>
                            </div>
                        </div>
                    );})}
                </div>
            </div>
        </div>
    );
}
