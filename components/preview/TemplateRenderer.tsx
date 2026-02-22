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
import GenericTemplate from '@/components/templates/GenericTemplate';
import { sanitizeFontFamily } from '@/lib/fonts';

export default function TemplateRenderer() {
    const personal = useCVStore(s => s.personal);
    const experience = useCVStore(s => s.experience);
    const education = useCVStore(s => s.education);
    const skills = useCVStore(s => s.skills);
    const projects = useCVStore(s => s.projects);
    const certifications = useCVStore(s => s.certifications);
    const languages = useCVStore(s => s.languages);
    const settings = useCVStore(s => s.settings);

    const data: CVData = { personal, experience, education, skills, projects, certifications, languages, settings };

    // Apply accent color as CSS variable on cv-page
    useEffect(() => {
        const el = document.getElementById('cv-page');
        if (el) el.style.setProperty('--cv-accent', settings.colorScheme || '#6c63ff');
    }, [settings.colorScheme]);

    const props = { data };

    const templateMap: Record<string, React.ReactNode> = {
        modern: <ModernTemplate {...props} />,
        classic: <ClassicTemplate {...props} />,
        minimalist: <MinimalistTemplate {...props} />,
        ats: <ATSTemplate {...props} />,
        'ats-clean': <ATSTemplate {...props} />,
        'ats-structured': <ATSTemplate {...props} />,
        'ats-corporate': <ATSTemplate {...props} />,
        creative: <CreativeTemplate {...props} />,
        'sidebar-dark': <CreativeTemplate {...props} />,
        designer: <ModernTemplate {...props} />,
        executive: <ExecutiveTemplate {...props} />,
    };

    const component = templateMap[settings.template] || <GenericTemplate {...props} />;
    const fontFamily = sanitizeFontFamily(settings.fontFamily);

    return (
        <>
            <style>{`
                #cv-page, #cv-page * {
                    font-family: ${fontFamily} !important;
                }
            `}</style>
            <div id="cv-page" className={`cv-page template-${settings.template}`}
                style={{
                    '--cv-accent': settings.colorScheme || '#6c63ff',
                    fontSize: `${typeof settings.fontSize === 'number' ? settings.fontSize : 12}pt`
                } as React.CSSProperties}>
                {component}
            </div>
        </>
    );
}
