'use client';

import { useCVStore } from '@/store/useCVStore';
import { getTranslations } from '@/lib/i18n';
import { Education } from '@/types/cv';
import { X, Plus, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableEntryCard({ edu, onUpdate, onRemove, t }: {
    edu: Education;
    onUpdate: (data: Partial<Education>) => void;
    onRemove: () => void;
    t: ReturnType<typeof getTranslations>;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: edu.id });

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
                    <span className="entry-number">{edu.school || t.newEdu}</span>
                </div>
                <button className="btn-remove" onClick={onRemove}><X size={14} /></button>
            </div>
            <div className="entry-fields">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>{t.school}</label>
                    <input type="text" placeholder={`${t.example} Universitas Indonesia`} value={edu.school}
                        onChange={e => onUpdate({ school: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>{t.degree}</label>
                    <input type="text" placeholder={`${t.example} S1 Teknik Informatika`} value={edu.degree}
                        onChange={e => onUpdate({ degree: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>{t.startDate}</label>
                    <input type="text" placeholder="2018" value={edu.startDate}
                        onChange={e => onUpdate({ startDate: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>{t.endDate}</label>
                    <input type="text" placeholder="2022" value={edu.endDate}
                        onChange={e => onUpdate({ endDate: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>{t.description} {t.optional}</label>
                    <textarea rows={2} placeholder={t.eduDescPlaceholder} value={edu.description}
                        onChange={e => onUpdate({ description: e.target.value })} />
                </div>
            </div>
        </div>
    );
}

export default function EducationTab() {
    const education = useCVStore(s => s.education);
    const addEducation = useCVStore(s => s.addEducation);
    const updateEducation = useCVStore(s => s.updateEducation);
    const removeEducation = useCVStore(s => s.removeEducation);
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
            const oldIndex = education.findIndex((item) => item.id === active.id);
            const newIndex = education.findIndex((item) => item.id === over.id);
            reorderItem('education', oldIndex, newIndex);
        }
    };

    return (
        <div>
            <div className="section-header">
                <h2>{t.eduTitle}</h2>
                <p className="section-desc">{t.eduDesc}</p>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={education.map(e => e.id)} strategy={verticalListSortingStrategy}>
                    <div className="entries-list">
                        {education.map(edu => (
                            <SortableEntryCard key={edu.id} edu={edu}
                                onUpdate={data => updateEducation(edu.id, data)}
                                onRemove={() => removeEducation(edu.id)} t={t} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <button className="btn-add" onClick={addEducation} style={{ marginTop: '1rem' }}>
                <Plus size={16} /> {t.addEdu}
            </button>
        </div>
    );
}
