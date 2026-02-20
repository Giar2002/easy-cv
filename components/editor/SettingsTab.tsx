'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useCVStore } from '@/store/useCVStore';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '@/lib/templates';
import { TemplateCategory } from '@/types/cv';
import { useState } from 'react';

// --- HSV helpers ---
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
    const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}
function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}
function hsvToHex(h: number, s: number, v: number): string {
    return rgbToHex(...hsvToRgb(h, s, v));
}
function hexToHsv(hex: string): { hue: number; sat: number; v: number } {
    if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return { hue: 258, sat: 0.38, v: 1 }; // default accent
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let hue = 0;
    if (d !== 0) {
        if (max === r) hue = 60 * (((g - b) / d) % 6);
        else if (max === g) hue = 60 * ((b - r) / d + 2);
        else hue = 60 * ((r - g) / d + 4);
    }
    if (hue < 0) hue += 360;
    const sat = max === 0 ? 0 : d / max;
    const v = max;
    if (isNaN(hue) || isNaN(sat) || isNaN(v)) return { hue: 258, sat: 0.38, v: 1 };
    return { hue, sat, v };
}

const COLOR_PRESETS = [
    '#6c63ff', '#3b82f6', '#10b981', '#f97316', '#ec4899', '#14b8a6',
    '#ef4444', '#6366f1', '#8b5cf6', '#d946ef', '#06b6d4', '#84cc16',
    '#eab308', '#78716c', '#0ea5e9', '#f43f5e'
];

function ColorPicker() {
    const colorScheme = useCVStore(s => s.settings.colorScheme);
    const setSettings = useCVStore(s => s.setSettings);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const svCursorRef = useRef<HTMLDivElement>(null);
    const hueThumbRef = useRef<HTMLDivElement>(null);
    const colorPreviewRef = useRef<HTMLDivElement>(null);
    const hexInputRef = useRef<HTMLInputElement>(null);

    const hsvRef = useRef(hexToHsv(colorScheme || '#6c63ff'));
    const initializedRef = useRef(false);
    const svDragging = useRef(false);
    const hueDragging = useRef(false);

    const renderSV = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        const { hue } = hsvRef.current;
        const w = canvas.width, h = canvas.height;
        const [hr, hg, hb] = hsvToRgb(hue, 1, 1);
        ctx.fillStyle = `rgb(${hr},${hg},${hb})`;
        ctx.fillRect(0, 0, w, h);
        const gW = ctx.createLinearGradient(0, 0, w, 0);
        gW.addColorStop(0, 'rgba(255,255,255,1)');
        gW.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gW; ctx.fillRect(0, 0, w, h);
        const gB = ctx.createLinearGradient(0, 0, 0, h);
        gB.addColorStop(0, 'rgba(0,0,0,0)');
        gB.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = gB; ctx.fillRect(0, 0, w, h);
    }, []);

    const updateUI = useCallback(() => {
        const { hue, sat, v } = hsvRef.current;
        renderSV();
        const hex = hsvToHex(hue, sat, v);
        if (svCursorRef.current) {
            svCursorRef.current.style.left = `${sat * 100}%`;
            svCursorRef.current.style.top = `${(1 - v) * 100}%`;
        }
        if (hueThumbRef.current) {
            hueThumbRef.current.style.left = `${(hue / 360) * 100}%`;
            const [r, g, b] = hsvToRgb(hue, 1, 1);
            hueThumbRef.current.style.background = `rgb(${r},${g},${b})`;
        }
        if (colorPreviewRef.current) colorPreviewRef.current.style.background = hex;
        if (hexInputRef.current) hexInputRef.current.value = hex.toUpperCase();
    }, [renderSV]);

    const applyColor = useCallback(() => {
        const hex = hsvToHex(hsvRef.current.hue, hsvRef.current.sat, hsvRef.current.v);
        setSettings({ colorScheme: hex });
    }, [setSettings]);

    useEffect(() => {
        // Initialize after canvas is mounted
        if (!initializedRef.current) {
            initializedRef.current = true;
            const hsv = hexToHsv(colorScheme || '#6c63ff');
            hsvRef.current = hsv;
            requestAnimationFrame(() => updateUI());
        }
    }); // run on every render until canvas is ready

    const handleSV = useCallback((e: MouseEvent | Touch) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        hsvRef.current.sat = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        hsvRef.current.v = 1 - Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        updateUI(); applyColor();
    }, [updateUI, applyColor]);

    const handleHue = useCallback((e: MouseEvent | Touch, trackEl: HTMLDivElement) => {
        const rect = trackEl.getBoundingClientRect();
        hsvRef.current.hue = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));
        updateUI(); applyColor();
    }, [updateUI, applyColor]);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (svDragging.current) handleSV(e);
        };
        const onUp = () => { svDragging.current = false; hueDragging.current = false; };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    }, [handleSV]);

    return (
        <div className="advanced-color-picker">
            <div className="color-picker-sv-area"
                onMouseDown={e => { svDragging.current = true; handleSV(e.nativeEvent); }}>
                <canvas ref={canvasRef} width={300} height={160} style={{ width: '100%', height: '160px' }} />
                <div ref={svCursorRef} className="color-picker-sv-cursor" />
            </div>
            <div className="color-picker-hue-wrap">
                <div className="color-picker-hue-track" id="hue-track"
                    onMouseDown={e => {
                        hueDragging.current = true;
                        handleHue(e.nativeEvent, e.currentTarget as HTMLDivElement);
                        const onMove = (ev: MouseEvent) => { if (hueDragging.current) handleHue(ev, document.getElementById('hue-track') as HTMLDivElement); };
                        const onUp = () => { hueDragging.current = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                        document.addEventListener('mousemove', onMove);
                        document.addEventListener('mouseup', onUp);
                    }}>
                    <div ref={hueThumbRef} className="color-picker-hue-thumb" />
                </div>
            </div>
            <div className="color-picker-bottom">
                <div ref={colorPreviewRef} className="color-picker-preview" />
                <input ref={hexInputRef} className="color-picker-hex" type="text" maxLength={7}
                    onChange={e => {
                        let v = e.target.value.trim();
                        if (!v.startsWith('#')) v = '#' + v;
                        if (/^#[0-9a-fA-F]{6}$/.test(v)) {
                            const hsv = hexToHsv(v);
                            hsvRef.current = hsv;
                            updateUI(); applyColor();
                        }
                    }} />
            </div>
            <div className="color-picker-presets">
                {COLOR_PRESETS.map(color => (
                    <button key={color} className={`color-preset ${colorScheme?.toUpperCase() === color.toUpperCase() ? 'active' : ''}`}
                        style={{ background: color }}
                        onClick={() => {
                            const hsv = hexToHsv(color);
                            hsvRef.current = hsv;
                            updateUI(); applyColor();
                        }}>
                        <span className="swatch-check">✓</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function SettingsTab() {
    const settings = useCVStore(s => s.settings);
    const setSettings = useCVStore(s => s.setSettings);
    const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all');

    const categories = Object.entries(TEMPLATE_CATEGORIES) as [TemplateCategory, { name: string; icon: string }][];
    const filteredTemplates = activeCategory === 'all'
        ? TEMPLATES
        : activeCategory === 'popular'
            ? TEMPLATES.filter(t => t.popular)
            : TEMPLATES.filter(t => t.category === activeCategory);

    return (
        <div>
            <div className="section-header">
                <h2>Pengaturan CV</h2>
                <p className="section-desc">Pilih template dan atur tampilan CV</p>
            </div>

            {/* Photo Toggle */}
            <div className="settings-group">
                <div className="setting-item">
                    <div className="setting-info">
                        <span className="setting-label">Tampilkan Foto</span>
                        <span className="setting-desc">Tampilkan foto profil di CV</span>
                    </div>
                    <label className="toggle-switch">
                        <input type="checkbox" checked={settings.showPhoto}
                            onChange={e => setSettings({ showPhoto: e.target.checked })} />
                        <span className="toggle-slider" />
                    </label>
                </div>
            </div>

            {/* Typography */}
            <div className="settings-group">
                <h3 className="settings-title">Tipografi</h3>
                <div className="setting-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <label className="setting-label">Jenis Font</label>
                    <select
                        className="form-input"
                        value={settings.fontFamily || 'Inter, sans-serif'}
                        onChange={e => setSettings({ fontFamily: e.target.value })}
                        style={{ width: '100%' }}
                    >
                        <option value="Inter, sans-serif">Inter (Sans-Serif)</option>
                        <option value="'Merriweather', serif">Merriweather (Serif)</option>
                        <option value="'Roboto Mono', monospace">Roboto Mono (Monospace)</option>
                        <option value="'Outfit', sans-serif">Outfit (Modern)</option>
                    </select>
                </div>
                <div className="setting-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', marginTop: '1rem' }}>
                    <label className="setting-label">Ukuran Font</label>
                    <select
                        className="form-input"
                        value={settings.fontSize || 12}
                        onChange={e => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) setSettings({ fontSize: val });
                        }}
                        style={{ width: '100%' }}
                    >
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12 (Standar / Normal)</option>
                        <option value="14">14</option>
                        <option value="16">16</option>
                        <option value="18">18</option>
                        <option value="24">24</option>
                    </select>
                </div>
            </div>

            {/* Color Picker */}
            <div className="settings-group">
                <h3 className="settings-title">Pilih Warna Tema</h3>
                <ColorPicker />
            </div>

            {/* Template Selector */}
            <div className="settings-group">
                <h3 className="settings-title">Filter Berdasarkan Kategori</h3>
                <div className="template-category-filter">
                    {categories.map(([key, cat]) => (
                        <button key={key} className={`category-btn ${activeCategory === key ? 'active' : ''}`}
                            onClick={() => setActiveCategory(key)}>
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>
                <h3 className="settings-title" style={{ marginTop: '0.75rem' }}>Pilih Template</h3>
                <div className="template-grid">
                    {filteredTemplates.map(tpl => (
                        <div key={tpl.id}
                            className={`template-card ${settings.template === tpl.id ? 'active' : ''}`}
                            onClick={() => setSettings({ template: tpl.id })}>
                            <div className="template-preview" style={{ background: '#f8f9fa' }}>
                                <div style={{ padding: '4px', height: '100%', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                    <div style={{ height: '8px', background: settings.template === tpl.id ? '#6c63ff' : '#d1d5db', borderRadius: '2px', width: '70%' }} />
                                    <div style={{ height: '5px', background: '#e5e7eb', borderRadius: '2px', width: '50%' }} />
                                    <div style={{ height: '1px', background: '#d1d5db', margin: '2px 0' }} />
                                    <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', width: '90%' }} />
                                    <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', width: '80%' }} />
                                    <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', width: '85%' }} />
                                </div>
                            </div>
                            <span className="template-name">{tpl.name}</span>
                            {tpl.badge && <span className={`template-badge ${tpl.category === 'ats' ? 'ats' : tpl.popular ? 'popular' : ''}`}>{tpl.badge}</span>}
                            {!tpl.badge && tpl.popular && <span className="template-badge popular">Populer</span>}
                            {!tpl.badge && tpl.category === 'ats' && !tpl.popular && <span className="template-badge ats">ATS</span>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
