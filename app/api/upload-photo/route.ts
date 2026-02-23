import { NextResponse } from 'next/server';
import { getSupabaseServiceClient, hasSupabaseServerEnv } from '@/lib/supabase/server';

const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
]);

const EXT_BY_MIME: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
};

function getBucketName() {
    return process.env.SUPABASE_STORAGE_BUCKET || 'cv-photos';
}

export async function POST(req: Request) {
    try {
        if (!hasSupabaseServerEnv()) {
            return NextResponse.json(
                { error: 'Supabase belum dikonfigurasi di server.' },
                { status: 503 }
            );
        }

        const formData = await req.formData();
        const photo = formData.get('photo');

        if (!(photo instanceof File)) {
            return NextResponse.json({ error: 'File foto tidak ditemukan.' }, { status: 400 });
        }

        if (!ALLOWED_MIME.has(photo.type)) {
            return NextResponse.json({ error: 'Format foto tidak didukung.' }, { status: 400 });
        }

        if (photo.size > MAX_PHOTO_SIZE_BYTES) {
            return NextResponse.json({ error: 'Ukuran foto maksimal 2MB.' }, { status: 400 });
        }

        const supabase = getSupabaseServiceClient();
        if (!supabase) {
            return NextResponse.json(
                { error: 'Supabase client gagal diinisialisasi.' },
                { status: 503 }
            );
        }

        const ext = EXT_BY_MIME[photo.type] || 'jpg';
        const filePath = `uploads/${Date.now()}-${crypto.randomUUID()}.${ext}`;
        const bucket = getBucketName();
        const bytes = Buffer.from(await photo.arrayBuffer());

        const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, bytes, {
            contentType: photo.type,
            upsert: false,
            cacheControl: '3600',
        });

        if (uploadError) {
            return NextResponse.json(
                {
                    error: uploadError.message.includes('Bucket not found')
                        ? `Bucket "${bucket}" belum ada. Buat dulu di Supabase Storage.`
                        : uploadError.message,
                },
                { status: 500 }
            );
        }

        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return NextResponse.json({
            url: publicData.publicUrl,
            path: filePath,
            bucket,
        });
    } catch (error: unknown) {
        const message =
            error instanceof Error && error.message
                ? error.message
                : 'Gagal upload foto.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
