'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCVStore } from '@/store/useCVStore';

export default function PricingPage() {
    const settings = useCVStore(s => s.settings);
    const setSettings = useCVStore(s => s.setSettings);
    const language = settings.language || 'en';
    const theme = settings.theme || 'light';
    const isEn = language === 'en';

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <div className={`landing-body ${theme}`}>
            <nav className="landing-nav">
                <div className="nav-container">
                    <Link href="/" className="logo" style={{ textDecoration: 'none' }}>
                        <div className="logo-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                        </div>
                        <span>EasY CV</span>
                    </Link>

                    <div className="landing-nav-actions">
                        <button
                            className="btn btn-ghost"
                            onClick={() => setSettings({ language: isEn ? 'id' : 'en' })}
                            type="button"
                        >
                            {isEn ? '🇮🇩 ID' : '🇬🇧 EN'}
                        </button>
                        <Link href="/builder" className="btn btn-secondary">
                            {isEn ? 'Open Builder' : 'Buka Builder'}
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pricing-page">
                <section className="pricing-hero">
                    <span className="hero-badge">{isEn ? 'Simple Pricing' : 'Harga Simpel'}</span>
                    <h1>{isEn ? 'Choose your plan' : 'Pilih paket Anda'}</h1>
                    <p>
                        {isEn
                            ? 'Free for starters, Pro for job seekers who need speed and scale.'
                            : 'Gratis untuk memulai, Pro untuk pencari kerja yang butuh kecepatan dan skala.'}
                    </p>
                </section>

                <section className="pricing-grid">
                    <article className="pricing-card">
                        <div className="pricing-tier">{isEn ? 'Free' : 'Gratis'}</div>
                        <div className="pricing-price">{isEn ? '$0' : 'Rp0'}</div>
                        <ul className="pricing-list">
                            <li>{isEn ? '1 active CV' : '1 CV aktif'}</li>
                            <li>{isEn ? 'Free templates' : 'Template gratis'}</li>
                            <li>{isEn ? 'AI daily limits (free quota)' : 'AI dibatasi kuota harian'}</li>
                            <li>{isEn ? '1 PDF download/day' : '1 download PDF/hari'}</li>
                            <li>{isEn ? 'Local browser storage' : 'Penyimpanan lokal browser'}</li>
                        </ul>
                        <Link href="/builder" className="btn btn-secondary pricing-btn">
                            {isEn ? 'Start Free' : 'Mulai Gratis'}
                        </Link>
                    </article>

                    <article className="pricing-card featured">
                        <div className="pricing-badge">{isEn ? 'Recommended' : 'Rekomendasi'}</div>
                        <div className="pricing-tier">Pro</div>
                        <div className="pricing-price">{isEn ? '$6 / month' : 'Rp99rb / bulan'}</div>
                        <ul className="pricing-list">
                            <li>{isEn ? 'Up to 10 CVs' : 'Maksimal 10 CV'}</li>
                            <li>{isEn ? 'All premium templates' : 'Semua template premium'}</li>
                            <li>{isEn ? 'Higher AI limits' : 'Limit AI lebih besar'}</li>
                            <li>{isEn ? 'Unlimited PDF downloads' : 'Download PDF tanpa batas'}</li>
                            <li>{isEn ? 'Cloud sync' : 'Sinkronisasi cloud'}</li>
                        </ul>
                        <button className="btn btn-primary pricing-btn" type="button">
                            {isEn ? 'Upgrade to Pro (Coming Soon)' : 'Upgrade ke Pro (Segera)'}
                        </button>
                    </article>
                </section>

                <section className="pricing-note">
                    <p>
                        {isEn
                            ? 'Current release still uses Premium Simulation for internal testing. Billing gateway will be connected next.'
                            : 'Rilis saat ini masih memakai Simulasi Premium untuk pengujian internal. Gateway pembayaran akan disambungkan berikutnya.'}
                    </p>
                </section>
            </main>
        </div>
    );
}
