'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import react-quill-new to avoid SSR "document is not defined" error
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface RichTextInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function RichTextInput({ value, onChange, placeholder, className }: RichTextInputProps) {
    // Defines standard formatting options (bold, italic, lists)
    const modules = useMemo(() => ({
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
        ],
    }), []);

    return (
        <div className={`cv-rich-text ${className || ''}`}>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                placeholder={placeholder}
            />
        </div>
    );
}
