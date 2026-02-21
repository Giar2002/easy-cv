'use client';

import { useCVStore } from '@/store/useCVStore';
import { Experience } from '@/types/cv';
import { X, Plus, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableEntryCard({ exp, onUpdate, onRemove }: {
    exp: Experience;
    onUpdate: (data: Partial<Experience>) => void;
    onRemove: () => void;
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
                    <span className="entry-number">{exp.title || 'Pengalaman Baru'}</span>
                </div>
                <button className="btn-remove" onClick={onRemove}><X size={14} /></button>
            </div>
            <div className="entry-fields">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Posisi / Jabatan</label>
                    <input type="text" placeholder="contoh: Software Engineer" value={exp.title}
                        onChange={e => onUpdate({ title: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Perusahaan</label>
                    <input type="text" placeholder="PT Teknologi Indonesia" value={exp.company}
                        onChange={e => onUpdate({ company: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Mulai</label>
                    <input type="text" placeholder="Jan 2022" value={exp.startDate}
                        onChange={e => onUpdate({ startDate: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Selesai</label>
                    <input type="text" placeholder="Sekarang" value={exp.endDate}
                        onChange={e => onUpdate({ endDate: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Deskripsi</label>
                    <textarea rows={3} placeholder="Jelaskan tanggung jawab dan pencapaian..." value={exp.description}
                        onChange={e => onUpdate({ description: e.target.value })} />
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
                <h2>Pengalaman Kerja</h2>
                <p className="section-desc">Tambahkan riwayat pekerjaan Anda</p>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={experience.map(e => e.id)} strategy={verticalListSortingStrategy}>
                    <div className="entries-list">
                        {experience.map(exp => (
                            <SortableEntryCard key={exp.id} exp={exp}
                                onUpdate={data => updateExperience(exp.id, data)}
                                onRemove={() => removeExperience(exp.id)} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <button className="btn-add" onClick={addExperience} style={{ marginTop: '1rem' }}>
                <Plus size={16} /> Tambah Pengalaman
            </button>
        </div>
    );
}
