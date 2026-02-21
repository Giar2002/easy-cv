import { useCVStore } from '@/store/useCVStore';
import toast from 'react-hot-toast';

export default function ResetModal({ onClose }: { onClose: () => void }) {
    const resetAll = useCVStore(s => s.resetAll);
    const language = useCVStore(s => s.settings.language);

    const isEn = language === 'en';

    const texts = {
        successToast: isEn ? 'All CV data successfully reset!' : 'Semua data CV berhasil direset!',
        title: isEn ? 'Reset All Data?' : 'Reset Semua Data?',
        description: isEn
            ? 'This action will permanently delete all your profile, experience, education, skills, and settings data back to the initial empty state. This action <b>cannot be undone</b>.'
            : 'Tindakan ini akan menghapus permanen seluruh data profil, pengalaman, pendidikan, keahlian, dan pengaturan Anda ke keadaan kosong awal. Tindakan ini <b>tidak bisa dibatalkan</b>.',
        cancel: isEn ? 'Cancel' : 'Batal',
        confirm: isEn ? 'Yes, Reset Data' : 'Ya, Reset Data'
    };

    const handleConfirm = () => {
        resetAll();
        toast.success(texts.successToast, {
            style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
            }
        });
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '1rem' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{texts.title}</h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-color)', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: texts.description }} />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>
                        {texts.cancel}
                    </button>
                    <button className="btn" onClick={handleConfirm} style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none' }}>
                        {texts.confirm}
                    </button>
                </div>
            </div>
        </div>
    );
}
