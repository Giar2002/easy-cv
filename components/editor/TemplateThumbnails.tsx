import { TemplateConfig } from '@/types/cv';

export default function TemplateThumbnail({ tpl }: { tpl: TemplateConfig }) {
    switch (tpl.id) {
        case 'modern':
            return (
                <>
                    <div className="tpl-mini-header">
                        <div className="tpl-mini-photo"></div>
                        <div className="tpl-mini-lines">
                            <div className="tpl-mini-line w70 accent"></div>
                            <div className="tpl-mini-line w50"></div>
                        </div>
                    </div>
                    <div className="tpl-mini-line w100 accent thin"></div>
                    <div className="tpl-mini-section">
                        <div className="tpl-mini-line w40 accent"></div>
                        <div className="tpl-mini-line w90"></div>
                        <div className="tpl-mini-line w80"></div>
                    </div>
                </>
            );
        case 'classic':
            return (
                <>
                    <div className="tpl-mini-center">
                        <div className="tpl-mini-line w60 accent center"></div>
                        <div className="tpl-mini-line w40 center"></div>
                    </div>
                    <div className="tpl-mini-line w100 border-b"></div>
                    <div className="tpl-mini-section">
                        <div className="tpl-mini-line w30 bold"></div>
                        <div className="tpl-mini-line w90"></div>
                        <div className="tpl-mini-line w80"></div>
                    </div>
                </>
            );
        case 'minimalist':
            return (
                <>
                    <div className="tpl-mini-left">
                        <div className="tpl-mini-line w80 bold"></div>
                        <div className="tpl-mini-line w50"></div>
                    </div>
                    <div className="tpl-mini-spacer"></div>
                    <div className="tpl-mini-section">
                        <div className="tpl-mini-line w25 upper"></div>
                        <div className="tpl-mini-line w90"></div>
                        <div className="tpl-mini-line w85"></div>
                    </div>
                </>
            );
        case 'ats':
            return (
                <>
                    <div className="tpl-mini-left">
                        <div className="tpl-mini-line w70 bold"></div>
                        <div className="tpl-mini-line w90"></div>
                    </div>
                    <div className="tpl-mini-line w100 border-b"></div>
                    <div className="tpl-mini-section">
                        <div className="tpl-mini-line w35 bold upper"></div>
                        <div className="tpl-mini-line w95"></div>
                        <div className="tpl-mini-line w90"></div>
                        <div className="tpl-mini-line w85"></div>
                    </div>
                </>
            );
        case 'elegant':
            return (
                <>
                    <div className="tpl-mini-center">
                        <div className="tpl-mini-photo small"></div>
                        <div className="tpl-mini-line w55 center serif"></div>
                        <div className="tpl-mini-line w35 center"></div>
                    </div>
                    <div className="tpl-mini-line w30 center border-b accent"></div>
                    <div className="tpl-mini-section">
                        <div className="tpl-mini-line w30 serif"></div>
                        <div className="tpl-mini-line w90"></div>
                        <div className="tpl-mini-line w85"></div>
                    </div>
                </>
            );
        case 'creative':
            return (
                <>
                    <div className="tpl-mini-split">
                        <div className="tpl-mini-sidebar">
                            <div className="tpl-mini-photo small circle"></div>
                            <div className="tpl-mini-line w60 white"></div>
                        </div>
                        <div className="tpl-mini-main">
                            <div className="tpl-mini-line w80 bold big"></div>
                            <div className="tpl-mini-line w60 accent"></div>
                            <div className="tpl-mini-section">
                                <div className="tpl-mini-line w90"></div>
                                <div className="tpl-mini-line w80"></div>
                            </div>
                        </div>
                    </div>
                </>
            );
        case 'executive':
            return (
                <>
                    <div className="tpl-mini-header-box">
                        <div className="tpl-mini-line w70 white bold"></div>
                        <div className="tpl-mini-line w50 white"></div>
                    </div>
                    <div className="tpl-mini-section">
                        <div className="tpl-mini-line w30 bold upper"></div>
                        <div className="tpl-mini-line w100 double-border"></div>
                        <div className="tpl-mini-line w95"></div>
                        <div className="tpl-mini-line w90"></div>
                    </div>
                </>
            );
        case 'tech':
            return (
                <>
                    <div className="tpl-mini-left">
                        <div className="tpl-mini-line w60 mono bold"></div>
                        <div className="tpl-mini-line w40 mono accent"></div>
                    </div>
                    <div className="tpl-mini-section">
                        <div className="tpl-mini-line w20 mono bold prefix"></div>
                        <div className="tpl-mini-line w90 mono"></div>
                        <div className="tpl-mini-line w85 mono"></div>
                    </div>
                </>
            );
        case 'academic':
            return (
                <>
                    <div className="tpl-mini-center">
                        <div className="tpl-mini-line w80 serif bold"></div>
                        <div className="tpl-mini-line w60 serif"></div>
                    </div>
                    <div className="tpl-mini-section">
                        <div className="tpl-mini-line w100 border-b"></div>
                        <div className="tpl-mini-line w100 serif small-gap"></div>
                        <div className="tpl-mini-line w100 serif small-gap"></div>
                        <div className="tpl-mini-line w100 serif small-gap"></div>
                    </div>
                </>
            );
        case 'compact':
            return (
                <>
                    <div className="tpl-mini-left dense">
                        <div className="tpl-mini-line w50 bold"></div>
                        <div className="tpl-mini-line w40"></div>
                    </div>
                    <div className="tpl-mini-cols">
                        <div className="tpl-mini-col">
                            <div className="tpl-mini-line w100"></div>
                            <div className="tpl-mini-line w100"></div>
                        </div>
                        <div className="tpl-mini-col">
                            <div className="tpl-mini-line w100"></div>
                            <div className="tpl-mini-line w100"></div>
                        </div>
                    </div>
                </>
            );
        case 'ats-clean':
            return (
                <>
                    <div className="tpl-mini-section">
                        <div className="tpl-mini-line w60 bold"></div>
                        <div className="tpl-mini-line w40"></div>
                        <div className="tpl-mini-line w100 thin"></div>
                        <div className="tpl-mini-line w90"></div>
                        <div className="tpl-mini-line w85"></div>
                    </div>
                </>
            );
        case 'ats-structured':
            return (
                <>
                    <div className="tpl-mini-section">
                        <div className="tpl-mini-line w50 bold"></div>
                        <div className="tpl-mini-line w100 thin"></div>
                        <div className="tpl-mini-line w30 bold"></div>
                        <div className="tpl-mini-line w80"></div>
                        <div className="tpl-mini-line w75"></div>
                    </div>
                </>
            );
        case 'ats-corporate':
            return (
                <>
                    <div className="tpl-mini-section">
                        <div className="tpl-mini-line w70 bold"></div>
                        <div className="tpl-mini-line w45"></div>
                        <div className="tpl-mini-line w100 thin"></div>
                        <div className="tpl-mini-line w95"></div>
                    </div>
                </>
            );
        case 'infographic':
            return (
                <>
                    <div className="tpl-mini-sidebar accent"></div>
                    <div className="tpl-mini-right">
                        <div className="tpl-mini-line w60 accent bold"></div>
                        <div className="tpl-mini-bar w80"></div>
                        <div className="tpl-mini-bar w60"></div>
                        <div className="tpl-mini-bar w90"></div>
                    </div>
                </>
            );
        case 'portfolio':
            return (
                <>
                    <div className="tpl-mini-header accent">
                        <div className="tpl-mini-photo"></div>
                    </div>
                    <div className="tpl-mini-grid">
                        <div className="tpl-mini-box"></div>
                        <div className="tpl-mini-box"></div>
                        <div className="tpl-mini-box"></div>
                    </div>
                </>
            );
        case 'designer':
            return (
                <>
                    <div className="tpl-mini-header" style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '4px' }}>
                        <div>
                            <div className="tpl-mini-line w60 bold"></div>
                            <div className="tpl-mini-line w40 accent"></div>
                        </div>
                    </div>
                    <div className="tpl-mini-line w90" style={{ marginTop: '4px' }}></div>
                    <div className="tpl-mini-line w80"></div>
                    <div className="tpl-mini-line w85"></div>
                </>
            );
        case 'banking':
            return (
                <>
                    <div className="tpl-mini-header serif">
                        <div className="tpl-mini-line w60 bold"></div>
                        <div className="tpl-mini-line w40"></div>
                    </div>
                    <div className="tpl-mini-line w100 thin"></div>
                    <div className="tpl-mini-line w90"></div>
                    <div className="tpl-mini-line w85"></div>
                </>
            );
        case 'consulting':
            return (
                <>
                    <div className="tpl-mini-header">
                        <div className="tpl-mini-line w55 bold"></div>
                    </div>
                    <div className="tpl-mini-section">
                        <div className="tpl-mini-line w40 bold"></div>
                        <div className="tpl-mini-line w100"></div>
                        <div className="tpl-mini-line w95"></div>
                    </div>
                </>
            );
        case 'law':
            return (
                <>
                    <div className="tpl-mini-header serif">
                        <div className="tpl-mini-line w70 bold"></div>
                        <div className="tpl-mini-line w50"></div>
                        <div className="tpl-mini-line w100 thin"></div>
                    </div>
                    <div className="tpl-mini-line w95"></div>
                    <div className="tpl-mini-line w90"></div>
                </>
            );
        case 'startup':
            return (
                <>
                    <div className="tpl-mini-header">
                        <div className="tpl-mini-line w65 accent bold"></div>
                        <div className="tpl-mini-line w45"></div>
                    </div>
                    <div className="tpl-mini-section">
                        <div className="tpl-mini-line w90"></div>
                        <div className="tpl-mini-line w85"></div>
                    </div>
                </>
            );
        case 'healthcare':
            return (
                <>
                    <div className="tpl-mini-header">
                        <div className="tpl-mini-line w60 bold"></div>
                        <div className="tpl-mini-line w40"></div>
                    </div>
                    <div className="tpl-mini-section">
                        <div className="tpl-mini-line w35 bold"></div>
                        <div className="tpl-mini-line w100"></div>
                        <div className="tpl-mini-line w90"></div>
                    </div>
                </>
            );
        case 'engineering':
            return (
                <>
                    <div className="tpl-mini-header">
                        <div className="tpl-mini-line w70 bold"></div>
                        <div className="tpl-mini-line w50"></div>
                    </div>
                    <div className="tpl-mini-cols">
                        <div className="tpl-mini-col">
                            <div className="tpl-mini-line w100"></div>
                            <div className="tpl-mini-line w90"></div>
                        </div>
                        <div className="tpl-mini-col">
                            <div className="tpl-mini-line w100"></div>
                            <div className="tpl-mini-line w80"></div>
                        </div>
                    </div>
                </>
            );
        case 'two-column':
            return (
                <>
                    <div className="tpl-mini-cols equal">
                        <div className="tpl-mini-col">
                            <div className="tpl-mini-line w100 bold"></div>
                            <div className="tpl-mini-line w90"></div>
                            <div className="tpl-mini-line w85"></div>
                        </div>
                        <div className="tpl-mini-col">
                            <div className="tpl-mini-line w100 bold"></div>
                            <div className="tpl-mini-line w95"></div>
                            <div className="tpl-mini-line w80"></div>
                        </div>
                    </div>
                </>
            );
        case 'timeline':
            return (
                <>
                    <div className="tpl-mini-timeline">
                        <div className="tpl-mini-timeline-line"></div>
                        <div className="tpl-mini-timeline-item">
                            <div className="tpl-mini-dot accent"></div>
                            <div className="tpl-mini-line w80"></div>
                        </div>
                        <div className="tpl-mini-timeline-item">
                            <div className="tpl-mini-dot accent"></div>
                            <div className="tpl-mini-line w75"></div>
                        </div>
                    </div>
                </>
            );
        case 'magazine':
            return (
                <>
                    <div className="tpl-mini-magazine">
                        <div className="tpl-mini-line w70 accent bold large"></div>
                        <div className="tpl-mini-line w50 accent"></div>
                        <div className="tpl-mini-cols">
                            <div className="tpl-mini-col">
                                <div className="tpl-mini-line w100"></div>
                            </div>
                            <div className="tpl-mini-col">
                                <div className="tpl-mini-line w100"></div>
                            </div>
                        </div>
                    </div>
                </>
            );
        case 'sidebar-dark':
            return (
                <>
                    <div className="tpl-mini-sidebar-dark">
                        <div className="tpl-mini-sidebar-panel">
                            <div className="tpl-mini-avatar-circle"></div>
                            <div className="tpl-mini-line w80 light mt4"></div>
                            <div className="tpl-mini-line w60 light mt2"></div>
                            <div className="tpl-mini-line w80 light mt6"></div>
                            <div className="tpl-mini-line w70 light"></div>
                        </div>
                        <div className="tpl-mini-sidebar-content">
                            <div className="tpl-mini-line w90 bold large mb2"></div>
                            <div className="tpl-mini-line w60 accent mb4"></div>
                            <div className="tpl-mini-line w40 accent-bar mb2"></div>
                            <div className="tpl-mini-line w80 mb1"></div>
                            <div className="tpl-mini-line w70 mb1"></div>
                            <div className="tpl-mini-line w40 accent-bar mt3 mb2"></div>
                            <div className="tpl-mini-line w80 mb1"></div>
                            <div className="tpl-mini-line w60 mb1"></div>
                        </div>
                    </div>
                </>
            );
        case 'skills-first':
            return (
                <>
                    <div className="tpl-mini-skills-first">
                        <div className="tpl-mini-line w70 bold large mb1"></div>
                        <div className="tpl-mini-line w50 accent mb3"></div>
                        <div className="tpl-mini-line w35 accent-bar mb2"></div>
                        <div className="tpl-mini-skills-row">
                            <div className="tpl-mini-skill-chip"></div>
                            <div className="tpl-mini-skill-chip"></div>
                            <div className="tpl-mini-skill-chip"></div>
                        </div>
                        <div className="tpl-mini-skills-row">
                            <div className="tpl-mini-skill-chip"></div>
                            <div className="tpl-mini-skill-chip"></div>
                        </div>
                        <div className="tpl-mini-line w35 accent-bar mt3 mb2"></div>
                        <div className="tpl-mini-line w80 mb1"></div>
                        <div className="tpl-mini-line w65 mb1"></div>
                    </div>
                </>
            );
        case 'bold-header':
            return (
                <>
                    <div className="tpl-mini-bold-header">
                        <div className="tpl-mini-bold-banner">
                            <div className="tpl-mini-line w80 bold light large mb1"></div>
                            <div className="tpl-mini-line w55 light mb1"></div>
                            <div className="tpl-mini-line w65 light small"></div>
                        </div>
                        <div className="tpl-mini-bold-body">
                            <div className="tpl-mini-line w35 accent-bar mb2"></div>
                            <div className="tpl-mini-line w80 mb1"></div>
                            <div className="tpl-mini-line w65 mb1"></div>
                            <div className="tpl-mini-line w35 accent-bar mt3 mb2"></div>
                            <div className="tpl-mini-line w80 mb1"></div>
                            <div className="tpl-mini-line w70 mb1"></div>
                        </div>
                    </div>
                </>
            );
        case 'hybrid':
            return (
                <>
                    <div className="tpl-mini-hybrid">
                        <div className="tpl-mini-line w70 bold large mb1"></div>
                        <div className="tpl-mini-line w50 accent mb2"></div>
                        <div className="tpl-mini-hybrid-summary"></div>
                        <div className="tpl-mini-hybrid-cols">
                            <div className="tpl-mini-hybrid-left">
                                <div className="tpl-mini-line w80 accent mb1"></div>
                                <div className="tpl-mini-skill-chip sm"></div>
                                <div className="tpl-mini-skill-chip sm"></div>
                                <div className="tpl-mini-skill-chip sm"></div>
                            </div>
                            <div className="tpl-mini-hybrid-right">
                                <div className="tpl-mini-line w80 accent mb1"></div>
                                <div className="tpl-mini-line w80 mb1"></div>
                                <div className="tpl-mini-line w60 mb1"></div>
                            </div>
                        </div>
                    </div>
                </>
            );
        case 'monogram':
            return (
                <>
                    <div className="tpl-mini-monogram">
                        <div className="tpl-mini-monogram-initial">A</div>
                        <div className="tpl-mini-line w70 bold large mb1"></div>
                        <div className="tpl-mini-line w50 accent mb3"></div>
                        <div className="tpl-mini-line w35 accent-bar mb2"></div>
                        <div className="tpl-mini-line w80 mb1"></div>
                        <div className="tpl-mini-line w65 mb1"></div>
                    </div>
                </>
            );
        case 'premium-pop':
            return (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '4px', height: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ background: '#f5e96d', border: '1.5px solid #1f1f1f', borderRadius: '6px', padding: '4px' }}>
                                <div className="tpl-mini-line w80 bold" style={{ background: '#1f1f1f', height: '4px' }} />
                                <div className="tpl-mini-line w65 bold mt2" style={{ background: '#1f1f1f', height: '4px' }} />
                            </div>
                            <div style={{ background: '#f5e96d', border: '1.5px solid #1f1f1f', borderRadius: '6px', padding: '4px' }}>
                                <div className="tpl-mini-line w55" style={{ background: '#8f62ff', height: '5px' }} />
                                <div className="tpl-mini-line w90 mt2" />
                                <div className="tpl-mini-line w85" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ background: '#f5e96d', border: '1.5px solid #1f1f1f', borderRadius: '6px', padding: '4px' }}>
                                <div className="tpl-mini-photo" style={{ width: '20px', height: '20px', margin: '0 auto', border: '2px solid #fff' }} />
                            </div>
                            <div style={{ background: '#f5e96d', border: '1.5px solid #1f1f1f', borderRadius: '6px', padding: '4px' }}>
                                <div className="tpl-mini-line w60" style={{ background: '#8f62ff', height: '5px' }} />
                                <div className="tpl-mini-line w85 mt2" />
                                <div className="tpl-mini-line w75" />
                            </div>
                        </div>
                    </div>
                </>
            );
        case 'premium-retro':
            return (
                <>
                    <div style={{ border: '1.5px solid #222', borderRadius: '7px', padding: '4px', display: 'flex', gap: '4px', background: '#f8f2e8' }}>
                        <div style={{ width: '22px', height: '28px', border: '1.5px solid #222', borderRadius: '5px', background: '#f79ac4' }} />
                        <div style={{ flex: 1 }}>
                            <div className="tpl-mini-line w70 bold" style={{ background: '#222', height: '5px' }} />
                            <div className="tpl-mini-line w55 bold mt2" style={{ background: '#222', height: '5px' }} />
                            <div className="tpl-mini-line w60 mt2" style={{ background: '#f79ac4' }} />
                        </div>
                    </div>
                    <div style={{ marginTop: '4px', border: '1.5px solid #222', borderRadius: '7px', padding: '4px' }}>
                        <div className="tpl-mini-line w50" style={{ background: '#222', height: '4px' }} />
                        <div className="tpl-mini-line w90 mt2" />
                        <div className="tpl-mini-line w80" />
                    </div>
                </>
            );
        case 'premium-soft':
            return (
                <>
                    <div style={{ background: 'linear-gradient(90deg,#e6dccf 60%,#d6cbc3 40%)', borderRadius: '7px', padding: '4px', border: '1px solid #d4c9bc' }}>
                        <div className="tpl-mini-line w65 bold" style={{ background: '#6f5b36', height: '4px' }} />
                        <div className="tpl-mini-line w50 mt2" style={{ background: '#6f5b36' }} />
                    </div>
                    <div style={{ marginTop: '4px', borderRadius: '6px', background: '#fff', border: '1px solid #e6e1da', padding: '4px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                        <div className="tpl-mini-line w90" />
                        <div className="tpl-mini-line w90" />
                        <div className="tpl-mini-line w80" />
                        <div className="tpl-mini-line w80" />
                    </div>
                </>
            );
        case 'premium-gallery':
            return (
                <>
                    <div className="tpl-mini-line w100" style={{ background: '#f28c28', height: '3px' }} />
                    <div style={{ marginTop: '4px', display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '4px' }}>
                        <div style={{ background: '#f5e57a', borderRadius: '4px', height: '32px' }} />
                        <div>
                            <div className="tpl-mini-line w75 bold" style={{ background: '#222', height: '5px' }} />
                            <div className="tpl-mini-line w50 mt2" style={{ background: '#f28c28' }} />
                            <div className="tpl-mini-line w90 mt2" />
                        </div>
                    </div>
                    <div style={{ marginTop: '4px', display: 'grid', gridTemplateColumns: '1fr 1fr 0.7fr', gap: '3px' }}>
                        <div className="tpl-mini-line w100" />
                        <div className="tpl-mini-line w100" />
                        <div className="tpl-mini-line w100" style={{ background: '#f6f2eb' }} />
                    </div>
                </>
            );
        case 'premium-noir':
            return (
                <>
                    <div style={{ background: '#1c1c1f', borderRadius: '7px', padding: '4px' }}>
                        <div className="tpl-mini-line w65 bold" style={{ background: '#f6c63d', height: '5px' }} />
                        <div className="tpl-mini-line w45 mt2" style={{ background: '#f6c63d' }} />
                    </div>
                    <div style={{ marginTop: '4px', background: '#232326', borderRadius: '7px', padding: '4px' }}>
                        <div className="tpl-mini-line w55" style={{ background: '#f6c63d', height: '4px' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', marginTop: '3px' }}>
                            <div className="tpl-mini-line w100" style={{ background: '#f0cf6a' }} />
                            <div className="tpl-mini-line w100" style={{ background: '#f0cf6a' }} />
                        </div>
                    </div>
                </>
            );
        case 'premium-rose':
            return (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '4px' }}>
                        <div style={{ background: '#f2d9e6', borderRadius: '7px', height: '34px', border: '1px solid #e2c2d5' }} />
                        <div>
                            <div className="tpl-mini-line w80 bold" style={{ background: '#4f3b45', height: '4px' }} />
                            <div className="tpl-mini-line w60 mt2" style={{ background: '#4f3b45' }} />
                            <div className="tpl-mini-line w90 mt2" />
                        </div>
                    </div>
                    <div style={{ marginTop: '4px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                        <div className="tpl-mini-line w95" />
                        <div className="tpl-mini-line w95" />
                        <div className="tpl-mini-line w85" style={{ background: '#d982ad' }} />
                        <div className="tpl-mini-line w85" style={{ background: '#d982ad' }} />
                    </div>
                </>
            );
        case 'premium-emerald':
            return (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '3px' }}>
                        <div>
                            <div className="tpl-mini-line w80 bold" style={{ background: '#202428', height: '5px' }} />
                            <div className="tpl-mini-line w60 mt2" style={{ background: '#202428' }} />
                        </div>
                        <div style={{ background: '#0f9d59', borderRadius: '5px', height: '18px' }} />
                    </div>
                    <div style={{ marginTop: '4px', background: '#eef0f2', borderRadius: '6px', padding: '4px' }}>
                        <div className="tpl-mini-line w90" />
                        <div className="tpl-mini-line w95 mt2" />
                        <div className="tpl-mini-line w80" />
                    </div>
                </>
            );
        case 'premium-monogram':
            return (
                <>
                    <div style={{ background: '#f5f1f4', borderRadius: '7px', padding: '4px', textAlign: 'center' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid #c8bda9', margin: '0 auto 2px', fontSize: '8px', lineHeight: '14px', color: '#6f6250' }}>km</div>
                        <div className="tpl-mini-line w75" style={{ background: '#4f5660', margin: '0 auto', height: '4px' }} />
                    </div>
                    <div style={{ marginTop: '4px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                        <div className="tpl-mini-line w95" />
                        <div className="tpl-mini-line w95" />
                        <div className="tpl-mini-line w85" />
                        <div className="tpl-mini-line w85" />
                    </div>
                </>
            );
        default:
            return <div />;
    }
}
