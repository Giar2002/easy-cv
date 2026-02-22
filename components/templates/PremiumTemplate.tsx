import { TemplateProps } from './shared';
import { getTranslations } from '@/lib/i18n';

export type PremiumVariant =
    | 'premium-pop'
    | 'premium-retro'
    | 'premium-soft'
    | 'premium-gallery'
    | 'premium-noir'
    | 'premium-rose'
    | 'premium-emerald'
    | 'premium-monogram';

interface PremiumTemplateProps extends TemplateProps {
    variant: PremiumVariant;
}

function hasRichText(value: string) {
    return Boolean(value && value !== '<p><br></p>');
}

function stripHtml(value: string) {
    return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function rangeLabel(start: string, end: string) {
    if (start && end) return `${start} - ${end}`;
    return start || end || '';
}

function placeholderSummary(isEn: boolean) {
    return isEn
        ? 'Creative professional with a strong track record in delivering impactful work and collaborating across teams.'
        : 'Profesional kreatif dengan pengalaman membangun karya berdampak dan kolaborasi lintas tim.';
}

function nameParts(fullName: string, fallback: string) {
    const clean = fullName.trim() || fallback;
    const parts = clean.split(/\s+/);
    if (parts.length === 1) return { first: parts[0], last: '' };
    return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
}

export default function PremiumTemplate({ data, variant }: PremiumTemplateProps) {
    const { personal, experience, education, skills, projects, certifications, languages, settings } = data;
    const t = getTranslations(settings.language);
    const isEn = settings.language === 'en';

    const contactItems = [
        { label: t.phone, value: personal.phone },
        { label: t.email, value: personal.email },
        { label: t.location, value: personal.location },
        { label: isEn ? 'Portfolio' : 'Portofolio', value: personal.website },
    ].filter(item => Boolean(item.value));

    const skillItems = skills.filter(skill => skill.name.trim());
    const expItems = experience.filter(item => item.title.trim() || item.company.trim() || hasRichText(item.description));
    const eduItems = education.filter(item => item.school.trim() || item.degree.trim() || hasRichText(item.description));
    const certItems = certifications.filter(item => item.name.trim() || item.issuer.trim());
    const langItems = languages.filter(item => item.name.trim());
    const projectItems = projects.filter(item => item.name.trim() || item.role.trim() || hasRichText(item.description));

    const summaryHtml = hasRichText(personal.summary)
        ? personal.summary
        : `<p>${placeholderSummary(isEn)}</p>`;

    const heroName = personal.fullName || t.defaultName;
    const heroRole = personal.jobTitle || t.defaultRole;
    const hasHeroPhoto = Boolean(settings.showPhoto && personal.photo);

    const skillFallback = [{ id: 'fallback-skill', name: t.defaultSkill, level: 3 as const }];
    const displayedSkills = skillItems.length > 0 ? skillItems : skillFallback;

    const timelineSource = certItems.length > 0 ? certItems : expItems;
    const np = nameParts(heroName, t.defaultName);
    const premiumMonogram = `${np.first.slice(0, 1)}${np.last.slice(0, 1) || np.first.slice(1, 2)}`.toLowerCase();

    if (variant === 'premium-pop') {
        return (
            <div className="pp-grid">
                <section className="pp-card pp-hero">
                    <div className="pp-window-bar">
                        <span />
                        <span />
                    </div>
                    <h1>{heroName}</h1>
                    <div className="pp-role-row">
                        <span>{heroRole}</span>
                        <span className="pp-play">▶</span>
                    </div>
                </section>

                <section className="pp-card pp-photo">
                    {settings.showPhoto && personal.photo ? (
                        <img src={personal.photo} alt={heroName} />
                    ) : (
                        <div className="pp-photo-placeholder">{heroName.slice(0, 2).toUpperCase()}</div>
                    )}
                </section>

                <section className="pp-card pp-about">
                    <h2>{isEn ? 'About Me' : 'Tentang Saya'}</h2>
                    <div className="pp-rich" dangerouslySetInnerHTML={{ __html: summaryHtml }} />
                </section>

                <section className="pp-card pp-education">
                    <h2>{t.education}</h2>
                    {eduItems.slice(0, 3).map(item => (
                        <article key={item.id} className="pp-list-item">
                            <strong>{item.school || t.defaultInstitution}</strong>
                            <span>{item.degree}</span>
                            <small>{rangeLabel(item.startDate, item.endDate)}</small>
                        </article>
                    ))}
                </section>

                <section className="pp-card pp-skills">
                    <h2>{t.skills}</h2>
                    {displayedSkills.slice(0, 5).map(item => (
                        <div key={item.id} className="pp-skill-row">
                            <span>{item.name}</span>
                            <div className="pp-skill-track">
                                <div className="pp-skill-fill" style={{ width: `${(item.level / 5) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </section>

                <section className="pp-card pp-experience">
                    <h2>{t.experience}</h2>
                    {expItems.slice(0, 3).map(item => (
                        <article key={item.id} className="pp-list-item">
                            <strong>{item.title || t.defaultPosition}</strong>
                            <span>{item.company}</span>
                            <small>{rangeLabel(item.startDate, item.endDate)}</small>
                        </article>
                    ))}
                </section>

                <section className="pp-card pp-contact">
                    <h2>{t.contact}</h2>
                    <div className="pp-contact-grid">
                        {contactItems.map((item, idx) => (
                            <div key={`${item.label}-${idx}`} className="pp-contact-item">
                                <strong>{item.label}</strong>
                                <span>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    if (variant === 'premium-retro') {
        return (
            <div className="pr2-layout">
                <header className="pr2-hero">
                    <div className="pr2-image">
                        {settings.showPhoto && personal.photo ? (
                            <img src={personal.photo} alt={heroName} />
                        ) : (
                            <div className="pr2-photo-placeholder">{heroName.slice(0, 1).toUpperCase()}</div>
                        )}
                    </div>
                    <div className="pr2-intro">
                        <h1>{heroName}</h1>
                        <p>{heroRole}</p>
                    </div>
                </header>

                <div className="pr2-columns">
                    <section className="pr2-card">
                        <h2>{isEn ? 'About Me' : 'Tentang Saya'}</h2>
                        <div className="pr2-rich" dangerouslySetInnerHTML={{ __html: summaryHtml }} />
                    </section>

                    <section className="pr2-card">
                        <h2>{t.skills}</h2>
                        <div className="pr2-chip-wrap">
                            {displayedSkills.slice(0, 8).map(item => (
                                <span key={item.id} className="pr2-chip">{item.name}</span>
                            ))}
                        </div>
                        <div className="pr2-contact-list">
                            {contactItems.map((item, idx) => (
                                <div key={`${item.label}-${idx}`} className="pr2-contact-pill">
                                    <strong>{item.label}</strong>
                                    <span>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="pr2-card">
                        <h2>{t.experience}</h2>
                        {expItems.slice(0, 4).map(item => (
                            <article key={item.id} className="pr2-line-item">
                                <strong>{item.title || t.defaultPosition}</strong>
                                <span>{item.company}</span>
                                <small>{rangeLabel(item.startDate, item.endDate)}</small>
                            </article>
                        ))}
                    </section>

                    <section className="pr2-card">
                        <h2>{t.education}</h2>
                        {eduItems.slice(0, 3).map(item => (
                            <article key={item.id} className="pr2-line-item">
                                <strong>{item.school || t.defaultInstitution}</strong>
                                <span>{item.degree}</span>
                                <small>{rangeLabel(item.startDate, item.endDate)}</small>
                            </article>
                        ))}
                    </section>
                </div>
            </div>
        );
    }

    if (variant === 'premium-soft') {
        return (
            <div className="pr3-layout">
                <header className={`pr3-header${hasHeroPhoto ? '' : ' no-photo'}`}>
                    <div className="pr3-namebox">
                        <h1>{heroName}</h1>
                        <p>{heroRole}</p>
                    </div>
                    {hasHeroPhoto && <img src={personal.photo} alt={heroName} />}
                </header>

                <section className="pr3-contact-strip">
                    {contactItems.map((item, idx) => (
                        <div key={`${item.label}-${idx}`} className="pr3-contact-item">
                            <strong>{item.label}</strong>
                            <span>{item.value}</span>
                        </div>
                    ))}
                </section>

                <div className="pr3-body">
                    <section className="pr3-block">
                        <h2>{isEn ? 'Summary' : 'Ringkasan'}</h2>
                        <div className="pr3-rich" dangerouslySetInnerHTML={{ __html: summaryHtml }} />
                    </section>

                    <section className="pr3-block">
                        <h2>{t.education}</h2>
                        {eduItems.slice(0, 3).map(item => (
                            <article key={item.id} className="pr3-item">
                                <small>{rangeLabel(item.startDate, item.endDate)}</small>
                                <strong>{item.school || t.defaultInstitution}</strong>
                                <span>{item.degree}</span>
                            </article>
                        ))}
                    </section>

                    <section className="pr3-block">
                        <h2>{isEn ? 'Work Experience' : 'Pengalaman Kerja'}</h2>
                        {expItems.slice(0, 4).map(item => (
                            <article key={item.id} className="pr3-item pr3-exp">
                                <div className="pr3-item-top">
                                    <strong>{item.title || t.defaultPosition}</strong>
                                    <span>{rangeLabel(item.startDate, item.endDate)}</span>
                                </div>
                                <p>{item.company}</p>
                                {hasRichText(item.description) && (
                                    <div dangerouslySetInnerHTML={{ __html: item.description }} />
                                )}
                            </article>
                        ))}
                    </section>

                    <section className="pr3-block">
                        <h2>{isEn ? 'Capabilities' : 'Kemampuan'}</h2>
                        <div className="pr3-tag-list">
                            {displayedSkills.slice(0, 6).map(item => (
                                <span key={item.id}>{item.name}</span>
                            ))}
                        </div>
                        {certItems.length > 0 && (
                            <>
                                <h3>{isEn ? 'Achievements' : 'Prestasi'}</h3>
                                <ul className="pr3-bullets">
                                    {certItems.slice(0, 4).map(item => (
                                        <li key={item.id}>{item.name}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </section>
                </div>
            </div>
        );
    }

    if (variant === 'premium-gallery') {
        return (
            <div className="pr4-layout">
                <header className="pr4-header">
                    <div className="pr4-line" />
                    <h1>
                        <span>{np.first}</span>
                        {np.last && <em>{np.last}</em>}
                    </h1>
                    <p>{heroRole}</p>
                </header>

                <section className="pr4-top">
                    <div className="pr4-photo">
                        {settings.showPhoto && personal.photo ? (
                            <img src={personal.photo} alt={heroName} />
                        ) : (
                            <div className="pr4-photo-placeholder">{heroName.slice(0, 2).toUpperCase()}</div>
                        )}
                    </div>
                    <div className="pr4-right">
                        <article>
                            <h2>{isEn ? 'About Me' : 'Tentang Saya'}</h2>
                            <div dangerouslySetInnerHTML={{ __html: summaryHtml }} />
                        </article>
                        {eduItems.slice(0, 1).map(item => (
                            <article key={item.id}>
                                <h2>{t.education}</h2>
                                <strong>{item.degree || t.education}</strong>
                                <p>{item.school || t.defaultInstitution}</p>
                                <small>{rangeLabel(item.startDate, item.endDate)}</small>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="pr4-skills">
                    <h2>{isEn ? 'Key Skills' : 'Keahlian Utama'}</h2>
                    <div>
                        {displayedSkills.slice(0, 9).map(item => (
                            <span key={item.id}>{item.name}</span>
                        ))}
                    </div>
                </section>

                <section className="pr4-experience-grid">
                    <div className="pr4-exp-col">
                        <h2>{t.experience}</h2>
                        {expItems.slice(0, 3).map(item => (
                            <article key={item.id}>
                                <strong>{item.title || t.defaultPosition}</strong>
                                <p>{item.company}</p>
                                <small>{rangeLabel(item.startDate, item.endDate)}</small>
                            </article>
                        ))}
                    </div>
                    <div className="pr4-exp-col">
                        <h2>{isEn ? 'Projects' : 'Proyek'}</h2>
                        {(projectItems.length > 0 ? projectItems : expItems).slice(0, 3).map(item => (
                            <article key={item.id}>
                                <strong>{'name' in item ? item.name : item.title || t.defaultPosition}</strong>
                                {'role' in item ? <p>{item.role}</p> : <p>{item.company}</p>}
                                {'startDate' in item && <small>{rangeLabel(item.startDate, item.endDate)}</small>}
                            </article>
                        ))}
                    </div>
                    <div className="pr4-side-panel">
                        <h3>{isEn ? 'Software Proficiency' : 'Kemahiran Software'}</h3>
                        <ul>
                            {displayedSkills.slice(0, 6).map(item => (
                                <li key={item.id}>{item.name}</li>
                            ))}
                        </ul>
                        <h3>{isEn ? 'Portfolio' : 'Portofolio'}</h3>
                        <p>{personal.website || 'reallygreatsite.com'}</p>
                    </div>
                </section>

                <footer className="pr4-footer">
                    {contactItems.map((item, idx) => (
                        <span key={`${item.label}-${idx}`}>{item.value}</span>
                    ))}
                </footer>
            </div>
        );
    }

    if (variant === 'premium-noir') {
        return (
            <div className="pr5-layout">
                <header className="pr5-header">
                    <div>
                        <h1>{heroName}</h1>
                        <p>{heroRole}</p>
                    </div>
                    {settings.showPhoto && personal.photo && (
                        <div className="pr5-diamond">
                            <img src={personal.photo} alt={heroName} />
                        </div>
                    )}
                </header>

                <section className="pr5-about">
                    <h2>{isEn ? 'About Me' : 'Tentang Saya'}</h2>
                    <div dangerouslySetInnerHTML={{ __html: summaryHtml }} />
                    <div className="pr5-contact-inline">
                        {contactItems.map((item, idx) => (
                            <span key={`${item.label}-${idx}`}>{item.value}</span>
                        ))}
                    </div>
                </section>

                <div className="pr5-main">
                    <section className="pr5-column">
                        <h3>{t.experience}</h3>
                        {expItems.slice(0, 3).map(item => (
                            <article key={item.id} className="pr5-timeline-item">
                                <small>{rangeLabel(item.startDate, item.endDate)}</small>
                                <strong>{item.title || t.defaultPosition}</strong>
                                <span>{item.company}</span>
                            </article>
                        ))}

                        <h3>{t.education}</h3>
                        {eduItems.slice(0, 2).map(item => (
                            <article key={item.id} className="pr5-timeline-item">
                                <small>{rangeLabel(item.startDate, item.endDate)}</small>
                                <strong>{item.degree || t.education}</strong>
                                <span>{item.school || t.defaultInstitution}</span>
                            </article>
                        ))}
                    </section>

                    <section className="pr5-column">
                        <h3>{t.skills}</h3>
                        <div className="pr5-skill-grid">
                            {displayedSkills.slice(0, 6).map(item => (
                                <div key={item.id} className="pr5-skill-circle">
                                    <span>{item.name.slice(0, 2).toUpperCase()}</span>
                                    <small>{item.name}</small>
                                </div>
                            ))}
                        </div>
                        <h3>{isEn ? 'Highlight' : 'Highlight'}</h3>
                        <div className="pr5-highlight">
                            {heroRole}
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    if (variant === 'premium-rose') {
        return (
            <div className="pr6-layout">
                <header className="pr6-header">
                    <div className="pr6-image-wrap">
                        {settings.showPhoto && personal.photo ? (
                            <img src={personal.photo} alt={heroName} />
                        ) : (
                            <div className="pr6-photo-placeholder">{heroName.slice(0, 1).toUpperCase()}</div>
                        )}
                    </div>
                    <div className="pr6-intro">
                        <h1>{heroName}</h1>
                        <p>{heroRole}</p>
                        <div dangerouslySetInnerHTML={{ __html: summaryHtml }} />
                    </div>
                </header>

                <div className="pr6-columns">
                    <section>
                        <h2>{t.education}</h2>
                        {eduItems.slice(0, 3).map(item => (
                            <article key={item.id}>
                                <small>{rangeLabel(item.startDate, item.endDate)}</small>
                                <strong>{item.school || t.defaultInstitution}</strong>
                                <p>{item.degree}</p>
                            </article>
                        ))}

                        <h2>{t.skills}</h2>
                        {displayedSkills.slice(0, 5).map(item => (
                            <div key={item.id} className="pr6-meter">
                                <span>{item.name}</span>
                                <div className="pr6-meter-track">
                                    <div style={{ width: `${(item.level / 5) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </section>

                    <section>
                        <h2>{t.experience}</h2>
                        {expItems.slice(0, 3).map(item => (
                            <article key={item.id}>
                                <small>{rangeLabel(item.startDate, item.endDate)}</small>
                                <strong>{item.title || t.defaultPosition}</strong>
                                <p>{item.company}</p>
                                {hasRichText(item.description) && (
                                    <div dangerouslySetInnerHTML={{ __html: item.description }} />
                                )}
                            </article>
                        ))}

                        <h2>{t.contact}</h2>
                        <ul className="pr6-contact">
                            {contactItems.map((item, idx) => (
                                <li key={`${item.label}-${idx}`}>{item.value}</li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>
        );
    }

    if (variant === 'premium-emerald') {
        return (
            <div className="pr7-layout">
                <header className="pr7-header">
                    <div>
                        <h1>{heroName}</h1>
                        <p>{heroRole}</p>
                    </div>
                    <div className="pr7-contact-box">
                        {contactItems.map((item, idx) => (
                            <span key={`${item.label}-${idx}`}>{item.value}</span>
                        ))}
                    </div>
                </header>

                <section className="pr7-block">
                    <h2>{isEn ? 'Professional Profile' : 'Profil Profesional'}</h2>
                    <div dangerouslySetInnerHTML={{ __html: summaryHtml }} />
                </section>

                <section className={`pr7-block pr7-exp-wrap${hasHeroPhoto ? '' : ' no-photo'}`}>
                    <div className="pr7-exp-list">
                        <h2>{isEn ? 'Work Experience' : 'Pengalaman Kerja'}</h2>
                        {expItems.slice(0, 3).map(item => (
                            <article key={item.id}>
                                <strong>{item.title || t.defaultPosition} ({rangeLabel(item.startDate, item.endDate)})</strong>
                                <p>{item.company}</p>
                                {hasRichText(item.description) && (
                                    <div dangerouslySetInnerHTML={{ __html: item.description }} />
                                )}
                            </article>
                        ))}
                    </div>
                    {hasHeroPhoto && <img src={personal.photo} alt={heroName} />}
                </section>

                <section className="pr7-block">
                    <h2>{isEn ? 'Education Background' : 'Latar Belakang Pendidikan'}</h2>
                    <div className="pr7-edu-grid">
                        {eduItems.slice(0, 2).map((item, idx) => (
                            <article key={item.id}>
                                <span className="pr7-num">{String(idx + 1).padStart(2, '0')}</span>
                                <div>
                                    <strong>{item.degree || t.education} ({rangeLabel(item.startDate, item.endDate)})</strong>
                                    <p>{item.school || t.defaultInstitution}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="pr7-skills-row">
                    <h2>{isEn ? 'Skills & Competencies' : 'Keahlian dan Kompetensi'}</h2>
                    <ul>
                        {displayedSkills.slice(0, 8).map(item => (
                            <li key={item.id}>{item.name}</li>
                        ))}
                    </ul>
                </section>
            </div>
        );
    }

    return (
        <div className="pr8-layout">
            <header className="pr8-header">
                <div className="pr8-mark">{premiumMonogram}</div>
                <h1>{heroName}</h1>
                <p>{heroRole}</p>
            </header>

            <div className="pr8-columns">
                <section>
                    <h2>{t.profile}</h2>
                    <div dangerouslySetInnerHTML={{ __html: summaryHtml }} />

                    <h2>{t.experience}</h2>
                    {expItems.slice(0, 4).map(item => (
                        <article key={item.id}>
                            <strong>{item.title || t.defaultPosition}</strong>
                            <p>{item.company}</p>
                            <small>{rangeLabel(item.startDate, item.endDate)}</small>
                            {hasRichText(item.description) && (
                                <div>{stripHtml(item.description)}</div>
                            )}
                        </article>
                    ))}
                </section>

                <section>
                    <h2>{t.contact}</h2>
                    <ul className="pr8-contact">
                        {contactItems.map((item, idx) => (
                            <li key={`${item.label}-${idx}`}>{item.value}</li>
                        ))}
                    </ul>

                    <h2>{t.education}</h2>
                    {eduItems.slice(0, 3).map(item => (
                        <article key={item.id}>
                            <strong>{item.school || t.defaultInstitution}</strong>
                            <p>{item.degree}</p>
                            <small>{rangeLabel(item.startDate, item.endDate)}</small>
                        </article>
                    ))}

                    <h2>{t.skills}</h2>
                    <ul className="pr8-skill-list">
                        {displayedSkills.slice(0, 8).map(item => (
                            <li key={item.id}>{item.name}</li>
                        ))}
                    </ul>

                    {langItems.length > 0 && (
                        <>
                            <h2>{t.languages}</h2>
                            <ul className="pr8-skill-list">
                                {langItems.slice(0, 4).map(item => (
                                    <li key={item.id}>{item.name} ({item.level})</li>
                                ))}
                            </ul>
                        </>
                    )}

                    {timelineSource.length > 0 && certItems.length > 0 && (
                        <>
                            <h2>{t.certifications}</h2>
                            <ul className="pr8-skill-list">
                                {certItems.slice(0, 4).map(item => (
                                    <li key={item.id}>{item.name}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
