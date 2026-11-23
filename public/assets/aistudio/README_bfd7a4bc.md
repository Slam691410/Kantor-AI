# Holding Investasi — Versi Google Apps Script

Salinan turunan dari server utama untuk ekosistem Google. **Bukan pialang; modal sendiri** (batas legal sama). Database = Google Spreadsheet, antarmuka = HtmlService, logika = Apps Script.

## Berkas yang dibutuhkan (hanya 3 ini)
| Berkas | Fungsi |
|---|---|
| `Code.gs` | Seluruh backend: login (hash SHA-256), sesi CacheService, dashboard, intake + penjaga RAPID, keuangan + penjaga Rp100 jt, tugas, absensi PIN, audit |
| `Index.html` | Antarmuka (memanggil backend lewat `google.script.run`) |
| `appsscript.json` | Manifest: zona waktu Asia/Jakarta, web app |

## Cara pasang singkat (5 langkah)
> Panduan lengkap dua jalur (manual & clasp) + checklist go-live ada di **DEPLOY.md**.
1. Buat Google Spreadsheet kosong (database-nya) → Extensions → Apps Script.
2. Hapus isi editor, tempel `Code.gs`; buat file HTML bernama persis `Index`; tempel `appsscript.json` (Project Settings → tampilkan manifest).
3. Jalankan fungsi `siapkanDatabase` sekali (membuat 7 sheet + 7 akun contoh; PIN sama seperti server utama, **wajib diganti** untuk produksi — jalankan fungsi `gantiPinPengguna` dari editor, lihat DEPLOY.md).
4. Deploy → Web app (execute as: Me; akses dibatasi domain/akun yang Anda izinkan).
5. Buka URL web app, login M1/1111.

## Yang sengaja TIDAK ada di versi ini (batasan platform, bukan kelalaian)
- Real-time SSE → diganti muat ulang manual (Apps Script tidak punya koneksi persisten).
- Video call grup & WebRTC signaling → tidak tersedia; rapat ada di server utama.
- Kamera absen & biometrik → absensi di sini PIN + lokasi teks, status menunggu verifikasi atasan.
- Lampiran file → jalur tambahnya lewat Google Drive (DriveApp) — lihat "akan ditambahkan".
- Katalog 160 & 94 tugas penuh → sheet dapat diimpor massal dari `holding-server/data/seed.json` (tempel sebagai data sheet Katalog/Tugas).

## Bisa dibenahi (oleh Anda/operator, tanpa ubah arsitektur)
- Ganti PIN contoh & nonaktifkan akun contoh langsung di sheet Pengguna (kolom Aktif).
- Ubah daftar contoh tugas awal di fungsi `siapkanDatabase`.
- Batasi akses web app (appsscript.json: DOMAIN/ANYONE) sesuai kebijakan.
- Tambah sheet/kolom — fungsi `baca/tambah/perbarui` generik mengikuti header baris 1.

## Akan ditambahkan bila versi ini dipakai serius
1. Lampiran via DriveApp (unggah ke folder Drive, tautan tersimpan di sheet).
2. Impor seed penuh 160 katalog + 94 tugas dari seed.json.
3. Notifikasi GmailApp untuk antrean persetujuan & SLA.
4. Ekspor CSV/laporan dari sheet ke PDF terjadwal (trigger waktu).
