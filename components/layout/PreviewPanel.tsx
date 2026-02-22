'use client';

import { useCVStore } from '@/store/useCVStore';
import TemplateRenderer from '@/components/preview/TemplateRenderer';
import CVScoreBadge from '@/components/preview/CVScoreBadge';
import { TEMPLATES, getAccessibleTemplateId } from '@/lib/templates';

export default function PreviewPanel() {
    const settings = useCVStore(s => s.settings);
    const activeTemplateId = getAccessibleTemplateId(settings.template, settings.isPremiumUser);
    const templateName = TEMPLATES.find(t => t.id === activeTemplateId)?.name || activeTemplateId;

    return (
        <section className="preview-panel" id="previewPanel">
            <CVScoreBadge />
            <div className="preview-toolbar">
                <span className="preview-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                    Live Preview
                </span>
                <span className="preview-template-badge" id="previewTemplateBadge">{templateName}</span>
            </div>
            <TemplateRenderer />
        </section>
    );
}
