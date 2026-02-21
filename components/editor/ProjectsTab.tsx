'use client';

import { useCVStore } from '@/store/useCVStore';
import { getTranslations } from '@/lib/i18n';
import { Project } from '@/types/cv';
import RichTextInput from './RichTextInput';
import AIAssistantButton from './AIAssistantButton';
import { X, Plus, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableProjectCard({ proj, onUpdate, onRemove, t }: {
    proj: Project;
    onUpdate: (data: Partial<Project>) => void;
    onRemove: () => void;
    t: ReturnType<typeof getTranslations>;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: proj.id });

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
                    <span className="entry-number">{proj.name || t.newProj}</span>
                </div>
                <button className="btn-remove" onClick={onRemove}><X size={14} /></button>
            </div>
            <div className="entry-fields">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>{t.projName}</label>
                    <input type="text" placeholder={`${t.example} E-Commerce App`} value={proj.name}
                        onChange={e => onUpdate({ name: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>{t.role}</label>
                    <input type="text" placeholder={`${t.example} Frontend Lead`} value={proj.role}
                        onChange={e => onUpdate({ role: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>{t.link}</label>
                    <input type="text" placeholder="https://..." value={proj.link}
                        onChange={e => onUpdate({ link: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>{t.startDate}</label>
                    <input type="text" placeholder="Jan 2023" value={proj.startDate}
                        onChange={e => onUpdate({ startDate: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>{t.endDate}</label>
                    <input type="text" placeholder="Des 2023" value={proj.endDate}
                        onChange={e => onUpdate({ endDate: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                        {t.description}
                        <AIAssistantButton value={proj.description} onApply={val => onUpdate({ description: val })} />
                    </label>
                    <RichTextInput
                        value={proj.description}
                        onChange={val => onUpdate({ description: val })}
                        placeholder={t.projDescPlaceholder}
                    />
                </div>
            </div>
        </div>
    );
}

export default function ProjectsTab() {
    const projects = useCVStore(s => s.projects);
    const addProject = useCVStore(s => s.addProject);
    const updateProject = useCVStore(s => s.updateProject);
    const removeProject = useCVStore(s => s.removeProject);
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
            const oldIndex = projects.findIndex((item) => item.id === active.id);
            const newIndex = projects.findIndex((item) => item.id === over.id);
            reorderItem('projects', oldIndex, newIndex);
        }
    };

    return (
        <div>
            <div className="section-header">
                <h2>{t.projTitle}</h2>
                <p className="section-desc">{t.projDesc}</p>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                    <div className="entries-list">
                        {projects.map((proj) => (
                            <SortableProjectCard key={proj.id} proj={proj}
                                onUpdate={data => updateProject(proj.id, data)}
                                onRemove={() => removeProject(proj.id)} t={t} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <button className="btn-add" onClick={addProject} style={{ marginTop: '1rem' }}>
                <Plus size={16} /> {t.addProj}
            </button>
        </div>
    );
}
