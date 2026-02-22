import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Simple in-memory rate limiter (Note: in production Vercel/serverless, use Redis/Upstash)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const LIMIT = 5; // Max 5 requests
const WINDOW_MS = 60 * 1000; // 1 minute window

function getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === 'string') return error;
    return 'Error generating content';
}

function toParagraphHtml(text: string): string {
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => `<p>${line}</p>`)
        .join('');
}

export async function POST(req: Request) {
    try {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
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

        const payload = await req.json();
        const text = typeof payload?.text === 'string' ? payload.text : '';
        const action = typeof payload?.action === 'string' ? payload.action : '';

        // Token length safeguard
        if (!text || text.length > 2000) {
            return NextResponse.json({ error: 'Teks terlalu panjang (Maksimal 2000 karakter)' }, { status: 400 });
        }

        // Remove HTML tags for AI processing to avoid formatting glitches
        const plainText = text.replace(/<[^>]*>?/gm, '').trim();
        if (!plainText) {
            return NextResponse.json({ error: 'Teks tidak boleh kosong' }, { status: 400 });
        }
        if (plainText.length > 2000) {
            return NextResponse.json({ error: 'Teks terlalu panjang (Maksimal 2000 karakter)' }, { status: 400 });
        }

        // Look for GEMINI_API_KEY environment variable. 
        // Fallback logic for testing: (Usually you should throw an error, but let's be graceful if it's missing)
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            const lowered = plainText.toLowerCase();
            const isIndo = lowered.includes('saya') || lowered.includes('di ') || lowered.includes('dan') || lowered.includes('kerja') || lowered.includes('profesi');

            let mockGrammar = isIndo
                ? plainText
                : plainText;

            let mockEnhance = isIndo
                ? `Saya adalah profesional yang fokus pada hasil, kolaborasi tim, dan peningkatan berkelanjutan. ${plainText}`
                : `I am a results-driven professional with strong collaboration skills and a continuous improvement mindset. ${plainText}`;

            const mockSkills = isIndo
                ? 'Komunikasi, Problem Solving, Manajemen Waktu, Kolaborasi Tim, Adaptabilitas'
                : 'Communication, Problem Solving, Time Management, Teamwork, Adaptability';

            let mockResult =
                action === 'grammar'
                    ? mockGrammar
                    : action === 'generate-skills'
                        ? mockSkills
                        : mockEnhance;

            if (action !== 'generate-skills') {
                mockResult = toParagraphHtml(mockResult);
            }

            // Simulating network delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            return NextResponse.json({ result: mockResult });
        }

        // plainText handled above

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        let systemPrompt = '';
        if (action === 'grammar') {
            systemPrompt = "You are a professional CV editor. Fix the grammar, spelling, and punctuation of the provided text. CRITICAL: You MUST reply in the EXACT SAME LANGUAGE as the User Input (e.g., if input is Indonesian, output MUST be Indonesian). Return ONLY the corrected text. Do NOT wrap in quotes or add conversational filler. Provide output in plain text.";
        } else if (action === 'enhance') {
            systemPrompt = "You are an expert career coach. Enhance the provided CV text to sound more professional, impactful, and action-oriented. Use strong action verbs. Keep it concise. CRITICAL INSTRUCTIONS:\n1. You MUST reply in the EXACT SAME LANGUAGE as the User Input (e.g., Indonesian input -> Indonesian output).\n2. Do NOT use markdown formatting like asterisks (**) or underscores (_).\n3. Return ONLY the enhanced text. Do NOT wrap in quotes or add conversational filler. Provide output in plain text.";
        } else if (action === 'generate-skills') {
            systemPrompt = "You are an expert technical recruiter. Based on the job title/role provided by the user, generate a comma-separated list of 5-8 highly relevant skills for that role. Include a mix of hard and soft skills. CRITICAL: You MUST respond in the EXACT SAME language the user used to specify the role. Return ONLY the comma-separated string, nothing else. Example: 'React, Node.js, Problem Solving, Communication'.";
        } else {
            systemPrompt = "You are a helpful CV assistant. Do NOT use markdown formatting like **bold** in your responses. Output plain text.";
        }

        const fullPrompt = `${systemPrompt}\n\nUser Input:\n${plainText}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        // Output format back to paragraphs for react-quill compatibility (unless it's skills)
        let generatedText = response.text().trim();

        if (action !== 'generate-skills') {
            // Convert newlines to HTML paragraphs so that it displays nicely in the Rich Text Editor
            generatedText = toParagraphHtml(generatedText);
        }

        return NextResponse.json({ result: generatedText });
    } catch (error: unknown) {
        console.error('AI API Error:', error);
        const message = getErrorMessage(error);
        const statusCode =
            typeof error === 'object' && error !== null && 'status' in error
                ? Number((error as { status?: unknown }).status)
                : NaN;

        // Handle 429 quota exhaustion gracefully
        if (statusCode === 429 || message.includes('429') || message.includes('Quota exceeded')) {
            return NextResponse.json({
                error: 'Batas gratis penggunaan AI harian telah habis. Silakan coba lagi besok.'
            }, { status: 429 });
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
