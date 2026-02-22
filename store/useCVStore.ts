'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    CVData, PersonalInfo, Experience, Education,
    Skill, Project, Certification, Language, CVSettings
} from '@/types/cv';
import { DEFAULT_FONT_FAMILY, sanitizeFontFamily } from '@/lib/fonts';
import { getAccessibleTemplateId } from '@/lib/templates';

function uid(): string {
    return Math.random().toString(36).slice(2, 9);
}

const defaultPersonal: PersonalInfo = {
    fullName: '', jobTitle: '', email: '', phone: '',
    location: '', website: '', summary: '', photo: ''
};

const defaultSettings: CVSettings = {
    template: 'modern',
    showPhoto: true,
    colorScheme: '#6c63ff',
    isPremiumUser: false,
    language: 'en',
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: 12,
    theme: 'light',
    hasCompletedOnboarding: false
};

function normalizeSkillLevel(level: unknown): Skill['level'] {
    const parsed = Number(level);
    if (!Number.isFinite(parsed)) return 3;
    const clamped = Math.max(1, Math.min(5, Math.round(parsed)));
    return clamped as Skill['level'];
}

function normalizeLanguageLevel(level: unknown): Language['level'] {
    if (typeof level !== 'string' || !level.trim()) return 'Professional';
    const normalized = level.trim().toLowerCase();
    if (normalized === 'native' || normalized === 'native/bilingual') return 'Native';
    if (normalized === 'fluent') return 'Fluent';
    if (normalized === 'professional' || normalized === 'proficient') return 'Professional';
    if (normalized === 'conversational' || normalized === 'intermediate') return 'Conversational';
    return 'Basic';
}

interface CVStore extends CVData {
    // Personal
    setPersonal: (data: Partial<PersonalInfo>) => void;
    // Experience
    addExperience: () => void;
    updateExperience: (id: string, data: Partial<Experience>) => void;
    removeExperience: (id: string) => void;
    // Education
    addEducation: () => void;
    updateEducation: (id: string, data: Partial<Education>) => void;
    removeEducation: (id: string) => void;
    // Skills
    addSkill: () => void;
    updateSkill: (id: string, data: Partial<Skill>) => void;
    removeSkill: (id: string) => void;
    // Projects
    addProject: () => void;
    updateProject: (id: string, data: Partial<Project>) => void;
    removeProject: (id: string) => void;
    // Certifications
    addCertification: () => void;
    updateCertification: (id: string, data: Partial<Certification>) => void;
    removeCertification: (id: string) => void;
    // Languages
    addLanguage: () => void;
    updateLanguage: (id: string, data: Partial<Language>) => void;
    removeLanguage: (id: string) => void;
    // Settings
    setSettings: (data: Partial<CVSettings>) => void;
    completeOnboarding: () => void;
    // Reset
    resetAll: () => void;
    // Import
    importData: (data: Partial<CVData>) => void;
    // Generic Reorder
    reorderItem: (section: keyof Omit<CVData, 'personal' | 'settings'>, oldIndex: number, newIndex: number) => void;
}

export const useCVStore = create<CVStore>()(
    persist(
        (set) => ({
            personal: defaultPersonal,
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
            languages: [],
            settings: defaultSettings,

            setPersonal: (data) => set(s => ({ personal: { ...s.personal, ...data } })),

            addExperience: () => set(s => ({
                experience: [...s.experience, { id: uid(), title: '', company: '', startDate: '', endDate: '', description: '' }]
            })),
            updateExperience: (id, data) => set(s => ({
                experience: s.experience.map(e => e.id === id ? { ...e, ...data } : e)
            })),
            removeExperience: (id) => set(s => ({ experience: s.experience.filter(e => e.id !== id) })),

            addEducation: () => set(s => ({
                education: [...s.education, { id: uid(), school: '', degree: '', startDate: '', endDate: '', description: '' }]
            })),
            updateEducation: (id, data) => set(s => ({
                education: s.education.map(e => e.id === id ? { ...e, ...data } : e)
            })),
            removeEducation: (id) => set(s => ({ education: s.education.filter(e => e.id !== id) })),

            addSkill: () => set(s => ({
                skills: [...s.skills, { id: uid(), name: '', level: 3 }]
            })),
            updateSkill: (id, data) => set(s => ({
                skills: s.skills.map(e => e.id === id ? { ...e, ...data } : e)
            })),
            removeSkill: (id) => set(s => ({ skills: s.skills.filter(e => e.id !== id) })),

            addProject: () => set(s => ({
                projects: [...s.projects, { id: uid(), name: '', role: '', startDate: '', endDate: '', description: '', link: '' }]
            })),
            updateProject: (id, data) => set(s => ({
                projects: s.projects.map(e => e.id === id ? { ...e, ...data } : e)
            })),
            removeProject: (id) => set(s => ({ projects: s.projects.filter(e => e.id !== id) })),

            addCertification: () => set(s => ({
                certifications: [...s.certifications, { id: uid(), name: '', issuer: '', date: '', link: '' }]
            })),
            updateCertification: (id, data) => set(s => ({
                certifications: s.certifications.map(e => e.id === id ? { ...e, ...data } : e)
            })),
            removeCertification: (id) => set(s => ({ certifications: s.certifications.filter(e => e.id !== id) })),

            addLanguage: () => set(s => ({
                languages: [...s.languages, { id: uid(), name: '', level: 'Professional' }]
            })),
            updateLanguage: (id, data) => set(s => ({
                languages: s.languages.map(e => e.id === id ? { ...e, ...data } : e)
            })),
            removeLanguage: (id) => set(s => ({ languages: s.languages.filter(e => e.id !== id) })),

            setSettings: (data) => set(s => {
                const merged = { ...s.settings, ...data };
                const isPremiumUser = Boolean(merged.isPremiumUser);
                const requestedTemplate = data.template || merged.template || defaultSettings.template;
                const safeTemplate = getAccessibleTemplateId(requestedTemplate, isPremiumUser);

                return {
                    settings: {
                        ...merged,
                        template: safeTemplate,
                        fontFamily: sanitizeFontFamily(merged.fontFamily)
                    }
                };
            }),
            completeOnboarding: () => set(s => ({ settings: { ...s.settings, hasCompletedOnboarding: true } })),

            resetAll: () => set({
                personal: defaultPersonal,
                experience: [],
                education: [],
                skills: [],
                projects: [],
                certifications: [],
                languages: [],
                settings: defaultSettings
            }),

            importData: (data) => set(s => {
                const normalize = <T extends { id?: string }>(arr: T[] = []): (T & { id: string })[] =>
                    arr.map(item => ({ ...item, id: item.id || uid() }));
                const normalizeSkills = (
                    arr: Array<Partial<Skill> & { id?: string; proficiency?: number | string }> = []
                ): Skill[] => arr.map(item => ({
                    id: item.id || uid(),
                    name: item.name || '',
                    level: normalizeSkillLevel(item.level ?? item.proficiency),
                }));
                const normalizeLanguages = (
                    arr: Array<Partial<Language> & { id?: string }> = []
                ): Language[] => arr.map(item => ({
                    id: item.id || uid(),
                    name: item.name || '',
                    level: normalizeLanguageLevel(item.level),
                }));
                const mergedSettings = { ...s.settings, ...(data.settings || {}) };
                const isPremiumUser = Boolean(mergedSettings.isPremiumUser);
                const requestedTemplate = mergedSettings.template || defaultSettings.template;
                const safeTemplate = getAccessibleTemplateId(requestedTemplate, isPremiumUser);
                return {
                    personal: { ...defaultPersonal, ...(data.personal || {}) },
                    experience: normalize(data.experience || s.experience),
                    education: normalize(data.education || s.education),
                    skills: normalizeSkills(
                        (data.skills as Array<Partial<Skill> & { id?: string; proficiency?: number | string }> | undefined) || s.skills
                    ),
                    projects: normalize(data.projects || s.projects),
                    certifications: normalize(data.certifications || s.certifications),
                    languages: normalizeLanguages(
                        (data.languages as Array<Partial<Language> & { id?: string }> | undefined) || s.languages
                    ),
                    settings: {
                        ...mergedSettings,
                        template: safeTemplate,
                        fontFamily: sanitizeFontFamily(mergedSettings.fontFamily),
                    }
                };
            }),

            reorderItem: (section, oldIndex, newIndex) => set(s => {
                const arr = [...s[section]];
                if (oldIndex < 0 || oldIndex >= arr.length || newIndex < 0 || newIndex >= arr.length) return {};
                const [moved] = arr.splice(oldIndex, 1);
                arr.splice(newIndex, 0, moved);
                return { [section]: arr } as Partial<CVStore>;
            }),
        }),
        { name: 'cv-builder-state' }
    )
);
