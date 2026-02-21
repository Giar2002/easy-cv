'use client';

import { useCVStore } from '@/store/useCVStore';
import { getTranslations } from '@/lib/i18n';
import { Experience } from '@/types/cv';
import RichTextInput from './RichTextInput';
import AIAssistantButton from './AIAssistantButton';
import { X, Plus, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableEntryCard({ exp, onUpdate, onRemove, t }: {
    exp: Experience;
    onUpdate: (data: Partial<Experience>) => void;
    onRemove: () => void;
    t: ReturnType<typeof getTranslations>;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: exp.id });

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
                    <span className="entry-number">{exp.title || t.newExp}</span>
                </div>
                <button className="btn-remove" onClick={onRemove}><X size={14} /></button>
            </div>
            <div className="entry-fields">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>{t.position}</label>
                    <input type="text" placeholder={`${t.example} Software Engineer`} value={exp.title}
                        onChange={e => onUpdate({ title: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>{t.company}</label>
                    <input type="text" placeholder="PT Teknologi Indonesia" value={exp.company}
                        onChange={e => onUpdate({ company: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>{t.startDate}</label>
                    <input type="text" placeholder="Jan 2022" value={exp.startDate}
                        onChange={e => onUpdate({ startDate: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>{t.endDate}</label>
                    <input type="text" placeholder={t.present} value={exp.endDate}
                        onChange={e => onUpdate({ endDate: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                        {t.description}
                        <AIAssistantButton value={exp.description} onApply={val => onUpdate({ description: val })} />
                    </label>
                    <RichTextInput
                        value={exp.description}
                        onChange={val => onUpdate({ description: val })}
                        placeholder={t.expDescPlaceholder}
                    />
                </div>
            </div>
        </div>
    );
}

export default function ExperienceTab() {
    const experience = useCVStore(s => s.experience);
    const addExperience = useCVStore(s => s.addExperience);
    const updateExperience = useCVStore(s => s.updateExperience);
    const removeExperience = useCVStore(s => s.removeExperience);
    const reorderItem = useCVStore(s => s.reorderItem);
    const language = useCVStore(s => s.settings.language);
    const t = getTranslations(language);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = experience.findIndex((item) => item.id === active.id);
            const newIndex = experience.findIndex((item) => item.id === over.id);
            reorderItem('experience', oldIndex, newIndex);
        }
    };

    return (
        <div>
            <div className="section-header">
                <h2>{t.expTitle}</h2>
                <p className="section-desc">{t.expDesc}</p>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={experience.map(e => e.id)} strategy={verticalListSortingStrategy}>
                    <div className="entries-list">
                        {experience.map(exp => (
                            <SortableEntryCard key={exp.id} exp={exp}
                                onUpdate={data => updateExperience(exp.id, data)}
                                onRemove={() => removeExperience(exp.id)} t={t} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <button className="btn-add" onClick={addExperience} style={{ marginTop: '1rem' }}>
                <Plus size={16} /> {t.addExp}
            </button>
        </div>
    );
}
