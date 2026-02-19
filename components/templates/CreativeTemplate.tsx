import { TemplateProps, nl2br } from './shared';

export default function CreativeTemplate({ data }: TemplateProps) {
    const { personal, experience, education, skills, projects, certifications, languages, settings } = data;
    const show = settings.showPhoto;
    const contacts = [personal.email, personal.phone, personal.location, personal.website].filter(Boolean);

    return (
        <div style={{ display: 'flex', minHeight: '297mm' }}>
            {/* Sidebar */}
            <div className="cv-sidebar">
                {show && personal.photo && (
                    <img src={personal.photo} className="cv-photo" alt="Foto Profil" />
                )}
                {personal.fullName && <div className="cv-name">{personal.fullName}</div>}
                {personal.jobTitle && <div className="cv-title">{personal.jobTitle}</div>}

                {contacts.length > 0 && (
                    <div>
                        <div className="cv-sidebar-section-title">Kontak</div>
                        {contacts.map((c, i) => <div key={i} className="cv-sidebar-item">{c}</div>)}
                    </div>
                )}

                {skills.length > 0 && (
                    <div>
                        <div className="cv-sidebar-section-title">Keahlian</div>
                        {skills.map(skill => (
                            <div key={skill.id} className="cv-skill-bar-wrap">
                                <div className="cv-skill-bar-label"><span>{skill.name}</span></div>
                                <div className="cv-skill-bar-track">
                                    <div className="cv-skill-bar-fill" style={{ width: `${(skill.level / 5) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {languages.length > 0 && (
                    <div>
                        <div className="cv-sidebar-section-title">Bahasa</div>
                        {languages.map(lang => (
                            <div key={lang.id} className="cv-sidebar-item">{lang.name} — {lang.level}</div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main */}
            <div className="cv-main">
                {personal.summary && (
                    <div style={{ marginBottom: '1.25rem' }}>
                        <div className="cv-section-title" style={{ marginBottom: '0.5rem' }}>Profil</div>
                        <div style={{ fontSize: '8.5pt', color: '#444', lineHeight: 1.6 }}>{personal.summary}</div>
                    </div>
                )}
                {experience.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                        <div className="cv-section-title" style={{ marginBottom: '0.5rem' }}>Pengalaman</div>
                        {experience.map(exp => (
                            <div key={exp.id} className="cv-entry">
                                <div className="cv-entry-header">
                                    <span className="cv-entry-title">{exp.title}</span>
                                    <span className="cv-entry-date">{exp.startDate}{exp.endDate && ` — ${exp.endDate}`}</span>
                                </div>
                                {exp.company && <div className="cv-entry-sub">{exp.company}</div>}
                                {exp.description && <div className="cv-entry-desc">{nl2br(exp.description)}</div>}
                            </div>
                        ))}
                    </div>
                )}
                {education.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                        <div className="cv-section-title" style={{ marginBottom: '0.5rem' }}>Pendidikan</div>
                        {education.map(edu => (
                            <div key={edu.id} className="cv-entry">
                                <div className="cv-entry-header">
                                    <span className="cv-entry-title">{edu.school}</span>
                                    <span className="cv-entry-date">{edu.startDate}{edu.endDate && ` — ${edu.endDate}`}</span>
                                </div>
                                {edu.degree && <div className="cv-entry-sub">{edu.degree}</div>}
                                {edu.description && <div className="cv-entry-desc">{nl2br(edu.description)}</div>}
                            </div>
                        ))}
                    </div>
                )}
                {projects.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                        <div className="cv-section-title" style={{ marginBottom: '0.5rem' }}>Proyek</div>
                        {projects.map(proj => (
                            <div key={proj.id} className="cv-entry">
                                <div className="cv-entry-header">
                                    <span className="cv-entry-title">{proj.name}</span>
                                    <span className="cv-entry-date">{proj.startDate}{proj.endDate && ` — ${proj.endDate}`}</span>
                                </div>
                                {proj.role && <div className="cv-entry-sub">{proj.role}</div>}
                                {proj.description && <div className="cv-entry-desc">{nl2br(proj.description)}</div>}
                                {proj.link && <div className="cv-entry-link"><a href={proj.link} target="_blank" rel="noopener noreferrer">🔗 {proj.link}</a></div>}
                            </div>
                        ))}
                    </div>
                )}
                {certifications.length > 0 && (
                    <div>
                        <div className="cv-section-title" style={{ marginBottom: '0.5rem' }}>Sertifikat</div>
                        {certifications.map(cert => (
                            <div key={cert.id} className="cv-entry">
                                <div className="cv-entry-header">
                                    <span className="cv-entry-title">{cert.name}</span>
                                    <span className="cv-entry-date">{cert.date}</span>
                                </div>
                                {cert.issuer && <div className="cv-entry-sub">{cert.issuer}</div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
