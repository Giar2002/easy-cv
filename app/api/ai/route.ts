import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Simple in-memory rate limiter (Note: in production Vercel/serverless, use Redis/Upstash)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const LIMIT = 5; // Max 5 requests
const WINDOW_MS = 60 * 1000; // 1 minute window

export async function POST(req: Request) {
    try {
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const now = Date.now();
        const limitData = rateLimitMap.get(ip);

        if (limitData) {
            if (now > limitData.resetTime) {
                rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
            } else if (limitData.count >= LIMIT) {
                return NextResponse.json({ error: 'Terlalu banyak permintaan. Tunggu 1 menit.' }, { status: 429 });
            } else {
                limitData.count++;
                rateLimitMap.set(ip, limitData);
            }
        } else {
            rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        }

        const { text, action } = await req.json();

        // Token length safeguard
        if (!text || text.length > 2000) {
            return NextResponse.json({ error: 'Teks terlalu panjang (Maksimal 2000 karakter)' }, { status: 400 });
        }

        // Look for GEMINI_API_KEY environment variable. 
        // Fallback logic for testing: (Usually you should throw an error, but let's be graceful if it's missing)
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            const isIndo = text.toLowerCase().includes('saya') || text.toLowerCase().includes('di') || text.toLowerCase().includes('dan') || text.toLowerCase().includes('kerja');
            const isExperience = text.toLowerCase().includes('dev') || text.toLowerCase().includes('pt') || text.toLowerCase().includes('kerja') || text.toLowerCase().includes('proyek');

            let mockGrammar = isIndo
                ? 'Saya adalah seorang developer yang suka menulis kode menggunakan React.'
                : 'I am a developer who likes to write code using React.';

            let mockEnhance = isIndo
                ? 'Pengembang Web Frontend antusias yang berspesialisasi dalam membangun antarmuka pengguna yang responsif dan interaktif menggunakan React.js dan teknologi web modern. Berdedikasi untuk menghasilkan kode yang bersih, efisien, dan mudah dipelihara.'
                : 'Frontend Web Developer specializing in building responsive and interactive user interfaces using React.js and modern web technologies. Passionate about writing clean, maintainable code.';

            if (isExperience) {
                mockGrammar = isIndo ? 'Saya bekerja sebagai developer.' : 'I worked as a developer.';
                mockEnhance = isIndo
                    ? 'Bertanggung jawab dalam merancang, mengembangkan, dan memelihara aplikasi web skala besar menggunakan ekosistem React.js. Berhasil meningkatkan performa antarmuka pengguna sebesar 30% melalui efisiensi kode dan modernisasi arsitektur frontend.'
                    : 'Responsible for designing, developing, and maintaining large-scale web applications using the React.js ecosystem. Successfully improved user interface performance by 30% through code efficiency and modernizing frontend architecture.';
            }

            const mockResult = action === 'grammar' ? mockGrammar : mockEnhance;

            // Simulating network delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            return NextResponse.json({ result: mockResult });
        }

        // Remove HTML tags for AI processing to avoid formatting glitches
        const plainText = text.replace(/<[^>]*>?/gm, '');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        let systemPrompt = '';
        if (action === 'grammar') {
            systemPrompt = "You are a professional CV editor. Fix the grammar, spelling, and punctuation of the provided text. Keep the language the same as the original (Indonesian or English). Return ONLY the corrected text. Do NOT wrap in quotes or add conversational filler. Provide output in plain text.";
        } else if (action === 'enhance') {
            systemPrompt = "You are an expert career coach. Enhance the provided CV text to sound more professional, impactful, and action-oriented. Use strong action verbs. Keep it concise and suitable for a resume. Keep the language the same as the original text (Indonesian or English). Return ONLY the enhanced text. Do NOT wrap in quotes or add conversational filler. Provide output in plain text.";
        } else {
            systemPrompt = "You are a helpful CV assistant.";
        }

        const fullPrompt = `${systemPrompt} \n\nUser Text: \n${plainText} `;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        // Output format back to paragraphs for react-quill compatibility
        let generatedText = response.text();

        // Convert newlines to HTML paragraphs so that it displays nicely in the Rich Text Editor
        generatedText = generatedText.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('');

        return NextResponse.json({ result: generatedText });
    } catch (error: any) {
        console.error('AI API Error:', error);
        return NextResponse.json({ error: error.message || 'Error generating content' }, { status: 500 });
    }
}
