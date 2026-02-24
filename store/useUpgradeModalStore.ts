'use client';

import { create } from 'zustand';

export type UpgradeSource = 'ai' | 'download' | 'template' | 'general';

interface UpgradeModalState {
    isOpen: boolean;
    source: UpgradeSource;
    message: string;
    openModal: (source?: UpgradeSource, message?: string) => void;
    closeModal: () => void;
}

export const useUpgradeModalStore = create<UpgradeModalState>((set) => ({
    isOpen: false,
    source: 'general',
    message: '',
    openModal: (source = 'general', message = '') =>
        set({ isOpen: true, source, message }),
    closeModal: () => set({ isOpen: false, message: '' }),
}));
