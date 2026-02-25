'use client';

import { useState } from 'react';
import { useCVStore } from '@/store/useCVStore';
import { getTranslations } from '@/lib/i18n';
import { Skill } from '@/types/cv';
import { X, Plus, GripVertical, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { isPlanLimitMessage } from '@/lib/planLimit';
import { useUpgradeModalStore } from '@/store/useUpgradeModalStore';
import { getSupabaseAuthHeader } from '@/lib/supabase/authHeader';
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

function AiSkillSuggester({
    jobTitle,
    onAddMultiple,
    t,
    isEn,
}: {
    jobTitle: string;
    onAddMultiple: (names: string[]) => void;
    t: ReturnType<typeof getTranslations>;
    isEn: boolean;
}) {
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const openUpgradeModal = useUpgradeModalStore(s => s.openModal);
    const texts = {
        missingRole: isEn
            ? 'Fill in your Job Title in the Profile tab first.'
            : 'Isi jabatan/profesi Anda di tab Profil terlebih dahulu.',
        tooManyRequests: isEn
            ? 'Too many requests. Please wait a moment.'
            : 'Terlalu banyak permintaan. Silakan tunggu sebentar.',
        serverError: isEn ? 'Failed to reach AI server.' : 'Gagal menghubungi AI server.',
        panelTitle: isEn ? 'AI Suggestions' : 'Rekomendasi AI',
        basedOnRole: isEn ? 'Based on role:' : 'Berdasarkan profesi:',
        emptyRole: isEn ? '(Empty)' : '(Kosong)',
        generate: isEn ? 'Generate' : 'Generate',
    };

    const handleGenerate = async () => {
        if (!jobTitle) {
            toast.error(texts.missingRole);
            return;
        }

        setLoading(true);
        try {
            const requestText = isEn ? `Role: ${jobTitle}` : `Profesi: ${jobTitle}`;
            const authHeader = await getSupabaseAuthHeader();
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeader },
                body: JSON.stringify({ text: requestText, action: 'generate-skills', feature: 'skills' })
            });
            const data = await res.json();

            if (res.status === 429) {
                const errorMessage = data.error || texts.tooManyRequests;
                toast.error(errorMessage);
                if (isPlanLimitMessage(errorMessage)) {
                    openUpgradeModal('ai', errorMessage);
                }
            } else if (data.result) {
                // The AI should return a comma separated string
                const parts = data.result.replace(/<[^>]*>?/gm, '').split(',').map((s: string) => s.trim()).filter(Boolean);
                setSuggestions(parts);
            } else if (data.error) {
                toast.error('AI Error: ' + data.error);
            }
        } catch {
            toast.error(texts.serverError);
        }
        setLoading(false);
    };

    return (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                        <Sparkles size={14} style={{ color: 'var(--accent)' }} /> {texts.panelTitle}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                        {texts.basedOnRole} <b>{jobTitle || texts.emptyRole}</b>
                    </p>
                </div>
                <button type="button" onClick={handleGenerate} disabled={loading || !jobTitle} className="btn-ai" style={{ padding: '0.4rem 0.8rem' }}>
                    {loading ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />} {texts.generate}
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
    const texts = {
        multiSkillHint: isEn
            ? 'Separate with commas (,) to add multiple skills at once.'
            : 'Pisahkan dengan koma (,) untuk menambahkan banyak skill sekaligus.',
        bulkLabel: isEn ? 'Add Multiple Skills' : 'Tambah Banyak Keahlian Sekaligus',
        bulkPlaceholder: isEn ? 'Example: Java, React, Node.js' : 'Contoh: Java, React, Node.js',
        bulkHelp: isEn
            ? 'Type skills separated by commas, then press Enter or click Add.'
            : 'Ketik keahlian dipisah koma, lalu tekan Enter atau tombol Tambah.',
    };

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

    const handleAddMultiple = (names: string[]) => {
        const normalizedInput = Array.from(
            new Set(names.map(name => name.trim()).filter(Boolean))
        );
        if (normalizedInput.length === 0) return;

        useCVStore.setState(state => {
            const existingNames = new Set(
                state.skills.map(skill => skill.name.trim().toLowerCase()).filter(Boolean)
            );
            const filtered = normalizedInput.filter(
                name => !existingNames.has(name.toLowerCase())
            );
            if (filtered.length === 0) return {};

            const newSkills = filtered.map(name => ({
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
                <p className="section-desc">{t.skillsDesc} {texts.multiSkillHint}</p>
            </div>

            <AiSkillSuggester jobTitle={jobTitle} onAddMultiple={handleAddMultiple} t={t} isEn={isEn} />

            <div className="bulk-skill-card">
                <label className="bulk-skill-label">
                    {texts.bulkLabel}
                </label>
                <div className="bulk-skill-row">
                    <input
                        type="text"
                        className="form-input bulk-skill-input"
                        placeholder={texts.bulkPlaceholder}
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
                    />
                    <button type="button" className="btn btn-primary bulk-skill-btn" onClick={() => {
                        const parts = bulkInput.split(',').map(s => s.trim()).filter(Boolean);
                        if (parts.length > 0) {
                            handleAddMultiple(parts);
                            setBulkInput('');
                        }
                    }}>
                        {t.addSkill}
                    </button>
                </div>
                <p className="bulk-skill-help">
                    {texts.bulkHelp}
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
