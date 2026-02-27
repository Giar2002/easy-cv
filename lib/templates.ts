import { TemplateCategory, TemplateConfig } from '@/types/cv';

export const TEMPLATES: TemplateConfig[] = [
    // General
    { id: 'modern', name: 'Modern', category: 'general', atsScore: 3, popular: true },
    { id: 'classic', name: 'Klasik', category: 'general', atsScore: 4, popular: true },
    { id: 'minimalist', name: 'Minimalis', category: 'general', atsScore: 5 },
    { id: 'elegant', name: 'Elegan', category: 'general', atsScore: 3 },
    { id: 'skills-first', name: 'Skills First', category: 'general', atsScore: 4, popular: true },
    { id: 'bold-header', name: 'Bold Header', category: 'general', atsScore: 4, popular: true },
    { id: 'hybrid', name: 'Hybrid', category: 'general', atsScore: 4, popular: true },
    // ATS
    { id: 'ats', name: 'ATS Friendly', category: 'ats', atsScore: 5, badge: 'ATS' },
    { id: 'compact', name: 'Compact', category: 'ats', atsScore: 5 },
    { id: 'ats-clean', name: 'ATS Clean', category: 'ats', atsScore: 5, badge: '⭐⭐⭐⭐⭐' },
    { id: 'ats-structured', name: 'ATS Structured', category: 'ats', atsScore: 5, badge: '⭐⭐⭐⭐⭐' },
    { id: 'ats-corporate', name: 'ATS Corporate', category: 'ats', atsScore: 5, badge: '⭐⭐⭐⭐⭐' },
    // Creative
    { id: 'creative', name: 'Creative', category: 'creative', atsScore: 2 },
    { id: 'infographic', name: 'Infographic', category: 'creative', atsScore: 1 },
    { id: 'portfolio', name: 'Portfolio', category: 'creative', atsScore: 2 },
    { id: 'designer', name: 'Designer', category: 'creative', atsScore: 2 },
    { id: 'monogram', name: 'Monogram', category: 'creative', atsScore: 2 },
    // Professional
    { id: 'executive', name: 'Executive', category: 'professional', atsScore: 4 },
    { id: 'banking', name: 'Banking', category: 'professional', atsScore: 4 },
    { id: 'consulting', name: 'Consulting', category: 'professional', atsScore: 4 },
    { id: 'law', name: 'Law Firm', category: 'professional', atsScore: 5, badge: '⭐⭐⭐⭐⭐' },
    // Industry
    { id: 'tech', name: 'Tech', category: 'industry', atsScore: 3 },
    { id: 'academic', name: 'Academic', category: 'industry', atsScore: 4 },
    { id: 'startup', name: 'Startup', category: 'industry', atsScore: 3 },
    { id: 'healthcare', name: 'Healthcare', category: 'industry', atsScore: 4 },
    { id: 'engineering', name: 'Engineering', category: 'industry', atsScore: 4 },
    // Layout
    { id: 'two-column', name: 'Two Column', category: 'layout', atsScore: 3 },
    { id: 'timeline', name: 'Timeline', category: 'layout', atsScore: 3 },
    { id: 'magazine', name: 'Magazine', category: 'layout', atsScore: 2 },
    { id: 'sidebar-dark', name: 'Sidebar Dark', category: 'layout', atsScore: 2, popular: true },
    // Premium (Paid-ready)
    { id: 'premium-pop', name: 'Premium Pop', category: 'premium', atsScore: 2, badge: 'Premium' },
    { id: 'premium-retro', name: 'Premium Retro', category: 'premium', atsScore: 2, badge: 'Premium' },
    { id: 'premium-soft', name: 'Premium Soft', category: 'premium', atsScore: 3, badge: 'Premium' },
    { id: 'premium-gallery', name: 'Premium Gallery', category: 'premium', atsScore: 3, badge: 'Premium' },
    { id: 'premium-noir', name: 'Premium Noir', category: 'premium', atsScore: 2, badge: 'Premium' },
    { id: 'premium-rose', name: 'Premium Rose', category: 'premium', atsScore: 3, badge: 'Premium' },
    { id: 'premium-emerald', name: 'Premium Emerald', category: 'premium', atsScore: 4, badge: 'Premium' },
    { id: 'premium-monogram', name: 'Premium Monogram', category: 'premium', atsScore: 4, badge: 'Premium' },
];

export const TEMPLATE_CATEGORIES: Record<TemplateCategory, { name: string; icon: string; desc?: string }> = {
    all: { name: 'Semua Template', icon: '📋' },
    popular: { name: 'Populer', icon: '🔥', desc: 'Template paling populer' },
    premium: { name: 'Premium', icon: '💎', desc: 'Template premium untuk paket berbayar' },
    ats: { name: 'ATS-Friendly', icon: '✅', desc: 'Optimized untuk ATS systems' },
    general: { name: 'General', icon: '📄', desc: 'Cocok untuk semua profesi' },
    creative: { name: 'Creative', icon: '🎨', desc: 'Design kreatif dan visual' },
    professional: { name: 'Professional', icon: '👔', desc: 'Formal dan eksekutif' },
    industry: { name: 'Industry', icon: '🏭', desc: 'Spesifik untuk industri tertentu' },
    layout: { name: 'Layout Variants', icon: '📐', desc: 'Variasi layout unik' },
};

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, { id: string; en: string }> = {
    all: { id: 'Semua Template', en: 'All Templates' },
    popular: { id: 'Populer', en: 'Popular' },
    premium: { id: 'Premium', en: 'Premium' },
    ats: { id: 'ATS-Friendly', en: 'ATS-Friendly' },
    general: { id: 'Umum', en: 'General' },
    creative: { id: 'Kreatif', en: 'Creative' },
    professional: { id: 'Profesional', en: 'Professional' },
    industry: { id: 'Industri', en: 'Industry' },
    layout: { id: 'Variasi Layout', en: 'Layout Variants' },
};

export function getTemplateCategoryLabel(category: TemplateCategory, language: 'id' | 'en'): string {
    const labels = TEMPLATE_CATEGORY_LABELS[category];
    if (!labels) return category;
    return language === 'en' ? labels.en : labels.id;
}

export function getTemplateById(id: string): TemplateConfig | undefined {
    return TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: TemplateCategory): TemplateConfig[] {
    if (category === 'all') return TEMPLATES;
    return TEMPLATES.filter(t => t.category === category);
}

export const DEFAULT_FREE_TEMPLATE_ID = 'modern';

export function isPremiumTemplate(templateId: string): boolean {
    return getTemplateById(templateId)?.category === 'premium';
}

const LOCKED_FOR_FREE_CATEGORIES = new Set<TemplateCategory>(['premium', 'ats']);
const LOCKED_FOR_FREE_TEMPLATE_IDS = new Set<string>(['sidebar-dark']);

export function isLockedForFreeTemplate(templateId: string): boolean {
    if (LOCKED_FOR_FREE_TEMPLATE_IDS.has(templateId)) return true;
    const category = getTemplateById(templateId)?.category;
    if (!category) return false;
    return LOCKED_FOR_FREE_CATEGORIES.has(category);
}

export function canUseTemplate(templateId: string, isPremiumUser?: boolean): boolean {
    if (!isLockedForFreeTemplate(templateId)) return true;
    return Boolean(isPremiumUser);
}

export function getAccessibleTemplateId(templateId: string, isPremiumUser?: boolean): string {
    if (canUseTemplate(templateId, isPremiumUser)) return templateId;
    return DEFAULT_FREE_TEMPLATE_ID;
}
