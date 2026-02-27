'use client';

import { useState } from 'react';
import { useCVStore } from '@/store/useCVStore';

const PROMPT_TEMPLATE_ID = `Tolong buatkan data CV saya dalam format JSON dengan struktur berikut:

Format JSON:
{
  "personal": {
    "fullName": "Nama lengkap",
    "jobTitle": "Posisi/jabatan yang diinginkan",
    "email": "email@example.com",
    "phone": "081234567890",
    "location": "Kota, Negara",
    "website": "https://linkedin.com/in/username atau URL portfolio",
    "summary": "Ringkasan profesional 2-3 kalimat tentang expertise dan pengalaman"
  },
  "experience": [
    {
      "title": "Posisi/Jabatan",
      "company": "Nama Perusahaan",
      "startDate": "Jan 2020",
      "endDate": "Sekarang",
      "description": "• Pencapaian 1\\n• Pencapaian 2\\n• Pencapaian 3"
    }
  ],
  "education": [
    {
      "school": "Nama Universitas/Sekolah",
      "degree": "Gelar (S1/S2/D3/SMA)",
      "fieldOfStudy": "Jurusan",
      "startDate": "2016",
      "endDate": "2020"
    }
  ],
  "skills": [
    {
      "name": "Nama Skill",
      "proficiency": 4
    }
  ],
  "projects": [
    {
      "name": "Nama Proyek",
      "role": "Peran di proyek",
      "startDate": "Jan 2021",
      "endDate": "Jun 2021",
      "description": "Deskripsi singkat proyek",
      "link": "https://github.com/username/project"
    }
  ],
  "certifications": [
    {
      "name": "Nama Sertifikasi",
      "issuer": "Lembaga Penerbit",
      "date": "2023",
      "link": "https://credential-url.com"
    }
  ],
  "languages": [
    {
      "name": "Bahasa Indonesia",
      "level": "Native"
    }
  ]
}

Data saya:
[GANTI DENGAN DATA ANDA - contoh: Nama saya Ahmad, lulusan Teknik Informatika, pernah kerja sebagai Frontend Developer di PT ABC selama 3 tahun, skill utama React dan Vue...]

Tolong generate dalam format JSON yang valid, siap untuk di-copy-paste.`;

const PROMPT_TEMPLATE_EN = `Please generate my CV data in JSON format using this structure:

JSON Format:
{
  "personal": {
    "fullName": "Full name",
    "jobTitle": "Desired position/role",
    "email": "email@example.com",
    "phone": "+123456789",
    "location": "City, Country",
    "website": "https://linkedin.com/in/username or portfolio URL",
    "summary": "Professional summary in 2-3 sentences about expertise and experience"
  },
  "experience": [
    {
      "title": "Position/Role",
      "company": "Company Name",
      "startDate": "Jan 2020",
      "endDate": "Present",
      "description": "• Achievement 1\\n• Achievement 2\\n• Achievement 3"
    }
  ],
  "education": [
    {
      "school": "University/School Name",
      "degree": "Degree (BSc/MSc/BA/etc.)",
      "fieldOfStudy": "Major",
      "startDate": "2016",
      "endDate": "2020"
    }
  ],
  "skills": [
    {
      "name": "Skill Name",
      "proficiency": 4
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "role": "Your role in the project",
      "startDate": "Jan 2021",
      "endDate": "Jun 2021",
      "description": "Short project description",
      "link": "https://github.com/username/project"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "2023",
      "link": "https://credential-url.com"
    }
  ],
  "languages": [
    {
      "name": "English",
      "level": "Native"
    }
  ]
}

My data:
[REPLACE WITH YOUR ACTUAL DATA - example: My name is Alex, I graduated in Computer Science, worked as a Frontend Developer at Company ABC for 3 years, and my core skills are React and Vue.]

Please output valid JSON ready to copy-paste.`;

const SCHEMA_TEMPLATE_ID = `{
  "personal": {
    "fullName": "string (required)",
    "jobTitle": "string (required)",
    "email": "string",
    "phone": "string",
    "location": "string",
    "website": "string (URL)",
    "summary": "string (min 30 karakter untuk skor maksimal)"
  },
  "experience": [
    {
      "title": "string (required)",
      "company": "string (required)",
      "startDate": "string (format: 'Jan 2020')",
      "endDate": "string ('Sekarang' atau 'Des 2023')",
      "description": "string (gunakan \\\\n untuk bullet points)"
    }
  ],
  "education": [
    {
      "school": "string (required)",
      "degree": "string",
      "fieldOfStudy": "string",
      "startDate": "string (tahun atau 'Jan 2020')",
      "endDate": "string"
    }
  ],
  "skills": [
    {
      "name": "string (required)",
      "proficiency": "number (1-5, opsional, default: 3)"
    }
  ],
  "projects": [
    {
      "name": "string",
      "role": "string",
      "startDate": "string",
      "endDate": "string",
      "description": "string",
      "link": "string (URL, opsional)"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string",
      "link": "string (URL, opsional)"
    }
  ],
  "languages": [
    {
      "name": "string",
      "level": "string (Native/Fluent/Professional/Conversational/Basic)"
    }
  ]
}`;

const SCHEMA_TEMPLATE_EN = `{
  "personal": {
    "fullName": "string (required)",
    "jobTitle": "string (required)",
    "email": "string",
    "phone": "string",
    "location": "string",
    "website": "string (URL)",
    "summary": "string (min 30 chars for best score)"
  },
  "experience": [
    {
      "title": "string (required)",
      "company": "string (required)",
      "startDate": "string (format: 'Jan 2020')",
      "endDate": "string ('Present' or 'Dec 2023')",
      "description": "string (use \\\\n for bullet points)"
    }
  ],
  "education": [
    {
      "school": "string (required)",
      "degree": "string",
      "fieldOfStudy": "string",
      "startDate": "string (year or 'Jan 2020')",
      "endDate": "string"
    }
  ],
  "skills": [
    {
      "name": "string (required)",
      "proficiency": "number (1-5, optional, default: 3)"
    }
  ],
  "projects": [
    {
      "name": "string",
      "role": "string",
      "startDate": "string",
      "endDate": "string",
      "description": "string",
      "link": "string (URL, optional)"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string",
      "link": "string (URL, optional)"
    }
  ],
  "languages": [
    {
      "name": "string",
      "level": "string (Native/Fluent/Professional/Conversational/Basic)"
    }
  ]
}`;

export default function AIImportModal({ onClose }: { onClose: () => void }) {
    const importData = useCVStore(s => s.importData);
    const language = useCVStore(s => s.settings.language) || 'en';
    const isEn = language === 'en';
    const [activeTab, setActiveTab] = useState<'prompt' | 'schema' | 'import'>('prompt');
    const [jsonInput, setJsonInput] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
    const promptTemplate = isEn ? PROMPT_TEMPLATE_EN : PROMPT_TEMPLATE_ID;
    const schemaTemplate = isEn ? SCHEMA_TEMPLATE_EN : SCHEMA_TEMPLATE_ID;

    const ui = {
        title: isEn ? 'Import JSON from AI Chat' : 'Import JSON dari AI Chat',
        tabPrompt: isEn ? 'Prompt Template' : 'Template Prompt',
        tabSchema: 'JSON Schema',
        tabImport: isEn ? 'Import Data' : 'Import Data',
        howToUse: isEn ? 'How to Use:' : 'Cara Pakai:',
        step1: isEn ? 'Copy the prompt below' : 'Copy prompt di bawah ini',
        step2: isEn ? 'Paste it into ChatGPT / Claude / any AI tool' : 'Paste ke ChatGPT / Claude / AI lainnya',
        step3: isEn ? 'Replace [YOUR DATA] with your own details' : 'Ganti [DATA ANDA] dengan informasi pribadi Anda',
        step4: isEn ? 'Copy the generated JSON result' : 'Copy hasil JSON yang di-generate AI',
        step5: isEn ? 'Open the "Import Data" tab and paste the JSON' : 'Klik tab "Import Data" dan paste JSON',
        schemaTitle: isEn ? 'JSON Structure:' : 'Struktur JSON:',
        notesTitle: isEn ? 'Notes:' : 'Catatan:',
        note1: isEn ? 'Fields marked with (required) must be filled' : 'Field dengan (required) wajib diisi',
        note2: isEn ? 'Proficiency: 1 = Beginner, 3 = Intermediate, 5 = Expert' : 'Proficiency: 1 = Beginner, 3 = Intermediate, 5 = Expert',
        note3: isEn ? 'At least 3 skills for optimal CV score' : 'Minimal 3 skills untuk skor CV optimal',
        note4: isEn ? 'Experience & Education can contain multiple entries (array)' : 'Experience & Education bisa multiple entries (array)',
        pasteTitle: isEn ? 'Paste JSON from AI:' : 'Paste JSON dari AI:',
        placeholder: isEn
            ? 'Paste AI JSON result here, example:\n{\n  "personal": {\n    "fullName": "Alex Doe",\n    ...\n  },\n  "experience": [...],\n  ...\n}'
            : 'Paste JSON hasil AI di sini, contoh:\n{\n  "personal": {\n    "fullName": "Ahmad Rizki",\n    ...\n  },\n  "experience": [...],\n  ...\n}',
        clear: isEn ? 'Clear' : 'Hapus',
        import: isEn ? 'Import Data' : 'Import Data',
        copy: isEn ? 'Copy' : 'Salin',
        copied: isEn ? '✓ Copied!' : '✓ Tersalin!',
        invalidFields: isEn
            ? 'JSON does not contain valid CV fields (personal, experience, etc.)'
            : 'JSON tidak memiliki field CV yang valid (personal, experience, dll)',
        success: isEn
            ? '✅ Data imported successfully! Please check your CV preview.'
            : '✅ Data berhasil diimport! Silakan cek preview CV Anda.',
        invalidJson: isEn
            ? '❌ Invalid JSON. Please make sure the JSON format is correct.'
            : '❌ JSON tidak valid. Pastikan format JSON benar.',
    };

    const copy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopyFeedback(label);
        setTimeout(() => setCopyFeedback(null), 2000);
    };

    const handleImport = () => {
        try {
            let cleaned = jsonInput.trim();
            // Extract JSON from markdown code block
            const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (match) cleaned = match[1].trim();
            const data = JSON.parse(cleaned);
            if (!data.personal && !data.experience && !data.education && !data.skills) {
                setStatus({ type: 'error', msg: ui.invalidFields });
                return;
            }
            importData(data);
            setStatus({ type: 'success', msg: ui.success });
            setTimeout(onClose, 1500);
        } catch {
            setStatus({ type: 'error', msg: ui.invalidJson });
        }
    };

    return (
        <div className="ai-import-modal" style={{ display: 'flex' }}>
            <div className="modal-overlay" onClick={onClose} />
            <div className="modal-content modal-large">
                <div className="modal-header">
                    <h3>🤖 {ui.title}</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <div className="import-tabs">
                        <button className={`import-tab ${activeTab === 'prompt' ? 'active' : ''}`} onClick={() => setActiveTab('prompt')}>📝 {ui.tabPrompt}</button>
                        <button className={`import-tab ${activeTab === 'schema' ? 'active' : ''}`} onClick={() => setActiveTab('schema')}>📋 {ui.tabSchema}</button>
                        <button className={`import-tab ${activeTab === 'import' ? 'active' : ''}`} onClick={() => setActiveTab('import')}>⬇️ {ui.tabImport}</button>
                    </div>

                    {/* Prompt */}
                    {activeTab === 'prompt' && (
                        <div className="import-tab-content active">
                            <div className="import-section">
                                <h4>{ui.howToUse}</h4>
                                <ol className="import-steps">
                                    <li>{ui.step1}</li>
                                    <li>{ui.step2}</li>
                                    <li>{ui.step3}</li>
                                    <li>{ui.step4}</li>
                                    <li>{ui.step5}</li>
                                </ol>
                                <div className="prompt-box">
                                    <button className="copy-btn" onClick={() => copy(promptTemplate, 'prompt')}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                        {copyFeedback === 'prompt' ? ui.copied : ui.copy}
                                    </button>
                                    <pre>{promptTemplate}</pre>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Schema */}
                    {activeTab === 'schema' && (
                        <div className="import-tab-content active">
                            <div className="import-section">
                                <h4>{ui.schemaTitle}</h4>
                                <div className="schema-box">
                                    <button className="copy-btn" onClick={() => copy(schemaTemplate, 'schema')}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                        {copyFeedback === 'schema' ? ui.copied : ui.copy}
                                    </button>
                                    <pre>{schemaTemplate}</pre>
                                </div>
                                <div className="schema-notes">
                                    <p><strong>{ui.notesTitle}</strong></p>
                                    <ul>
                                        <li>{ui.note1}</li>
                                        <li>{ui.note2}</li>
                                        <li>{ui.note3}</li>
                                        <li>{ui.note4}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Import */}
                    {activeTab === 'import' && (
                        <div className="import-tab-content active">
                            <div className="import-section">
                                <h4>{ui.pasteTitle}</h4>
                                <textarea id="jsonInput" value={jsonInput} onChange={e => setJsonInput(e.target.value)}
                                    placeholder={ui.placeholder} />
                                <div className="import-actions">
                                    <button className="btn btn-ghost" onClick={() => { setJsonInput(''); setStatus(null); }}>{ui.clear}</button>
                                    <button className="btn btn-primary" onClick={handleImport}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                                        {ui.import}
                                    </button>
                                </div>
                                {status && <div className={`import-status ${status.type}`}>{status.msg}</div>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
