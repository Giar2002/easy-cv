'use client';

import AppHeader from '@/components/layout/AppHeader';
import EditorPanel from '@/components/layout/EditorPanel';
import PreviewPanel from '@/components/layout/PreviewPanel';
import OnboardingWizard from '@/components/modals/OnboardingWizard';

export default function BuilderPage() {
    return (
        <div className="app-wrapper">
            <AppHeader />
            <main className="app-main">
                <EditorPanel />
                <PreviewPanel />
            </main>
            <OnboardingWizard />
        </div>
    );
}
