'use client';

import { useState, useRef, useEffect } from 'react';
import { useCVStore } from '@/store/useCVStore';
import { getTranslations } from '@/lib/i18n';
import PersonalTab from '@/components/editor/PersonalTab';
import ExperienceTab from '@/components/editor/ExperienceTab';
import EducationTab from '@/components/editor/EducationTab';
import SkillsTab from '@/components/editor/SkillsTab';
import ProjectsTab from '@/components/editor/ProjectsTab';
import OthersTab from '@/components/editor/OthersTab';
import SettingsTab from '@/components/editor/SettingsTab';

const TABS = [
    {
        id: 'personal', label: 'Pribadi', icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
        )
    },
    {
        id: 'experience', label: 'Pengalaman', icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
        )
    },
    {
        id: 'education', label: 'Pendidikan', icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 6 3 6 3s3 0 6-3v-5" />
            </svg>
        )
    },
    {
        id: 'skills', label: 'Keahlian', icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        )
    },
    {
        id: 'projects', label: 'Proyek', icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
        )
    },
    {
        id: 'others', label: 'Lainnya', icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-5.82 3.25L7.38 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
        )
    },
    {
        id: 'settings', label: 'Pengaturan', icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
        )
    },
];

export default function EditorPanel() {
    const [activeTab, setActiveTab] = useState('personal');
    const tabNavRef = useRef<HTMLElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const language = useCVStore(s => s.settings.language);
    const t = getTranslations(language);

    const tabTranslationKeys: Record<string, keyof typeof t> = {
        personal: 'profile',
        experience: 'experience',
        education: 'education',
        skills: 'skills',
        projects: 'projects',
        others: 'others',
        settings: 'settings',
    };

    useEffect(() => {
        const nav = tabNavRef.current;
        const wrapper = wrapperRef.current;
        if (!nav || !wrapper) return;
        const update = () => {
            const maxScroll = nav.scrollWidth - nav.clientWidth;
            wrapper.classList.toggle('scroll-left', nav.scrollLeft > 5);
            wrapper.classList.toggle('scroll-right', nav.scrollLeft < maxScroll - 5);
        };
        nav.addEventListener('scroll', update);
        window.addEventListener('resize', update);
        setTimeout(update, 100);
        return () => { nav.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
    }, []);

    function switchTab(id: string, e: React.MouseEvent<HTMLButtonElement>) {
        setActiveTab(id);
        // Scroll active tab into view, matching original behavior
        e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        // Update scroll indicators after scroll completes
        setTimeout(() => {
            const nav = tabNavRef.current;
            const wrapper = wrapperRef.current;
            if (nav && wrapper) {
                const maxScroll = nav.scrollWidth - nav.clientWidth;
                wrapper.classList.toggle('scroll-left', nav.scrollLeft > 5);
                wrapper.classList.toggle('scroll-right', nav.scrollLeft < maxScroll - 5);
            }
        }, 350);
    }

    const tabContent: Record<string, React.ReactNode> = {
        personal: <PersonalTab />,
        experience: <ExperienceTab />,
        education: <EducationTab />,
        skills: <SkillsTab />,
        projects: <ProjectsTab />,
        others: <OthersTab />,
        settings: <SettingsTab />,
    };

    return (
        <aside className="editor-panel">
            <div className="tab-nav-wrapper scroll-right" ref={wrapperRef}>
                <nav className="tab-nav" ref={tabNavRef}>
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={(e) => switchTab(tab.id, e)}
                        >
                            {tab.icon}
                            <span>{t[tabTranslationKeys[tab.id]] || tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            <div className="tab-content active">
                {tabContent[activeTab]}
            </div>
        </aside>
    );
}
