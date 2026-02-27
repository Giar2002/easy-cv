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

### Setup limit AI per user (direkomendasikan)

1. Buka Supabase SQL Editor.
2. Jalankan SQL dari file `supabase/ai_usage_daily.sql`.
3. Pastikan env ini terisi:

```env
AI_DAILY_LIMIT=25
SUPABASE_AI_USAGE_TABLE=ai_usage_daily
AI_LIMIT_SURVEY=1
AI_LIMIT_SUMMARY=2
AI_LIMIT_EXPERIENCE=2
FREE_MONTHLY_DOWNLOAD_LIMIT=1
PRO_DAILY_DOWNLOAD_LIMIT=3
SUPABASE_DOWNLOAD_USAGE_TABLE=download_usage_monthly
NEXT_PUBLIC_SUPABASE_SUBSCRIPTIONS_TABLE=user_subscriptions
SUPABASE_SUBSCRIPTIONS_TABLE=user_subscriptions
PREMIUM_TEST_EMAILS=
SUPABASE_FEEDBACK_TABLE=cv_feedback
```

Catatan:
- Limit harian dihitung per `anon_id` cookie per browser (UTC day).
- Limit fitur default:
  - Survey AI: `1x/hari`
  - Profile Summary AI: `2x/hari`
  - Experience Description AI: `2x/hari`
  - Bisa diubah lewat env di atas.
- Limit hanya dikenakan ke user gratis. User premium melewati kuota harian/fitur.
- Premium diputuskan dari server-side (`user_subscriptions` + `PREMIUM_TEST_EMAILS`), tidak lagi menerima bypass premium dari payload client.
- Download PDF sekarang wajib login dan untuk user gratis dibatasi per bulan (default `1x/bulan`) melalui endpoint `app/api/download-access/route.ts`.
- User `pro` (Pro Daily) mendapat semua template + AI tanpa batas, dengan limit download PDF per hari (default `3x/hari`).
- Jika user login Supabase dan punya row aktif di `user_subscriptions`, AI/download otomatis dianggap premium dari server-side.
- Untuk AI, jika tabel kuota belum siap, app fallback ke burst limit 1 menit untuk mencegah spam.

## Environment Variables

Lihat `.env.example`:

- `GEMINI_API_KEY`: untuk AI assistant.
- `NEXT_PUBLIC_SUPABASE_URL`: URL project Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key.
- `SUPABASE_SERVICE_ROLE_KEY`: key server-only untuk upload ke storage.
- `SUPABASE_STORAGE_BUCKET`: nama bucket foto.
- `AI_DAILY_LIMIT`: batas request AI per hari per user anonim (default `25`).
- `SUPABASE_AI_USAGE_TABLE`: nama tabel kuota AI (default `ai_usage_daily`).
- `AI_LIMIT_SURVEY`: batas AI untuk onboarding survey per hari (default `1`).
- `AI_LIMIT_SUMMARY`: batas AI untuk profile summary per hari (default `2`).
- `AI_LIMIT_EXPERIENCE`: batas AI untuk description work experience per hari (default `2`).
- `FREE_MONTHLY_DOWNLOAD_LIMIT`: batas download PDF gratis per bulan per akun login (default `1`).
- `PRO_DAILY_DOWNLOAD_LIMIT`: batas download PDF harian untuk plan `pro` (default `3`).
- `SUPABASE_DOWNLOAD_USAGE_TABLE`: nama tabel kuota download bulanan (default `download_usage_monthly`).
- `NEXT_PUBLIC_SUPABASE_SUBSCRIPTIONS_TABLE`: nama tabel subscription untuk cek status plan di UI client (default `user_subscriptions`).
- `SUPABASE_SUBSCRIPTIONS_TABLE`: nama tabel subscription user login (default `user_subscriptions`).
- `PREMIUM_TEST_EMAILS`: daftar email dipisah koma yang otomatis dianggap premium setelah login (untuk testing internal).
- `SUPABASE_FEEDBACK_TABLE`: nama tabel feedback user (default `cv_feedback`).

## Setup Subscription Table (Direkomendasikan)

1. Buka Supabase SQL Editor.
2. Jalankan file `supabase/user_subscriptions.sql`.
3. Saat user berlangganan, insert/update row user di tabel ini:
   - `user_id`: id dari `auth.users`
   - `plan`: `pro` (Pro Daily) atau `premium`/`business` (Premium Monthly)
   - `status`: `active` atau `trialing`
   - `current_period_end`: tanggal berakhir paket (boleh null untuk lifetime)

## Setup Feedback Table (Opsional)

1. Buka Supabase SQL Editor.
2. Jalankan file `supabase/feedback.sql`.
3. Feedback dari modal setelah download CV akan disimpan ke tabel `cv_feedback`.

## Setup Download Usage Table (Wajib untuk limit download bulanan)

1. Buka Supabase SQL Editor.
2. Jalankan file `supabase/download_usage_monthly.sql`.
3. Pastikan env:
   - `FREE_MONTHLY_DOWNLOAD_LIMIT=1`
   - `PRO_DAILY_DOWNLOAD_LIMIT=3`
   - `SUPABASE_DOWNLOAD_USAGE_TABLE=download_usage_monthly`

Catatan:
- Kuota `pro` harian diambil dari tabel AI usage (`ai_usage_daily.download_requests`) agar reset harian otomatis per UTC.

## Catatan Keamanan

- `SUPABASE_SERVICE_ROLE_KEY` hanya dipakai di server (`lib/supabase/server.ts`), jangan expose ke client.
- File foto divalidasi maksimal `2MB` dan mime type image sebelum upload.
