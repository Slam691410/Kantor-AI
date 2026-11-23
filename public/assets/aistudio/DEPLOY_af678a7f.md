# DEPLOY — Versi Google Apps Script

Dua jalur: **A (manual, tanpa install apa pun — disarankan pertama kali)** atau **B (clasp, untuk yang mengelola lewat git/terminal)**.

## Prasyarat
- Akun Google (Workspace lebih baik — akses web app bisa dibatasi satu domain).
- Server utama TIDAK dibutuhkan; versi ini berdiri sendiri dengan database Google Spreadsheet.

## Jalur A — Manual (±10 menit)
1. Buka https://sheets.google.com → buat Spreadsheet kosong, beri nama mis. `DB Holding Investasi`.
2. Menu **Extensions → Apps Script** — editor proyek terbuka (proyek ini terikat ke spreadsheet tersebut).
3. Di editor: hapus isi `Code.gs` bawaan, tempel seluruh isi berkas **`Code.gs`** dari paket ini.
4. Klik **+** di panel Files → **HTML** → beri nama persis **`Index`** (tanpa `.html`) → tempel isi **`Index.html`**.
5. **Project Settings** (ikon gerigi) → centang *"Show 'appsscript.json' manifest file in editor"* → kembali ke editor, buka `appsscript.json`, ganti isinya dengan berkas **`appsscript.json`** paket ini.
6. Pilih fungsi **`siapkanDatabase`** di daftar fungsi atas editor → **Run**. Setujui izin (akses Spreadsheet atas nama Anda). Hasil: 7 sheet terbuat + akun contoh terisi.
7. **Deploy → New deployment → Web app**:
   - *Execute as:* **Me**
   - *Who has access:* sesuai `appsscript.json` (bawaan `DOMAIN` = hanya domain Workspace Anda; ubah ke `ANYONE` hanya bila sadar risikonya — login PIN tetap wajib).
8. Salin **URL web app** (`https://script.google.com/macros/s/.../exec`) — itulah alamat aplikasinya. Buka, login `M1 / 1111`.

## Jalur B — clasp (terminal)
```bash
cd versi-appscript
npm install                 # memasang @google/clasp lokal
npx clasp login             # login akun Google
# Buat proyek dulu lewat Jalur A langkah 1–2, lalu ambil Script ID:
# editor Apps Script → Project Settings → Script ID
cp .clasp.json.example .clasp.json   # isi scriptId di dalamnya
npx clasp push              # mengunggah Code.gs, Index.html, appsscript.json
npx clasp open              # buka editor: jalankan siapkanDatabase() sekali
npm run deploy              # membuat deployment web app baru
```

## Checklist go-live (WAJIB sebelum dipakai nyata)
- [ ] Ganti PIN **semua** akun contoh: dari editor jalankan fungsi **`gantiPinPengguna`** (ubah `ID_PENGGUNA` + `PIN_BARU` di dalamnya, Run, lalu kembalikan `PIN_BARU` ke teks contoh agar PIN asli tidak tersimpan sebagai teks biasa).
- [ ] Periksa hasil **`cekInstalasi`** di editor: 7 sheet ada, tidak ada yang HILANG.
- [ ] Nonaktifkan akun yang tidak dipakai: kolom `Aktif` pada sheet Pengguna → selain `YA` berarti tidak bisa login.
- [ ] Batasi akses web app seketat mungkin (DOMAIN bila Workspace).
- [ ] Uji login tiap peran + uji penjaga: intake >Rp5 M tidak bisa disetujui Desk Head; kas keluar >Rp100 jt ditolak untuk non-Direktur.

## Memperbarui setelah ada perubahan kode
- Jalur A: tempel ulang berkas yang berubah → **Deploy → Manage deployments → Edit (ikon pensil) → Version: New version → Deploy**. URL tetap sama.
- Jalur B: `npx clasp push` lalu `npm run deploy` (atau edit deployment yang sama agar URL tidak berubah).

## Troubleshooting
| Gejala | Penyebab & obat |
|---|---|
| "Sheet hilang" | `siapkanDatabase()` belum dijalankan di proyek/spreadsheet ini. |
| Login selalu gagal setelah deploy ulang | Pastikan deployment menunjuk *New version*; sesi lama (CacheService 6 jam) cukup login ulang. |
| Izin ditolak peran tertentu | Itu penjaga by-design; percobaannya tercatat di sheet Audit. |
| Data tidak berubah | Yang diedit harus spreadsheet yang sama dengan tempat proyek Apps Script terikat (Jalur A langkah 1–2). |
