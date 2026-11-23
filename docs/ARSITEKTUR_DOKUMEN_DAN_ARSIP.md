# Arsitektur Dokumen, Informasi & Arsip — Holding Investasi Non-Pialang

**Status:** rancangan kerja untuk dibahas Direksi, Legal/Corsec, Risk/Compliance, Finance, dan pemilik proses.  
**Ruang lingkup:** holding investasi bermodal sendiri; bukan pialang, penjamin emisi, penasihat investasi untuk publik, pengelola dana pihak ketiga, kustodian pihak ketiga, atau penghimpun dana publik—kecuali setelah ada kajian hukum dan perizinan khusus.  
**Peringatan:** dokumen ini adalah kerangka operasional, bukan legal opinion. Nama izin, regulator, klasifikasi usaha, kewajiban pelaporan, tanda tangan, masa simpan dan format arsip harus diverifikasi terhadap kegiatan nyata, akta, KBLI, bentuk badan, lokasi, kontrak, aturan terbaru, dan penasihat profesional Indonesia sebelum digunakan.

## 1. Prinsip rancangan

1. **Satu sumber resmi:** setiap dokumen final punya ID, versi, pemilik, status, tanggal berlaku, klasifikasi, pihak penyetuju, lokasi master, dan aturan retensi.
2. **Pisahkan draf, bukti, keputusan, dan publikasi.** AI boleh membantu menyusun draf/ringkasan; persetujuan, transaksi, tanda tangan, pernyataan regulator, dan keputusan investasi selalu oleh manusia berwenang.
3. **Jejak keputusan lengkap:** proposal → due diligence → penilaian risiko → keputusan/penolakan → kontrak/settlement → pemantauan → exit → arsip.
4. **Entitas dan aset terpetakan:** setiap rekening, aset, kontrak, kewajiban, pajak, izin, dan laporan diberi badan hukum pemilik; jangan mencampur aset personal, holding, dan SPV.
5. **Minimalisasi data:** kumpulkan data pribadi hanya untuk tujuan sah; batasi akses, masa simpan, pemrosesan vendor, transfer dan penghapusan sesuai kajian kewajiban yang berlaku.
6. **Bukti autentik:** simpan dokumen asli elektronik, metadata, tanda tangan, lampiran, bukti kirim/terima, checksum/hash jika tersedia, serta jejak perubahan. Scan bukan otomatis pengganti dokumen asli.
7. **Hold mengalahkan jadwal hapus:** sengketa, investigasi, audit, permintaan regulator, klaim, atau transaksi yang belum selesai membekukan pemusnahan dokumen relevan.
8. **Tidak ada penghapusan otomatis tanpa otorisasi:** jadwal retensi adalah pemicu review, bukan instruksi hapus otomatis.

## 2. Siklus hidup dokumen

| Fase | Tahap | Gerbang keluar / bukti |
|---|---|---|
| P0 | Pra-pendirian & studi kelayakan | Keputusan lanjut/tidak, asumsi modal, pemetaan aktivitas yang diizinkan/dilarang, risiko pendiri |
| P1 | Pembentukan badan dan struktur kepemilikan | Akta/keputusan pendiri, struktur saham, identitas pemilik manfaat sesuai kewajiban, pencatatan resmi dan bukti penerimaan |
| P2 | Perizinan, kesiapan pajak, bank dan tata kelola | Matriks izin per badan/aktivitas, konfirmasi penasihat, rekening, kebijakan, delegasi dan kontrol |
| P3 | Operasional siap | SOP, vendor, keamanan TI, SDM, register, akses, kalender kewajiban dan rencana kontinuitas |
| P4 | Sourcing & intake peluang | Form proposal, konflik kepentingan, screening awal, persetujuan masuk proses |
| P5 | Due diligence & keputusan | Bukti sumber, legal, finansial, teknis, risiko, pajak, penilaian, memo, risalah dan resolusi |
| P6 | Eksekusi & pencatatan | Persetujuan final, kontrak, pembayaran/settlement, bukti kepemilikan, register, akuntansi dan pajak |
| P7 | Pengelolaan aset | Bukti monitoring, valuasi, covenant, inspeksi, klaim, asuransi, pajak, eskalasi dan keputusan |
| P8 | Hubungan & pelaporan berkala | Korespondensi pihak internal/eksternal, laporan manajemen, pemilik, auditor, bank dan regulator sesuai kewajiban |
| P9 | Exit, restrukturisasi atau sengketa | Persetujuan exit, nilai realisasi, pelepasan hak, pajak, klaim, sengketa dan penutupan transaksi |
| P10 | Tutup periode / ganti struktur | Rekonsiliasi, tutup buku, serah terima jabatan, migrasi, perubahan akta/izin dan continuity record |
| P11 | Pembubaran / likuidasi / insolvensi | Keputusan formal, daftar kewajiban/klaim, likuidator, penyelesaian pihak berkepentingan, serah terima arsip |
| P12 | Arsip pasca-operasi | Penanggung jawab arsip, akses terkendali, legal hold, pemeliharaan media, tinjau retensi berkala dan disposisi sah |

**Prinsip “sejak sebelum berdiri”:** buat ruang data P0 sebelum mengirim dokumen sensitif kepada notaris, bank, mitra, konsultan, calon investor atau instansi. Catat siapa yang meminta/menerima, tujuan, dasar pembagian, NDA/otorisasi, versi dan bukti pengiriman. Dokumen pra-pendirian yang menjadi dasar transaksi atau kewajiban perusahaan dipindahkan ke arsip perusahaan dengan metadata asal; jangan mengubah tanggal atau menghapus riwayat.

## 3. Register master — keluarga dokumen minimum

Kolom “pemilik” adalah fungsi yang bertanggung jawab; satu orang dapat memegang lebih dari satu fungsi pada fase awal dengan kontrol kompensasi. “Klasifikasi” disarankan: **PUBLIK / INTERNAL / RAHASIA / SANGAT RAHASIA**. Retensi pada tabel 4 dan Lampiran A wajib dipastikan oleh Legal/Compliance.

| ID | Keluarga dokumen | Isi / contoh catatan | Pemilik utama | Klasifikasi umum | Titik mulai retensi |
|---|---|---|---|---|---|
| GOV-01 | Inisiasi pendiri | Identitas pendiri, mandat, notulen penjajakan, keputusan membentuk tim | Pendiri / Legal | Rahasia | Pembuatan |
| GOV-02 | Studi kelayakan | Model modal sendiri, sumber modal, skenario, pasar, batas aktivitas, sensitivitas | Strategy / Finance | Rahasia | Keputusan investasi/studi |
| GOV-03 | Struktur grup | Bagan pemegang saham, badan induk, SPV, UBO/control map, perubahan historis | Legal / Corsec | Sangat Rahasia | Sejak dibentuk; review tiap perubahan |
| GOV-04 | Akta dan korporasi | Akta, anggaran dasar, keputusan pemegang saham, perubahan, bukti pendaftaran/persetujuan | Legal / Corsec | Sangat Rahasia | Sejak dokumen dibuat; tinjau kewajiban permanen |
| GOV-05 | Pemegang saham & modal | Daftar saham, setoran modal, bukti transfer, register, hak dan pembatasan | Corsec / Finance | Sangat Rahasia | Peristiwa modal dan masa perusahaan |
| GOV-06 | Rapat organ perseroan | Undangan, agenda, daftar hadir, kuasa, bahan, risalah, keputusan, dissent | Corsec | Sangat Rahasia | Rapat / keputusan |
| GOV-07 | Delegasi & otorisasi | Matriks kuasa, limit, specimen, pengganti, pencabutan, bukti notifikasi | Legal / Risk | Sangat Rahasia | Berlaku dan masa tindak lanjut |
| GOV-08 | Kebijakan & kontrol | Kebijakan investasi, konflik, risiko, anti-fraud, hadiah, data, arsip, whistleblowing | Pemilik kebijakan | Internal/Rahasia | Siklus kebijakan dan penggantian |
| REG-01 | Register legal & izin | Matriks entitas-aktivitas-izin, aplikasi, korespondensi, keputusan, syarat, pembaruan | Legal / Compliance | Rahasia | Izin/aktivitas dan penutupan kewajiban |
| REG-02 | Komunikasi regulator/instansi | Surat masuk/keluar, permintaan data, jawaban, bukti serah, hasil pertemuan | Legal / Compliance | Rahasia | Tanggal kasus ditutup; hold bila ada |
| REG-03 | Kalender kewajiban | Pelaporan, pembayaran, pembaruan, pemilik, bukti submit, status diterima | Compliance / Tax | Internal/Rahasia | Setiap periode pelaporan |
| TAX-01 | NPWP/administrasi pajak | Pendaftaran, perubahan data, korespondensi, surat, bukti akses terkontrol | Tax | Sangat Rahasia | Sesuai kewajiban pajak dan sengketa |
| TAX-02 | Kertas kerja pajak | Rekonsiliasi, perhitungan, bukti potong/pungut, SPT dan bukti penerimaan | Tax / Finance | Sangat Rahasia | Masa/tahun pajak; hold pemeriksaan |
| FIN-01 | Kebijakan & rencana keuangan | Anggaran, forecast, cash runway, limit rekening, kontrol pembayaran | CFO | Rahasia | Periode anggaran / penggantian |
| FIN-02 | Buku besar & tutup buku | Jurnal, subledger, rekonsiliasi, closing pack, trial balance, jurnal koreksi | Finance | Sangat Rahasia | Periode buku dan retensi wajib |
| FIN-03 | Rekening & kas | KYC bank, mandate, statement, transfer, approval, rekonsiliasi, konfirmasi saldo | Treasury | Sangat Rahasia | Transaksi / penutupan rekening |
| FIN-04 | Laporan keuangan | Neraca, laba rugi, arus kas, perubahan ekuitas, catatan dan approval | CFO | Sangat Rahasia | Periode laporan; audit/hold |
| FIN-05 | Audit | PBC, konfirmasi, sampling, temuan, jawaban, management letter, closure | CFO / Internal Audit | Sangat Rahasia | Audit ditutup; hold bila perlu |
| AST-01 | Intake peluang aset | Sumber, tanggal, pengusul, kelas, pemilik hukum, nilai indikatif, konflik, keputusan awal | Desk + Deal Sourcing | Rahasia | Peluang ditutup / investasi selesai |
| AST-02 | Identitas & kepemilikan aset | Register unik, lokasi/kustodi, dokumen hak, legal owner, beban, asuransi | Desk / COO | Sangat Rahasia | Selama kepemilikan + pasca-exit |
| AST-03 | Due diligence | Legal title, penjual/BO, sumber dana, valuasi, pajak, teknis, fraud, ESG bila relevan | Deal team + Legal/Risk | Sangat Rahasia | Keputusan dan transaksi / hold |
| AST-04 | Memo investasi | Tesis, alternatif, asumsi, downside, risiko, likuiditas, konsentrasi, exit | Desk / CIO | Sangat Rahasia | Keputusan IC dan investasi terkait |
| AST-05 | Keputusan investasi | Bahan rapat, quorum, risalah, resolusi, syarat, conflict recusal, voting | Corsec / CIO | Sangat Rahasia | Permanen/tinjau kewajiban korporasi |
| AST-06 | Eksekusi / settlement | Kontrak, instruksi, bukti pembayaran, serah terima, rekening, konfirmasi | COO / Finance / Legal | Sangat Rahasia | Settlement dan masa klaim |
| AST-07 | Valuasi & impairment | Metode, input, sumber data, asumsi, reviewer, penyesuaian, approval | Finance / Risk / Desk | Sangat Rahasia | Setiap tanggal valuasi dan laporan |
| AST-08 | Monitoring & covenant | Kinerja, inspeksi, jatuh tempo, covenant, tindakan korektif, eskalasi | Desk / Risk | Rahasia | Kepemilikan + masa kewajiban |
| AST-09 | Exit / pelepasan | Proposal, valuasi, keputusan, penawaran, kontrak, pajak, bukti transfer hak | Desk / Legal / CFO | Sangat Rahasia | Exit final + klaim/sengketa |
| AST-10 | Peristiwa aset | Klaim, kehilangan, kerusakan, penipuan, insiden, investigasi, pemulihan | COO / Risk | Sangat Rahasia | Kasus ditutup + legal hold |
| CTR-01 | Counterparty onboarding | KYC/KYB, legalitas, pemilik manfaat bila relevan, rekening, screening, approval | Compliance / Procurement | Sangat Rahasia | Hubungan selesai + kewajiban lanjut |
| CTR-02 | Kontrak & perubahan | Draft, legal review, sign-off, counterpart signature, addendum, termination | Legal | Sangat Rahasia | Berakhir + masa klaim / hold |
| CTR-03 | Vendor & procurement | Kebutuhan, spesifikasi, pembanding, konflik, PO, SLA, invoice, penerimaan | Procurement / unit | Rahasia | Kontrak/PO ditutup + audit |
| CTR-04 | NDA & data room | NDA, daftar pihak/akses, watermark, unduhan, pencabutan, bukti return/delete | Legal / Data owner | Sangat Rahasia | Akses berakhir + klaim/hold |
| HR-01 | Struktur SDM & jabatan | Org chart, job description, headcount, FTE phase, approval budget | People / CFO | Internal | Siklus perubahan dan workforce |
| HR-02 | Rekrutmen & onboarding | Requisition, kandidat, penawaran, kontrak, due diligence yang sah, onboarding | People | Sangat Rahasia | Sesuai tujuan, hukum, dan kontrak |
| HR-03 | Berkas karyawan | Perjanjian, perubahan, identitas seperlunya, payroll, cuti, disiplin, exit | People / Payroll | Sangat Rahasia | Hubungan kerja dan kewajiban klaim |
| HR-04 | Freelancer / konsultan | Scope, deliverable, NDA, IP, timesheet, invoice, penerimaan kerja | Unit + Legal / Finance | Sangat Rahasia | Kontrak, pajak dan klaim |
| HR-05 | Pelatihan & kompetensi | Kurikulum, kehadiran, sertifikasi, evaluasi, pelatihan kepatuhan | People / Compliance | Internal/Rahasia | Validitas kompetensi / kewajiban |
| IT-01 | Identitas & akses | Daftar akun, peran, MFA, persetujuan, akses istimewa, review dan pencabutan | IT / Security | Sangat Rahasia | Akun ditutup + audit |
| IT-02 | Aset informasi & sistem | Inventaris, diagram, konfigurasi, lisensi, backup, perubahan, vendor | IT | Rahasia | Sistem pensiun + kebutuhan keamanan |
| IT-03 | Privasi & data | Peta data, tujuan, dasar, pemberitahuan, permintaan subjek, vendor, insiden | Data owner / Legal | Sangat Rahasia | Tujuan selesai + kewajiban / hold |
| IT-04 | Insiden keamanan | Kronologi, indikator, dampak, respons, komunikasi, pemulihan, lessons learned | Security / Risk | Sangat Rahasia | Insiden selesai + hold |
| OPS-01 | SOP & kontrol proses | SOP, checklist, kontrol maker-checker, bukti review, versi dan pelatihan | Process owner | Internal/Rahasia | Versi diganti + audit |
| OPS-02 | Fasilitas & aset kantor | Sewa, inventaris, maintenance, akses, keselamatan, inspeksi dan vendor | GA / COO | Internal/Rahasia | Aset/kantor ditutup + klaim |
| OPS-03 | Continuity & recovery | BCP, BIA, DR plan, uji, kontak darurat, pemulihan, lessons learned | COO / IT / Risk | Rahasia | Versi diganti + uji/audit |
| COM-01 | Korespondensi | Register surat, nomor, pengirim/penerima, kanal, lampiran, bukti kirim/terima | Corsec / pemilik urusan | Sesuai isi | Kasus/urusan ditutup |
| COM-02 | Proposal & presentasi | Proposal usaha/kemitraan, deck, asumsi, penerima, approval dan versi | Sponsor / unit | Internal/Rahasia | Proposal berakhir / hubungan selesai |
| COM-03 | Rapat & tindakan | Undangan, agenda, bahan, keputusan, action owner, deadline, status closure | Sekretariat rapat | Rahasia | Action selesai / rapat terkait |
| COM-04 | Pengaduan & whistleblowing | Kanal, laporan, triase, investigasi independen, bukti, remediasi, non-retaliation | Risk / Audit | Sangat Rahasia | Kasus final + hold |
| REP-01 | Dashboard manajemen | NAV/eksposur, kas, likuiditas, return, risiko, exception, keputusan | CFO / CIO / Risk | Sangat Rahasia | Periode dan basis data |
| REP-02 | Laporan pemegang saham | Kinerja, keputusan material, risiko, modal, transaksi pihak berelasi | Direksi / Corsec | Rahasia | Periode laporan dan keputusan |
| REP-03 | Laporan eksternal/regulator | Hanya laporan yang diwajibkan/diotorisasi; bukti penyampaian dan penerimaan | Legal / Compliance | Sangat Rahasia | Periode/kewajiban terkait |
| REP-04 | ESG / dampak / keselamatan | Hanya metrik material dan metodologi terukur; jangan membuat klaim tanpa bukti | Risk / COO | Internal/Rahasia | Periode laporan / klaim |
| LIT-01 | Klaim, sengketa, investigasi | Legal hold, kuasa, kronologi, bukti, korespondensi, strategi akses terbatas | Legal | Sangat Rahasia | Penutupan final + release hold |
| ARC-01 | Indeks arsip | ID dokumen, metadata, lokasi, checksum, relasi, jadwal, hold, pemilik | Records owner | Internal | Seumur arsip |
| ARC-02 | Transfer & serah terima | Daftar box/export, jumlah file, checksum, sumber, penerima, bukti penerimaan | Records owner | Rahasia | Transfer selesai dan chain of custody |
| ARC-03 | Disposisi & pemusnahan | Review retensi, persetujuan, pengecualian, daftar, metode, saksi, sertifikat | Legal + Records owner | Sangat Rahasia | Permanen sebagai bukti disposisi |
| ARC-04 | Arsip pasca-pembubaran | Penanggung jawab, kustodian, akses, lokasi, biaya, transfer, hold dan jadwal review | Likuidator / kustodian arsip | Sangat Rahasia | Hingga kewajiban legal benar-benar selesai |

## 4. Usulan klasifikasi dan jadwal retensi awal

Ini **bukan pernyataan masa simpan minimum yang ditetapkan hukum**. Jadwal final harus punya matriks aturan per entitas/aktivitas dan disetujui Legal/Compliance. Gunakan aturan konservatif: **retensi = masa terlama dari (aturan yang berlaku, izin, kontrak, klaim yang masih mungkin, kebijakan internal yang disetujui), kecuali ada legal hold**.

| Kode band (usulan) | Kelompok | Usulan titik mulai hitung | Perlakuan |
|---|---|---|---|
| P — permanen / tinjau sebelum disposisi | Akta, anggaran dasar, keputusan organ, register saham/modal, keputusan strategis material, daftar izin utama, sejarah struktur grup | Sejak penciptaan/peristiwa | Simpan master jangka panjang; tinjau dengan penasihat sebelum ada disposisi |
| L — selama hak/kewajiban hidup + review hukum | Hak milik aset, bukti title, kontrak, garansi, jaminan, klaim, dokumen pendirian SPV, litigasi | Sejak hak/kewajiban/entitas ditutup | Jangan mulai timer hanya dari tanggal dokumen; mulai setelah hak, kewajiban, dan sengketa selesai |
| F — periode fiskal + kewajiban | Buku besar, invoice, bukti kas, pajak, payroll, audit, laporan dan rekonsiliasi | Akhir periode/transaksi sesuai aturan yang berlaku | Legal/Tax menetapkan angka final per tipe rekod; hold audit/pemeriksaan bila ada |
| O — siklus operasional | SOP, tiket, rapat operasional, maintenance, procurement nonmaterial | Penutupan proses/kontrak | Retensi berdasar nilai bukti, klaim kontrak, keselamatan, audit dan kebutuhan usaha |
| H — data pribadi | Kandidat, karyawan, pengguna, kontak, identitas dan data sensitif | Tujuan pengumpulan berakhir / hubungan selesai | Minimalkan, batasi akses, review tujuan; hapus/anonimkan hanya setelah validasi dasar, kewajiban dan hold |
| S — keamanan / legal hold | Sengketa, investigasi, insiden, audit, regulator, whistleblowing | Release hold tertulis | Tangguhkan pemusnahan; akses need-to-know; simpan log pencarian, preservasi, salinan dan pelepasan hold |
| D — duplikat / transitory | Salinan kerja, export sementara, chat operasional yang sudah direkam ke record resmi | Rekod resmi tervalidasi | Hapus terkontrol setelah konfirmasi master, tidak ada hold, dan kebijakan mengizinkan |

**Jangan pakai angka tunggal untuk semua arsip.** Tidak ada satu angka “maksimum tahun” yang aman untuk seluruh keluarga dokumen. Untuk arsip korporasi vital, title aset, keputusan, pajak/audit dan sengketa, horizon dapat melampaui umur operasi: pertahankan sejak pra-pendirian selama perusahaan berjalan dan sesudah exit/pembubaran sampai semua kewajiban, klaim, pemeriksaan, hak atas aset dan legal hold benar-benar selesai; dokumen sejarah korporasi tertentu dapat ditetapkan permanen setelah review Legal. “Permanen” adalah keputusan klasifikasi dan review berkala, bukan alasan menyimpan semua data pribadi selamanya. Untuk setiap kelas arsip, isi: dasar kewajiban yang sudah diverifikasi, badan hukum terkait, periode hitung, event pemicu, owner, approver, storage/backup, hold flag, metode disposisi, serta tanggal tinjau ulang. Bila dasar hukum belum dipetakan, tandai **RETENSI BELUM DITETAPKAN — DILARANG HAPUS**.

## 5. Matriks hubungan dan komunikasi

| Pihak | Dokumen awal | Dokumen selama hubungan | Penutupan / arsip |
|---|---|---|---|
| Pemegang saham / pendiri / UBO | Identitas seperlunya, deklarasi kepemilikan, sumber modal, NDA | Undangan dan bahan RUPS, keputusan, laporan, transaksi pihak berelasi | Perubahan saham, exit, final account, bukti pemenuhan kewajiban |
| Komisaris / direksi / komite | Pengangkatan, deklarasi benturan, mandate | Board pack, risalah, resolusi, action log, evaluasi kontrol | Pemberhentian/pengunduran diri, serah terima akses, keputusan terbuka |
| Karyawan | Requisition, penawaran, perjanjian, pemberitahuan privasi | Job changes, payroll, pelatihan, cuti, evaluasi, keselamatan | Exit checklist, hak akses dicabut, aset dikembalikan, final settlement |
| Freelancer / konsultan | Scope, due diligence proporsional, NDA, kontrak, hak IP | Deliverable, acceptance, timesheet, invoice, perubahan scope | Serah terima sumber/file, pencabutan akses, pajak, return/delete data |
| Bank / penyedia jasa keuangan | KYC/KYB, beneficial ownership jika diminta, mandate, sumber dana | Rekening, statement, instruksi, konfirmasi, covenant, keluhan | Penutupan rekening/mandate, saldo, konfirmasi dan akses dicabut |
| Penjual / pembeli / target / mitra | NDA, screening, kuasa, data room access | DD request/response, proposal, term sheet nonbinding, kontrak, settlement | Closing binder, warranties/claims calendar, pelepasan akses, retention hold |
| Vendor / landlord / insurer | RFP, KYC, konflik, kontrak, SLA, akses data | PO, work order, penerimaan, invoice, insiden, evaluasi | Termination, final invoice, return asset/data, revoke credentials |
| Notaris / akuntan / auditor / penasihat | Engagement, scope, NDA/kerahasiaan, conflict check | Instructions, deliverables, evidence, advice, invoice | Final opinion/report, daftar isu terbuka, serah terima dan arsip |
| Instansi / pemerintah / regulator | Pemetaan kewenangan, permohonan resmi, kuasa, dasar dan bukti submit | Surat resmi, notulen, jawaban faktual, permintaan tambahan, bukti penerimaan | Keputusan/izin, syarat, tanggal efektif, keberatan/banding, pelaksanaan |
| Masyarakat / pemilik lokasi / komunitas | Pemetaan pemangku kepentingan, konsultasi jika relevan, kontak resmi | Komitmen tertulis, keluhan, dampak, perbaikan, pembayaran sah | Penutupan komitmen, bukti pemulihan, eskalasi klaim |

**Aturan surat kepada instansi:** verifikasi instansi dan kewenangan penerima, gunakan kanal resmi, cantumkan badan hukum, nomor referensi, dasar permintaan/permohonan, fakta terverifikasi, lampiran terbatas, pejabat penandatangan berkuasa, dan bukti kirim/terima. Jangan menjanjikan hadiah, biaya percepatan, atau memberi data melebihi tujuan. Pertanyaan regulasi yang memengaruhi boleh/tidaknya suatu aktivitas harus melalui Legal/Compliance; jangan memperlakukan model usaha sebagai dikecualikan dari izin tanpa kajian tertulis.

## 6. Repositori, penamaan, versi dan hak akses

**ID unik yang disarankan:** `ENT-KELUARGA-TAHUN-URUT-VERSI` (contoh `HOLD-AST-2026-0001-v01`). Jangan memasukkan data pribadi ke nama file.

**Metadata minimum:** `document_id`, `entity_id`, `asset_id/opportunity_id` (bila relevan), judul, jenis, pihak, tanggal dibuat/diterima, tanggal berlaku, pemilik, penyusun, pemeriksa, penyetuju, versi, status, klasifikasi, bahasa, media, lokasi master, lampiran, checksum/hash (bila digunakan), retensi band, event mulai retensi, legal_hold, relasi dokumen, akses, dan tanggal review.

**Folder logis:** `00-Governance / 01-Entity / 02-Legal-Compliance / 03-Finance-Tax / 04-Assets / 05-Counterparties / 06-People / 07-Operations-IT / 08-Reports-Audit / 09-Claims-Legal-Hold / 10-Archive / 99-Transitory`. Folder bukan kontrol akses; izin akses tetap role-based. Simpan primary record satu tempat, tautkan pada register; backup tidak dihitung sebagai arsip utama.

**State dokumen:** `WORKING → REVIEW → APPROVED → EXECUTED/ISSUED → SUPERSEDED/CLOSED → ARCHIVED → DISPOSITION-REVIEW`. Untuk kontrak, beda status `SIGNED` dan `EFFECTIVE` bila persyaratan berlakunya berbeda. Versi final read-only; revisi menjadi versi baru dengan change log.

## 7. Tata kelola arsip jangka panjang

1. Tetapkan **Records Owner** tiap keluarga dan **Records Coordinator** grup; tiap SPV tetap punya pemilik rekod legal/finance-nya.
2. Review kelengkapan arsip dan kalender kewajiban per bulan; lakukan uji akses/pemulihan backup berkala dan catat hasil.
3. Saat ganti vendor/sistem: ekspor format terbuka, metadata, permission map, audit log, attachment, checksum; lakukan rekonsiliasi jumlah file dan sign-off penerimaan sebelum akses lama dicabut.
4. Saat orang keluar: blokir kredensial segera, tetapkan pengganti, pindahkan mailbox/file/kalender yang merupakan rekod usaha dengan prosedur legal/privasi, dan catat chain of custody.
5. Saat exit aset/SPV atau pembubaran: jangan tutup storage lebih dulu. Susun **archive transfer pack**, daftarkan kewajiban/hold, tentukan kustodian, lokasi, biaya, akses, format, backup, jadwal tinjau, kontak likuidator/penasihat, dan pemicu disposisi.
6. Media berumur panjang: format terbuka, migrasi media yang terdokumentasi, dua salinan terpisah, checksum, akses baca terkendali, uji restorasi, catat migrasi tanpa mengganti tanggal asli.
7. Pemusnahan: legal + pemilik data + Compliance menyetujui daftar; pastikan tidak ada hold; pakai metode sesuai media; buat sertifikat disposisi yang menyimpan ID, dasar, cakupan, approver, tanggal, metode, vendor/saksi, dan verifikasi selesai. Jangan menghapus sertifikat disposisi itu sendiri tanpa jadwal tersendiri.
8. Jadwalkan **review retensi tahunan** dan review peristiwa (audit, transaksi, sengketa, perubahan hukum, perubahan izin, merger, insolvensi).

## 8. Implementasi 90 hari

- **Hari 0–15:** tunjuk sponsor Direksi, Records Owner, Legal/Compliance reviewer; bekukan penghapusan tanpa review; tetapkan entity list, ID, klasifikasi, dan data room dasar.
- **Hari 16–30:** inventarisasi dokumen yang sudah ada sejak pra-pendirian; register gap akta, saham/modal, rekening, izin, aset, kontrak, SDM, pajak, laporan; identifikasi legal hold.
- **Hari 31–60:** validasi kewajiban per badan hukum/aktivitas dengan penasihat; sahkan matriks retensi; tetapkan kalender kewajiban, penandatangan, RAPID, folder dan access matrix.
- **Hari 61–90:** migrasikan primary records, lengkapi metadata, uji pencarian/restore, jalankan satu siklus board pack, tutup buku dan asset approval menggunakan template; tindak lanjuti exception.

## 9. Gate sebelum template dipakai

- Ganti semua `[PLACEHOLDER]`; hapus opsi yang tidak relevan; verifikasi nama badan/nomor akta/izin/KBLI/pejabat dan alamat.
- Pastikan draft tidak menyatakan holding melakukan layanan berizin atau mengelola dana pihak lain bila tidak benar/diizinkan.
- Nilai transaksi, pajak, sumber dana, pemilik aset, rekening tujuan, manfaat pemilik, konflik, dan kewenangan diverifikasi dua orang.
- Minta review Legal/Compliance; minta notaris/penasihat pajak/auditor bila bentuk instrumen atau pengajuan mewajibkannya.
- Nomor dokumen, klasifikasi, penerima, lampiran, versi, persetujuan, tanda tangan, bukti pengiriman, dan lokasi master harus tercatat sebelum final.
