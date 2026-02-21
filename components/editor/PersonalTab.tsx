'use client';

import { useRef } from 'react';
import { useCVStore } from '@/store/useCVStore';
import RichTextInput from './RichTextInput';
import AIAssistantButton from './AIAssistantButton';

export default function PersonalTab() {
    const personal = useCVStore(s => s.personal);
    const setPersonal = useCVStore(s => s.setPersonal);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPersonal({ photo: ev.target?.result as string });
        };
        reader.readAsDataURL(file);
    }

    return (
        <div>
            <div className="section-header">
                <h2>Data Pribadi</h2>
                <p className="section-desc">Informasi dasar untuk ditampilkan di CV</p>
            </div>
            <div className="form-grid">
                {/* Photo Upload */}
                <div className="form-group photo-upload-group">
                    <label>Foto Profil</label>
                    <div className="photo-upload" onClick={() => fileInputRef.current?.click()}>
                        {personal.photo ? (
                            <img src={personal.photo} alt="Foto Profil" className="photo-preview-img" />
                        ) : (
                            <div className="photo-placeholder">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                                <span>Upload Foto</span>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                    </div>
                    {personal.photo && (
                        <button className="btn btn-ghost" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}
                            onClick={() => setPersonal({ photo: '' })}>Hapus Foto</button>
                    )}
                </div>
                {/* Fields */}
                <div className="form-group full-width">
                    <label htmlFor="fullName">Nama Lengkap</label>
                    <input id="fullName" type="text" placeholder="contoh: Ahmad Rizki Pratama"
                        value={personal.fullName} onChange={e => setPersonal({ fullName: e.target.value })} />
                </div>
                <div className="form-group full-width">
                    <label htmlFor="jobTitle">Jabatan / Profesi</label>
                    <input id="jobTitle" type="text" placeholder="contoh: Frontend Developer"
                        value={personal.jobTitle} onChange={e => setPersonal({ jobTitle: e.target.value })} />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" placeholder="nama@email.com"
                        value={personal.email} onChange={e => setPersonal({ email: e.target.value })} />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Telepon</label>
                    <input id="phone" type="tel" placeholder="+62 812 3456 7890"
                        value={personal.phone} onChange={e => setPersonal({ phone: e.target.value })} />
                </div>
                <div className="form-group">
                    <label htmlFor="location">Lokasi</label>
                    <input id="location" type="text" placeholder="Jakarta, Indonesia"
                        value={personal.location} onChange={e => setPersonal({ location: e.target.value })} />
                </div>
                <div className="form-group">
                    <label htmlFor="website">Website / LinkedIn</label>
                    <input id="website" type="url" placeholder="https://linkedin.com/in/nama"
                        value={personal.website} onChange={e => setPersonal({ website: e.target.value })} />
                </div>
                <div className="form-group full-width">
                    <label htmlFor="summary" style={{ display: 'flex', alignItems: 'center' }}>
                        Ringkasan Profil <small style={{ fontWeight: 'normal', fontSize: '0.8em', marginLeft: 5, color: 'var(--text-muted)' }}>(Min. 10 karakter)</small>
                        <AIAssistantButton value={personal.summary} onApply={val => setPersonal({ summary: val })} />
                    </label>
                    <RichTextInput
                        value={personal.summary}
                        onChange={val => setPersonal({ summary: val })}
                        placeholder="Tuliskan ringkasan singkat tentang diri Anda, pengalaman, dan keahlian utama..."
                    />
                </div>
            </div>
        </div>
    );
}
