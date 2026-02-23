# EasY CV

CV builder berbasis Next.js dengan preview real-time, AI helper, dan 38 template (termasuk kategori premium).

## Jalankan Lokal

```bash
npm install --legacy-peer-deps
npm run dev
```

Buka `http://localhost:3000`.

## Mode Penyimpanan Data

App ini sekarang mendukung 2 mode:

1. `Local mode` (default)
- Data CV disimpan di browser (`localStorage`, key: `cv-builder-state`).
- Upload foto disimpan sebagai base64 lokal.

2. `Supabase mode` (opsional)
- Data tetap bisa lokal untuk saat ini.
- Upload foto dikirim ke Supabase Storage via API route `app/api/upload-photo/route.ts`.
- Jika upload cloud gagal, otomatis fallback ke penyimpanan lokal.

## Setup Supabase (Opsional)

1. Buat project di Supabase.
2. Buat bucket Storage, default nama: `cv-photos`.
3. Set bucket sebagai `Public` jika ingin URL foto langsung bisa dipakai.
4. Copy env dari `.env.example` ke `.env.local`.
5. Isi value berikut:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=cv-photos
```

6. Restart server dev setelah ubah env.

## Environment Variables

Lihat `.env.example`:

- `GEMINI_API_KEY`: untuk AI assistant.
- `NEXT_PUBLIC_SUPABASE_URL`: URL project Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key.
- `SUPABASE_SERVICE_ROLE_KEY`: key server-only untuk upload ke storage.
- `SUPABASE_STORAGE_BUCKET`: nama bucket foto.

## Catatan Keamanan

- `SUPABASE_SERVICE_ROLE_KEY` hanya dipakai di server (`lib/supabase/server.ts`), jangan expose ke client.
- File foto divalidasi maksimal `2MB` dan mime type image sebelum upload.
