'use client';

import { useCVStore } from '@/store/useCVStore';
import { useEffect } from 'react';
import { CVData } from '@/types/cv';
import ModernTemplate from '@/components/templates/ModernTemplate';
import ClassicTemplate from '@/components/templates/ClassicTemplate';
import MinimalistTemplate from '@/components/templates/MinimalistTemplate';
import ATSTemplate from '@/components/templates/ATSTemplate';
import CreativeTemplate from '@/components/templates/CreativeTemplate';
import ExecutiveTemplate from '@/components/templates/ExecutiveTemplate';
import SidebarDarkTemplate from '@/components/templates/SidebarDarkTemplate';
import PremiumTemplate from '@/components/templates/PremiumTemplate';
import MonogramTemplate from '@/components/templates/MonogramTemplate';
import GenericTemplate from '@/components/templates/GenericTemplate';
import { sanitizeFontFamily } from '@/lib/fonts';
import { getAccessibleTemplateId } from '@/lib/templates';

function normalizeRichTextArtifacts(value: string): string {
    if (!value) return value;

    return value
        .replace(/\u00ad/g, '') // remove soft hyphen from pasted PDF/OCR text
        .replace(/([A-Za-zÀ-ÖØ-öø-ÿ])-\s*<\/p>\s*<p>\s*([A-Za-zÀ-ÖØ-öø-ÿ])/g, '$1$2')
        .replace(/([A-Za-zÀ-ÖØ-öø-ÿ])-\s*<br\s*\/?>\s*([A-Za-zÀ-ÖØ-öø-ÿ])/g, '$1$2')
        .replace(/([A-Za-zÀ-ÖØ-öø-ÿ])<\/p>\s*<p>\s*([a-zà-öø-ÿ])/g, '$1$2')
        .replace(/([A-Za-zÀ-ÖØ-öø-ÿ])-\s*\n\s*([A-Za-zÀ-ÖØ-öø-ÿ])/g, '$1$2')
        .replace(/([A-Za-zÀ-ÖØ-öø-ÿ])\s*\n\s*([a-zà-öø-ÿ])/g, '$1$2');
}

export default function TemplateRenderer() {
    const personal = useCVStore(s => s.personal);
    const experience = useCVStore(s => s.experience);
    const education = useCVStore(s => s.education);
    const skills = useCVStore(s => s.skills);
    const projects = useCVStore(s => s.projects);
    const certifications = useCVStore(s => s.certifications);
    const languages = useCVStore(s => s.languages);
    const settings = useCVStore(s => s.settings);

    const data: CVData = {
        personal: {
            ...personal,
            summary: normalizeRichTextArtifacts(personal.summary),
        },
        experience: experience.map(item => ({
            ...item,
            description: normalizeRichTextArtifacts(item.description),
        })),
        education: education.map(item => ({
            ...item,
            description: normalizeRichTextArtifacts(item.description),
        })),
        skills,
        projects: projects.map(item => ({
            ...item,
            description: normalizeRichTextArtifacts(item.description),
        })),
        certifications,
        languages,
        settings,
    };

    // Apply accent color as CSS variable on cv-page
    useEffect(() => {
        const el = document.getElementById('cv-page');
        if (el) el.style.setProperty('--cv-accent', settings.colorScheme || '#6c63ff');
    }, [settings.colorScheme]);

    const props = { data };
    const activeTemplateId = getAccessibleTemplateId(settings.template, settings.isPremiumUser);

    const templateMap: Record<string, React.ReactNode> = {
        modern: <ModernTemplate {...props} />,
        classic: <ClassicTemplate {...props} />,
        minimalist: <MinimalistTemplate {...props} />,
        ats: <ATSTemplate {...props} />,
        'ats-clean': <ATSTemplate {...props} />,
        'ats-structured': <ATSTemplate {...props} />,
        'ats-corporate': <ATSTemplate {...props} />,
        creative: <CreativeTemplate {...props} />,
        'sidebar-dark': <SidebarDarkTemplate {...props} />,
        'premium-pop': <PremiumTemplate {...props} variant="premium-pop" />,
        'premium-retro': <PremiumTemplate {...props} variant="premium-retro" />,
        'premium-soft': <PremiumTemplate {...props} variant="premium-soft" />,
        'premium-gallery': <PremiumTemplate {...props} variant="premium-gallery" />,
        'premium-noir': <PremiumTemplate {...props} variant="premium-noir" />,
        'premium-rose': <PremiumTemplate {...props} variant="premium-rose" />,
        'premium-emerald': <PremiumTemplate {...props} variant="premium-emerald" />,
        'premium-monogram': <PremiumTemplate {...props} variant="premium-monogram" />,
        designer: <ModernTemplate {...props} />,
        monogram: <MonogramTemplate {...props} />,
        executive: <ExecutiveTemplate {...props} />,
    };

    const component = templateMap[activeTemplateId] || <GenericTemplate {...props} />;
    const fontFamily = sanitizeFontFamily(settings.fontFamily);

    return (
        <>
            <style>{`
                #cv-page, #cv-page * {
                    font-family: ${fontFamily} !important;
                }
            `}</style>
            <div id="cv-page" className={`cv-page template-${activeTemplateId}`}
                style={{
                    '--cv-accent': settings.colorScheme || '#6c63ff',
                    fontSize: `${typeof settings.fontSize === 'number' ? settings.fontSize : 12}pt`
                } as React.CSSProperties}>
                {component}
            </div>
        </>
    );
}
