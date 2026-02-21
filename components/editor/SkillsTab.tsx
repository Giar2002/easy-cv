'use client';

import { useCVStore } from '@/store/useCVStore';
import { Skill } from '@/types/cv';
import { X, Plus, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SKILL_LEVELS = [
    { value: 1, label: '1 — Pemula' },
    { value: 2, label: '2 — Menengah' },
    { value: 3, label: '3 — Mahir' },
    { value: 4, label: '4 — Sangat Mahir' },
    { value: 5, label: '5 — Ahli' },
];

function SortableSkillCard({ skill, onUpdate, onRemove }: {
    skill: Skill;
    onUpdate: (data: Partial<Skill>) => void;
    onRemove: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: skill.id });

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
                    <span className="entry-number">{skill.name || 'Keahlian Baru'}</span>
                </div>
                <button className="btn-remove" onClick={onRemove}><X size={14} /></button>
            </div>
            <div className="entry-fields">
                <div className="form-group">
                    <label>Nama Keahlian</label>
                    <input type="text" placeholder="contoh: JavaScript" value={skill.name}
                        onChange={e => onUpdate({ name: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Level (1-5)</label>
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

export default function SkillsTab() {
    const skills = useCVStore(s => s.skills);
    const addSkill = useCVStore(s => s.addSkill);
    const updateSkill = useCVStore(s => s.updateSkill);
    const removeSkill = useCVStore(s => s.removeSkill);
    const reorderItem = useCVStore(s => s.reorderItem);

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

    return (
        <div>
            <div className="section-header">
                <h2>Keahlian</h2>
                <p className="section-desc">Tambahkan skill dan kompetensi Anda</p>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={skills.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="entries-list">
                        {skills.map((skill) => (
                            <SortableSkillCard key={skill.id} skill={skill}
                                onUpdate={data => updateSkill(skill.id, data)}
                                onRemove={() => removeSkill(skill.id)} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <button className="btn-add" onClick={addSkill} style={{ marginTop: '1rem' }}>
                <Plus size={16} /> Tambah Keahlian
            </button>
        </div>
    );
}
