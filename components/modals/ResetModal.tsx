import { useCVStore } from '@/store/useCVStore';
import toast from 'react-hot-toast';

export default function ResetModal({ onClose }: { onClose: () => void }) {
    const resetAll = useCVStore(s => s.resetAll);

    const handleConfirm = () => {
        resetAll();
        toast.success('Semua data CV berhasil direset!', {
            style: {
                background: '#333',
                color: '#fff',
                border: '1px solid #444',
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
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>Reset Semua Data?</h2>
                    <p style={{ fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.5 }}>
                        Tindakan ini akan menghapus permanen seluruh data profil, pengalaman, pendidikan, keahlian, dan pengaturan Anda ke keadaan kosong awal. Tindakan ini <b>tidak bisa dibatalkan</b>.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>
                        Batal
                    </button>
                    <button className="btn" onClick={handleConfirm} style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none' }}>
                        Ya, Reset Data
                    </button>
                </div>
            </div>
        </div>
    );
}
