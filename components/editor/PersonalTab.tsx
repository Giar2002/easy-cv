'use client';

import { useRef } from 'react';
import { useCVStore } from '@/store/useCVStore';
import { getTranslations } from '@/lib/i18n';
import RichTextInput from './RichTextInput';
import AIAssistantButton from './AIAssistantButton';
import toast from 'react-hot-toast';
import { hasSupabaseClientEnv } from '@/lib/supabase/client';

const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024;

function readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve((ev.target?.result as string) || '');
        reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
        reader.readAsDataURL(file);
    });
}

export default function PersonalTab() {
    const personal = useCVStore(s => s.personal);
    const setPersonal = useCVStore(s => s.setPersonal);
    const language = useCVStore(s => s.settings.language);
    const t = getTranslations(language);
    const isEn = language === 'en';
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error(isEn ? 'Please select a valid image file.' : 'Pilih file gambar yang valid.');
            e.target.value = '';
            return;
        }
        if (file.size > MAX_PHOTO_SIZE_BYTES) {
            toast.error(
                isEn
                    ? 'Image is too large. Maximum file size is 2MB.'
                    : 'Ukuran gambar terlalu besar. Maksimal 2MB.'
            );
            e.target.value = '';
            return;
        }

        try {
            if (hasSupabaseClientEnv()) {
                const formData = new FormData();
                formData.append('photo', file);

                const res = await fetch('/api/upload-photo', {
                    method: 'POST',
                    body: formData,
                });
                const data = await res.json();

                if (!res.ok || !data?.url) {
                    throw new Error(data?.error || 'Gagal upload foto ke cloud.');
                }

                setPersonal({ photo: data.url as string });
                toast.success(
                    isEn
                        ? 'Photo uploaded to cloud storage.'
                        : 'Foto berhasil diupload ke cloud storage.'
                );
            } else {
                const localDataUrl = await readAsDataUrl(file);
                setPersonal({ photo: localDataUrl });
            }
        } catch (error: unknown) {
            const localDataUrl = await readAsDataUrl(file);
            setPersonal({ photo: localDataUrl });
            const message = error instanceof Error ? error.message : '';

            toast.error(
                isEn
                    ? `Cloud upload failed. Saved locally instead.${message ? ` ${message}` : ''}`
                    : `Upload cloud gagal. Disimpan lokal sebagai fallback.${message ? ` ${message}` : ''}`
            );
        } finally {
            e.target.value = '';
        }
    }

    return (
        <div>
            <div className="section-header">
                <h2>{t.personalDataTitle}</h2>
                <p className="section-desc">{t.personalDataDesc}</p>
            </div>
            <div className="form-grid">
                {/* Photo Upload */}
                <div className="form-group photo-upload-group">
                    <label>{t.profilePhoto}</label>
                    <div className="photo-upload-stack">
                        <div
                            className="photo-upload"
                            onClick={() => fileInputRef.current?.click()}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    fileInputRef.current?.click();
                                }
                            }}
                        >
                            {personal.photo ? (
                                <img src={personal.photo} alt={t.profilePhoto} className="photo-preview-img" />
                            ) : (
                                <div className="photo-placeholder">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                    <span>{t.uploadPhoto}</span>
                                </div>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                        </div>
                        {personal.photo && (
                            <button
                                type="button"
                                className="btn btn-ghost photo-remove-btn"
                                onClick={() => setPersonal({ photo: '' })}
                            >
                                {t.removePhoto}
                            </button>
                        )}
                        <p className="photo-upload-help">
                            {isEn ? 'JPG/PNG up to 2MB' : 'JPG/PNG maksimal 2MB'}
                        </p>
                    </div>
                </div>
                {/* Fields */}
                <div className="form-group full-width">
                    <label htmlFor="fullName">{t.fullName}</label>
                    <input id="fullName" type="text" placeholder={`${t.example} Ahmad Rizki Pratama`}
                        value={personal.fullName} onChange={e => setPersonal({ fullName: e.target.value })} />
                </div>
                <div className="form-group full-width">
                    <label htmlFor="jobTitle">{t.jobTitle}</label>
                    <input id="jobTitle" type="text" placeholder={`${t.example} Frontend Developer`}
                        value={personal.jobTitle} onChange={e => setPersonal({ jobTitle: e.target.value })} />
                </div>
                <div className="form-group">
                    <label htmlFor="email">{t.email}</label>
                    <input id="email" type="email" placeholder="nama@email.com"
                        value={personal.email} onChange={e => setPersonal({ email: e.target.value })} />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">{t.phone}</label>
                    <input id="phone" type="tel" placeholder="+62 812 3456 7890"
                        value={personal.phone} onChange={e => setPersonal({ phone: e.target.value })} />
                </div>
                <div className="form-group">
                    <label htmlFor="location">{t.location}</label>
                    <input id="location" type="text" placeholder="Jakarta, Indonesia"
                        value={personal.location} onChange={e => setPersonal({ location: e.target.value })} />
                </div>
                <div className="form-group">
                    <label htmlFor="website">{t.websiteLinkedIn}</label>
                    <input id="website" type="url" placeholder="https://linkedin.com/in/nama"
                        value={personal.website} onChange={e => setPersonal({ website: e.target.value })} />
                </div>
                <div className="form-group full-width">
                    <label htmlFor="summary" style={{ display: 'flex', alignItems: 'center' }}>
                        {t.profileSummary} <small style={{ fontWeight: 'normal', fontSize: '0.8em', marginLeft: 5, color: 'var(--text-muted)' }}>{t.min10Chars}</small>
                        <AIAssistantButton feature="summary" value={personal.summary} onApply={val => setPersonal({ summary: val })} />
                    </label>
                    <RichTextInput
                        value={personal.summary}
                        onChange={val => setPersonal({ summary: val })}
                        placeholder={t.summaryPlaceholder}
                    />
                </div>
            </div>
        </div>
    );
}
