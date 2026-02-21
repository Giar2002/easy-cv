'use client';

import { useState } from 'react';
import { useCVStore } from '@/store/useCVStore';
import { getTranslations } from '@/lib/i18n';
import { Skill } from '@/types/cv';
import { X, Plus, GripVertical, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableSkillCard({ skill, onUpdate, onRemove, t, isEn }: {
    skill: Skill;
    onUpdate: (data: Partial<Skill>) => void;
    onRemove: () => void;
    t: ReturnType<typeof getTranslations>;
    isEn: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: skill.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 1 : 0,
    };

    const SKILL_LEVELS = isEn ? [
        { value: 1, label: '1 — Novice' },
        { value: 2, label: '2 — Intermediate' },
        { value: 3, label: '3 — Advanced' },
        { value: 4, label: '4 — Proficient' },
        { value: 5, label: '5 — Expert' },
    ] : [
        { value: 1, label: '1 — Pemula' },
        { value: 2, label: '2 — Menengah' },
        { value: 3, label: '3 — Mahir' },
        { value: 4, label: '4 — Sangat Mahir' },
        { value: 5, label: '5 — Ahli' },
    ];

    const handleNameChange = (val: string) => {
        onUpdate({ name: val });
    };

    return (
        <div ref={setNodeRef} style={style} className="entry-card">
            <div className="entry-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
                        <GripVertical size={16} />
                    </div>
                    <span className="entry-number">{skill.name || t.newSkill}</span>
                </div>
                <button className="btn-remove" onClick={onRemove}><X size={14} /></button>
            </div>
            <div className="entry-fields">
                <div className="form-group">
                    <label>{t.skillName}</label>
                    <input type="text" placeholder={`${t.example} JavaScript, React, Node`} value={skill.name}
                        onChange={e => handleNameChange(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>{t.skillLevel} (1-5)</label>
                    <select value={skill.level}
                        onChange={e => onUpdate({ level: Number(e.target.value) as Skill['level'] })}>
                        {SKILL_LEVELS.map(l => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

function AiSkillSuggester({ jobTitle, onAddMultiple, t }: { jobTitle: string, onAddMultiple: (names: string[]) => void, t: ReturnType<typeof getTranslations> }) {
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const handleGenerate = async () => {
        if (!jobTitle) {
            toast.error(t.skillsDesc || 'Isi Jabatan/Profesi Anda di tab Profil terlebih dahulu.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: `Role: ${jobTitle}`, action: 'generate-skills' })
            });
            const data = await res.json();

            if (res.status === 429) {
                toast.error(data.error || 'Terlalu banyak permintaan. Silakan tunggu sebentar.');
            } else if (data.result) {
                // The AI should return a comma separated string
                const parts = data.result.replace(/<[^>]*>?/gm, '').split(',').map((s: string) => s.trim()).filter(Boolean);
                setSuggestions(parts);
            } else if (data.error) {
                toast.error('AI Error: ' + data.error);
            }
        } catch (e) {
            toast.error('Gagal menghubungi AI Server');
        }
        setLoading(false);
    };

    return (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                        <Sparkles size={14} style={{ color: 'var(--accent)' }} /> Rekomendasi AI
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Berdasarkan profesi: <b>{jobTitle || '(Kosong)'}</b></p>
                </div>
                <button type="button" onClick={handleGenerate} disabled={loading || !jobTitle} className="btn-ai" style={{ padding: '0.4rem 0.8rem' }}>
                    {loading ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />} Generate
                </button>
            </div>

            {suggestions.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '1rem' }}>
                    {suggestions.map((s, i) => (
                        <button key={i} type="button" onClick={() => {
                            onAddMultiple([s]);
                            setSuggestions(prev => prev.filter(item => item !== s));
                        }} style={{
                            background: 'rgba(108, 99, 255, 0.1)', cursor: 'pointer', border: '1px solid rgba(108, 99, 255, 0.3)',
                            padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', color: 'var(--accent)',
                            fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                            <Plus size={12} /> {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SkillsTab() {
    const skills = useCVStore(s => s.skills);
    const jobTitle = useCVStore(s => s.personal.jobTitle);
    const addSkill = useCVStore(s => s.addSkill);
    const updateSkill = useCVStore(s => s.updateSkill);
    const removeSkill = useCVStore(s => s.removeSkill);
    const reorderItem = useCVStore(s => s.reorderItem);
    const language = useCVStore(s => s.settings.language);
    const t = getTranslations(language);
    const isEn = language === 'en';

    const [bulkInput, setBulkInput] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = skills.findIndex((item) => item.id === active.id);
            const newIndex = skills.findIndex((item) => item.id === over.id);
            reorderItem('skills', oldIndex, newIndex);
        }
    };

    const setSkills = useCVStore(s => s.setSettings); // Wait, we don't have setSkills directly exposed in CVStore
    // Let's rely on useCVStore.setState which is the standard Zustand external API.
    const handleAddMultiple = (names: string[]) => {
        useCVStore.setState(state => {
            const newSkills = names.map(name => ({
                id: Math.random().toString(36).slice(2, 9),
                name,
                level: 3 as const
            }));
            return { skills: [...state.skills, ...newSkills] };
        });
    };

    return (
        <div>
            <div className="section-header">
                <h2>{t.skillsTitle}</h2>
                <p className="section-desc">{t.skillsDesc} Pisahkan dengan koma (,) untuk menambahkan banyak skill sekaligus.</p>
            </div>

            <AiSkillSuggester jobTitle={jobTitle} onAddMultiple={handleAddMultiple} t={t} />

            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                    Tambah Banyak Keahlian Sekaligus
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        placeholder="Contoh: Java, React, Node.js"
                        value={bulkInput}
                        onChange={e => setBulkInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const parts = bulkInput.split(',').map(s => s.trim()).filter(Boolean);
                                if (parts.length > 0) {
                                    handleAddMultiple(parts);
                                    setBulkInput('');
                                }
                            }
                        }}
                        style={{ flex: 1 }}
                    />
                    <button type="button" className="btn btn-primary" onClick={() => {
                        const parts = bulkInput.split(',').map(s => s.trim()).filter(Boolean);
                        if (parts.length > 0) {
                            handleAddMultiple(parts);
                            setBulkInput('');
                        }
                    }}>
                        {t.addSkill}
                    </button>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                    Ketik keahlian dipisah koma, lalu tekan <b>Enter</b> atau tombol Tambah.
                </p>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={skills.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="entries-list">
                        {skills.map((skill) => (
                            <SortableSkillCard key={skill.id} skill={skill}
                                onUpdate={(data: Partial<Skill>) => updateSkill(skill.id, data)}
                                onRemove={() => removeSkill(skill.id)}
                                t={t} isEn={isEn} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <button className="btn-add" onClick={addSkill} style={{ marginTop: '1rem' }}>
                <Plus size={16} /> {t.addSkill}
            </button>
        </div>
    );
}
