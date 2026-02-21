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

        // Remove HTML tags for AI processing to avoid formatting glitches
        const plainText = text.replace(/<[^>]*>?/gm, '');

        // Look for GEMINI_API_KEY environment variable. 
        // Fallback logic for testing: (Usually you should throw an error, but let's be graceful if it's missing)
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            const isIndo = text.toLowerCase().includes('saya') || text.toLowerCase().includes('di') || text.toLowerCase().includes('dan') || text.toLowerCase().includes('kerja');
            const isExperience = text.toLowerCase().includes('dev') || text.toLowerCase().includes('pt') || text.toLowerCase().includes('kerja') || text.toLowerCase().includes('proyek');

            let mockGrammar = isIndo
                ? `[Simulasi AI - Grammar Checked]\n\n${plainText}`
                : `[AI Mock - Grammar Checked]\n\n${plainText}`;

            let mockEnhance = isIndo
                ? `[Simulasi AI - Teks Lebih Profesional]\n\nSaya merekomendasikan: ${plainText}`
                : `[AI Mock - Enhanced Professional Text]\n\nI recommend: ${plainText}`;

            const mockResult = action === 'grammar' ? mockGrammar : mockEnhance;

            // Simulating network delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            return NextResponse.json({ result: mockResult });
        }

        // plainText handled above

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        let systemPrompt = '';
        if (action === 'grammar') {
            systemPrompt = "You are a professional CV editor. Fix the grammar, spelling, and punctuation of the provided text. CRITICAL: You MUST keep the language EXACTLY the same as the original text (If Indonesian, answer in Indonesian. If English, answer in English). Return ONLY the corrected text. Do NOT wrap in quotes or add conversational filler. Provide output in plain text.";
        } else if (action === 'enhance') {
            systemPrompt = "You are an expert career coach. Enhance the provided CV text to sound more professional, impactful, and action-oriented. Use strong action verbs. Keep it concise. CRITICAL INSTRUCTIONS:\n1. You MUST keep the language EXACTLY the same as the original text.\n2. Do NOT use markdown formatting like asterisks (**) or underscores (_).\n3. Return ONLY the enhanced text. Do NOT wrap in quotes or add conversational filler. Provide output in plain text.";
        } else if (action === 'generate-skills') {
            systemPrompt = "You are an expert technical recruiter. Based on the job title/role provided by the user, generate a comma-separated list of 5-8 highly relevant skills for that role. Include a mix of hard and soft skills. CRITICAL: You MUST respond in the EXACT SAME language the user used to specify the role. Return ONLY the comma-separated string, nothing else. Example: 'React, Node.js, Problem Solving, Communication'.";
        } else {
            systemPrompt = "You are a helpful CV assistant. Do NOT use markdown formatting like **bold** in your responses. Output plain text.";
        }

        const fullPrompt = `${systemPrompt}\n\nUser Input:\n${plainText}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        // Output format back to paragraphs for react-quill compatibility (unless it's skills)
        let generatedText = response.text();

        if (action !== 'generate-skills') {
            // Convert newlines to HTML paragraphs so that it displays nicely in the Rich Text Editor
            generatedText = generatedText.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('');
        }

        return NextResponse.json({ result: generatedText });
    } catch (error: any) {
        console.error('AI API Error:', error);
        return NextResponse.json({ error: error.message || 'Error generating content' }, { status: 500 });
    }
}
