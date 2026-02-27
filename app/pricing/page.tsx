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
                            ? 'Start free, then choose Pro Daily or Premium Monthly based on your job-hunting intensity.'
                            : 'Mulai gratis, lalu pilih Pro Harian atau Premium Bulanan sesuai intensitas cari kerja kamu.'}
                    </p>
                </section>

                <section className="pricing-grid">
                    <article className="pricing-card">
                        <div className="pricing-tier">{isEn ? 'Free' : 'Gratis'}</div>
                        <div className="pricing-price">{isEn ? '$0' : 'Rp0'}</div>
                        <ul className="pricing-list">
                            <li>{isEn ? '1 active CV' : '1 CV aktif'}</li>
                            <li>{isEn ? 'Standard templates only' : 'Hanya template standar'}</li>
                            <li>{isEn ? 'ATS and premium templates locked' : 'Template ATS dan premium terkunci'}</li>
                            <li>{isEn ? 'AI daily limits (1/2/2)' : 'AI dibatasi kuota harian (1/2/2)'}</li>
                            <li>{isEn ? '1 PDF download/month (login required)' : '1 download PDF/bulan (wajib login)'}</li>
                            <li>{isEn ? 'Local browser storage' : 'Penyimpanan lokal browser'}</li>
                        </ul>
                        <Link href="/builder" className="btn btn-secondary pricing-btn">
                            {isEn ? 'Start Free' : 'Mulai Gratis'}
                        </Link>
                    </article>

                    <article className="pricing-card">
                        <div className="pricing-tier">{isEn ? 'Pro Daily' : 'Pro Harian'}</div>
                        <div className="pricing-price">{isEn ? '$1 / day' : 'Rp15rb / hari'}</div>
                        <ul className="pricing-list">
                            <li>{isEn ? 'All templates unlocked (ATS + premium)' : 'Semua template terbuka (ATS + premium)'}</li>
                            <li>{isEn ? 'AI access without free quota limits' : 'Akses AI tanpa limit kuota gratis'}</li>
                            <li>{isEn ? 'Limited PDF downloads/day (more than free)' : 'Download PDF harian terbatas (lebih banyak dari gratis)'}</li>
                            <li>{isEn ? 'Good for short, focused usage' : 'Cocok untuk pemakaian singkat'}</li>
                        </ul>
                        <button className="btn btn-secondary pricing-btn" type="button">
                            {isEn ? 'Upgrade to Pro Daily (Coming Soon)' : 'Upgrade ke Pro Harian (Segera)'}
                        </button>
                    </article>

                    <article className="pricing-card featured">
                        <div className="pricing-badge">{isEn ? 'Recommended' : 'Rekomendasi'}</div>
                        <div className="pricing-tier">{isEn ? 'Premium Monthly' : 'Premium Bulanan'}</div>
                        <div className="pricing-price">{isEn ? '$6 / month' : 'Rp99rb / bulan'}</div>
                        <ul className="pricing-list">
                            <li>{isEn ? 'Up to 10 CVs' : 'Maksimal 10 CV'}</li>
                            <li>{isEn ? 'ATS + all premium templates' : 'Template ATS + semua premium'}</li>
                            <li>{isEn ? 'AI access without free quota limits' : 'Akses AI tanpa limit kuota gratis'}</li>
                            <li>{isEn ? 'Unlimited PDF downloads' : 'Download PDF tanpa batas'}</li>
                            <li>{isEn ? 'Cloud sync' : 'Sinkronisasi cloud'}</li>
                        </ul>
                        <button className="btn btn-primary pricing-btn" type="button">
                            {isEn ? 'Upgrade to Premium (Coming Soon)' : 'Upgrade ke Premium (Segera)'}
                        </button>
                    </article>
                </section>

                <section className="pricing-note">
                    <p>
                        {isEn
                            ? 'Billing gateway is currently in progress and will be connected in the next release.'
                            : 'Gateway pembayaran sedang dalam proses dan akan disambungkan pada rilis berikutnya.'}
                    </p>
                </section>
            </main>
        </div>
    );
}
