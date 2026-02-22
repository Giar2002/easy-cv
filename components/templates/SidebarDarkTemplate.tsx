import { TemplateProps, ContactItem } from './shared';
import { getTranslations } from '@/lib/i18n';

function hasRichText(value: string) {
    return Boolean(value && value !== '<p><br></p>');
}

function formatRange(start?: string, end?: string) {
    if (start && end) return `${start} - ${end}`;
    return start || end || '';
}

export default function SidebarDarkTemplate({ data }: TemplateProps) {
    const { personal, experience, education, skills, projects, certifications, languages, settings } = data;
    const showPhoto = settings.showPhoto;
    const t = getTranslations(settings.language);

    const contacts = [
        { type: 'phone' as const, value: personal.phone },
        { type: 'email' as const, value: personal.email },
        { type: 'location' as const, value: personal.location },
        { type: 'website' as const, value: personal.website },
    ].filter(item => Boolean(item.value));

    return (
        <div className="sd-layout">
            <aside className="cv-sidebar">
                {showPhoto && personal.photo && (
                    <div className="sd-photo-wrap">
                        <img src={personal.photo} className="cv-photo" alt="Foto Profil" />
                    </div>
                )}

                {contacts.length > 0 && (
                    <section className="sd-side-section">
                        <h3 className="cv-sidebar-section-title">{t.contact}</h3>
                        <div className="cv-contact sd-contact-list">
                            {contacts.map((contact, index) => (
                                <ContactItem key={`${contact.type}-${index}`} type={contact.type} value={contact.value as string} />
                            ))}
                        </div>
                    </section>
                )}

                {education.length > 0 && (
                    <section className="sd-side-section">
                        <h3 className="cv-sidebar-section-title">{t.education}</h3>
                        <div className="sd-education-list">
                            {education.map(edu => (
                                <article key={edu.id} className="sd-education-item">
                                    <div className="sd-education-date">{formatRange(edu.startDate, edu.endDate)}</div>
                                    <div className="sd-education-school">{edu.school || t.defaultInstitution}</div>
                                    {edu.degree && <div className="sd-education-degree">{edu.degree}</div>}
                                    {edu.description && hasRichText(edu.description) && (
                                        <div className="sd-education-desc" dangerouslySetInnerHTML={{ __html: edu.description }} />
                                    )}
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {skills.length > 0 && (
                    <section className="sd-side-section">
                        <h3 className="cv-sidebar-section-title">{t.skills}</h3>
                        <ul className="sd-bullet-list">
                            {skills.map(skill => (
                                <li key={skill.id}>{skill.name || t.defaultSkill}</li>
                            ))}
                        </ul>
                    </section>
                )}

                {languages.length > 0 && (
                    <section className="sd-side-section">
                        <h3 className="cv-sidebar-section-title">{t.languages}</h3>
                        <ul className="sd-language-list">
                            {languages.map(lang => (
                                <li key={lang.id}>
                                    {lang.name}
                                    {lang.level ? ` (${lang.level.toLowerCase()})` : ''}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </aside>

            <main className="cv-main">
                <header className="sd-header">
                    <h1 className="cv-name">{personal.fullName || t.defaultName}</h1>
                    <p className="cv-title">{personal.jobTitle || t.defaultRole}</p>
                    <div className="sd-header-bar" />
                </header>

                {hasRichText(personal.summary) && (
                    <section className="cv-section">
                        <h2 className="cv-section-title">{t.profile}</h2>
                        <div className="cv-summary-text" dangerouslySetInnerHTML={{ __html: personal.summary }} />
                    </section>
                )}

                {experience.length > 0 && (
                    <section className="cv-section">
                        <h2 className="cv-section-title">{t.experience}</h2>
                        <div className="sd-experience-list">
                            {experience.map(exp => {
                                const heading = exp.company || exp.title || t.defaultPosition;
                                const subtitle = exp.company && exp.title ? exp.title : '';
                                const dateRange = formatRange(exp.startDate, exp.endDate);
                                return (
                                    <article key={exp.id} className="cv-entry sd-experience-item">
                                        <div className="cv-entry-header">
                                            <span className="cv-entry-title">{heading}</span>
                                            {dateRange && <span className="cv-entry-date">{dateRange}</span>}
                                        </div>
                                        {subtitle && <div className="cv-entry-subtitle">{subtitle}</div>}
                                        {hasRichText(exp.description) && (
                                            <div className="cv-entry-desc" dangerouslySetInnerHTML={{ __html: exp.description }} />
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                )}

                {projects.length > 0 && (
                    <section className="cv-section">
                        <h2 className="cv-section-title">{t.projects}</h2>
                        {projects.map(project => (
                            <article key={project.id} className="cv-entry">
                                <div className="cv-entry-header">
                                    <span className="cv-entry-title">{project.name}</span>
                                    <span className="cv-entry-date">{formatRange(project.startDate, project.endDate)}</span>
                                </div>
                                {project.role && <div className="cv-entry-subtitle">{project.role}</div>}
                                {hasRichText(project.description) && (
                                    <div className="cv-entry-desc" dangerouslySetInnerHTML={{ __html: project.description }} />
                                )}
                            </article>
                        ))}
                    </section>
                )}

                {certifications.length > 0 && (
                    <section className="cv-section">
                        <h2 className="cv-section-title">{t.certifications}</h2>
                        <div className="sd-timeline">
                            {certifications.map(cert => (
                                <article key={cert.id} className="sd-timeline-item">
                                    <div className="sd-timeline-dot" />
                                    <div className="sd-timeline-content">
                                        <div className="sd-timeline-head">
                                            <span className="cv-entry-title">{cert.name}</span>
                                            {cert.date && <span className="cv-entry-date">{cert.date}</span>}
                                        </div>
                                        {cert.issuer && <div className="cv-entry-subtitle">{cert.issuer}</div>}
                                        {cert.link && <div className="cv-entry-link">{cert.link}</div>}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
