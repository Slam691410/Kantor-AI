# DEPLOY — Portal Holding Investasi (Versi Google Apps Script)

Paket di folder **`versi-appscript/`** berisi versi lengkap portal yang berjalan mandiri di **Google Apps Script** menggunakan **Google Spreadsheet** sebagai database dan layanan Workspace bawaan (**Gmail, Google Calendar, Google Meet, Google Drive/Docs/Sheets, Google Tasks**) + **Gemini AI**.

Berkas utama yang perlu diunggah ke proyek Apps Script:
1. `Code.gs` — server logic Apps Script, seed 156 Karyawan FTE + 12 Freelancer + 2 Eksternal, OTP Email via Gmail/MailApp, penjaga RAPID & Kas, dan penghubung Workspace.
2. `Index.html` — antarmuka SPA lengkap hasil build tunggal (`npm run build:appscript`).
3. `appsscript.json` — manifest izin layanan Google Apps Script.

---

## Cara 1 — Unggah Manual di Browser (±5 menit, tanpa terminal)

1. Buka [https://sheets.google.com](https://sheets.google.com) dan buat **Spreadsheet baru** (beri nama mis. `DB Holding Investasi`).
2. Di menu Spreadsheet, klik **Extensions → Apps Script** (*Ekstensi → Apps Script*).
3. Di editor Apps Script:
   - Buka **`Code.gs`**, hapus seluruh isinya, lalu tempel seluruh isi berkas **`versi-appscript/Code.gs`**.
   - Klik tombol **+** di sebelah *Files* → pilih **HTML** → beri nama persis **`Index`** (tanpa `.html`) → tempel seluruh isi **`versi-appscript/Index.html`**.
   - Klik **Project Settings** (ikon gerigi kiri) → centang **"Show 'appsscript.json' manifest file in editor"** → kembali ke editor, buka **`appsscript.json`**, dan ganti isinya dengan **`versi-appscript/appsscript.json`**.
4. *(Opsional)* Di **Project Settings → Script Properties**, tambahkan properti berikut bila ingin mengaktifkan fitur tambahan:
   - `GEMINI_API_KEY` — kunci API Gemini untuk tab *Asisten Gemini AI*.
   - `GOOGLE_MAPS_API_KEY` — kunci Google Maps JS API untuk peta interaktif.
5. Klik **Save** (ikon disket), pilih fungsi **`siapkanDatabase`** di menu atas editor, lalu klik **Run**. Setujui semua izin akses Google Spreadsheet, Gmail, Calendar, Drive, Docs, dan eksternal.
   - Hasil: **7 sheet** (`Pengguna`, `Tugas`, `Intake`, `Keuangan`, `Absen`, `Dokumen`, `Audit`) + **170 akun** (`156 Karyawan FTE + 12 Freelancer + 2 Eksternal`) langsung terisi otomatis.
6. Klik **Deploy → New deployment → Web app**:
   - *Execute as:* **Me**
   - *Who has access:* **Anyone** (atau **Anyone within [Domain Anda]** bila memakai akun Google Workspace perusahaan; bila memakai `@gmail.com` pribadi, ubah `"access": "ANYONE_ANONYMOUS"` atau pilih *Anyone* di UI Deploy).
7. Salin **Web app URL** (`https://script.google.com/macros/s/.../exec`) dan buka portal Anda!

---

## Cara 2 — Unggah via `clasp` (Terminal)

```bash
npm run build:appscript         # 1. Bangun ulang versi-appscript/Index.html terbaru
cd versi-appscript
npm install                     # 2. Pasang @google/clasp
npx clasp login                 # 3. Login akun Google Anda
cp .clasp.json.example .clasp.json
# Edit .clasp.json -> masukkan Script ID dari editor Apps Script (Project Settings)
npx clasp push                  # 4. Unggah Code.gs, Index.html, appsscript.json
npx clasp open                  # 5. Buka editor -> jalankan fungsi siapkanDatabase() sekali
npm run deploy                  # 6. Terbitkan Web App baru
```
