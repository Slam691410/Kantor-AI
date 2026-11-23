# Holding Investasi — Kantor AI & Sistem Kerja Terpadu

Portal terpadu **Holding Investasi** (modal sendiri, bukan pialang): Kantor AI 3 lantai
dengan 18 Agen AI, Sistem Kerja operasional (intake RAPID, buku kas, tugas, absensi wajah +
Google Maps, dokumen, audit), katalog 160 aset, dan Ekosistem Google Workspace
(Meet · Calendar · Gmail · Drive · Tasks).

## Arsitektur

| Lapisan | Teknologi |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS 4 (`src/`) |
| Backend lokal | Express 4 + `tsx` (`server.ts`), database JSON `data/holding-db.json` |
| Backend Apps Script | Google Apps Script + Spreadsheet 7 sheet (`versi-appscript/Code.gs`) |
| AI | Gemini server-side (`@google/genai`, default `gemini-2.5-flash`) |
| Peta | Google Maps Platform (`@vis.gl/react-google-maps`) |
| Workspace | Firebase Auth + Google Workspace API (`src/services/googleWorkspace.ts`) |

Frontend memakai **satu lapisan `src/api.ts`** yang otomatis beralih antara
REST (`/api/*`) dan Apps Script (`gasApiDispatch`) berdasarkan runtime.

## Menjalankan lokal

```bash
npm install
cp .env.example .env   # isi GEMINI_API_KEY & VITE_GOOGLE_MAPS_API_KEY
npm run dev            # http://localhost:3000 (Vite middleware + Express)
```

Perintah lain:

```bash
npm run lint           # tsc --noEmit
npm run build          # vite build -> dist/
NODE_ENV=production npm start   # sajikan dist/ via Express
npm run build:appscript         # bundle single-file -> versi-appscript/Index.html
```

Database dibuat otomatis di `data/holding-db.json` (seed 170 akun:
156 FTE Fase 1–3 + 12 Freelancer + 2 Eksternal, 39 tugas, intake/kas/dokumen contoh).
Folder `data/` di root diabaikan Git — **jangan** ubah menjadi `data/` tanpa garis miring
di depan, karena akan ikut mengabaikan `src/data/` (data portal statis).

## Autentikasi 3 faktor

Login memakai **foto wajah/kamera + lokasi Google Maps/GPS + OTP Email 6 digit**
(tanpa ID & PIN). Foto saat ini divalidasi format/ukurannya dan dicatat sebagai SHA-256 digest;
ini **belum** melakukan pencocokan biometrik atau memastikan identitas wajah. Validasi GPS juga
mengandalkan koordinat dari browser, bukan perangkat anti-spoofing. Jangan gunakan sebagai kontrol
keamanan produksi tanpa integrasi liveness/face matching dan attestation lokasi.

Sesi berlaku 6 jam dan disimpan di `sessionStorage` (refresh tidak perlu login ulang;
divalidasi ulang via `GET /api/auth/me`).

Tanpa `RESEND_API_KEY`, OTP berjalan dalam **mode preview** (ditampilkan di layar
dan log server) untuk pengujian. Atur `RESEND_API_KEY` + `MAIL_FROM` untuk email nyata.

## Aturan wewenang (RAPID & kas)

- Persetujuan intake: ≤ Rp500 jt Desk Head · > Rp500 jt CIO/Manajemen · > Rp5 M Direksi/Komisaris.
- Pengeluaran kas keluar > Rp100 jt wajib Direktur/Pemilik.
- Semua penolakan wewenang dicatat di audit log.

## Data statis (`src/data/`)

- `portalData.ts` — 12 desk, 12 fungsi pendukung, 14 kelas aset, 7 entitas,
  18 agen AI, 94 tugas, 15 alih daya, 6 skenario, dan layout kantor 3 lantai.
  Master data peran memuat 81 jabatan untuk fungsi Desk/Support.
- `katalog.ts` — 160 aset dari master katalog portal (tab `KAT`).
- `workforceSeed.ts` / `taskSeed.ts` — seed akun & tugas (sama dengan `Code.gs`).

## Tata kelola dokumen & arsip

Tab utama **Dokumen & Arsip** menampilkan pustaka draft bertahap (pra-pendirian sampai
arsip/penutupan) secara publik; template bisa dicari, dipratinjau, dan disalin tanpa login.
Dokumen operasional yang disimpan dan data transaksi tetap berada di area Sistem Kerja yang
memerlukan autentikasi. Paket lengkap dan register keluarga dokumen:

- [`docs/ARSITEKTUR_DOKUMEN_DAN_ARSIP.md`](docs/ARSITEKTUR_DOKUMEN_DAN_ARSIP.md) — siklus hidup, register keluarga dokumen untuk korporasi/izin/keuangan/160-an kategori aset/SDM/mitra/pemerintah/laporan/arsip, akses, dan retensi berbasis event.
- [`docs/PAKET_DRAFT_DOKUMEN_HOLDING.md`](docs/PAKET_DRAFT_DOKUMEN_HOLDING.md) — draft awal piagam pra-pendirian, instruksi notaris, keputusan/RAPID, kebijakan investasi, DD, memo/risalah, closing, surat instansi/kemitraan, laporan, insiden, legal hold, HR, NDA, disposisi dan transfer arsip jangka panjang.

Periode retensi di dokumen tersebut adalah **kerangka untuk divalidasi**, bukan angka hukum final.
Masa simpan harus ditentukan per entitas/aktivitas berdasarkan aturan, izin, kontrak, klaim dan
legal hold yang sudah diverifikasi. Modul penyimpanan aplikasi menyimpan teks terbatas dalam database
operasional; itu bukan DMS/records vault, bukan tanda tangan elektronik, dan bukan sistem legal hold.
Jangan simpan identitas, dokumen transaksi asli, rahasia dagang, atau bukti hukum di sana tanpa
kontrol akses, backup, retensi dan persetujuan yang memadai.

## Deploy Google Apps Script

Lihat `versi-appscript/DEPLOY.md`. Ringkasnya: buat proyek Apps Script,
unggah `Code.gs`, `Index.html` (hasil `npm run build:appscript`), dan `appsscript.json`,
jalankan `siapkanDatabase()` sekali, lalu deploy sebagai Web App.
Atur Script Properties: `SPREADSHEET_ID`, `GEMINI_API_KEY`, `GEMINI_MODEL`,
`GOOGLE_MAPS_API_KEY`.

## Environment

Lihat `.env.example`. Variabel utama: `PORT`, `DATA_DIR`, `GEMINI_API_KEY`,
`GEMINI_MODEL`, `VITE_GOOGLE_MAPS_API_KEY`, `VITE_GOOGLE_MAP_ID`, `RESEND_API_KEY`, `MAIL_FROM`.
