'use client';

import { useState, useEffect } from 'react';
import { useCVStore } from '@/store/useCVStore';

// Criteria and weights matching the original app.js exactly
function calculateScore(state: ReturnType<typeof useCVStore.getState>) {
    const p = state.personal;
    const criteria = [
        { key: 'name', label: 'Nama Lengkap', done: !!p.fullName && p.fullName.trim().length >= 3 },
        { key: 'title', label: 'Jabatan / Profesi', done: !!p.jobTitle && p.jobTitle.trim().length >= 2 },
        { key: 'email', label: 'Email', done: !!p.email && p.email.includes('@') },
        { key: 'phone', label: 'Telepon', done: !!p.phone && p.phone.trim().length >= 6 },
        { key: 'summary', label: 'Ringkasan Profil', done: !!p.summary && p.summary.trim().length >= 10 },
        { key: 'experience', label: 'Pengalaman Kerja', done: state.experience.length > 0 && state.experience.some(e => e.title && e.company) },
        { key: 'education', label: 'Pendidikan', done: state.education.length > 0 && state.education.some(e => e.school) },
        { key: 'skills', label: 'Keahlian (min 3)', done: state.skills.filter(s => s.name && s.name.trim()).length >= 3 },
    ];

    const weights: Record<string, number> = { name: 15, title: 10, email: 10, phone: 5, summary: 20, experience: 20, education: 10, skills: 10 };
    let score = 0;
    criteria.forEach(c => { if (c.done) score += weights[c.key]; });
    score = Math.min(100, Math.round(score));

    // Tips matching original
    const tips: string[] = [];
    if (!criteria[4].done) tips.push('Tulis ringkasan profil minimal 10 karakter agar CV lebih menarik.');
    if (!criteria[5].done) tips.push('Tambahkan minimal 1 pengalaman kerja dengan posisi dan perusahaan.');
    if (!criteria[7].done) tips.push('Tambahkan minimal 3 keahlian untuk menunjukkan kompetensi.');
    if (!criteria[2].done) tips.push('Sertakan alamat email yang valid.');
    if (!criteria[6].done) tips.push('Cantumkan riwayat pendidikan Anda.');

    return { score, criteria, tips };
}

function getScoreStyle(score: number) {
    if (score >= 80) return { color: '#34d399', cls: 'excellent', text: 'Sangat Baik' };
    if (score >= 55) return { color: '#3b82f6', cls: 'good', text: 'Baik' };
    if (score >= 30) return { color: '#fbbf24', cls: 'fair', text: 'Cukup' };
    return { color: '#ff4d6a', cls: 'poor', text: 'Perlu Dilengkapi' };
}

export default function CVScoreBadge() {
    // Subscribe to store changes
    useCVStore(s => s.personal);
    useCVStore(s => s.experience);
    useCVStore(s => s.education);
    useCVStore(s => s.skills);

    const [showModal, setShowModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const state = useCVStore.getState();
    const { score, criteria, tips } = mounted ? calculateScore(state) : { score: 0, criteria: [], tips: [] };
    const style = getScoreStyle(score);

    // Badge SVG circle math
    const r = 35;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (score / 100) * circumference;

    // Modal SVG circle math
    const rBig = 52;
    const circBig = 2 * Math.PI * rBig;
    const offsetBig = circBig - (score / 100) * circBig;

    return (
        <>
            <div className="cv-score-badge" onClick={() => setShowModal(true)}>
                <svg viewBox="0 0 80 80" className="badge-circle">
                    <circle className="score-bg" cx="40" cy="40" r={r} />
                    <circle className="score-fill" cx="40" cy="40" r={r}
                        style={{ strokeDasharray: circumference, strokeDashoffset: offset, stroke: style.color }} />
                </svg>
                <div className="badge-score"><span>{score}</span>%</div>
            </div>

            {showModal && (
                <div className="cv-score-modal" style={{ display: 'flex' }}>
                    <div className="modal-overlay" onClick={() => setShowModal(false)} />
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Skor CV Anda</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="score-display">
                                <div className="score-circle-big">
                                    <svg viewBox="0 0 120 120">
                                        <circle className="score-bg" cx="60" cy="60" r={rBig} />
                                        <circle className="score-fill" cx="60" cy="60" r={rBig}
                                            style={{ strokeDasharray: circBig, strokeDashoffset: offsetBig, stroke: style.color }} />
                                    </svg>
                                    <div className="score-value-big"><span>{score}</span><span>%</span></div>
                                </div>
                                <span className={`score-label ${style.cls}`}>{style.text}</span>
                            </div>
                            <div className="score-breakdown">
                                {criteria.map(c => (
                                    <div key={c.key} className="score-item">
                                        <div className={`score-item-icon ${c.done ? 'check' : 'miss'}`}>
                                            {c.done ? '✓' : '✗'}
                                        </div>
                                        <span className={`score-item-text ${c.done ? 'done' : ''}`}>{c.label}</span>
                                    </div>
                                ))}
                            </div>
                            {tips.length > 0 && (
                                <div className="score-tips">
                                    <div className="score-tips-title">Saran Perbaikan</div>
                                    <ul className="score-tips-list">
                                        {tips.map((t, i) => <li key={i}>{t}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
