export function isPlanLimitMessage(input: string): boolean {
    const message = (input || '').toLowerCase().trim();
    if (!message) return false;

    // Non-plan rate-limit / temporary errors
    if (
        message.includes('tunggu 1 menit') ||
        message.includes('too many requests') ||
        message.includes('quota gemini') ||
        message.includes('kuota gemini') ||
        message.includes('coba lagi nanti') ||
        message.includes('failed to')
    ) {
        return false;
    }

    return (
        message.includes('batas') ||
        message.includes('limit reached') ||
        message.includes('free limit') ||
        message.includes('upgrade')
    );
}
