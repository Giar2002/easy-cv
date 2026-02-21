import { TemplateProps, nl2br, ContactInfo, SkillDots } from './shared';
import { getTranslations } from '@/lib/i18n';

export default function ModernTemplate({ data }: TemplateProps) {
    const { personal, experience, education, skills, projects, certifications, languages, settings } = data;
    const show = settings.showPhoto;
    const t = getTranslations(settings.language);

    return (
        <>
            <div className="cv-header">
                {show && personal.photo && (
                    <div id="cvPhotoContainer">
                        <img src={personal.photo} className="cv-photo" alt="Foto Profil" />
                    </div>
                )}
                <div>
                    <div className="cv-name">{personal.fullName || t.defaultName}</div>
                    <div className="cv-title">{personal.jobTitle || t.defaultRole}</div>
                    <ContactInfo personal={personal} />
                </div>
            </div>
            <div className="cv-body">
                {personal.summary && personal.summary !== '<p><br></p>' && (
                    <div className="cv-section">
                        <div className="cv-section-title">{t.profile}</div>
                        <div className="cv-summary" dangerouslySetInnerHTML={{ __html: personal.summary }} />
                    </div>
                )}
                {experience.length > 0 && (
                    <div className="cv-section">
                        <div className="cv-section-title">{t.experience}</div>
                        {experience.map(exp => (
                            <div key={exp.id} className="cv-entry">
                                <div className="cv-entry-header">
                                    <span className="cv-entry-title">{exp.title || t.defaultPosition}</span>
                                    <span className="cv-entry-date">{exp.startDate}{exp.startDate && exp.endDate ? ' — ' : ''}{exp.endDate}</span>
                                </div>
                                {exp.company && <div className="cv-entry-subtitle">{exp.company}</div>}
                                {exp.description && exp.description !== '<p><br></p>' && <div className="cv-entry-desc" dangerouslySetInnerHTML={{ __html: exp.description }} />}
                            </div>
                        ))}
                    </div>
                )}
                {education.length > 0 && (
                    <div className="cv-section">
                        <div className="cv-section-title">{t.education}</div>
                        {education.map(edu => (
                            <div key={edu.id} className="cv-entry">
                                <div className="cv-entry-header">
                                    <span className="cv-entry-title">{edu.school || t.defaultInstitution}</span>
                                    <span className="cv-entry-date">{edu.startDate}{edu.startDate && edu.endDate ? ' — ' : ''}{edu.endDate}</span>
                                </div>
                                {edu.degree && <div className="cv-entry-subtitle">{edu.degree}</div>}
                                {edu.description && edu.description !== '<p><br></p>' && <div className="cv-entry-desc" dangerouslySetInnerHTML={{ __html: edu.description }} />}
                            </div>
                        ))}
                    </div>
                )}
                {skills.length > 0 && (
                    <div className="cv-section">
                        <div className="cv-section-title">{t.skills}</div>
                        <div className="cv-skills-grid">
                            {skills.map(skill => (
                                <SkillDots key={skill.id} name={skill.name || t.defaultSkill} level={skill.level} />
                            ))}
                        </div>
                    </div>
                )}
                {projects.length > 0 && (
                    <div className="cv-section">
                        <div className="cv-section-title">{t.projects}</div>
                        {projects.map(proj => (
                            <div key={proj.id} className="cv-entry">
                                <div className="cv-entry-header">
                                    <span className="cv-entry-title">{proj.name}</span>
                                    <span className="cv-entry-date">{proj.startDate}{proj.startDate && proj.endDate ? ' — ' : ''}{proj.endDate}</span>
                                </div>
                                {proj.role && <div className="cv-entry-subtitle">{proj.role}</div>}
                                {proj.description && proj.description !== '<p><br></p>' && <div className="cv-entry-desc" dangerouslySetInnerHTML={{ __html: proj.description }} />}
                                {proj.link && <div className="cv-entry-link"><a href={proj.link} target="_blank" rel="noopener noreferrer">{proj.link}</a></div>}
                            </div>
                        ))}
                    </div>
                )}
                {certifications.length > 0 && (
                    <div className="cv-section">
                        <div className="cv-section-title">{t.certifications}</div>
                        {certifications.map(cert => (
                            <div key={cert.id} className="cv-entry">
                                <div className="cv-entry-header">
                                    <span className="cv-entry-title">{cert.name}</span>
                                    <span className="cv-entry-date">{cert.date}</span>
                                </div>
                                {cert.issuer && <div className="cv-entry-subtitle">{cert.issuer}</div>}
                            </div>
                        ))}
                    </div>
                )}
                {languages.length > 0 && (
                    <div className="cv-section">
                        <div className="cv-section-title">{t.languages}</div>
                        <div className="cv-skills-grid">
                            {languages.map(lang => (
                                <div key={lang.id} className="cv-skill-item">
                                    <span>{lang.name}</span>
                                    <span className="cv-skill-level" style={{ fontSize: '0.7rem', color: 'var(--cv-text-muted)' }}>{lang.level}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
