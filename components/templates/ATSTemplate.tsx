import { TemplateProps, nl2br } from './shared';

export default function ATSTemplate({ data }: TemplateProps) {
    const { personal, experience, education, skills, projects, certifications, languages } = data;
    const contacts = [personal.email, personal.phone, personal.location, personal.website].filter(Boolean);

    return (
        <>
            <div className="cv-header">
                {personal.fullName && <div className="cv-name">{personal.fullName}</div>}
                {personal.jobTitle && <div className="cv-title">{personal.jobTitle}</div>}
                {contacts.length > 0 && <div className="cv-contact">{contacts.map((c, i) => <span key={i}>{c}</span>)}</div>}
            </div>
            <div className="cv-divider" />
            <div className="cv-body">
                {personal.summary && (
                    <div className="cv-section">
                        <div className="cv-section-title">Summary</div>
                        <div className="cv-summary">{personal.summary}</div>
                    </div>
                )}
                {skills.length > 0 && (
                    <div className="cv-section">
                        <div className="cv-section-title">Core Competencies</div>
                        <div className="cv-skills-list">
                            {skills.map((s, i) => <span key={s.id}>{s.name}{i < skills.length - 1 ? ' • ' : ''}</span>)}
                        </div>
                    </div>
                )}
                {experience.length > 0 && (
                    <div className="cv-section">
                        <div className="cv-section-title">Pengalaman Kerja</div>
                        {experience.map(exp => (
                            <div key={exp.id} className="cv-entry">
                                <div className="cv-entry-header">
                                    <span className="cv-entry-title">{exp.title}{exp.company ? ` | ${exp.company}` : ''}</span>
                                    <span className="cv-entry-date">{exp.startDate}{exp.endDate && ` — ${exp.endDate}`}</span>
                                </div>
                                {exp.description && <div className="cv-entry-desc">{nl2br(exp.description)}</div>}
                            </div>
                        ))}
                    </div>
                )}
                {education.length > 0 && (
                    <div className="cv-section">
                        <div className="cv-section-title">Pendidikan</div>
                        {education.map(edu => (
                            <div key={edu.id} className="cv-entry">
                                <div className="cv-entry-header">
                                    <span className="cv-entry-title">{edu.degree}{edu.school ? `, ${edu.school}` : ''}</span>
                                    <span className="cv-entry-date">{edu.startDate}{edu.endDate && ` — ${edu.endDate}`}</span>
                                </div>
                                {edu.description && <div className="cv-entry-desc">{nl2br(edu.description)}</div>}
                            </div>
                        ))}
                    </div>
                )}
                {projects.length > 0 && (
                    <div className="cv-section">
                        <div className="cv-section-title">Proyek</div>
                        {projects.map(proj => (
                            <div key={proj.id} className="cv-entry">
                                <div className="cv-entry-header">
                                    <span className="cv-entry-title">{proj.name}{proj.role ? ` | ${proj.role}` : ''}</span>
                                    <span className="cv-entry-date">{proj.startDate}{proj.endDate && ` — ${proj.endDate}`}</span>
                                </div>
                                {proj.description && <div className="cv-entry-desc">{nl2br(proj.description)}</div>}
                                {proj.link && <div className="cv-entry-link"><a href={proj.link} target="_blank" rel="noopener noreferrer">🔗 {proj.link}</a></div>}
                            </div>
                        ))}
                    </div>
                )}
                {certifications.length > 0 && (
                    <div className="cv-section">
                        <div className="cv-section-title">Sertifikat</div>
                        <div className="cv-skills-list">
                            {certifications.map(cert => <div key={cert.id}>{cert.name}{cert.issuer ? ` — ${cert.issuer}` : ''} {cert.date && `(${cert.date})`}</div>)}
                        </div>
                    </div>
                )}
                {languages.length > 0 && (
                    <div className="cv-section">
                        <div className="cv-section-title">Bahasa</div>
                        <div className="cv-skills-list">
                            {languages.map((l, i) => <span key={l.id}>{l.name} ({l.level}){i < languages.length - 1 ? ', ' : ''}</span>)}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
