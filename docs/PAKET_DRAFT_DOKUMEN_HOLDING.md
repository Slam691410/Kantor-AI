# Paket Draft Dokumen — Holding Investasi Modal Sendiri

**Pemakaian:** salin sebagai draf kerja, isi bagian `[KURUNG SIKU]`, hapus petunjuk internal, lalu review Legal/Compliance dan pemegang kewenangan sebelum diterbitkan. Semua contoh harus disesuaikan dengan badan hukum/aktivitas sesungguhnya. Bukan akta notaris, opini hukum/pajak, izin, prospektus, penawaran efek, atau laporan regulator.

**Penanda isi:** `[WAJIB-ISI]` data/fakta yang harus diverifikasi; `[PILIH]` pilih opsi dan hapus sisanya; `[REVIEW-LEGAL]` jangan disahkan sebelum tinjauan profesional.

## Indeks draft

| Kode | Draft | Pemilik penyusun | Pemeriksa minimum |
|---|---|---|---|
| D-00 | Sampul kendali dokumen | Pemilik proses | Records Coordinator |
| D-01 | Piagam proyek pra-pendirian & keputusan lanjut | Pendiri / Strategy | Legal + Finance + Risk |
| D-02 | Instruksi pendirian badan kepada notaris | Pendiri / Legal | Penasihat hukum/notaris |
| D-03 | Risalah keputusan pendiri / rapat organ | Corsec | Legal; notaris bila diperlukan |
| D-04 | Register badan, saham, modal dan pemilik manfaat | Corsec / Finance | Legal + CFO |
| D-05 | Matriks kewenangan dan RAPID | Legal / Risk | Direksi + Komisaris/RUPS sesuai kewenangan |
| D-06 | Kebijakan investasi modal sendiri | CIO / Risk | Direksi / Komite investasi |
| D-07 | Form intake peluang investasi | Deal Sourcing / Desk | Compliance + sponsor desk |
| D-08 | Checklist due diligence berbasis kelas aset | Deal team | Legal + Risk + Finance + ahli teknis |
| D-09 | Memo investasi / keputusan alokasi modal | Desk / CIO | Risk + Finance + Legal + Komite berwenang |
| D-10 | Risalah komite investasi dan resolusi | Sekretaris komite | Corsec / Legal |
| D-11 | Checklist penutupan / settlement transaksi | COO / Deal lead | Legal + Finance + approver independen |
| D-12 | Register aset dan lembar monitoring periodik | Asset owner | Finance + Risk |
| D-13 | Onboarding pihak lawan / vendor / konsultan | Procurement / Compliance | Legal + pemilik data/proses |
| D-14 | Kerangka evaluasi dan pemilihan vendor | Procurement | User unit + Finance + Risk |
| D-15 | Kerangka perjanjian jasa / scope of work | Legal / sponsor | Legal, tax dan data owner |
| D-16 | Surat resmi permohonan/klarifikasi kepada instansi | Legal / Compliance | Pejabat berwenang + counsel |
| D-17 | Surat permintaan proposal/kemitraan | Sponsor unit | Legal + Finance |
| D-18 | Board pack / laporan Direksi berkala | Sekretariat Direksi | CFO + CIO + Risk + Legal |
| D-19 | Paket tutup buku bulanan | CFO / Finance | Reviewer independen |
| D-20 | Laporan risiko dan kepatuhan berkala | Risk / Compliance | Direksi / Komite audit/risiko |
| D-21 | Risalah rapat dan action log | Sekretariat rapat | Ketua rapat + Legal bila material |
| D-22 | Notifikasi insiden / laporan awal | Incident owner | Risk + Legal + Security / HR sesuai kasus |
| D-23 | Legal hold / preservasi bukti | Legal | Direksi/penanggung jawab kasus + IT |
| D-24 | Checklist akhir hubungan kerja/vendor | People / Procurement | Legal + IT + Finance |
| D-25 | Sertifikat disposisi/pemusnahan arsip | Records Coordinator | Legal + Compliance + pemilik arsip |
| D-26 | Rencana serah terima arsip pasca-operasi | Direksi / likuidator | Legal + Finance + kustodian |
| D-27 | Register surat masuk/keluar dan bukti penyampaian | Corsec / pemilik urusan | Records Coordinator |

---

## D-00 · Sampul kendali dokumen

```text
[LOGO / NAMA BADAN HUKUM]

JUDUL DOKUMEN: [WAJIB-ISI]
Nomor dokumen: [ENT-KELUARGA-TAHUN-URUT-VERSI]
Badan hukum pemilik: [WAJIB-ISI]
Unit/pemilik proses: [WAJIB-ISI]
Jenis: [Kebijakan / Keputusan / Kontrak / Surat / Laporan / Bukti / lainnya]
Klasifikasi: [PUBLIK / INTERNAL / RAHASIA / SANGAT RAHASIA]
Status: [WORKING / REVIEW / APPROVED / EXECUTED-ISSUED / SUPERSEDED / ARCHIVED]
Versi dan tanggal: [WAJIB-ISI]
Tanggal berlaku: [WAJIB-ISI / tidak berlaku]
Disusun oleh: [nama, jabatan]
Diperiksa oleh: [nama, jabatan]
Disetujui/ditandatangani oleh: [nama, kapasitas, dasar kewenangan]
Pihak/entitas/transaksi terkait: [WAJIB-ISI / tidak ada]
Lampiran: [daftar]
Lokasi master: [tautan/path repositori terkendali]
Retensi: [band + aturan yang sudah diverifikasi + event mulai]
Legal hold: [TIDAK / YA — case ID dan instruksi Legal]
Riwayat revisi:
Versi | tanggal | perubahan | penyusun | pemeriksa | approver
[...]
```

## D-01 · Piagam proyek pra-pendirian & keputusan lanjut

```text
PIAGAM STUDI PEMBENTUKAN HOLDING INVESTASI
Nomor: [..] | Tanggal: [..] | Sponsor: [..]
Status dokumen ini: kajian internal, bukan penawaran kepada publik atau komitmen transaksi.

1. TUJUAN DAN KEPUTUSAN YANG DIMINTA
Mengevaluasi pembentukan [nama usulan] untuk menginvestasikan modal sendiri pada kelas aset
[daftar awal], mengelola kepemilikan dan risiko grup, serta menentukan prasyarat sebelum mulai
beroperasi. Keputusan yang diminta: [LANJUT / LANJUT DENGAN SYARAT / TUNDA / HENTIKAN].

2. ASUMSI YANG BELUM MENJADI FAKTA
- Domisili/badan hukum: [..]; bentuk badan: [..]; pemilik/pengendali: [..].
- Modal awal dan sumber: [..]; tahap setoran: [..]; runway: [..].
- Aktivitas yang direncanakan: [..]. Aktivitas yang tidak akan dilakukan tanpa kajian/izin:
  menghimpun/mengelola dana pihak lain, menjadi perantara/pialang, menawarkan instrumen ke publik,
  memberi jasa investasi berizin, bertindak sebagai kustodian, atau aktivitas lain yang diklasifikasi
  memerlukan persetujuan/izin.
- Portofolio sasaran: [..] dari sekitar 160 kategori master; angka ini bukan pernyataan seluruh
  kategori sudah layak, tersedia, diizinkan, atau akan dimiliki.

3. ANALISIS
A. Strategi dan tesis pemilik modal: [..]
B. Struktur entitas / SPV per aset, alasan, biaya, konflik: [..]
C. Sumber dan bukti modal; batas eksposur dan likuiditas: [..]
D. Pemetaan regulasi dan legal opinion yang diperlukan: [isu, counsel, due date]
E. Rencana organisasi/FTE per fase, jabatan kritis, pemisahan tugas: [..]
F. Sistem pembukuan, pajak, kontrol pembayaran, audit, keamanan dan arsip: [..]
G. Pihak eksternal: notaris, bank, akuntan, auditor, penasihat, vendor utama: [..]
H. Skenario dasar/tekanan/ekstrem; asumsi return, rugi, likuiditas, exit: [..]
I. Risiko dan mitigasi (pemilik, trigger, indikator): [..]
J. Biaya pendirian dan operasi 36 bulan: [..]

4. GERBANG PRA-OPERASI (semua harus ditutup atau punya waiver sah)
[ ] Bentuk badan, nama, pemegang saham, modal dan pengendali disetujui.
[ ] Akta, pendaftaran, pajak, perizinan dan KBLI diverifikasi penasihat sesuai aktivitas aktual.
[ ] KYC bank/sumber modal dan rekening atas nama entitas siap.
[ ] Kebijakan investasi, konflik, delegasi/RAPID, maker-checker dan transaksi pihak terkait disahkan.
[ ] Buku besar, chart of accounts, kalender pajak/laporan dan kontrol rekonsiliasi siap.
[ ] Register aset/kontrak, keamanan akses, backup, privasi dan retensi siap.
[ ] Penanggung jawab risiko, kepatuhan, legal, finance, operasi dan arsip ditetapkan.

5. KEPUTUSAN
Keputusan: [..] | Syarat: [..] | Pemilik tiap syarat dan tenggat: [..]
Batas wewenang: keputusan ini [tidak] memberi mandat melakukan transaksi, menawarkan investasi,
menandatangani kontrak, meminta dana publik, atau menyampaikan klaim return.

Tanda tangan pendiri/sponsor: [..] | Legal: [..] | Finance: [..] | Risk/Compliance: [..]
Lampiran: model finansial [..], daftar pertanyaan counsel [..], risk register [..].
```

## D-02 · Instruksi pendirian badan kepada notaris

```text
RAHASIA — INSTRUKSI KEPADA NOTARIS (DRAF KLIEN)
Tanggal: [..] | Ditujukan kepada: [nama notaris/kantor]
Perihal: Permintaan konsultasi dan penyusunan dokumen pendirian [bentuk badan]

Kami, [nama pihak pemberi instruksi dan kapasitas], meminta konsultasi mengenai pendirian badan
hukum untuk tujuan mengelola investasi dari modal sendiri. Instruksi ini bukan akta, bukan keputusan
pengesahan, dan tidak menggantikan pemeriksaan identitas, persetujuan para pihak, atau ketentuan
hukum yang berlaku.

A. Data usulan (mohon diverifikasi):
Nama 1/2/3: [..] | Domisili: [..] | Kegiatan nyata yang direncanakan: [..]
Pendiri/pemegang saham dan porsi indikatif: [..] | Modal ditempatkan/disetor: [..]
Direksi/komisaris usulan: [..] | Pemilik/pengendali manfaat: [..]

B. Mohon notaris memberi arahan tertulis atas:
1. Ketersediaan nama, bentuk badan, persyaratan pendirian dan dokumen identitas.
2. Klausul maksud/tujuan dan kegiatan usaha yang akurat; mohon tandai aktivitas yang memerlukan
   klasifikasi, izin, persetujuan atau pembatasan khusus.
3. Modal, setoran, saham, kelas/hak saham, pengendalian dan pengungkapan yang diwajibkan.
4. Pengangkatan pengurus, masa jabatan, kewenangan, tanda tangan dan keputusan pemegang saham.
5. Proses pembuatan akta, pengajuan/pencatatan/persetujuan instansi, biaya resmi, bukti hasil dan
   kewajiban pascapendirian.
6. Dokumen sumber dana/pemilik manfaat dan perlindungan data yang diperlukan.
7. Tindakan yang harus ditunda hingga status pendirian/izin efektif.

C. Batas instruksi:
- Jangan mengajukan kegiatan atau pernyataan yang belum didukung fakta dan kajian.
- Tidak ada kuasa untuk membuka rekening, memindahkan dana, menunjuk pihak lain, atau menandatangani
  kontrak operasional kecuali diberi kuasa tertulis terpisah.
- Dokumen identitas/keuangan terlampir hanya untuk tujuan pendirian; penanganan dan retensinya
  mengikuti kewajiban kerahasiaan dan hukum yang berlaku.

Kontak resmi: [..] | Daftar lampiran dan klasifikasi: [..]
Dimohon memberikan daftar kekurangan, estimasi timeline/biaya, dan draf untuk ditinjau sebelum
penandatanganan. Tidak ada bagian draf ini yang boleh dianggap telah disahkan.

Hormat kami,
[nama, jabatan/kapasitas, dasar kewenangan, tanda tangan]
```

## D-03 · Risalah keputusan pendiri / rapat organ

```text
DRAF RISALAH [RAPAT PENDIRI / DIREKSI / KOMISARIS / KOMITE]
Badan hukum: [..] | Nomor: [..] | Tanggal/jam/tempat/media: [..]
Pemimpin: [..] | Pencatat: [..] | Undangan dan bukti penyampaian: Lampiran A

HADIR, KAPASITAS, KUORUM DAN KONFLIK
Hadir: [nama, jabatan, mewakili siapa]. Kuasa: [..]. Kuorum dinilai oleh [..] berdasarkan [aturan
internal/akta yang sudah diverifikasi]. Tidak hadir: [..]. Konflik kepentingan yang dideklarasikan:
[..]. Anggota yang abstain/meninggalkan pembahasan dan alasannya: [..].

AGENDA
1. [..]
2. [..]

PEMBAHASAN DAN BUKTI
Untuk setiap agenda: ringkasan fakta, bahan yang dibahas (nomor versi), alternatif, risiko, pertanyaan,
pendapat profesional, dissent/abstain. Jangan menyalin data sensitif yang tidak diperlukan.

RESOLUSI
Diputuskan bahwa: [teks operatif spesifik].
Batas nominal/masa berlaku/syarat pendahuluan: [..].
Pejabat yang diberi kuasa dan lingkupnya: [..].
Hal yang TIDAK disetujui/tidak diputuskan: [..].
Suara: setuju [..], tidak setuju [..], abstain [..]; pencatatan konflik: [..].
Pelaksana, pemilik tindakan, tenggat dan bukti penutupan: lihat action log.

Pernyataan: risalah ini adalah draf sampai diverifikasi, dikoreksi, dan ditandatangani sesuai tata
cara badan dan aturan yang berlaku. Keabsahan keputusan harus ditinjau Legal/Corsec.

Pengesahan: Ketua [..] | Pencatat [..] | peserta lain bila diwajibkan: [..]
Lampiran: undangan, daftar hadir/kuasa, bahan final, deklarasi konflik, action log.
```

## D-04 · Register badan, saham, modal dan pemilik manfaat

```text
REGISTER KORPORASI — AKSES SANGAT TERBATAS
Badan hukum ID: [..] | Nama terdaftar: [..] | Nomor akta/pencatatan/izin: [..]
Tanggal berdiri/efektif: [..] | Domisili: [..] | Penanggung jawab record: [..]

A. Riwayat dokumen badan: ID | jenis | nomor/tanggal | notaris/instansi | status | versi | lokasi master
B. Register saham/modal (akses terbatas): pemegang | kelas/jumlah/nominal | tanggal perolehan/
   setoran | bukti | hak/beban | dasar perubahan | approver
C. Peta kepemilikan dan kendali langsung/tidak langsung: entity | parent | persentase/hak kendali |
   tanggal efektif | bukti | review legal
D. Identifikasi pemilik manfaat/pengendali sesuai definisi dan kewajiban yang telah diverifikasi:
   [data seperlunya; dasar; sumber; verifikasi; tanggal review; akses]
E. Daftar pengurus/kuasa: nama | jabatan | masa | batas kuasa | spesimen/kanal aman | mulai/akhir |
   pencabutan akses
F. Perubahan tertunda dan tenggat pemberitahuan/pengajuan: [..]
G. Catatan: data di sini bukan pengganti register resmi atau pelaporan instansi.

Setiap perubahan harus ditautkan pada keputusan sah, dokumen pendukung, tanggal berlaku,
pengajuan/penerimaan bila diperlukan, serta pembaruan bank, pajak, izin, kontrak dan access list.
```

## D-05 · Matriks kewenangan dan RAPID

```text
KEBIJAKAN DELEGASI KEWENANGAN — VERSI [..]
Pemilik: [..] | Disetujui organ: [..] | Efektif: [..] | Review berikut: [..]

Definisi: R=Recommend/menyusun; A=Agree/peninjau wajib; P=Perform/pelaksana; I=Input/masukan;
D=Decide/keputusan akhir. Tiap urusan harus memiliki satu D yang jelas. Matriks ini tidak menggantikan
batas kewenangan dalam anggaran dasar, keputusan organ, izin, kontrak bank, atau hukum.

Urusan | Desk mengusulkan | Risk/Compliance | Legal | Finance | CIO/komite | Direksi | organ pemegang saham
Intake awal | R | A bila trigger | A bila legal | I | D sesuai limit | D bila trigger | D bila dicadangkan
Transaksi aset | R/P terbatas | A | A | A | D sesuai limit | D di atas limit | D jika reserved matter
Pembayaran | P | I | I | A/checker | D sesuai limit | D sesuai limit | D bila dicadangkan
Kontrak/vendor | R | A bila risiko | A | A sesuai nilai | I | D sesuai limit | D bila dicadangkan
Exit/impairment | R | A | A | A | D sesuai limit | D sesuai limit | D bila dicadangkan

Ambang angka: [isi hanya setelah disetujui dan sinkron dengan akta/mandate bank].
Pemisahan tugas: pengusul ≠ approver ≠ pembuat pembayaran ≠ rekonsiliator.
Conflict: pihak berkepentingan deklarasi sebelum agenda; tidak ikut memutus kecuali dinilai sah.
Emergency: [lingkup terbatas], notifikasi [..], ratifikasi [..], larangan [..].
Pengganti/kuasa: [..]. Masa berlaku: [..]. Pencabutan dan bukti notifikasi: [..].

Persetujuan Legal/Compliance: [..] | CFO: [..] | Risk: [..] | Direksi/organ: [..]
Lampiran: tabel limit per kelas risiko dan per entitas; jangan gunakan angka contoh sebagai otorisasi.
```

## D-06 · Kebijakan investasi modal sendiri

```text
KEBIJAKAN INVESTASI DAN PENGELOLAAN ASET
Versi [..] | Pemilik [CIO] | Disetujui [..] | Tanggal efektif [..]

1. MANDAT
Perseroan menempatkan modal sendiri untuk kepentingan perseroan sesuai tujuan, batasan, dan
kewenangan yang disahkan. Kebijakan ini tidak memberi kuasa menghimpun/mengelola dana pihak lain,
menawarkan investasi kepada publik, menjadi perantara, atau menjalankan jasa berizin.

2. TUJUAN, HORIZON DAN KEBUTUHAN KAS
Tujuan return/risk/liquidity: [..]. Kebutuhan operasi, utang, pajak, komitmen dan reserve kas: [..].
Horizon per kelas aset: [..]. Benchmark dan metode pengukuran: [..]. Tidak ada jaminan return.

3. KELAYAKAN DAN DAFTAR AKTIVITAS
Kategori master (160-an) adalah taksonomi pencatatan, bukan persetujuan otomatis. Untuk tiap peluang
harus dicatat: badan pemilik, kelas/desk, regulasi dan izin yang diverifikasi, due diligence, konflik,
sumber modal, penilaian, risiko, limit dan exit. Daftar prohibisi/restriksi: [..].

4. LIMIT PORTOFOLIO
Konsentrasi per aset/issuer/entitas/sektor/geografi/counterparty: [angka disahkan].
Likuiditas minimum/stress: [..]. Leverage/derivatif/kripto/pihak berelasi: [diizinkan terbatas / dilarang
sampai persetujuan khusus]. Limit hanya berlaku setelah Legal/Risk menilai kesesuaian.

5. KEPUTUSAN DAN EKSEKUSI
Sourcing → screening → DD → memo → review independen → keputusan sesuai delegation matrix →
kontrak → maker-checker settlement → register/ledger → monitoring. Pelaksana tidak boleh mengubah
harga, counterparty, rekening atau syarat material dari keputusan tanpa approval baru.

6. PENILAIAN, AKUNTANSI DAN PELAPORAN
Frekuensi per kelas: [..]. Sumber harga/hierarki, metodologi, reviewer, impairment dan exception: [..].
Finance menentukan perlakuan akuntansi bersama penasihat; NAV internal bukan otomatis nilai wajar,
penilaian independen, atau angka untuk penawaran ke publik.

7. RISIKO, KONFLIK DAN ESKALASI
Risk appetite, trigger, breach response, conflict register, related party, gifts, escalation: [..].
Tidak boleh ada transaksi bila beneficial ownership, sumber dana, title, rekening atau otorisasi belum
cukup diverifikasi.

8. REVIEW
Review minimum [frekuensi]; segera saat perubahan hukum/izin/struktur/insiden/material strategy.
Pemilik versi dan bukti pelatihan: [..].
```

## D-07 · Form intake peluang investasi

```text
ID peluang: [..] | Tanggal masuk: [..] | Pengusul/sumber: [..] | Pemilik proses: [..]
Badan hukum calon pemilik: [..] | Desk/kelas katalog: [..] | Tahap: [screening / DD / keputusan]

1. RINGKASAN
Aset/usaha/issuer: [..] | Jenis hak yang diperoleh: [saham/utang/title/lisensi/lainnya]
Lokasi/yurisdiksi: [..] | Penjual/counterparty dan pengendali yang diketahui: [..]
Harga/nilai indikatif dan mata uang: [..] | Struktur transaksi: [..] | Tenggat: [..]

2. SUMBER DAN KONFLIK
Sumber lead, referral fee, hubungan pihak terkait, ownership, deklarasi konflik pengusul/pihak review:
[..]. Fee/komisi/benefit yang diminta: [..]. Screening yang telah dilakukan dan sumber/tanggal: [..].

3. RINGKAS INVESTMENT CASE
Tesis; alasan strategic fit; alternatif termasuk tidak bertransaksi; asumsi return/downside; exit;
likuiditas; sumber modal; kebutuhan follow-on; biaya transaksi: [..].

4. GERBANG KELAYAKAN
[ ] Modal sendiri dan badan pemilik jelas.
[ ] Aktivitas, produk, pihak serta izin/kewajiban yang mungkin terpicu telah dipetakan Legal/Compliance.
[ ] KYC/KYB, pemilik/pengendali, sumber dana dan rekening sesuai kebutuhan diverifikasi.
[ ] Konflik, sanksi/PEP screening (bila relevan dan sah), integritas dan reputasi dinilai.
[ ] Title/hak, beban, tuntutan, pajak, teknis, valuasi, data, keamanan, keselamatan dan ESG yang relevan.
[ ] Nilai di atas limit? [..] Siapa D? [..]

Keputusan screening: [lanjut DD / minta informasi / tolak / hold]. Alasan: [..]. Approver: [..].
Lampiran/data room: [ID dan klasifikasi]. Tidak ada komitmen sebelum persetujuan final tertulis.
```

## D-08 · Checklist due diligence lintas aset

```text
ID peluang/aset: [..] | Entitas pemilik: [..] | Kelas: [..] | Tanggal cut-off: [..]
Untuk tiap item: status [clear / exception / tidak berlaku / belum tersedia], sumber, tanggal, reviewer,
materiality, mitigasi, owner dan deadline. “Belum tersedia” bukan dianggap lolos.

A. IDENTITAS & HAK
[ ] Identitas counterparties/representatives dan otorisasi
[ ] UBO/control chain, related party, konflik dan reputasi (sejauh relevan)
[ ] Title/ownership, chain of title, registrasi, lien, encumbrance, sengketa, hak pihak ketiga
[ ] Kuasa jual/representasi, consent pasangan/pemilik bersama bila relevan dan sah
[ ] Dokumen asli/keabsahan tanda tangan, penerjemahan/legalisasi bila perlu

B. KEUANGAN / PAJAK
[ ] Harga, dasar negosiasi, valuasi independen/benchmark dan sensitivitas
[ ] Laporan keuangan, arus kas, utang/kewajiban, covenant, komitmen tersembunyi
[ ] Pajak transaksi, pajak berjalan, pajak tangguhan, potensi tunggakan/sengketa
[ ] Sumber dan tujuan dana, rekening atas nama pihak yang benar, fraud/payment controls

C. LEGAL / REGULASI
[ ] Aktivitas dan izin per badan hukum; pembatasan; kondisi/expiry/pelaporan
[ ] Kontrak material, jaminan, hak kekayaan intelektual, litigasi, klaim, persetujuan pihak ketiga
[ ] Perlindungan data, konsumen, persaingan, ketenagakerjaan dan lingkungan bila relevan
[ ] Struktur deal tidak menyamarkan penghimpunan atau pengelolaan dana pihak lain

D. OPERASIONAL / TEKNIS
[ ] Kondisi fisik/sistem, kapasitas, maintenance, keselamatan, vendor, ketergantungan
[ ] Hak akses, cybersecurity, data provenance, continuity, asuransi dan klaim
[ ] Reputasi, kualitas pendapatan, pelanggan/pemasok utama, concentration, fraud

E. RISIKO / KEPUTUSAN
[ ] Downside dan skenario stress; likuiditas dan exit; concentration/limit
[ ] Conflict disclosure dan recusal
[ ] Red flags, residual risk, syarat sebelum closing, covenant/post-closing action
[ ] Pendapat ahli terlampir dan batasannya; independence/engagement check

Kesimpulan: [..] | Open items yang harus jadi condition precedent: [..]
Reviewer independen: [Risk ..] [Legal ..] [Finance ..] [Technical ..]
Rekomendasi: [..] — keputusan final tetap sesuai delegation matrix.
```

### Lampiran D-08A · Tambahan DD per kategori katalog

Gunakan baris sesuai kategori; jangan mengasumsikan satu checklist cocok untuk semua 160 kode.

| Kategori master (pemetaan mengikuti `src/data/katalog.ts`) | Bukti tambahan yang perlu dinilai |
|---|---|
| A — kas, deposito, pendapatan tetap | Penerbit/bank, rekening dan hak atas dana, tenor, kupon, risiko kredit, likuiditas, covenant, konfirmasi eksternal, konsentrasi, pajak, early withdrawal |
| B — obligasi dan instrumen utang | Dokumen penerbitan, term, senioritas, jaminan, covenant, rating/sumber, trustee/agen bila relevan, default, pasar sekunder, settlement dan pembatasan transfer |
| C — saham publik | Legalitas akses bursa melalui perantara berizin bila digunakan, beneficial ownership, corporate action, likuiditas/market impact, insider/restricted list, konsentrasi, custody statement |
| D — reksa dana/ETF | Status dan dokumen produk/pengelola/kustodian, prospektus/fund facts, biaya, redemption gate, NAV, overlap underlying, pihak penjual/kanal yang sah; jangan memasarkan ke pihak lain |
| E — FX, komoditas, derivatif | Tujuan hedging/investasi, izin/venue/counterparty, margin/collateral, leverage, settlement, basis/rollover, exposure limit dan stress loss; persetujuan khusus sebelum transaksi |
| F — kripto/aset digital | Klasifikasi hukum aktual, penyedia/venue yang dapat digunakan, custody, key management, multisig, chain analytics, smart-contract audit, bridge/counterparty risk, fork, tax, cyber dan recovery; larang penggunaan wallet pribadi |
| G — properti dan tanah | Sertifikat/registrasi dan chain of title, zoning/tata ruang, batas/pengukuran, sengketa/occupant, izin bangunan/pemanfaatan, pajak, appraisal, sewa, lingkungan, struktur dan biaya pemeliharaan |
| H — aset fisik produktif | Serial/nomor aset, title dan lien, inspeksi teknis, usia/kapasitas, maintenance, spare parts, operator, keselamatan/izin, utilisasi, telemetry, lokasi, asuransi, nilai scrap |
| I — agrikultur dan sumber daya alam | Hak/konsesi/lahan dan tenure, izin operasional, rantai pasok, tanah/air, lingkungan, tenaga kerja, musim/cuaca, hama, traceability, masyarakat, keselamatan dan rehabilitasi |
| J — koleksi/barang bernilai tinggi | Provenance, autentikasi ahli independen, title, ekspor/impor/kepabeanan bila relevan, appraisal, penyimpanan/iklim, theft/fraud, asuransi, market depth dan biaya jual |
| K — bisnis/usaha langsung/UMKM | Legalitas usaha, laporan transaksi/POS, rekening, pajak, payroll, pelanggan/pemasok, unit economics, persediaan, utang off-book, izin sektor, kontrol pemilik, fraud, integrasi pasca-investasi |
| L — digital, SaaS dan kekayaan intelektual | Chain of title kode/merek/domain/data, lisensi open-source/third-party, kontrak developer, keamanan, privacy, cloud portability, customer concentration, churn/MRR provenance, escrow/backup, expiry dan infringement |
| M — asuransi/pensiun/proteksi | Jenis hak yang dibeli, issuer dan status izin, pemegang polis/penerima manfaat, exclusion, surrender value, solvabilitas pihak penerbit, premi/pajak, klaim dan batas: bukan menjual/menasihati pihak lain tanpa izin |
| N — aset alternatif/struktur khusus (jika digunakan) | Dokumen struktur, issuer/SPV, hak waterfall, fee, valuation, leverage, likuiditas, side letter, conflicts, custody, tax, regulator dan exit restrictions; counsel wajib sebelum komitmen |

**Peringatan instrumen:** kode dan kelompok di tabel adalah taksonomi internal yang bisa berubah. Verifikasi nama/kelas tepat pada master katalog, klasifikasi produk, aturan aktual, pihak berizin, transaksi dan yurisdiksi. Tidak ada item yang otomatis disetujui karena ada di katalog.

## D-09 · Memo investasi / keputusan alokasi modal

```text
MEMO INVESTASI — RAHASIA / KOMITE SAJA
ID peluang: [..] | Entitas investor: [..] | Tanggal cut-off data: [..]
Penyusun/rekomendasi: [..] | Review independen: [..] | Meeting/decision ID: [..]

1. RINGKASAN KEPUTUSAN
Rekomendasi: [beli / tambah / tahan / restrukturisasi / jual / tolak].
Jumlah maksimum: [..] | Mata uang: [..] | Sumber dana: [..] | Counterparty: [..]
Syarat sebelum efektif: [..]. Batas waktu mandat: [..].

2. ASET DAN STRUKTUR
Identitas/kode, hak yang dibeli, kelas, lokasi/yurisdiksi, issuer/seller, entitas pemilik, instrument,
terms, ownership, custody dan hubungan pihak berelasi: [..].

3. TESIS DAN ALTERNATIF
Strategic fit, sumber return, pembanding, alternatif (termasuk no-deal), exit route: [..].

4. ANALISIS KUANTITATIF
Harga dan sumber, total biaya, proyeksi [base/downside/upside], horizon, cashflows, IRR/ROI bila
layak, asumsi, sensitivitas, pajak, FX, liquidity, impairment, modal lanjutan: [..].
Jelaskan bahwa proyeksi bukan jaminan hasil; jangan memakai angka tanpa sumber dan tanggal.

5. DUE DILIGENCE DAN RISIKO
Temuan legal, tax, finance, technical, operations, security, data, counterparty, concentration,
conflicts, ESG/health/environment bila material: [..]. Residual risk/mitigasi/owner/trigger: [..].
Open item/condition precedent: [..]. Pendapat eksternal dan limitation: [..].

6. KEWENANGAN DAN KONTROL
Limit policy yang berlaku, D/approver, conflict recusal, maker-checker, rekening, settlement,
post-closing owner, reporting frequency, stop-loss/exit trigger: [..]. Legal/Compliance memastikan
struktur dan aktivitas diizinkan sebelum transaksi.

7. RESOLUSI YANG DIMINTA
Setujui [..] dengan kondisi [..], otorisasi terbatas kepada [..] sampai [tanggal] dengan syarat [..].
Setiap perubahan harga/volume/counterparty/terms material memerlukan approval baru. Tidak ada kuasa
menghimpun dana, menjual kepada publik, atau mewakili pihak lain.

Lampiran: DD checklist; model; valuation; conflict declaration; term sheet; legal/tax memos; source list.
```

## D-10 · Risalah komite investasi dan resolusi

```text
KOMITE INVESTASI — RISALAH KEPUTUSAN
Meeting ID/tanggal: [..] | Chair: [..] | Secretary: [..] | Kuorum: [diverifikasi]
Agenda/memo version: [ID + hash/version]
Hadir dan kapasitas: [..] | Conflict declarations: [..] | Recusal: [..]

Ringkasan paparan dan pertanyaan: [..]
Asumsi atau data yang ditantang: [..]
Pendapat Risk / Legal / Finance / Desk: [..]

RESOLUSI: [APPROVE / APPROVE WITH CONDITIONS / DEFER / REJECT]
Nilai/currency/asset/entity/counterparty: [..]
Kondisi pendahuluan dan bukti penutupan: [..]
Delegasi terbatas kepada: [..], tidak boleh mengubah [..], berlaku sampai [..].
Dissent/abstain dan alasan: [..]. Tindakan pasca rapat (owner + due date): [..].
Keputusan ini tidak efektif sebelum semua syarat organ/otorisasi dan legal dipenuhi.

Pengesahan chair/secretary/approver: [..] | Tanggal final: [..]
Lampiran final, daftar hadir, conflict declarations, voting, memo dan bukti pemenuhan conditions.
```

## D-11 · Checklist penutupan / settlement transaksi

```text
CLOSING CHECKLIST — ID TRANSAKSI [..]
Entitas pembeli: [..] | Aset: [..] | Counterparty: [..] | Target close: [..]

LEGAL
[ ] Approval dan limit masih berlaku; kuasa/signatory diverifikasi
[ ] Kontrak final versi [..] sama dengan versi yang disetujui
[ ] Conditions precedent dan consent dipenuhi/diputuskan oleh Legal
[ ] Title/transfer/registrasi, jaminan, release, dokumen asli dan tanggal efektif diverifikasi
[ ] Kewajiban lapor/izin/pajak pasca close dipetakan dan assigned

FINANCE / TREASURY
[ ] Budget dan sumber kas tersedia; maker dan checker berbeda
[ ] Nama rekening penerima diverifikasi lewat kanal independen; perubahan rekening callback
[ ] Currency, amount, fee, withholding/tax dan reference cocok dengan approval
[ ] Payment instruction ditandatangani pejabat sesuai mandate; bukti transfer disimpan
[ ] Jurnal, subledger, bank reconciliation dan opening value disiapkan

OPERASI / ASET
[ ] Serah terima, inspeksi, serial/location/custodian, access/credential dan insurance
[ ] Register asset, owner, valuation basis, maturity/covenant/corporate action dibuat
[ ] Vendor/operator, maintenance, safety, data dan emergency contact disiapkan

RECORDS / POST-CLOSE
[ ] Final signed set, evidence, correspondence, approvals, source files dan metadata tersimpan
[ ] Legal hold/retention band/trigger dan access group ditetapkan
[ ] 30/60/90 day action plan, reporting, covenant/renewal/tax dates dimasukkan kalender
[ ] Rekonsiliasi independen selesai; exception dan eskalasi dicatat

Status: [READY / BLOCKED]. Blocker: [..]. Tidak boleh release pembayaran saat BLOCKED.
Penanggung jawab checklist: [..] | Legal: [..] | Finance: [..] | Approver: [..]
```

## D-12 · Register aset dan lembar monitoring

```text
MASTER ASSET RECORD
Asset ID: [unik] | Entitas legal owner: [..] | Parent/SPV: [..]
Master category/code: [..] | Nama/description: [..] | Lokasi/yurisdiksi/custodian: [..]
Tanggal dan biaya perolehan: [..] | Basis pencatatan: [..] | Currency/FX: [..]
Counterparty/issuer/beneficial owner jika relevan: [..] | Hak/title document IDs: [..]
Approval/closing IDs: [..] | Insurance/coverage/expiry: [..] | Tax basis: [..]
Valuation method, date, source, reviewer, assumptions and limitations: [..]
Encumbrances, covenant, maturity, maintenance, cashflows, concentration: [..]

MONITORING PERIOD [YYYY-MM]
Kinerja dan sumber data: [..] | Nilai/uncertainty: [..] | Cashflow: [..]
Trigger/covenant/expiry: [..] | Inspection / condition: [..] | Risk score/change: [..]
Exception, event, claim, incident: [..] | Action owner/due date: [..]
Rekomendasi: [hold / reduce / increase subject to approval / remediate / exit / revalue].
Reviewer: Desk [..] | Risk [..] | Finance [..] | Approval jika diperlukan [..]

Log perubahan: waktu | field | nilai lama/baru | alasan | user | approval/document ID.
```

## D-13 · Onboarding pihak lawan / vendor / konsultan

```text
COUNTERPARTY INTAKE — AKSES TERBATAS
ID: [..] | Tipe: [vendor / seller / buyer / adviser / bank / partner / instansi / other]
Entitas peminta: [..] | Sponsor internal: [..] | Tujuan hubungan: [..] | Due date: [..]

Data minimum dan dasar pengumpulan: nama legal, nomor registrasi yang relevan, alamat usaha,
representative/authority, kontak bisnis, rekening atas nama entitas bila pembayaran, pemilik/kendali
bila diwajibkan/risiko meminta, deklarasi konflik, sanctions/PEP checks bila sesuai dasar dan policy.
Jangan minta data berlebih; jangan simpan identitas pribadi di kolom bebas.

Verifikasi: registry/sumber resmi [..], tanggal [..], reviewer [..], file evidence IDs [..].
Reputasi/konflik/related party/source of funds (sejauh proporsional): [..].
Data yang akan dibagi, tujuan, lokasi dan jangka akses: [..]. NDA/data terms: [..].
Security/privacy assessment: [..]. Risk rating dan alasan: [..].
Approval: Sponsor [..] | Compliance [..] | Legal [..] | Finance [..].
Keputusan: [approve / conditional / reject]. Kondisi/monitoring/expiry: [..].
Penutupan: akses dicabut, data dikembalikan/dihapus atau retained under hold, final invoice/claim,
record IDs dan alasan retensi: [..].
```

## D-14 · Kerangka evaluasi dan pemilihan vendor

```text
RFP / EVALUASI VENDOR — [NAMA KEBUTUHAN]
Pemilik kebutuhan: [..] | Anggaran: [..] | Entitas kontrak: [..]
Kebutuhan dan hasil terukur: [..] | Must-have: [..] | Batasan: [..]
Kriteria dan bobot disetujui SEBELUM penawaran dibuka: kemampuan [..], harga total [..], keamanan/
data [..], service/continuity [..], legal/compliance [..], sustainability jika relevan [..].

Daftar vendor yang diundang dan dasar pemilihan: [..]
Deklarasi konflik evaluator dan mitigasi: [..]
Ringkasan pembanding dengan sumber: [..]
TCO (setup, recurring, FX, exit, tax, termination): [..]
Risiko single-source/related party/data access/cyber/lock-in: [..]
Negosiasi dan perubahan proposal (log): [..]
Rekomendasi dan alasan mengapa alternatif lain tidak dipilih: [..]
Approval sesuai delegation matrix: [..]

Tidak ada vendor yang boleh mulai pekerjaan, menerima data sensitif, memperoleh akses sistem,
atau menggunakan nama perusahaan sebelum kontrak dan approval berlaku. Buat PO/statement of work,
acceptance criteria, SLA, security/data terms, IP, confidentiality, audit right, subprocessor,
incident notice, business continuity, termination, return/delete data, dispute and retention.
```

## D-15 · Kerangka perjanjian jasa / scope of work

```text
DRAF KERANGKA — BUKAN KONTRAK SIAP TANDA TANGAN; REVIEW LEGAL WAJIB

1. Para pihak: [nama hukum, nomor, alamat, wakil dan dasar kewenangan].
2. Tujuan dan scope: [deliverable, exclusions, milestone, acceptance criteria, jadwal].
3. Hubungan: pihak independen; tidak membentuk agensi/kemitraan/kuasa kecuali dinyatakan sah.
4. Fee, pajak, invoice, rekening terverifikasi dan prosedur perubahan scope: [..].
5. Pernyataan, kewenangan, kepatuhan dan konflik: [..].
6. Kerahasiaan dan permitted disclosure; pengecualian untuk kewajiban sah; masa berlaku: [..].
7. Data pribadi/informasi: tujuan, instruksi, minimisasi, keamanan, subprocessor, transfer, insiden,
   permintaan subjek, audit, pengembalian/penghapusan dan retensi legal: [..] [review privacy].
8. IP/background materials, assignment/license, open-source, source files dan acceptance: [..].
9. Security, akses least-privilege, MFA, device, logging, continuity dan incident response: [..].
10. Asuransi, liability cap, indemnity, warranty, force majeure: [..] [review counsel].
11. Term, suspension, termination for cause/convenience, transition assistance, final payment: [..].
12. Catatan dan audit, regulator access bila sah, conflict/related party: [..].
13. Governing law, dispute resolution, notices, language precedence: [..] [review counsel].
14. Signatures, authority, counterpart/e-sign process and effective date: [..].

Lampiran: SOW, SLA/KPI, security schedule, data processing schedule, fee schedule, acceptance form.
```

## D-16 · Surat resmi permohonan / klarifikasi instansi

```text
[KOP SURAT BADAN HUKUM]
Nomor: [..] | Klasifikasi: [..] | Lampiran: [daftar] | Hal: [permohonan/klarifikasi faktual]

Kepada Yth. [nama jabatan/instansi yang kewenangannya diverifikasi]
[alamat/kanal resmi]

Dengan hormat,
Kami, [nama badan hukum terdaftar, nomor identitas korporasi yang relevan], berkedudukan di [..],
dalam hal ini diwakili oleh [nama/jabatan/dasar kewenangan], menyampaikan [tujuan spesifik surat].

FAKTA DAN RUANG LINGKUP
1. Kegiatan aktual yang dilakukan/direncanakan: [uraikan faktual, jangan klaim status izin].
2. Badan hukum pemilik dan hubungan entitas: [..].
3. Pertanyaan/permohonan spesifik: [..].
4. Informasi yang telah diverifikasi dan tanggal cut-off: [..].
5. Hal yang belum diketahui / asumsi: [..].

Dengan hormat kami memohon [pertanyaan yang jelas/konfirmasi prosedur/daftar persyaratan/penjelasan
atas kewajiban]. Kami tidak meminta perlakuan di luar ketentuan dan akan melengkapi dokumen yang
secara sah diperlukan melalui kanal resmi.

Lampiran dibatasi pada: [..]. Data personal/komersial sensitif disampaikan hanya jika dibutuhkan,
dengan saluran aman dan klasifikasi [..]. Mohon konfirmasi penerimaan dan nomor referensi.

Hormat kami,
[Nama] | [Jabatan] | [dasar kuasa] | [kontak resmi]

CHECKLIST PENERBITAN: kewenangan instansi diverifikasi; counsel review; fakta dan lampiran dicek;
penandatangan berwenang; nomor surat; klasifikasi; bukti kirim/terima; jawaban dan tenggat ditautkan
pada register. Jangan mengirim permintaan hukum yang mengandung kesimpulan yang belum diverifikasi.
```

## D-17 · Surat permintaan proposal / kemitraan

```text
[KOP SURAT]
Nomor: [..] | Tanggal: [..] | Kepada: [..] | Perihal: Permintaan proposal untuk [kebutuhan]

Kami dari [nama badan hukum] sedang mengevaluasi [kebutuhan/kemungkinan kerja sama] untuk kepentingan
internal. Surat ini adalah permintaan informasi/proposal, bukan janji membeli, mandat investasi,
penawaran efek, komitmen pendanaan, atau persetujuan transaksi.

Mohon proposal menjelaskan:
- ruang lingkup, deliverables, metodologi, jadwal dan asumsi;
- biaya total, pajak, mata uang, syarat pembayaran dan masa berlaku;
- identitas pihak kontrak, ownership/conflict disclosure dan referensi relevan;
- kebutuhan data, akses sistem, subkontraktor dan kontrol keamanan;
- izin/sertifikasi yang diperlukan untuk layanan yang ditawarkan;
- SLA, kontinuitas, penanganan keluhan/insiden, termination/exit dan penghapusan/pengembalian data.

Batas pengiriman: [tanggal/kanal]. Narahubung resmi: [..].
Informasi yang kami berikan bersifat [..], hanya untuk tujuan evaluasi; jangan menggunakannya untuk
pemasaran/redistribusi. NDA terpisah berlaku bila ditandatangani. Kami dapat menolak semua proposal,
meminta klarifikasi, atau mengubah jadwal sesuai proses procurement.

Hormat kami, [nama/jabatan/otorisasi]. Lampiran: spesifikasi dan aturan submission [..].
```

## D-18 · Board pack / laporan Direksi berkala

```text
BOARD PACK — PERIODE [..] | Versi data as-of [..] | Klasifikasi SANGAT RAHASIA
Disusun oleh [..] | Disetujui penerbitannya [..] | Meeting ID [..]

1. Executive decisions required: keputusan, pemilik, deadline, limit dan alternatif.
2. Ringkasan modal sendiri: modal, kas, komitmen, liabilitas, restricted cash; sumber data & tie-out.
3. Portofolio per legal entity dan kelas aset: book value, fair value jika tersedia, methodology/date,
   unrealized/realized, income, concentration, liquidity, currency; limitations dan stale marks.
4. Transaksi periode: proposal/approval/closing/exit, related party, exception, condition open.
5. Return dan benchmark: definisi, fees/tax, FX, period, denominator, source; jangan membandingkan
   metrik berbeda tanpa penjelasan. Bukan proyeksi/jaminan.
6. Risiko & kepatuhan: breaches, near misses, complaints, regulatory/calendar status, remediation.
7. Finance: management accounts, cash forecast 13 minggu, budget variance, tax, audit issues.
8. People/operations/technology: FTE vs phase, key-person, control segregation, incidents, uptime,
   vendor dependency, cyber/BCP test.
9. Legal/corporate: changes, contracts, notices, claims, litigation and authority expiry.
10. Resolutions requested; conflict declarations; appendix source ID list and confidentiality controls.

Data owner sign-offs: Finance [..], CIO [..], Risk [..], Legal/Compliance [..], Operations [..].
```

## D-19 · Paket tutup buku bulanan

```text
MONTH-END CLOSE — [ENTITAS] — [YYYY-MM]
Cut-off [..] | Prepared by [..] | Reviewer [..] | Close date [..]

Checklist: bank/cash reconciliation; investment/asset subledger to GL; receivable/payable and accruals;
fee/interest/dividend; realized/unrealized valuation and source; FX; impairment; intercompany balance;
payroll/benefits; tax payable/withholding; fixed assets/depreciation; provisions/contingencies;
contract and maturity completeness; post-close events; suspense accounts; access to journal entries.

Account | opening | debit | credit | closing | source/reconciliation ID | preparer | reviewer | exception
[..]

Adjusting entries: ID, rationale, support, approver, reversals. Unreconciled items: amount, age,
owner, root cause, due date, escalation. Restricted cash/commitments: [..].

Management statements attached: [trial balance, P&L, balance sheet, cashflow, equity, asset schedule,
commentary]. Basis and limitations: [..].

Certification by preparer: records are complete to best knowledge; exceptions listed, not concealed.
Review CFO/Controller: [..] | Unresolved material items escalated: [..].
```

## D-20 · Laporan risiko dan kepatuhan

```text
PERIODIC RISK & COMPLIANCE REPORT — [PERIOD]
Prepared [..] | Recipient [..] | Data cut-off [..] | Classification [..]

1. Executive summary, changes in risk profile, decision required.
2. Regulatory/permit obligations by entity: source/reference, applicable status validated by counsel,
   owner, due date, submitted evidence, acknowledgment, open question. Do not assume N/A silently.
3. Investment limits: exposure/concentration/liquidity/issuer/counterparty; methodology and breach.
4. Operational control: approval exceptions, segregation-of-duty, access review, payment callback,
   reconciliation, overdue conditions.
5. Conflicts/related parties, gifts/entertainment, complaints and whistleblowing (aggregated/need-to-know).
6. Data privacy/cyber: incidents, access, vendors, deletion requests, transfer, recovery test.
7. Incident/claim/litigation and legal hold register; restricted case appendix separately.
8. Remediation: finding ID, severity, root cause, owner, due date, evidence, independent closure.
9. Attestation limits, missing data, external advice and decisions requested.

Owner approvals: Compliance [..] | Risk [..] | Legal [..] | executive recipient [..].
```

## D-21 · Risalah rapat dan action log

```text
MEETING ID: [..] | Judul: [..] | Tanggal/zona waktu: [..] | Lokasi/kanal: [..]
Ketua/notulis: [..] | Undangan/peserta/kapasitas: [..] | Rekaman: [tidak / ID dan akses]
Agenda dan bahan versi: [..] | Deklarasi konflik: [..]

Catatan per agenda (fakta, pertanyaan, keputusan, dissent): [..]
Keputusan eksplisit: [..] | Hal yang tidak diputuskan: [..]
Action ID | tindakan | accountable owner | due date | bukti selesai | status | eskalasi
[..]

Risalah disebarkan hanya kepada: [..]. Koreksi sampai [..]; final disahkan oleh [..].
Rekaman/audio/video bukan otomatis risalah resmi; retensi dan persetujuan sesuai kebijakan dan hukum.
```

## D-22 · Notifikasi insiden / laporan awal

```text
INCIDENT ID: [..] | Klasifikasi: [..] | Ditemukan: [tanggal/jam/zona] | Dilaporkan oleh: [..]
Jenis: [aset/fraud/data/cyber/operasi/SDM/keselamatan/lingkungan/keluhan/other]
Entitas/lokasi/sistem/asset: [..] | Status: [active / contained / investigating / closed]

FAKTA YANG DIKETAHUI (dipisahkan dari dugaan)
Kronologi sumber-terverifikasi: [..] | Dampak aktual/potensial: [..] | Pihak/data/aset: [..]
Tindakan containment yang dilakukan, siapa, kapan, bukti: [..]
Risiko keselamatan/kerugian/continuity: [..] | Belum diketahui: [..]

Preservation: evidence IDs, custodian, hash/capture time, chain of custody, akses; jangan ubah sumber.
Notifikasi internal: Risk [..], Legal [..], Security/HR/Operations [..], Direksi [..].
Kewajiban eksternal/notifikasi: penilaian Legal/Privacy/Compliance [owner + deadline]; jangan kirim
pernyataan publik/instansi sampai fakta, kewenangan dan persetujuan diverifikasi.
Remediasi sementara dan next update: [..]. Root cause/corrective action akan dibuat terpisah.
```

## D-23 · Instruksi legal hold / preservasi bukti

```text
LEGAL HOLD NOTICE — CASE [..] — SANGAT RAHASIA
Tanggal diterbitkan: [..] | Counsel/case owner: [..] | Dasar trigger: [sengketa/audit/investigasi/
permintaan regulator/klaim lain] (detail hanya kepada penerima need-to-know)

Kepada custodian/fungsi: [..]
Mulai sekarang, hentikan penghapusan otomatis/perubahan/pemusnahan rekod yang berkaitan dengan:
periode [..], entitas/pihak/sistem/aset [..], istilah/pencarian [..], tipe data/media [..].

Instruksi: jangan menghapus email, chat bisnis, file, backup relevan, perangkat, log, kontrak, invoice,
rekaman atau catatan; jangan mengubah metadata atau membuat salinan informal yang tidak terkendali.
Amankan media dan tandai legal hold sesuai prosedur; laporkan bila sumber tidak tersedia/tertimpa.
Jangan membahas perkara di luar tim yang ditunjuk. Hubungi [counsel] bila ada pertanyaan.

Custodian acknowledgment: nama/fungsi/tanggal, sumber yang dikuasai, tindakan dilakukan, masalah.
Preservation log: item/source, original owner, capture date, method, hash/custodian, access.

Hold hanya dilepas melalui pemberitahuan tertulis Legal nomor [..]. Setelah release, records owner
menghitung ulang jadwal retensi dan tidak langsung menghapus sebelum review yang diwajibkan.
```

## D-24 · Checklist akhir hubungan kerja/vendor

```text
OFFBOARDING ID [..] | Pihak [..] | Entitas/unit [..] | Tanggal akhir [..]
Dasar: [resign / termination / contract end / role change]. Akses dan transfer dilakukan proporsional,
sesuai kontrak, hukum dan privasi; Legal/HR review untuk kasus sensitif.

PEOPLE / PROCUREMENT
[ ] Penghentian/serah terima tertulis dan hak pembayaran/claim dihitung
[ ] Deliverables, source files, admin manuals, IP/license dan acceptance diserahterimakan
[ ] Aset fisik, kartu, kunci, token, dokumen asli dikembalikan
[ ] Data perusahaan di perangkat/akun pribadi ditangani sesuai instruksi sah dan terdokumentasi
[ ] NDA, confidentiality, continuing obligations dan kontak pascakontrak dijelaskan

IT / DATA
[ ] SSO, email, cloud, VPN, API keys, privileged accounts dan physical entry dicabut pada waktu tepat
[ ] Credentials/secret dirotasi, MFA recovery dan shared mailbox dialihkan terkontrol
[ ] Business records dipindahkan ke custodian, bukan dihapus bersama akun
[ ] Legal hold dan preservation instructions diperiksa sebelum retensi/purge
[ ] Data return/delete certificate diperoleh bila diwajibkan dan diverifikasi

FINANCE / RECORDS
[ ] Invoice, tax evidence, final payroll/benefit, expense, PO dan rekonsiliasi diselesaikan
[ ] Register kontrak, correspondence, claims, renewals, warranty dan records index diperbarui
[ ] Akses pihak ketiga/subprocessor dihapus; insiden/exception dicatat
[ ] Serah terima ke owner baru, open actions, lokasi master dan bukti penerimaan

Disusun HR/Procurement [..] | IT [..] | Legal/Compliance [..] | Finance [..] | Asset owner [..]
Pengecualian dan tanggal penyelesaian: [..]
```

## D-25 · Sertifikat disposisi / pemusnahan arsip

```text
SERTIFIKAT REVIEW DISPOSISI — BUKAN PERINTAH PENGHAPUSAN OTOMATIS
Case/Batch ID: [..] | Entitas | Records owner | Tanggal review: [..]

Daftar arsip/ID dan rentang tanggal terlampir dengan jumlah, media, lokasi, klasifikasi, retensi band,
event pemicu, dasar aturan/kontrak yang telah diverifikasi dan rekomendasi.

Pengecekan sebelum persetujuan:
[ ] Tidak ada legal hold, investigasi, audit, permintaan regulator, klaim atau transaksi terbuka.
[ ] Primary record, duplikat, metadata, bukti penerimaan dan akses telah dibedakan.
[ ] Legal/Compliance/Tax dan unit pemilik mengonfirmasi kewajiban berakhir.
[ ] Tidak ada retention trigger yang belum selesai; bukti hold release dilampirkan bila pernah ada.

Keputusan: [RETAIN / REVIEW LATER / APPROVE DISPOSITION]. Alasan: [..].
Metode sesuai media: [..] | Vendor/saksi: [..] | Tanggal rencana/selesai: [..]
Verifikasi hasil dan log exceptions: [..].

Approver Records Owner [..] | Legal [..] | Compliance [..] | Pemilik data [..]
Simpan sertifikat, daftar final, approval, dan bukti metode sebagai rekod tersendiri sesuai jadwalnya.
```

## D-26 · Rencana serah terima arsip pasca-operasi

```text
ARCHIVE TRANSFER / WIND-DOWN PLAN
Entitas/operasi: [..] | Alasan: [penutupan / merger / exit / likuidasi / sistem migrasi]
Tanggal efektif dan otoritas: [..] | Penanggung jawab: [..] | Counsel/likuidator: [..]

1. Daftar entitas, aset, klaim, kontrak, karyawan, pihak berkepentingan dan kewajiban yang masih hidup.
2. Jadwal kewajiban (pajak, laporan, sengketa, kontrak, garansi, title, regulator) dengan owner dan
   sumber verifikasi; item belum pasti diberi status OPEN — TIDAK BOLEH DIMUSNAHKAN.
3. Indeks arsip: rentang tanggal, ID, volume, tipe file/media, metadata, klasifikasi, legal holds,
   lokasi, checksum, enkripsi, format, backup dan pemilik akses.
4. Kustodian/penerima yang sah, dasar penunjukan, kontak, lokasi/data residency bila relevan, biaya,
   hak akses, confidentiality, continuity, breach response dan kondisi pengakhiran kustodian.
5. Migrasi: export test, sampel dibuka, checksum dihitung ulang, jumlah dicocokkan, metadata/ACL/log
   diverifikasi, berita acara dan sign-off sebelum sumber dinonaktifkan.
6. Jadwal review retensi per kelas, titik mulai, kewajiban terlama yang telah diidentifikasi, hold,
   pemicu re-review; jangan menjanjikan tanggal pemusnahan sebelum Legal menyetujui.
7. Prosedur akses bagi likuidator, auditor, regulator/pengadilan bila ada permintaan sah; log request.
8. Kontak eskalasi, perubahan alamat, backup recovery, bencana, penggantian kustodian dan biaya.
9. Persetujuan organ yang berwenang, bukti transfer, chain of custody dan sertifikat completion.

Dilarang menutup akun/sistem/entitas sebelum arsip kritis, bukti akses dan legal hold tervalidasi.
```

## D-27 · Register surat masuk/keluar

```text
REGISTER CORRESPONDENCE — satu baris per surat/dokumen resmi
ID | entity | ref number | incoming/outgoing | date | from/to | authority/purpose | subject |
owner | confidentiality | attachments IDs | response deadline | approval/signatory | channel |
sent/received evidence | linked case/contract/asset | retention band | hold | archive location
[..]

Checklist penerbitan: nomor unik, badan hukum dan kapasitas, nomor referensi pihak, tujuan, fakta,
lampiran, review, penandatangan berwenang, klasifikasi, kanal, delivery proof, response tracking.
Simpan email transmittal dan receipt bersama surat final, bukan hanya PDF surat.
```

---

## Jadwal dokumen berkala — contoh kalender internal

Kalender ini hanya template; **frekuensi dan tanggal legal harus dipetakan per badan dan aktivitas**.

| Frekuensi internal usulan | Paket | Penanggung jawab | Bukti penutupan |
|---|---|---|---|
| Harian / per transaksi | Payment queue, cash position, settlement exceptions, incident triage | Treasury / COO | Maker-checker, bank proof, exception log |
| Mingguan | Deal pipeline, open DD, approval conditions, maturity/renewal alert | CIO / desk / Legal | Pipeline version, action log |
| Bulanan | Close pack, reconciliation, portfolio/valuation exceptions, access & vendor changes | CFO / Finance / Risk / IT | Approved close checklist and source index |
| Kuartalan (atau sesuai kebijakan) | Board pack, risk appetite, concentration/stress, policy and conflict review | Direksi / Risk / Corsec | Signed minutes, resolutions, remediation |
| Tahunan / periode yang ditentukan hukum | Budget, strategy, audit, tax & statutory calendar, insurance, access review, retention review, BCP test | Direksi / CFO / Legal / Risk / IT | Approval, submitted/received evidence, test report |
| Peristiwa | Acquisition/exit, incident, permit change, litigation, restructuring, employee departure | Owner peristiwa | Event-specific closing binder, hold and handover |

## D-28 · Rencana tenaga kerja, job architecture & FTE per fase

```text
WORKFORCE PLAN — ENTITY/GRUP [..] | Periode [..] | Sponsor [..]
Mandat bisnis dan asumsi modal/opex: [..]. Angka headcount adalah rencana, bukan janji rekrutmen.

Fase | Tanggal gate | FTE target | Freelancer aktif maks | External access | Budget | Approval | Kriteria lanjut/hold
Fase 1 [..] | [..] | [..] | [..] | [..] | [..] | [..]
Fase 2 [..] | [..] | [..] | [..] | [..] | [..] | [..]
Fase 3 [..] | [..] | [..] | [..] | [..] | [..] | [..]

JOB ID | unit (12 desk/12 support) | jabatan | tujuan | accountable manager | FTE per fase |
status (employee/contractor/outsource) | skills/license required | segregation/conflict |
access level | training | salary band/budget owner | hiring approval | location/remote | KPI
[..]

Headcount reconciliation: budget vs actual, vacant, secondment, contractors, outsourced, inactive.
Critical role succession, key-person risk, limits on admin/finance/approval access: [..].
Review People [..] CFO [..] Risk [..] Direksi [..]. Jangan membuat satu akun bersama untuk pegawai/kontraktor.
```

## D-29 · Checklist hubungan kerja dan onboarding individu

```text
INDIVIDUAL ENGAGEMENT — pilih klasifikasi yang benar: employee / freelancer / consultant / intern /
external professional. Legal/People review klasifikasi; jangan memakai label contractor untuk
menghindari hak atau kewajiban hubungan kerja.

Identitas seperlunya dan dasar pengumpulan: [..] | Role/job ID & entity [..] | Manager [..]
Offer/contract version, start/end/effective dates, compensation/benefit/fee/tax [..]
Scope/KPI/place/hours/remote expectations/reporting [..]
Confidentiality, IP and work-product ownership, permitted tools, conflicts and outside interests [..]
Data privacy notice, purpose/access/retention/contact [..]
Safety, equipment, acceptable use, security/MFA/training and incident reporting [..]
Required professional qualifications/permissions checked by [..] on [..]
Approvals and signature authority [..] | Payroll/vendor setup reference [..]
Onboarding: policy acknowledgment, access role, device, training, asset register, emergency contacts.
Periodic review and changes: [..] | offboarding checklist and access revocation owner: [..].
Sensitive personal records stay in restricted HR repository, not general project folders.
```

## D-30 · NDA / confidentiality & data-room access request

```text
CONFIDENTIALITY UNDERTAKING — DRAF KERANGKA, REVIEW LEGAL WAJIB
Disclosing entity: [..] | Receiving party: [..] | Authorized representatives: [..]
Purpose limited to evaluating [specific transaction/project] and no other use.
Information includes [categories]; exclusions for independently known/public/lawfully received material.
Recipient access limited to named individuals on need-to-know basis, with equivalent obligations;
no onward sharing, copying, scraping, reverse engineering, publicity or contact with customers/employees
without written consent, except legally compelled disclosure handled through prior notice where lawful.
Security measures, breach notification, permitted processing/location, return/delete and legal-record
exception: [..] [privacy/security review]. No license, transaction commitment, exclusivity, agency or
representation is created unless separate signed agreement says so.
Term and continuing confidentiality period [Legal to set]; trade secrets/personal data handled per
applicable obligations. Remedies, governing law, dispute terms, notices, language and signatures [counsel].
Data-room log: user | entity | NDA version | approval | access groups | files viewed/downloaded |
start/end | revoke | return/delete confirmation | legal hold.
```

## D-31 · Register master dokumen & metadata

```text
REGISTER DOKUMEN — satu baris per dokumen final/rekod resmi
ID | entity ID | asset/opportunity/case ID | judul/jenis | pihak | created/received/effective date |
owner | author/reviewer/approver | version/status | classification/language | attachment IDs |
master location | checksum/hash | retention band + verified rule + event trigger | legal hold/case ID |
related IDs | access group | next review date | disposition status
[..]

Workflow: WORKING → REVIEW → APPROVED → EXECUTED/ISSUED → SUPERSEDED/CLOSED → ARCHIVED →
DISPOSITION REVIEW. Kontrak signed/effective dibedakan bila perlu. Final read-only; revisi menghasilkan
versi baru dan change log. Jangan masukkan data pribadi ke nama file.
```

## Penutup

Sebelum dipakai sebagai sistem resmi, lengkapi `Register Dokumen` dengan ID setiap record yang sudah ada, badan hukum pemilik, klasifikasi, pemilik proses, kewajiban yang sudah diverifikasi, lokasi master, kontrol akses, event retensi, dan legal hold. Berkas ini adalah **draft pack awal**; persetujuan Direksi dan review penasihat Indonesia diperlukan untuk menjadikannya kebijakan perusahaan.
