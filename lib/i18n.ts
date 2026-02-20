export const translations = {
    id: {
        profile: 'Profil',
        experience: 'Pengalaman',
        education: 'Pendidikan',
        skills: 'Keahlian',
        projects: 'Proyek',
        certifications: 'Sertifikat',
        languages: 'Bahasa',
        contact: 'Kontak',
        present: 'Sekarang'
    },
    en: {
        profile: 'Profile',
        experience: 'Experience',
        education: 'Education',
        skills: 'Skills',
        projects: 'Projects',
        certifications: 'Certifications',
        languages: 'Languages',
        contact: 'Contact',
        present: 'Present'
    }
};

export type Language = 'id' | 'en';
export type TranslationDict = typeof translations.id;

export function getTranslations(lang?: Language): TranslationDict {
    if (lang === 'en') {
        return translations.en;
    }
    return translations.id;
}
