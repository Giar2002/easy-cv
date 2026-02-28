import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient, hasSupabaseServerEnv, resolveServerPlan } from '@/lib/supabase/server';

const ANON_COOKIE_NAME = 'easycv_anon_id';
const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT || 25);
const DAILY_LIMIT_SAFE = Number.isFinite(DAILY_LIMIT) && DAILY_LIMIT > 0 ? Math.min(DAILY_LIMIT, 200) : 25;
const USAGE_TABLE = process.env.SUPABASE_AI_USAGE_TABLE || 'ai_usage_daily';
const FEATURE_LIMIT_SURVEY = Number(process.env.AI_LIMIT_SURVEY || 1);
const FEATURE_LIMIT_SUMMARY = Number(process.env.AI_LIMIT_SUMMARY || 2);
const FEATURE_LIMIT_EXPERIENCE = Number(process.env.AI_LIMIT_EXPERIENCE || 2);

// Burst limiter in-memory (per anonymous user) to prevent spam
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const LIMIT = 5; // Max 5 requests
const WINDOW_MS = 60 * 1000; // 1 minute window

type AIQuotaFeature = 'survey' | 'summary' | 'experience' | 'skills' | 'project' | 'general';
type FeatureColumn = 'survey_requests' | 'summary_requests' | 'experience_requests';
type UILanguage = 'id' | 'en';

const FEATURE_COLUMN_MAP: Partial<Record<AIQuotaFeature, FeatureColumn>> = {
    survey: 'survey_requests',
    summary: 'summary_requests',
    experience: 'experience_requests',
};

function getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === 'string') return error;
    return 'Error generating content';
}

function escapeHtml(text: string): string {
    return text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function toParagraphHtml(text: string): string {
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => `<p>${escapeHtml(line)}</p>`)
        .join('');
}

function toExperienceHtml(text: string): string {
    const lines = text
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

    const bulletItems = lines
        .map(line => line.replace(/^[-*•]\s+/, '').replace(/^\d+[\.\)]\s+/, '').trim())
        .filter(Boolean);

    const hasListIntent = lines.some(line => /^[-*•]\s+/.test(line) || /^\d+[\.\)]\s+/.test(line));
    if (bulletItems.length >= 2 || hasListIntent) {
        return `<ul>${bulletItems.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
    }

    const sentenceItems = text
        .split(/(?<=[.!?])\s+/)
        .map(item => item.trim())
        .filter(Boolean)
        .slice(0, 4);
    if (sentenceItems.length >= 2) {
        return `<ul>${sentenceItems.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
    }

    return toParagraphHtml(text);
}

function formatAiOutput(text: string, action: string, feature: AIQuotaFeature): string {
    if (action === 'generate-skills') {
        return text;
    }
    if (feature === 'experience') {
        return toExperienceHtml(text);
    }
    return toParagraphHtml(text);
}

function getTodayUtc(): string {
    return new Date().toISOString().slice(0, 10);
}

function sanitizeLimit(value: number, fallback: number): number {
    if (!Number.isFinite(value) || value <= 0) return fallback;
    return Math.min(Math.floor(value), 20);
}

const FEATURE_LIMITS = {
    survey: sanitizeLimit(FEATURE_LIMIT_SURVEY, 1),
    summary: sanitizeLimit(FEATURE_LIMIT_SUMMARY, 2),
    experience: sanitizeLimit(FEATURE_LIMIT_EXPERIENCE, 2),
} as const;

function isLikelyIndonesian(text: string): boolean {
    const sample = text.toLowerCase();
    return /\b(saya|dan|yang|di|ke|dengan|untuk|dari|pada|sebagai|profesi|pengalaman|kerja)\b/.test(sample);
}

function normalizeLanguage(rawLanguage: unknown, fallbackText: string): UILanguage {
    if (rawLanguage === 'en' || rawLanguage === 'id') {
        return rawLanguage;
    }
    return isLikelyIndonesian(fallbackText) ? 'id' : 'en';
}

function messages(language: UILanguage) {
    if (language === 'en') {
        return {
            tooManyRequests: 'Too many requests. Please wait 1 minute.',
            textTooLong: 'Text is too long (maximum 2000 characters).',
            textEmpty: 'Text cannot be empty.',
            dailyLimit: 'Free daily AI limit has been reached for this account. Try again tomorrow.',
            surveyLimit: `Survey AI limit reached for today (${FEATURE_LIMITS.survey}x).`,
            summaryLimit: `Profile Summary AI limit reached for today (${FEATURE_LIMITS.summary}x).`,
            experienceLimit: `Experience Description AI limit reached for today (${FEATURE_LIMITS.experience}x).`,
            featureLimit: 'AI limit for this feature has been reached for today.',
            geminiQuota: 'Gemini project quota is exhausted. Please try again later.',
        };
    }
    return {
        tooManyRequests: 'Terlalu banyak permintaan. Tunggu 1 menit.',
        textTooLong: 'Teks terlalu panjang (maksimal 2000 karakter).',
        textEmpty: 'Teks tidak boleh kosong.',
        dailyLimit: 'Batas gratis penggunaan AI harian untuk akun ini sudah habis. Coba lagi besok.',
        surveyLimit: `Batas AI survey sudah habis untuk hari ini (${FEATURE_LIMITS.survey}x).`,
        summaryLimit: `Batas AI Profile Summary sudah habis untuk hari ini (${FEATURE_LIMITS.summary}x).`,
        experienceLimit: `Batas AI Description Experience sudah habis untuk hari ini (${FEATURE_LIMITS.experience}x).`,
        featureLimit: 'Batas AI fitur ini sudah habis untuk hari ini.',
        geminiQuota: 'Kuota Gemini project sedang habis. Coba lagi nanti atau besok.',
    };
}

function normalizeFeature(rawFeature: unknown, action: string): AIQuotaFeature {
    if (typeof rawFeature === 'string') {
        const normalized = rawFeature.trim().toLowerCase();
        if (
            normalized === 'survey' ||
            normalized === 'summary' ||
            normalized === 'experience' ||
            normalized === 'skills' ||
            normalized === 'project' ||
            normalized === 'general'
        ) {
            return normalized;
        }
    }
    if (action === 'generate-skills') return 'skills';
    return 'general';
}

function getFeatureLimit(feature: AIQuotaFeature): number | null {
    if (feature === 'survey') return FEATURE_LIMITS.survey;
    if (feature === 'summary') return FEATURE_LIMITS.summary;
    if (feature === 'experience') return FEATURE_LIMITS.experience;
    return null;
}

function getFeatureLimitMessage(feature: AIQuotaFeature, language: UILanguage): string {
    const msg = messages(language);
    if (feature === 'survey') {
        return msg.surveyLimit;
    }
    if (feature === 'summary') {
        return msg.summaryLimit;
    }
    if (feature === 'experience') {
        return msg.experienceLimit;
    }
    return msg.featureLimit;
}

function buildAnonId(seed?: string): { anonId: string; shouldSetCookie: boolean } {
    const safeSeed = (seed || '').trim();
    if (safeSeed && /^[a-zA-Z0-9_-]{8,64}$/.test(safeSeed)) {
        return { anonId: safeSeed, shouldSetCookie: false };
    }
    return { anonId: crypto.randomUUID().replace(/-/g, ''), shouldSetCookie: true };
}

function withAnonCookie(
    response: NextResponse,
    anonId: string,
    shouldSetCookie: boolean
): NextResponse {
    if (shouldSetCookie) {
        response.cookies.set({
            name: ANON_COOKIE_NAME,
            value: anonId,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 365,
            path: '/',
        });
    }
    return response;
}

type QuotaResult =
    | { ok: true; remaining: number; featureRemaining: number | null }
    | { ok: false; reason: 'daily-limit' | 'feature-limit' | 'unavailable'; message: string };

async function consumeDailyQuotaLegacy(anonId: string, language: UILanguage): Promise<QuotaResult> {
    const supabase = getSupabaseServiceClient();
    if (!supabase) {
        return { ok: false, reason: 'unavailable', message: 'Supabase client init failed.' };
    }
    const today = getTodayUtc();
    const { data: existing, error: readError } = await supabase
        .from(USAGE_TABLE)
        .select('requests')
        .eq('anon_id', anonId)
        .eq('usage_date', today)
        .maybeSingle();

    if (readError) {
        return { ok: false, reason: 'unavailable', message: readError.message };
    }

    if (!existing) {
        const { error: insertError } = await supabase
            .from(USAGE_TABLE)
            .insert({ anon_id: anonId, usage_date: today, requests: 1 });
        if (insertError) {
            return { ok: false, reason: 'unavailable', message: insertError.message };
        }
        return { ok: true, remaining: DAILY_LIMIT_SAFE - 1, featureRemaining: null };
    }

    const current = Number(existing.requests) || 0;
    if (current >= DAILY_LIMIT_SAFE) {
        const msg = messages(language);
        return {
            ok: false,
            reason: 'daily-limit',
            message: msg.dailyLimit,
        };
    }

    const next = current + 1;
    const { error: updateError } = await supabase
        .from(USAGE_TABLE)
        .update({ requests: next })
        .eq('anon_id', anonId)
        .eq('usage_date', today);

    if (updateError) {
        return { ok: false, reason: 'unavailable', message: updateError.message };
    }

    return { ok: true, remaining: Math.max(0, DAILY_LIMIT_SAFE - next), featureRemaining: null };
}

async function consumeDailyQuota(anonId: string, feature: AIQuotaFeature, language: UILanguage): Promise<QuotaResult> {
    if (!hasSupabaseServerEnv()) {
        return { ok: false, reason: 'unavailable', message: 'Supabase not configured.' };
    }

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
        return { ok: false, reason: 'unavailable', message: 'Supabase client init failed.' };
    }

    const today = getTodayUtc();
    const { data: existing, error: readError } = await supabase
        .from(USAGE_TABLE)
        .select('requests,survey_requests,summary_requests,experience_requests')
        .eq('anon_id', anonId)
        .eq('usage_date', today)
        .maybeSingle();

    if (readError) {
        if (
            readError.message.includes('survey_requests') ||
            readError.message.includes('summary_requests') ||
            readError.message.includes('experience_requests')
        ) {
            return consumeDailyQuotaLegacy(anonId, language);
        }
        return { ok: false, reason: 'unavailable', message: readError.message };
    }

    const featureColumn = FEATURE_COLUMN_MAP[feature];
    const featureLimit = getFeatureLimit(feature);

    if (!existing) {
        const insertPayload: Record<string, string | number> = {
            anon_id: anonId,
            usage_date: today,
            requests: 1,
        };
        if (featureColumn) {
            insertPayload[featureColumn] = 1;
        }
        const { error: insertError } = await supabase
            .from(USAGE_TABLE)
            .insert(insertPayload);
        if (insertError) {
            return { ok: false, reason: 'unavailable', message: insertError.message };
        }
        return {
            ok: true,
            remaining: DAILY_LIMIT_SAFE - 1,
            featureRemaining: featureLimit && featureColumn ? Math.max(0, featureLimit - 1) : null,
        };
    }

    const current = Number(existing.requests) || 0;
    if (current >= DAILY_LIMIT_SAFE) {
        const msg = messages(language);
        return {
            ok: false,
            reason: 'daily-limit',
            message: msg.dailyLimit,
        };
    }

    let currentFeatureUsage = 0;
    if (featureColumn) {
        currentFeatureUsage = Number((existing as Record<string, unknown>)[featureColumn]) || 0;
    }

    if (featureLimit && currentFeatureUsage >= featureLimit) {
        return {
            ok: false,
            reason: 'feature-limit',
            message: getFeatureLimitMessage(feature, language),
        };
    }

    const next = current + 1;
    const updatePayload: Record<string, number> = { requests: next };
    if (featureColumn) {
        updatePayload[featureColumn] = currentFeatureUsage + 1;
    }

    const { error: updateError } = await supabase
        .from(USAGE_TABLE)
        .update(updatePayload)
        .eq('anon_id', anonId)
        .eq('usage_date', today);

    if (updateError) {
        return { ok: false, reason: 'unavailable', message: updateError.message };
    }

    return {
        ok: true,
        remaining: Math.max(0, DAILY_LIMIT_SAFE - next),
        featureRemaining: featureLimit ? Math.max(0, featureLimit - (currentFeatureUsage + 1)) : null,
    };
}

export async function POST(req: NextRequest) {
    let responseLanguage: UILanguage = 'id';
    try {
        const { anonId, shouldSetCookie } = buildAnonId(req.cookies.get(ANON_COOKIE_NAME)?.value);

        const payload = await req.json();
        const text = typeof payload?.text === 'string' ? payload.text : '';
        const action = typeof payload?.action === 'string' ? payload.action : '';
        const feature = normalizeFeature(payload?.feature, action);
        const language = normalizeLanguage(payload?.language, text);
        responseLanguage = language;
        const msg = messages(language);
        const serverPlan = await resolveServerPlan(req);
        const isPremiumUser = serverPlan.isPremium;

        const now = Date.now();
        const limitData = rateLimitMap.get(anonId);

        if (limitData) {
            if (now > limitData.resetTime) {
                rateLimitMap.set(anonId, { count: 1, resetTime: now + WINDOW_MS });
            } else if (limitData.count >= LIMIT) {
                return withAnonCookie(
                    NextResponse.json({ error: msg.tooManyRequests }, { status: 429 }),
                    anonId,
                    shouldSetCookie
                );
            } else {
                limitData.count++;
                rateLimitMap.set(anonId, limitData);
            }
        } else {
            rateLimitMap.set(anonId, { count: 1, resetTime: now + WINDOW_MS });
        }

        if (!isPremiumUser) {
            const quota = await consumeDailyQuota(anonId, feature, language);
            if (!quota.ok && (quota.reason === 'daily-limit' || quota.reason === 'feature-limit')) {
                return withAnonCookie(
                    NextResponse.json({ error: quota.message }, { status: 429 }),
                    anonId,
                    shouldSetCookie
                );
            }
            if (!quota.ok && quota.reason === 'unavailable') {
                console.warn('[AI quota] Supabase unavailable, fallback to burst limiter only:', quota.message);
            }
        }

        // Token length safeguard
        if (!text || text.length > 2000) {
            return withAnonCookie(
                NextResponse.json({ error: msg.textTooLong }, { status: 400 }),
                anonId,
                shouldSetCookie
            );
        }

        // Remove HTML tags for AI processing to avoid formatting glitches
        const plainText = text.replace(/<[^>]*>?/gm, '').trim();
        if (!plainText) {
            return withAnonCookie(
                NextResponse.json({ error: msg.textEmpty }, { status: 400 }),
                anonId,
                shouldSetCookie
            );
        }
        if (plainText.length > 2000) {
            return withAnonCookie(
                NextResponse.json({ error: msg.textTooLong }, { status: 400 }),
                anonId,
                shouldSetCookie
            );
        }

        // Look for GEMINI_API_KEY environment variable. 
        // Fallback logic for testing: (Usually you should throw an error, but let's be graceful if it's missing)
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            const isIndo = language === 'id';

            let mockGrammar = isIndo
                ? plainText
                : plainText;

            let mockEnhance =
                feature === 'experience'
                    ? isIndo
                        ? `- Mengelola proyek utama dengan target tercapai 100% dan kualitas output konsisten.\n- Berkolaborasi lintas tim untuk mempercepat proses kerja dan mengurangi kendala operasional.\n- Menerapkan perbaikan berkelanjutan yang meningkatkan efisiensi dan kepuasan pengguna.`
                        : `- Led key projects to 100% completion with consistent output quality.\n- Collaborated across teams to speed up delivery and reduce operational blockers.\n- Implemented continuous improvements that increased efficiency and user satisfaction.`
                    : isIndo
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

            mockResult = formatAiOutput(mockResult, action, feature);

            // Simulating network delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            return withAnonCookie(
                NextResponse.json({ result: mockResult }),
                anonId,
                shouldSetCookie
            );
        }

        // plainText handled above

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const targetLanguage = language === 'en' ? 'English' : 'Indonesian';
        let systemPrompt = '';
        if (action === 'grammar') {
            systemPrompt = `You are a professional CV editor. Fix grammar, spelling, and punctuation without changing meaning. Keep the writing style concise and recruiter-friendly. Output language MUST be ${targetLanguage}. Return ONLY plain text. Do not add conversational filler or markdown.`;
        } else if (action === 'enhance') {
            if (feature === 'experience') {
                systemPrompt = `You are an expert resume writer. Rewrite the work experience description into exactly 3 concise, achievement-oriented bullet points. Each bullet must start with "- " on a new line, use strong action verbs, and include concrete impact where possible. Output language MUST be ${targetLanguage}. Return ONLY plain text bullet lines (no headings, no markdown beyond "- ").`;
            } else {
                systemPrompt = `You are an expert career coach. Enhance the provided CV text so it sounds professional, impactful, and action-oriented. Keep it concise and natural for recruiters. Output language MUST be ${targetLanguage}. Return ONLY plain text with no markdown and no conversational filler.`;
            }
        } else if (action === 'generate-skills') {
            systemPrompt = `You are an expert technical recruiter. Based on the provided job title/role, generate a comma-separated list of 5-8 highly relevant skills. Include a mix of hard and soft skills. Output language MUST be ${targetLanguage}. Return ONLY the comma-separated string, nothing else.`;
        } else {
            systemPrompt = `You are a helpful CV assistant. Output language MUST be ${targetLanguage}. Return plain text only.`;
        }

        const fullPrompt = `${systemPrompt}\n\nUser Input:\n${plainText}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        let generatedText = response.text().trim();
        generatedText = formatAiOutput(generatedText, action, feature);

        return withAnonCookie(
            NextResponse.json({ result: generatedText, premium: isPremiumUser }),
            anonId,
            shouldSetCookie
        );
    } catch (error: unknown) {
        console.error('AI API Error:', error);
        const message = getErrorMessage(error);
        const statusCode =
            typeof error === 'object' && error !== null && 'status' in error
                ? Number((error as { status?: unknown }).status)
                : NaN;

        // Handle 429 quota exhaustion gracefully
        if (statusCode === 429 || message.includes('429') || message.includes('Quota exceeded')) {
            return NextResponse.json(
                { error: messages(responseLanguage).geminiQuota },
                { status: 429 }
            );
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
