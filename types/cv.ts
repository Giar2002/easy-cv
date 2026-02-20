export interface PersonalInfo {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    summary: string;
    photo: string;
}

export interface Experience {
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface Education {
    id: string;
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface Skill {
    id: string;
    name: string;
    level: 1 | 2 | 3 | 4 | 5;
}

export interface Project {
    id: string;
    name: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
    link: string;
}

export interface Certification {
    id: string;
    name: string;
    issuer: string;
    date: string;
    link: string;
}

export interface Language {
    id: string;
    name: string;
    level: 'Native' | 'Fluent' | 'Professional' | 'Conversational' | 'Basic';
}

export interface CVSettings {
    template: string;
    showPhoto: boolean;
    colorScheme: string; // hex color e.g. "#6c63ff"
    language?: 'id' | 'en';
    fontFamily?: string;
    fontSize?: number | string;
}

export interface CVData {
    personal: PersonalInfo;
    experience: Experience[];
    education: Education[];
    skills: Skill[];
    projects: Project[];
    certifications: Certification[];
    languages: Language[];
    settings: CVSettings;
}

export type TemplateCategory = 'all' | 'popular' | 'ats' | 'general' | 'creative' | 'professional' | 'industry' | 'layout';

export interface TemplateConfig {
    id: string;
    name: string;
    category: Exclude<TemplateCategory, 'all'>;
    atsScore: number;
    badge?: string;
    popular?: boolean;
}
