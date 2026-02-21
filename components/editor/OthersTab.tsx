'use client';

import { useCVStore } from '@/store/useCVStore';
import { getTranslations } from '@/lib/i18n';
import { Certification, Language } from '@/types/cv';
import { X, Plus, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const LANGUAGE_LEVELS: Language['level'][] = ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic'];

function SortableCertCard({ cert, onUpdate, onRemove, t }: {
    cert: Certification;
    onUpdate: (data: Partial<Certification>) => void;
    onRemove: () => void;
    t: ReturnType<typeof getTranslations>;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cert.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 1 : 0,
    };

    return (
        <div ref={setNodeRef} style={style} className="entry-card">
            <div className="entry-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
                        <GripVertical size={16} />
                    </div>
                    <span className="entry-number">{cert.name || t.newCert}</span>
                </div>
                <button className="btn-remove" onClick={onRemove}><X size={14} /></button>
            </div>
            <div className="entry-fields">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>{t.certName}</label>
                    <input type="text" placeholder={`${t.example} AWS Certified`} value={cert.name}
                        onChange={e => onUpdate({ name: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>{t.issuer}</label>
                    <input type="text" placeholder={`${t.example} Amazon`} value={cert.issuer}
                        onChange={e => onUpdate({ issuer: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>{t.date}</label>
                    <input type="text" placeholder="2023" value={cert.date}
                        onChange={e => onUpdate({ date: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>{t.link} {t.optional}</label>
                    <input type="text" placeholder="Credential URL" value={cert.link}
                        onChange={e => onUpdate({ link: e.target.value })} />
                </div>
            </div>
        </div>
    );
}

function SortableLangCard({ lang, onUpdate, onRemove, t }: {
    lang: Language;
    onUpdate: (data: Partial<Language>) => void;
    onRemove: () => void;
    t: ReturnType<typeof getTranslations>;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lang.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 1 : 0,
    };

    return (
        <div ref={setNodeRef} style={style} className="entry-card">
            <div className="entry-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
                        <GripVertical size={16} />
                    </div>
                    <span className="entry-number">{lang.name || t.newLanguage}</span>
                </div>
                <button className="btn-remove" onClick={onRemove}><X size={14} /></button>
            </div>
            <div className="entry-fields">
                <div className="form-group" style={{ flex: 2 }}>
                    <label>{t.languageName}</label>
                    <input type="text" placeholder={`${t.example} English`} value={lang.name}
                        onChange={e => onUpdate({ name: e.target.value })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                    <label>{t.skillLevel}</label>
                    <select value={lang.level}
                        onChange={e => onUpdate({ level: e.target.value as Language['level'] })}>
                        {LANGUAGE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
}

export default function OthersTab() {
    const certifications = useCVStore(s => s.certifications);
    const addCertification = useCVStore(s => s.addCertification);
    const updateCertification = useCVStore(s => s.updateCertification);
    const removeCertification = useCVStore(s => s.removeCertification);

    const languages = useCVStore(s => s.languages);
    const addLanguage = useCVStore(s => s.addLanguage);
    const updateLanguage = useCVStore(s => s.updateLanguage);
    const removeLanguage = useCVStore(s => s.removeLanguage);
    const reorderItem = useCVStore(s => s.reorderItem);
    const appLanguage = useCVStore(s => s.settings.language);
    const t = getTranslations(appLanguage);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleCertDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = certifications.findIndex((item) => item.id === active.id);
            const newIndex = certifications.findIndex((item) => item.id === over.id);
            reorderItem('certifications', oldIndex, newIndex);
        }
    };

    const handleLangDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = languages.findIndex((item) => item.id === active.id);
            const newIndex = languages.findIndex((item) => item.id === over.id);
            reorderItem('languages', oldIndex, newIndex);
        }
    };

    return (
        <div>
            <div className="section-header">
                <h2>{t.othersTitle}</h2>
                <p className="section-desc">{t.othersDesc}</p>
            </div>

            <h3 className="subsection-title">{t.certTitleSection}</h3>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCertDragEnd}>
                <SortableContext items={certifications.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="entries-list">
                        {certifications.map((cert) => (
                            <SortableCertCard key={cert.id} cert={cert}
                                onUpdate={data => updateCertification(cert.id, data)}
                                onRemove={() => removeCertification(cert.id)} t={t} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
            <button className="btn-add" onClick={addCertification} style={{ marginTop: '1rem' }}>
                <Plus size={16} /> {t.addCert}
            </button>

            <h3 className="subsection-title" style={{ marginTop: '2rem' }}>{t.langTitleSection}</h3>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLangDragEnd}>
                <SortableContext items={languages.map(l => l.id)} strategy={verticalListSortingStrategy}>
                    <div className="entries-list">
                        {languages.map((lang) => (
                            <SortableLangCard key={lang.id} lang={lang}
                                onUpdate={data => updateLanguage(lang.id, data)}
                                onRemove={() => removeLanguage(lang.id)} t={t} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
            <button className="btn-add" onClick={addLanguage} style={{ marginTop: '1rem' }}>
                <Plus size={16} /> {t.addLanguage}
            </button>
        </div>
    );
}
