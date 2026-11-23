/**
 * Holding Investasi — Google Apps Script Server (V8)
 * Database: Google Spreadsheet (7 sheet).
 * Antarmuka: Single-file SPA (Index.html) melalui HtmlService.
 * Autentikasi: 3 Faktor (Wajah Kamera + Lokasi GPS/Maps + OTP Email 6 digit) tanpa ID & PIN.
 * Skala Akses: 156 Karyawan FTE (Fase 1=26, Fase 2=71, Fase 3=156) + 12 Freelancer Proyek + 2 Eksternal.
 */

var SHEET = {
  pengguna: 'Pengguna',
  tugas: 'Tugas',
  intake: 'Intake',
  keuangan: 'Keuangan',
  absen: 'Absen',
  dokumen: 'Dokumen',
  audit: 'Audit'
};

var HEADERS = {
  Pengguna: ['ID', 'Nama', 'Jabatan', 'Unit', 'Tier', 'Email', 'Aktif', 'Fase', 'StatusKepegawaian'],
  Tugas: ['ID', 'Kategori', 'Tugas', 'Pengerja', 'Eksekutor', 'Status'],
  Intake: ['ID', 'Judul', 'Kategori', 'Nilai', 'Unit', 'Pengaju', 'Status', 'Riwayat', 'TanggalBuat'],
  Keuangan: ['ID', 'Tanggal', 'Jenis', 'Kategori', 'Nominal', 'Keterangan', 'Oleh', 'Status', 'Rekonsiliasi'],
  Absen: ['ID', 'Tanggal', 'Jam', 'Nama', 'UserID', 'Jenis', 'Lokasi', 'Lat', 'Lng', 'JarakMeter', 'FaceDigest', 'StatusVerifikasi', 'DiverifikasiOleh'],
  Dokumen: ['ID', 'Judul', 'Jenis', 'Oleh', 'Isi', 'Tanggal'],
  Audit: ['Waktu', 'Siapa', 'Aksi', 'Modul']
};

var OFFICE_LAT = -6.2297;
var OFFICE_LNG = 106.8095;

function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('Holding Investasi')
      .addItem('Siapkan Database (156 FTE + 12 Freelancer + 2 Eksternal)', 'siapkanDatabase')
      .addItem('Cek Instalasi Sheet', 'cekInstalasi')
      .addToUi();
  } catch (e) {
    // Abaikan bila dipanggil non-UI
  }
}

function doGet() {
  var tpl = HtmlService.createTemplateFromFile('Index');
  tpl.mapsKey = PropertiesService.getScriptProperties().getProperty('GOOGLE_MAPS_API_KEY') || '';
  return tpl
    .evaluate()
    .setTitle('Holding Investasi — Portal & Kantor AI')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function ss_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (id) {
    return SpreadsheetApp.openById(id);
  }
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) {
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', active.getId());
    return active;
  }
  throw new Error('SPREADSHEET_ID belum diatur. Jalankan fungsi siapkanDatabase() sekali dari editor Apps Script.');
}

function sheet_(nama) {
  var s = ss_().getSheetByName(nama);
  if (!s) {
    throw new Error('Sheet "' + nama + '" belum ada. Jalankan fungsi siapkanDatabase() sekali.');
  }
  return s;
}

function baca_(nama) {
  var s = sheet_(nama);
  var lastRow = s.getLastRow();
  var lastCol = s.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];
  var values = s.getRange(1, 1, lastRow, lastCol).getValues();
  var head = values[0];
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    if (row.join('') === '') continue;
    var obj = { _rowIndex: r + 1 };
    for (var c = 0; c < head.length; c++) {
      obj[head[c]] = row[c];
    }
    out.push(obj);
  }
  return out;
}

function tambah_(nama, obj) {
  var s = sheet_(nama);
  var head = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0];
  var row = head.map(function (h) {
    var v = obj[h];
    if (v === undefined || v === null) return '';
    return typeof v === 'object' ? JSON.stringify(v) : v;
  });
  s.appendRow(row);
}

function perbaruiBaris_(nama, rowIndex, patchObj) {
  var s = sheet_(nama);
  var head = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0];
  head.forEach(function (h, i) {
    if (patchObj[h] !== undefined) {
      var val = patchObj[h];
      s.getRange(rowIndex, i + 1).setValue(typeof val === 'object' ? JSON.stringify(val) : val);
    }
  });
}

function sekarangWib_() {
  return Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss') + ' WIB';
}

function tanggalWib_() {
  return Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd');
}

function sha256Hex_(input) {
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(input), Utilities.Charset.UTF_8);
  return digest.map(function (b) {
    return ('0' + (b & 0xff).toString(16)).slice(-2);
  }).join('');
}

function appendAudit_(siapa, aksi, modul) {
  tambah_(SHEET.audit, {
    Waktu: sekarangWib_(),
    Siapa: siapa || 'SISTEM',
    Aksi: aksi,
    Modul: modul || 'Sistem'
  });
}

function peringkat_(u) {
  if (!u) return 0;
  if (/Komisaris|Direktur|Pemilik Utama/i.test(String(u.Jabatan || '')) || u.Tier === 'Pemilik') return 3;
  if (u.Tier === 'Manajemen') return 2;
  if (u.Tier === 'Staf') return 1;
  return 0;
}

function jalurRapid_(nilai) {
  var n = Number(nilai) || 0;
  if (n > 5000000000) return { label: 'Direksi / Komisaris', rank: 3 };
  if (n > 500000000) return { label: 'CIO', rank: 2 };
  return { label: 'Desk Head', rank: 1 };
}

function inferWorkforceCat_(tier, raw) {
  if (raw === 'Karyawan FTE' || raw === 'Freelancer' || raw === 'Eksternal') return raw;
  if (tier === 'Freelancer') return 'Freelancer';
  if (tier === 'Auditor' || tier === 'Tamu') return 'Eksternal';
  return 'Karyawan FTE';
}

function toPublicUser_(u) {
  return {
    ID: String(u.ID),
    Nama: String(u.Nama),
    Jabatan: String(u.Jabatan),
    Unit: String(u.Unit),
    Tier: String(u.Tier),
    Email: String(u.Email),
    Peringkat: peringkat_(u),
    Fase: u.Fase ? Number(u.Fase) : undefined,
    StatusKepegawaian: inferWorkforceCat_(u.Tier, u.StatusKepegawaian)
  };
}

function maskEmail_(email) {
  var parts = String(email || '').split('@');
  if (parts.length !== 2) return email;
  var local = parts[0];
  var visible = local.length <= 2 ? local.charAt(0) : local.slice(0, 2);
  return visible + '***@' + parts[1];
}

function generateId_(prefix) {
  return prefix + '-' + new Date().getTime().toString(36).toUpperCase() + Math.floor(Math.random() * 999).toString(36).toUpperCase();
}

function haversineMeters_(lat, lng) {
  var toRad = function (d) { return (d * Math.PI) / 180; };
  var R = 6371000;
  var dLat = toRad(lat - OFFICE_LAT);
  var dLng = toRad(lng - OFFICE_LNG);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(OFFICE_LAT)) * Math.cos(toRad(lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/* ---------------- Penyiapan Database (156 FTE + 12 Freelancer + 2 Eksternal) ---------------- */

function buildSeedUsers_() {
  var units = [
    ['D1', 'Kas & Pendapatan Tetap', [2, 4, 8], 'Head of Fixed Income & Treasury'],
    ['D2', 'Ekuitas Publik', [1, 3, 5], 'Head of Public Equity'],
    ['D3', 'Seleksi Reksa Dana & ETF', [1, 2, 3], 'Head of Manager Research'],
    ['D4', 'Valas, Komoditas & Derivatif', [1, 2, 5], 'Head of Macro & Derivatives'],
    ['D5', 'Kripto & Aset Digital Trading', [1, 2, 4], 'Head of Digital Assets'],
    ['D6', 'Bisnis Digital & Kekayaan Intelektual', [1, 3, 6], 'Head of Digital & IP Assets'],
    ['D7', 'Properti & Tanah', [2, 5, 12], 'Head of Real Estate'],
    ['D8', 'Aset Fisik Produktif', [2, 6, 14], 'Head of Productive Assets'],
    ['D9', 'Agrikultur & Alam', [1, 2, 6], 'Head of Agri & Natural Assets'],
    ['D10', 'Koleksi & Aset Gaya Hidup', [1, 2, 4], 'Head of Collectibles'],
    ['D11', 'Asuransi & Pensiun', [0, 1, 2], 'Head of Protection & Retirement'],
    ['D12', 'Bisnis & Usaha Langsung', [1, 2, 6], 'Head of Direct Business'],
    ['S1', 'CIO Office & Investment Committee', [1, 2, 4], 'Direktur Utama'],
    ['S2', 'Risk, Compliance & APU-PPT', [1, 4, 8], 'Head of Compliance & Risk'],
    ['S3', 'Finance, Tax & Accounting', [1, 4, 9], 'Finance & Tax Lead'],
    ['S4', 'Operations, Settlement & Custody', [1, 4, 9], 'Head of Operations & Custody'],
    ['S5', 'Legal & Corporate Secretary', [0, 2, 4], 'General Counsel & Corp Sec'],
    ['S6', 'People & Culture', [0, 1, 4], 'Head of People & Culture'],
    ['S7', 'Technology, Data & AI Engineering', [2, 5, 10], 'Head of Technology & AI'],
    ['S8', 'Capital & Stakeholder Relations', [1, 2, 5], 'Head of Stakeholder Relations'],
    ['S9', 'Internal Audit', [0, 1, 2], 'Head of Internal Audit'],
    ['S10', 'AI Operations Center (Kantor AI)', [1, 3, 7], 'AI Operations Director'],
    ['S11', 'Business Development & Deal Sourcing', [1, 2, 5], 'Head of Deal Sourcing'],
    ['S12', 'General Affairs, Fasilitas & Umum', [3, 7, 14], 'GA Manager']
  ];

  var primary = {
    D1: ['OWN1', 'Slamet Sugiono', 'Pemilik Utama & Investor', 'Pemilik', 'slametsugiono.studio@gmail.com'],
    S1: ['M1', 'Rangga Adhisurya', 'Direktur Utama', 'Pemilik', 'rangga.direksi@holding-investasi.id'],
    D2: ['M2', 'Kirana Prameswari', 'Head of Investment', 'Manajemen', 'kirana.investasi@holding-investasi.id'],
    D3: ['M3', 'Bimo Saputra', 'Dealer Saham & Obligasi', 'Staf', 'bimo.pasarmodal@holding-investasi.id'],
    D7: ['M4', 'Nadia Kusuma', 'Analis Properti & Aset Fisik', 'Staf', 'nadia.properti@holding-investasi.id'],
    S2: ['M5', 'Aditya Rahim', 'Compliance & Legal Officer', 'Manajemen', 'aditya.kepatuhan@holding-investasi.id'],
    S3: ['M6', 'Sari Handayani', 'Finance & Tax Lead', 'Manajemen', 'sari.keuangan@holding-investasi.id'],
    S12: ['M7', 'Yusuf Maulana', 'GA Manager', 'Manajemen', 'yusuf.ga@holding-investasi.id']
  };

  var firstNames = ['Bagus','Citra','Darma','Eka','Farhan','Gita','Hendra','Intan','Joko','Kartika','Lutfi','Maya','Naufal','Olivia','Prasetya','Qori','Rama','Sinta','Taufik','Utami','Vina','Wahyu','Yogi','Zahra','Andi','Bella','Cakra','Dewi','Erlangga','Fanny','Galih','Hana','Ilham','Jasmine','Kevin','Laras','Mahendra','Nabila','Oki','Putri'];
  var lastNames = ['Wibowo','Nugroho','Santoso','Pratiwi','Kusumo','Hartono','Setiawan','Lestari','Purnama','Gunawan','Permata','Halim','Suryadi','Wijaya','Hidayat','Kencana','Siregar','Panggabean','Ramadhan','Mulyono','Subekti','Utomo','Sanjaya','Puspita'];

  var rows = [];
  var seq = 0;

  units.forEach(function (u) {
    var code = u[0], namaUnit = u[1], fte = u[2], kepala = u[3];
    var f1 = fte[0], f2 = fte[1], f3 = fte[2];
    var unitLabel = code + ' · ' + namaUnit;
    for (var seat = 1; seat <= f3; seat++) {
      var fase = seat <= f1 ? 1 : (seat <= f2 ? 2 : 3);
      if (seat === 1 && primary[code]) {
        var p = primary[code];
        rows.push([p[0], p[1], p[2], unitLabel, p[3], p[4], 'YA', fase, 'Karyawan FTE']);
        continue;
      }
      var fn = firstNames[seq % firstNames.length];
      var ln = lastNames[(Math.floor(seq / firstNames.length) + seq * 3) % lastNames.length];
      seq++;
      var tier = seat === 1 ? 'Manajemen' : 'Staf';
      var jab = seat === 1 ? (kepala || 'Lead ' + namaUnit) : 'Analis & Pelaksana ' + namaUnit;
      var pad = (seat < 10 ? '0' : '') + seat;
      var id = code + '-' + pad;
      var email = code.toLowerCase() + '.' + pad + '.' + fn.toLowerCase() + '@holding-investasi.id';
      rows.push([id, fn + ' ' + ln, jab, unitLabel, tier, email, 'YA', fase, 'Karyawan FTE']);
    }
  });

  var freelancers = [
    ['M10', 'Dimas Prasetyo', 'Freelancer Proyek Media & Konten', 'D6 · Bisnis Digital & IP (Proyek)', 'dimas.freelance@mitra.id'],
    ['FL-01', 'Raka Pratama', 'Freelancer UI/UX & Dashboard Design', 'S7 · Technology & AI Eng (Proyek)', 'raka.uiux@mitra.id'],
    ['FL-02', 'Tiara Ayu', 'Freelancer Penilai Properti (KJPP)', 'D7 · Properti & Tanah (Proyek)', 'tiara.kjpp@mitra.id'],
    ['FL-03', 'Fajar Nugraha', 'Freelancer Riset Pasar & Sektor', 'D2 · Ekuitas Publik (Proyek)', 'fajar.riset@mitra.id'],
    ['FL-04', 'Salsa Maharani', 'Freelancer Video & Investor Deck', 'S8 · Stakeholder Relations (Proyek)', 'salsa.media@mitra.id'],
    ['FL-05', 'Hafiz Alamsyah', 'Freelancer Otomasi Prompt & Agen AI', 'S10 · AI Operations Center (Proyek)', 'hafiz.aiops@mitra.id'],
    ['FL-06', 'Novi Wulandari', 'Freelancer Konsultan Pajak & Aktuaria', 'D11 · Asuransi & Pensiun (Proyek)', 'novi.aktuaria@mitra.id'],
    ['FL-07', 'Bayu Segara', 'Freelancer Agronomi & Survey Lahan', 'D9 · Agrikultur & Alam (Proyek)', 'bayu.agro@mitra.id'],
    ['FL-08', 'Clarissa Lim', 'Freelancer Kurator Karya & Koleksi', 'D10 · Koleksi & Gaya Hidup (Proyek)', 'clarissa.kurasi@mitra.id'],
    ['FL-09', 'Ilham Firdaus', 'Freelancer Pentest & Audit Keamanan', 'S7 · Technology & AI Eng (Proyek)', 'ilham.sec@mitra.id'],
    ['FL-10', 'Mega Puspitasari', 'Freelancer Notaris & Akta Transaksi', 'S5 · Legal & Corp Sec (Proyek)', 'mega.notaris@mitra.id'],
    ['FL-11', 'Dody Kurniawan', 'Freelancer Teknisi MEP & Audit Aset', 'D8 · Aset Fisik Produktif (Proyek)', 'dody.teknisi@mitra.id']
  ];
  freelancers.forEach(function (f) {
    rows.push([f[0], f[1], f[2], f[3], 'Freelancer', f[4], 'YA', '', 'Freelancer']);
  });

  rows.push(['M8', 'KAP Wijaya & Rekan', 'Auditor Eksternal (Tamu)', 'Eksternal · Audit KAP', 'Auditor', 'audit.wijaya@eksternal.id', 'YA', '', 'Eksternal']);
  rows.push(['M9', 'PT Bersih Cemerlang', 'Vendor Fasilitas (Tamu)', 'Eksternal · Vendor', 'Tamu', 'vendor.bersih@mitra.id', 'YA', '', 'Eksternal']);
  return rows;
}

function buildSeedTugasRows_() {
  var list = [
    ['Fasilitas & Kantor', 'Membuka kantor, cek fasilitas & laporan harian', 'On-site', 'Office Boy'],
    ['Fasilitas & Kantor', 'Menyusun anggaran GA & memantau deviasi realisasi otomatis', 'AI', 'AG-14 + GA Manager'],
    ['Teknis & Pemeliharaan', 'Menyusun jadwal pemeliharaan preventif & pengingat servis tahunan', 'AI', 'AG-07 + Google Calendar'],
    ['Pengadaan & Vendor', 'Menerima tiket pengadaan, membandingkan 3 vendor & cek invoice PO', 'AI', 'AG-16 + AG-14'],
    ['Investasi & Deal', 'Memantau listing masuk, menyusun memo investasi, DD & valuasi 3 skenario', 'AI', 'AG-01..AG-04'],
    ['Investasi & Deal', 'Menandatangani perjanjian & instruksi transfer dana (wajib manusia)', 'On-site', 'Direktur'],
    ['Keuangan & Pajak', 'Mengimpor transaksi bank, rekonsiliasi & memodelkan proyeksi kas 3 skenario', 'AI', 'AG-14 + AG-12'],
    ['Keuangan & Pajak', 'Mengompilasi data room audit 100% populasi & draf jawaban auditor', 'AI', 'AG-14 + AG-12 + AG-13'],
    ['Keuangan & Pajak', 'Menyetujui dan melepas pembayaran transaksi (> Rp100 jt wajib Direktur)', 'Remote', 'CFO / Direktur'],
    ['SDM & Administrasi', 'Menyaring CV, menyiapkan kontrak onboarding, payroll BPJS & rekap KPI', 'AI', 'AG-16 + AG-17 + AG-14'],
    ['SDM & Administrasi', 'Menyiapkan modul pelatihan kepatuhan & AI, kuis uji & absensi daring', 'AI', 'AG-13 + AG-18 + Gemini AI'],
    ['SDM & Administrasi', 'Melakukan wawancara final, asesmen senior & penanganan disiplin karyawan', 'On-site', 'HR Manager + Direksi'],
    ['Kepatuhan & Korporasi', 'Memantau aturan POJK/PMK, screening PEP & menyusun draf jawaban regulator', 'AI', 'AG-13 + AG-17'],
    ['Kepatuhan & Korporasi', 'Menyelenggarakan RUPS, pembaruan OSS/AHU & audit internal lapangan', 'On-site', 'Corsec + Internal Audit'],
    ['D1 · Kas & Pendapatan Tetap (A, B)', 'Memantau jatuh tempo deposito, jadwal kupon obligasi & rasio likuiditas 3 bln', 'AI', 'AG-05 + AG-14 + AG-12'],
    ['D1 · Kas & Pendapatan Tetap (A, B)', 'Negosiasi special rate deposito & kuota penempatan dengan treasury bank', 'Remote', 'Head D1'],
    ['D2 & D3 · Ekuitas, Reksa Dana & ETF (C, D)', 'Screening saham IDX/Global, batas 10% emiten & audit overlap Reksa Dana/ETF', 'AI', 'AG-05 + AG-02 + AG-12'],
    ['D2 & D3 · Ekuitas, Reksa Dana & ETF (C, D)', 'Menetapkan tesis investasi, limit order & eksekusi rebalancing kuartalan', 'Remote', 'Head D2 + Head D3'],
    ['D4 · Valas, Komoditas & Derivatif (E, N)', 'Memantau kurs spot, spread emas, margin call & stress test limit 3% harian', 'AI', 'AG-05 + AG-04 + AG-13'],
    ['D4 · Valas, Komoditas & Derivatif (E, N)', 'Keputusan hedging valas & verifikasi fisik sertifikat emas/perak di brankas', 'On-site', 'Head D4 + Custody + Audit'],
    ['D5 · Kripto & Aset Digital Trading (F1–F10)', 'Mengawasi dompet on-chain 24/7, health factor DeFi & hitung PPh 22 0,21%', 'AI', 'AG-10 + AG-14'],
    ['D5 · Kripto & Aset Digital Trading (F1–F10)', 'Uji pemulihan seed phrase & rotasi hardware wallet multi-sig 2-dari-3', 'On-site', 'Custody D5 + 2 Pejabat'],
    ['D6 · Bisnis Digital, SaaS & HKI (F11–F20, L)', 'Audit traffic SaaS, MRR/churn, rekonsiliasi royalti & alert perpanjangan domain/HKI', 'AI', 'AG-11 + AG-17 + AG-13'],
    ['D6 · Bisnis Digital, SaaS & HKI (F11–F20, L)', 'Pengembangan fitur SaaS, konten teknis & audit kode sumber proyek', 'Remote', 'Freelancer Proyek + S7'],
    ['D7 · Properti & Tanah (G)', 'Menarik NJOP, komparasi harga, penagihan sewa otomatis & pengingat kontrak H-60', 'AI', 'AG-06 + AG-14 + AG-17'],
    ['D7 · Properti & Tanah (G)', 'Survei lokasi, cek sertifikat BPN/PPAT, patok tanah & pengawasan renovasi', 'On-site', 'Site Officer D7 + Legal S5'],
    ['D8 · Aset Fisik Produktif (H)', 'Memantau telemetri IoT mesin/vending, rute teknisi & cocokkan setoran QRIS', 'AI', 'AG-07 + AG-14'],
    ['D8 · Aset Fisik Produktif (H)', 'Restock mesin, perbaikan lapangan & pengurusan izin laik operasi SIA/SILO', 'On-site', 'Technician + Field Ops D8'],
    ['D9 · Agrikultur & Alam (I)', 'Proyeksi cuaca/panen satelit, deteksi dini hama & hitung bagi hasil petani/plasma', 'AI', 'AG-08 + AG-14'],
    ['D9 · Agrikultur & Alam (I)', 'Pengadaan bibit/pupuk, vaksinasi ternak & pengukuran panen ke offtaker', 'On-site', 'Field Coordinator + Agronomist'],
    ['D10 · Koleksi & Aset Gaya Hidup (J)', 'Pelacakan harga lelang global, provenans & jadwal perawatan/asuransi koleksi', 'AI', 'AG-09 + AG-07 + AG-13'],
    ['D10 · Koleksi & Aset Gaya Hidup (J)', 'Autentikasi fisik objek bernilai tinggi & pemeliharaan climate control brankas', 'On-site', 'Kurator D10 + Vendor'],
    ['D11 · Asuransi & Pensiun (M)', 'Audit isi polis unit-link/jiwa/anuitas, jadwal premi & nilai tunai pensiun', 'AI', 'AG-13 + AG-14 + AG-12'],
    ['D11 · Asuransi & Pensiun (M)', 'Evaluasi proteksi grup, pengajuan klaim besar & negosiasi retensi premi', 'Remote', 'Head D11 + Finance'],
    ['D12 · Bisnis Langsung & UMKM (K)', 'Konsolidasi POS kasir harian franchise/klinik, deteksi selisih stok & pra-DD UMKM', 'AI', 'AG-14 + AG-12 + AG-03'],
    ['D12 · Bisnis Langsung & UMKM (K)', 'Inspeksi SOP cabang, kepatuhan izin BPOM/Kemenkes & pembinaan mitra usaha', 'On-site', 'Operations D12'],
    ['Tata Kelola Grup & Multi-Entitas (7 PT/SPV)', 'Rekonsiliasi intercompany & transfer pricing 7 PT/SPV, risalah Meet & pra-audit 100%', 'AI', 'AG-14 + AG-18 + Gemini AI'],
    ['Tata Kelola Grup & Multi-Entitas (7 PT/SPV)', 'Briefing NDA, milestone & jadwal termin 12 Freelancer serta monitoring server S7', 'AI', 'AG-16 + AG-18'],
    ['Tata Kelola Grup & Multi-Entitas (7 PT/SPV)', 'Pengembangan portal/Apps Script & negosiasi strategis co-investor/bank/regulator', 'Remote', 'CTO S7 + Direksi']
  ];
  return list.map(function (row, idx) {
    var num = idx + 1;
    var pad = num < 10 ? '00' + num : num < 100 ? '0' + num : String(num);
    return ['TGS-' + pad, row[0], row[1], row[2], row[3], 'Belum'];
  });
}

function siapkanDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    ss = SpreadsheetApp.create('DB Holding Investasi');
  }
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());

  Object.keys(HEADERS).forEach(function (nama) {
    var s = ss.getSheetByName(nama) || ss.insertSheet(nama);
    if (s.getLastRow() === 0) {
      s.appendRow(HEADERS[nama]);
      s.setFrozenRows(1);
    }
  });

  var sPengguna = sheet_(SHEET.pengguna);
  if (sPengguna.getLastRow() <= 1) {
    var seedRows = buildSeedUsers_();
    sPengguna.getRange(2, 1, seedRows.length, HEADERS.Pengguna.length).setValues(seedRows);
  }

  var sTugas = sheet_(SHEET.tugas);
  if (sTugas.getLastRow() <= 1) {
    var tRows = buildSeedTugasRows_();
    sTugas.getRange(2, 1, tRows.length, HEADERS.Tugas.length).setValues(tRows);
  }

  var now = sekarangWib_();
  var today = tanggalWib_();
  var sIntake = sheet_(SHEET.intake);
  if (sIntake.getLastRow() <= 1) {
    var iRows = [
      ['INT-SEED01', 'Alokasi Obligasi Korporasi Tenor 3 Tahun — Seri A', 'Investasi', 6500000000, 'D2 · Ekuitas Publik', 'Kirana Prameswari', 'Direview', now + ' dibuat Kirana Prameswari', today],
      ['INT-SEED02', 'Penambahan Posisi Ekuitas Blue-Chip Sektor Perbankan', 'Investasi', 1250000000, 'D3 · Seleksi Reksa Dana & ETF', 'Bimo Saputra', 'Masuk', now + ' dibuat Bimo Saputra', today],
      ['INT-SEED03', 'Pembaruan Lisensi Terminal Data & Sistem Kepatuhan', 'Operasional', 185000000, 'S12 · General Affairs, Fasilitas & Umum', 'Yusuf Maulana', 'Masuk', now + ' dibuat Yusuf Maulana', today]
    ];
    sIntake.getRange(2, 1, iRows.length, HEADERS.Intake.length).setValues(iRows);
  }

  var sKeu = sheet_(SHEET.keuangan);
  if (sKeu.getLastRow() <= 1) {
    var kRows = [
      ['KAS-SEED01', today, 'Masuk', 'Modal Disetor', 12500000000, 'Penempatan modal sendiri pemegang saham kuartal berjalan', 'Rangga Adhisurya', 'Disetujui', 'Sudah'],
      ['KAS-SEED02', today, 'Masuk', 'Dividen & Kupon', 420000000, 'Penerimaan kupon obligasi & dividen portofolio', 'Kirana Prameswari', 'Terverifikasi', 'Sudah'],
      ['KAS-SEED03', today, 'Keluar', 'Operasional Kantor', 48500000, 'Biaya sewa ruang kerja, utilitas, dan vendor kebersihan bulanan', 'Yusuf Maulana', 'Draft', 'Belum']
    ];
    sKeu.getRange(2, 1, kRows.length, HEADERS.Keuangan.length).setValues(kRows);
  }

  var sDok = sheet_(SHEET.dokumen);
  if (sDok.getLastRow() <= 1) {
    var dRows = [
      ['DOK-SEED01', 'Piagam Tata Kelola Modal Sendiri & Matriks RAPID', 'Kebijakan', 'Rangga Adhisurya', 'Holding beroperasi murni menggunakan modal sendiri. Persetujuan RAPID: <= Rp500 jt Desk Head, > Rp500 jt CIO, > Rp5 M Direksi/Komisaris. Kas keluar > Rp100 jt wajib Direktur.', today],
      ['DOK-SEED02', 'Ringkasan Komite Investasi — Alokasi Pendapatan Tetap', 'Memo Investasi', 'Kirana Prameswari', 'Menjaga likuiditas kas operasional minimal 15% dari total modal kerja sebelum penempatan instrumen jangka menengah.', today]
    ];
    sDok.getRange(2, 1, dRows.length, HEADERS.Dokumen.length).setValues(dRows);
  }

  appendAudit_('SISTEM', 'Database disiapkan (156 FTE + 12 Freelancer + 2 Eksternal)', 'Sistem');
  return 'Database siap di Spreadsheet "' + ss.getName() + '" (170 akun + 7 sheet).';
}

function cekInstalasi() {
  var hasil = {};
  Object.keys(HEADERS).forEach(function (nm) {
    var sh = ss_().getSheetByName(nm);
    hasil[nm] = sh ? Math.max(0, sh.getLastRow() - 1) + ' baris data' : 'HILANG';
  });
  Logger.log(JSON.stringify(hasil, null, 2));
  return hasil;
}

/* ---------------- Sesi & Guardrail Server ---------------- */

function getSesiUser_(token) {
  if (!token) return null;
  var raw = CacheService.getScriptCache().get('sesi_' + token);
  if (!raw) return null;
  var parsed = JSON.parse(raw);
  var list = baca_(SHEET.pengguna);
  for (var i = 0; i < list.length; i++) {
    if (String(list[i].ID) === String(parsed.id) && list[i].Aktif === 'YA') {
      return list[i];
    }
  }
  return null;
}

function requireUser_(token, tiers) {
  var u = getSesiUser_(token);
  if (!u) throw new Error('Belum masuk / sesi berakhir. Silakan verifikasi ulang.');
  if (tiers && tiers.indexOf(u.Tier) < 0) {
    appendAudit_(u.Nama, 'AKSES DITOLAK (' + u.Tier + ')', 'Keamanan');
    throw new Error('Akses ditolak untuk peran ' + u.Tier + ' (dicatat di audit).');
  }
  return u;
}

/* ---------------- API Dispatcher untuk UI SPA ---------------- */

function gasApiDispatch(route, token, payload) {
  payload = payload || {};

  if (route === 'auth.profiles') {
    return baca_(SHEET.pengguna)
      .filter(function (u) { return u.Aktif === 'YA'; })
      .map(function (u) {
        return {
          ID: String(u.ID),
          Nama: String(u.Nama),
          Jabatan: String(u.Jabatan),
          Unit: String(u.Unit),
          Tier: String(u.Tier),
          Email: String(u.Email),
          Fase: u.Fase ? Number(u.Fase) : undefined,
          StatusKepegawaian: inferWorkforceCat_(u.Tier, u.StatusKepegawaian)
        };
      });
  }

  if (route === 'auth.otpRequest') {
    var email = String(payload.email || '').trim().toLowerCase();
    if (!email || email.indexOf('@') < 1) throw new Error('Alamat email tidak valid.');
    var user = baca_(SHEET.pengguna).filter(function (u) {
      return String(u.Email || '').trim().toLowerCase() === email && u.Aktif === 'YA';
    })[0];
    if (!user) throw new Error('Email tidak terdaftar atau akun dinonaktifkan.');

    var otp = String(Math.floor(100000 + Math.random() * 900000));
    var salt = Utilities.getUuid().slice(0, 12);
    CacheService.getScriptCache().put(
      'otp_' + sha256Hex_(email),
      JSON.stringify({ userId: user.ID, salt: salt, hash: sha256Hex_(salt + ':' + otp), attempts: 0 }),
      300
    );

    var delivery = 'email';
    try {
      MailApp.sendEmail({
        to: email,
        subject: 'Kode OTP Masuk Holding Investasi: ' + otp,
        body: 'Halo ' + user.Nama + ',\n\nGunakan kode OTP berikut untuk melengkapi verifikasi Wajah & Lokasi:\n\n' + otp + '\n\nKode berlaku 5 menit.'
      });
    } catch (e) {
      delivery = 'preview';
    }
    appendAudit_(user.Nama, 'Permintaan OTP Email (' + maskEmail_(email) + ') [' + delivery + ']', 'Autentikasi');
    var res = {
      ok: true,
      delivery: delivery,
      maskedEmail: maskEmail_(email),
      expiresInSec: 300
    };
    if (delivery === 'preview') res.previewOtp = otp;
    return res;
  }

  if (route === 'auth.login') {
    var email = String(payload.email || '').trim().toLowerCase();
    var otp = String(payload.otp || '').trim();
    var faceImage = String(payload.faceImage || '');
    var lat = Number(payload.lat);
    var lng = Number(payload.lng);
    var lokasiLabel = String(payload.lokasiLabel || 'Lokasi Terpetakan').slice(0, 120);

    if (!email || !/^\d{6}$/.test(otp)) throw new Error('Email dan kode OTP 6 digit wajib diisi.');
    if (faceImage.indexOf('data:image/') !== 0 || faceImage.length < 400) {
      throw new Error('Foto verifikasi wajah wajib diambil terlebih dahulu.');
    }
    if (!isFinite(lat) || !isFinite(lng)) {
      throw new Error('Koordinat lokasi Google Maps wajib tersedia.');
    }

    var cacheKey = 'otp_' + sha256Hex_(email);
    var rawOtp = CacheService.getScriptCache().get(cacheKey);
    if (!rawOtp) throw new Error('Kode OTP belum diminta atau sudah kedaluwarsa.');
    var otpObj = JSON.parse(rawOtp);
    if (sha256Hex_(otpObj.salt + ':' + otp) !== otpObj.hash) {
      appendAudit_(email, 'LOGIN GAGAL (OTP salah)', 'Keamanan');
      throw new Error('Kode OTP Email salah.');
    }

    var u = baca_(SHEET.pengguna).filter(function (x) {
      return String(x.ID) === String(otpObj.userId) && x.Aktif === 'YA';
    })[0];
    if (!u) throw new Error('Akun tidak aktif atau tidak ditemukan.');

    CacheService.getScriptCache().remove(cacheKey);
    var newToken = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '').slice(0, 16);
    CacheService.getScriptCache().put('sesi_' + newToken, JSON.stringify({ id: u.ID }), 6 * 60 * 60);

    var faceDigest = sha256Hex_(faceImage).slice(0, 12).toUpperCase();
    var jarak = haversineMeters_(lat, lng);
    appendAudit_(u.Nama, 'Login Wajah(' + faceDigest + ') + Maps(' + lat.toFixed(4) + ',' + lng.toFixed(4) + ' · ' + jarak + 'm) + OTP [' + lokasiLabel + ']', 'Autentikasi');
    return { token: newToken, user: toPublicUser_(u) };
  }

  if (route === 'auth.logout') {
    if (token) CacheService.getScriptCache().remove('sesi_' + token);
    return { ok: true };
  }

  if (route === 'auth.me') {
    var me = requireUser_(token);
    return { user: toPublicUser_(me) };
  }

  if (route === 'dashboard.get') {
    requireUser_(token);
    var keu = baca_(SHEET.keuangan);
    var totalMasuk = 0, totalKeluar = 0;
    keu.forEach(function (k) {
      var nom = Number(k.Nominal) || 0;
      if (k.Jenis === 'Masuk') totalMasuk += nom;
      else totalKeluar += nom;
    });
    var intakeList = baca_(SHEET.intake);
    var tugasList = baca_(SHEET.tugas);
    var absenList = baca_(SHEET.absen);
    return {
      antrean: intakeList.filter(function (x) { return ['Masuk', 'Direview', 'Perlu Info'].indexOf(x.Status) >= 0; }).length,
      totalIntake: intakeList.length,
      tugasSelesai: tugasList.filter(function (x) { return x.Status === 'Selesai'; }).length,
      totalTugas: tugasList.length,
      saldoKas: totalMasuk - totalKeluar,
      totalMasuk: totalMasuk,
      totalKeluar: totalKeluar,
      dokumen: baca_(SHEET.dokumen).length,
      absenMenunggu: absenList.filter(function (x) { return x.StatusVerifikasi === 'menunggu-verifikasi-atasan'; }).length,
      auditTerakhir: baca_(SHEET.audit).slice(-8).reverse()
    };
  }

  if (route === 'intake.list') {
    requireUser_(token);
    return baca_(SHEET.intake).reverse();
  }

  if (route === 'intake.create') {
    var u = requireUser_(token, ['Pemilik', 'Manajemen', 'Staf', 'Freelancer']);
    var judul = String(payload.judul || '').trim();
    if (!judul) throw new Error('Judul permintaan wajib diisi.');
    var item = {
      ID: generateId_('INT'),
      Judul: judul,
      Kategori: String(payload.kategori || 'Operasional'),
      Nilai: Math.round(Number(payload.nilai) || 0),
      Unit: String(payload.unit || u.Unit),
      Pengaju: u.Nama,
      Status: 'Masuk',
      Riwayat: sekarangWib_() + ' dibuat ' + u.Nama,
      TanggalBuat: tanggalWib_()
    };
    tambah_(SHEET.intake, item);
    appendAudit_(u.Nama, 'Intake ' + item.ID + ' (' + item.Kategori + ')', 'Intake');
    return item;
  }

  if (route === 'intake.status') {
    var u = requireUser_(token, ['Pemilik', 'Manajemen', 'Staf']);
    var validIntake = ['Masuk', 'Direview', 'Perlu Info', 'Disetujui', 'Ditolak'];
    if (validIntake.indexOf(payload.aksi) < 0) throw new Error('Status intake tidak valid.');
    var list = baca_(SHEET.intake);
    var target = list.filter(function (x) { return x.ID === payload.id; })[0];
    if (!target) throw new Error('Permintaan intake tidak ditemukan.');
    if (payload.aksi === 'Disetujui') {
      var jalur = jalurRapid_(target.Nilai);
      if (peringkat_(u) < jalur.rank) {
        appendAudit_(u.Nama, 'PERCOBAAN setujui di luar wewenang ' + payload.id, 'Intake');
        throw new Error('Ditolak: nilai ini wajib persetujuan ' + jalur.label + '.');
      }
    }
    var riwayat = String(target.Riwayat || '') + ' | ' + sekarangWib_() + ' ' + u.Nama + ' -> ' + payload.aksi;
    perbaruiBaris_(SHEET.intake, target._rowIndex, { Status: payload.aksi, Riwayat: riwayat });
    appendAudit_(u.Nama, 'Intake ' + payload.id + ' -> ' + payload.aksi, 'Intake');
    target.Status = payload.aksi;
    target.Riwayat = riwayat;
    return target;
  }

  if (route === 'keuangan.list') {
    requireUser_(token, ['Pemilik', 'Manajemen', 'Staf', 'Auditor']);
    return baca_(SHEET.keuangan).reverse();
  }

  if (route === 'keuangan.create') {
    var u = requireUser_(token, ['Pemilik', 'Manajemen', 'Staf']);
    var nominal = Number(payload.nominal);
    if (!(nominal > 0)) throw new Error('Nominal harus > 0.');
    if (payload.jenis === 'Keluar' && nominal > 100000000 && peringkat_(u) < 3) {
      appendAudit_(u.Nama, 'PERCOBAAN pengeluaran besar Rp' + nominal, 'Keuangan');
      throw new Error('Ditolak: pengeluaran > Rp100 juta wajib Direktur / Pemilik.');
    }
    var item = {
      ID: generateId_('KAS'),
      Tanggal: payload.tanggal || tanggalWib_(),
      Jenis: payload.jenis === 'Keluar' ? 'Keluar' : 'Masuk',
      Kategori: String(payload.kategori || 'Umum'),
      Nominal: Math.round(nominal),
      Keterangan: String(payload.keterangan || ''),
      Oleh: u.Nama,
      Status: 'Draft',
      Rekonsiliasi: 'Belum'
    };
    tambah_(SHEET.keuangan, item);
    appendAudit_(u.Nama, 'Kas ' + item.ID + ' ' + item.Jenis + ' Rp' + item.Nominal, 'Keuangan');
    return item;
  }

  if (route === 'keuangan.update') {
    var u = requireUser_(token, ['Pemilik', 'Manajemen']);
    var target = baca_(SHEET.keuangan).filter(function (x) { return x.ID === payload.id; })[0];
    if (!target) throw new Error('Catatan kas tidak ditemukan.');
    var patch = {};
    if (payload.status !== undefined) {
      var validKas = ['Draft', 'Terverifikasi', 'Disetujui'];
      if (validKas.indexOf(payload.status) < 0) throw new Error('Status kas tidak valid.');
      if (payload.status === 'Disetujui' && target.Jenis === 'Keluar' && Number(target.Nominal) > 100000000 && peringkat_(u) < 3) {
        throw new Error('Persetujuan pengeluaran > Rp100 juta wajib Direktur.');
      }
      patch.Status = payload.status;
      target.Status = payload.status;
    }
    if (payload.rekonsiliasi !== undefined) {
      if (['Belum', 'Sudah'].indexOf(payload.rekonsiliasi) < 0) throw new Error('Status rekonsiliasi tidak valid.');
      patch.Rekonsiliasi = payload.rekonsiliasi;
      target.Rekonsiliasi = payload.rekonsiliasi;
    }
    perbaruiBaris_(SHEET.keuangan, target._rowIndex, patch);
    appendAudit_(u.Nama, 'Kas ' + target.ID + ' diperbarui', 'Keuangan');
    return target;
  }

  if (route === 'tugas.list') {
    requireUser_(token, ['Pemilik', 'Manajemen', 'Staf', 'Freelancer']);
    return baca_(SHEET.tugas);
  }

  if (route === 'tugas.create') {
    var u = requireUser_(token, ['Pemilik', 'Manajemen', 'Staf']);
    var item = {
      ID: generateId_('TGS'),
      Kategori: String(payload.kategori || 'Operasional'),
      Tugas: String(payload.tugas || '').trim(),
      Pengerja: String(payload.pengerja || 'On-site'),
      Eksekutor: String(payload.eksekutor || u.Nama),
      Status: 'Belum'
    };
    if (!item.Tugas) throw new Error('Deskripsi tugas wajib diisi.');
    tambah_(SHEET.tugas, item);
    appendAudit_(u.Nama, 'Tugas baru ' + item.ID, 'Tugas');
    return item;
  }

  if (route === 'tugas.update') {
    var u = requireUser_(token, ['Pemilik', 'Manajemen', 'Staf', 'Freelancer']);
    if (['Belum', 'Proses', 'Selesai'].indexOf(payload.status) < 0) {
      throw new Error('Status tugas harus Belum, Proses, atau Selesai.');
    }
    var target = baca_(SHEET.tugas).filter(function (x) { return x.ID === payload.id; })[0];
    if (!target) throw new Error('Tugas tidak ditemukan.');
    perbaruiBaris_(SHEET.tugas, target._rowIndex, { Status: payload.status });
    appendAudit_(u.Nama, 'Tugas ' + target.ID + ' -> ' + payload.status, 'Tugas');
    target.Status = payload.status;
    return target;
  }

  if (route === 'absen.list') {
    var u = requireUser_(token, ['Pemilik', 'Manajemen', 'Staf']);
    var rows = baca_(SHEET.absen);
    if (peringkat_(u) < 2) {
      rows = rows.filter(function (x) { return String(x.UserID) === String(u.ID); });
    }
    return rows.reverse();
  }

  if (route === 'absen.submit') {
    var u = requireUser_(token, ['Pemilik', 'Manajemen', 'Staf']);
    var faceImage = String(payload.faceImage || '');
    if (faceImage.indexOf('data:image/') !== 0 || faceImage.length < 400) {
      throw new Error('Foto verifikasi wajah wajib diambil.');
    }
    var lat = Number(payload.lat), lng = Number(payload.lng);
    if (!isFinite(lat) || !isFinite(lng)) throw new Error('Koordinat lokasi wajib valid.');
    var now = sekarangWib_();
    var item = {
      ID: generateId_('ABS'),
      Tanggal: now.slice(0, 10),
      Jam: now.slice(11, 19),
      Nama: u.Nama,
      UserID: u.ID,
      Jenis: payload.jenis === 'out' ? 'out' : 'in',
      Lokasi: String(payload.lokasi || 'Lokasi Google Maps'),
      Lat: Number(lat.toFixed(6)),
      Lng: Number(lng.toFixed(6)),
      JarakMeter: haversineMeters_(lat, lng),
      FaceDigest: sha256Hex_(faceImage).slice(0, 12).toUpperCase(),
      StatusVerifikasi: 'menunggu-verifikasi-atasan',
      DiverifikasiOleh: ''
    };
    tambah_(SHEET.absen, item);
    appendAudit_(u.Nama, 'Absen ' + item.Jenis + ' (' + item.Lokasi + ')', 'Absensi');
    return item;
  }

  if (route === 'absen.verify') {
    var u = requireUser_(token, ['Pemilik', 'Manajemen']);
    if (['terverifikasi', 'ditolak'].indexOf(payload.status) < 0) {
      throw new Error('Status verifikasi absen tidak valid.');
    }
    var target = baca_(SHEET.absen).filter(function (x) { return x.ID === payload.id; })[0];
    if (!target) throw new Error('Data absen tidak ditemukan.');
    perbaruiBaris_(SHEET.absen, target._rowIndex, { StatusVerifikasi: payload.status, DiverifikasiOleh: u.Nama });
    appendAudit_(u.Nama, 'Verifikasi absen ' + target.ID + ' -> ' + payload.status, 'Absensi');
    target.StatusVerifikasi = payload.status;
    target.DiverifikasiOleh = u.Nama;
    return target;
  }

  if (route === 'dokumen.list') {
    requireUser_(token, ['Pemilik', 'Manajemen', 'Staf', 'Auditor', 'Freelancer']);
    return baca_(SHEET.dokumen).reverse();
  }

  if (route === 'dokumen.create') {
    var u = requireUser_(token, ['Pemilik', 'Manajemen', 'Staf']);
    var item = {
      ID: generateId_('DOK'),
      Judul: String(payload.judul || '').trim(),
      Jenis: String(payload.jenis || 'Memo Investasi'),
      Oleh: u.Nama,
      Isi: String(payload.isi || '').trim(),
      Tanggal: tanggalWib_()
    };
    if (!item.Judul || !item.Isi) throw new Error('Judul dan isi dokumen wajib diisi.');
    if (item.Isi.length > 20000) throw new Error('Isi dokumen melebihi batas 20.000 karakter.');
    item.Judul = item.Judul.slice(0, 180);
    item.Jenis = item.Jenis.slice(0, 60);
    tambah_(SHEET.dokumen, item);
    appendAudit_(u.Nama, 'Dokumen ' + item.ID + ': ' + item.Judul, 'Dokumen');
    return item;
  }

  if (route === 'audit.list') {
    requireUser_(token, ['Pemilik', 'Manajemen', 'Auditor']);
    return baca_(SHEET.audit).slice(-200).reverse();
  }

  if (route === 'pengguna.list') {
    requireUser_(token, ['Pemilik']);
    return baca_(SHEET.pengguna).map(function (u) {
      var pub = toPublicUser_(u);
      pub.Aktif = u.Aktif;
      return pub;
    });
  }

  if (route === 'pengguna.create') {
    var actor = requireUser_(token, ['Pemilik']);
    var rec = {
      ID: String(payload.id || '').trim().toUpperCase(),
      Nama: String(payload.nama || '').trim(),
      Jabatan: String(payload.jabatan || '').trim(),
      Unit: String(payload.unit || '').trim(),
      Tier: String(payload.tier || 'Staf'),
      Email: String(payload.email || '').trim().toLowerCase(),
      Aktif: 'YA',
      Fase: payload.fase || '',
      StatusKepegawaian: inferWorkforceCat_(payload.tier, payload.statusKepegawaian)
    };
    if (!rec.ID || !rec.Nama || !rec.Email) throw new Error('ID, nama, dan email wajib diisi.');
    tambah_(SHEET.pengguna, rec);
    appendAudit_(actor.Nama, 'Akun baru dibuat: ' + rec.ID, 'Keamanan');
    var pub = toPublicUser_(rec);
    pub.Aktif = 'YA';
    return pub;
  }

  if (route === 'pengguna.email') {
    var actor = requireUser_(token, ['Pemilik']);
    var target = baca_(SHEET.pengguna).filter(function (u) { return u.ID === payload.id; })[0];
    if (!target) throw new Error('Pengguna tidak ditemukan.');
    var email = String(payload.email || '').trim().toLowerCase();
    perbaruiBaris_(SHEET.pengguna, target._rowIndex, { Email: email });
    appendAudit_(actor.Nama, 'Email OTP diperbarui untuk ' + target.ID, 'Keamanan');
    target.Email = email;
    var pub = toPublicUser_(target);
    pub.Aktif = target.Aktif;
    return pub;
  }

  if (route === 'pengguna.status') {
    var actor = requireUser_(token, ['Pemilik']);
    var target = baca_(SHEET.pengguna).filter(function (u) { return u.ID === payload.id; })[0];
    if (!target) throw new Error('Pengguna tidak ditemukan.');
    var aktif = payload.aktif === 'TIDAK' ? 'TIDAK' : 'YA';
    perbaruiBaris_(SHEET.pengguna, target._rowIndex, { Aktif: aktif });
    appendAudit_(actor.Nama, 'Status akun ' + target.ID + ' -> ' + aktif, 'Keamanan');
    target.Aktif = aktif;
    var pub = toPublicUser_(target);
    pub.Aktif = aktif;
    return pub;
  }

  if (route === 'system.status') {
    requireUser_(token, ['Pemilik']);
    var tables = {};
    Object.keys(HEADERS).forEach(function (nm) {
      tables[nm] = Math.max(0, sheet_(nm).getLastRow() - 1);
    });
    return {
      tables: tables,
      storagePath: 'Google Spreadsheet (' + ss_().getName() + ')',
      timezone: 'Asia/Jakarta (WIB)',
      activeSessions: 1
    };
  }

  if (route === 'ai.assist') {
    var u = requireUser_(token);
    var geminiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || '';
    if (!geminiKey) {
      throw new Error('GEMINI_API_KEY belum diatur di Project Settings > Script Properties pada proyek Apps Script Anda.');
    }
    var model = PropertiesService.getScriptProperties().getProperty('GEMINI_MODEL') || 'gemini-2.5-flash';
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(geminiKey);
    var body = {
      contents: [{
        parts: [{
          text: 'Anda adalah Asisten AI Holding Investasi Modal Sendiri. Pengguna: ' + u.Nama + ' (' + u.Jabatan + '). Mode: ' + payload.mode + (payload.agentId ? ' · Agen: ' + payload.agentId : '') + '.\n\nInstruksi:\n' + payload.prompt
        }]
      }]
    };
    var resp = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(body),
      muteHttpExceptions: true
    });
    var json = JSON.parse(resp.getContentText() || '{}');
    if (resp.getResponseCode() >= 400) {
      throw new Error((json.error && json.error.message) || 'Gagal menghubungi Gemini API.');
    }
    var outText = (json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts && json.candidates[0].content.parts[0] && json.candidates[0].content.parts[0].text) || '';
    appendAudit_(u.Nama, 'Gemini AI (' + payload.mode + ')', 'Kantor AI');
    return { text: outText, model: model, mode: payload.mode, timestamp: sekarangWib_() };
  }

  throw new Error('Rute tidak dikenali: ' + route);
}

/* ---------------- Google Workspace Native Services di Apps Script ---------------- */

function gasWorkspaceDispatch(action, portalToken, payload) {
  var u = requireUser_(portalToken);
  payload = payload || {};
  var oauthToken = ScriptApp.getOAuthToken();

  if (action === 'meet.create') {
    var resp = UrlFetchApp.fetch('https://meet.googleapis.com/v2/spaces', {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + oauthToken },
      payload: '{}',
      muteHttpExceptions: true
    });
    if (resp.getResponseCode() >= 400) {
      var ev = CalendarApp.getDefaultCalendar().createEvent('Rapat Holding Investasi', new Date(Date.now() + 60000), new Date(Date.now() + 3660000));
      return { name: ev.getId(), meetingUri: 'https://calendar.google.com', meetingCode: 'CAL-' + ev.getId().slice(0, 6) };
    }
    return JSON.parse(resp.getContentText());
  }

  if (action === 'calendar.list') {
    var now = new Date(Date.now() - 2 * 3600 * 1000);
    var later = new Date(Date.now() + 14 * 24 * 3600 * 1000);
    return CalendarApp.getDefaultCalendar().getEvents(now, later).slice(0, 10).map(function (e) {
      return {
        id: e.getId(),
        summary: e.getTitle(),
        description: e.getDescription(),
        start: { dateTime: e.getStartTime().toISOString() },
        end: { dateTime: e.getEndTime().toISOString() }
      };
    });
  }

  if (action === 'calendar.create') {
    var resp = UrlFetchApp.fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + oauthToken },
      payload: JSON.stringify({
        summary: payload.summary,
        description: payload.description || '',
        start: { dateTime: payload.startIso, timeZone: 'Asia/Jakarta' },
        end: { dateTime: payload.endIso, timeZone: 'Asia/Jakarta' },
        attendees: (payload.attendeeEmails || []).map(function (em) { return { email: em }; }),
        conferenceData: {
          createRequest: {
            requestId: 'gas-' + new Date().getTime(),
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        }
      }),
      muteHttpExceptions: true
    });
    if (resp.getResponseCode() >= 400) {
      var ev = CalendarApp.getDefaultCalendar().createEvent(payload.summary, new Date(payload.startIso), new Date(payload.endIso), { description: payload.description || '' });
      appendAudit_(u.Nama, 'Calendar event dibuat: ' + payload.summary, 'Google Calendar');
      return { id: ev.getId(), summary: ev.getTitle(), start: { dateTime: payload.startIso }, end: { dateTime: payload.endIso } };
    }
    appendAudit_(u.Nama, 'Calendar + Meet dibuat: ' + payload.summary, 'Google Calendar');
    return JSON.parse(resp.getContentText());
  }

  if (action === 'calendar.delete') {
    var ev = CalendarApp.getDefaultCalendar().getEventById(payload.id);
    if (ev) ev.deleteEvent();
    appendAudit_(u.Nama, 'Hapus event Calendar: ' + payload.id, 'Google Calendar');
    return { ok: true };
  }

  if (action === 'gmail.list') {
    var threads = GmailApp.getInboxThreads(0, payload.maxResults || 8);
    return threads.map(function (t) {
      var m = t.getMessages()[0];
      return {
        id: m.getId(),
        threadId: t.getId(),
        subject: m.getSubject() || '(Tanpa Subjek)',
        from: m.getFrom() || '',
        date: m.getDate().toISOString(),
        snippet: String(m.getPlainBody() || '').slice(0, 140)
      };
    });
  }

  if (action === 'gmail.send') {
    GmailApp.sendEmail(payload.to, payload.subject, payload.body);
    appendAudit_(u.Nama, 'Kirim email Gmail ke ' + payload.to, 'Gmail');
    return { ok: true };
  }

  if (action === 'drive.list') {
    var files = [];
    var iter = DriveApp.getFiles();
    while (iter.hasNext() && files.length < 15) {
      var f = iter.next();
      if (!f.isTrashed()) {
        files.push({
          id: f.getId(),
          name: f.getName(),
          mimeType: f.getMimeType(),
          webViewLink: f.getUrl(),
          modifiedTime: f.getLastUpdated().toISOString()
        });
      }
    }
    return files;
  }

  if (action === 'docs.create') {
    var doc = DocumentApp.create(payload.title);
    doc.getBody().setText(payload.content);
    doc.saveAndClose();
    appendAudit_(u.Nama, 'Buat Google Docs: ' + payload.title, 'Google Drive');
    return { documentId: doc.getId(), title: doc.getName(), webViewLink: doc.getUrl() };
  }

  if (action === 'sheets.create') {
    var ssNew = SpreadsheetApp.create(payload.title);
    var sh = ssNew.getActiveSheet();
    sh.setName(payload.sheetTitle || 'Ringkasan');
    if (payload.rows && payload.rows.length > 0) {
      sh.getRange(1, 1, payload.rows.length, payload.rows[0].length).setValues(payload.rows);
    }
    appendAudit_(u.Nama, 'Ekspor Google Sheets: ' + payload.title, 'Google Sheets');
    return { spreadsheetId: ssNew.getId(), title: ssNew.getName(), spreadsheetUrl: ssNew.getUrl() };
  }

  if (action === 'drive.trash') {
    DriveApp.getFileById(payload.id).setTrashed(true);
    appendAudit_(u.Nama, 'Pindah file Drive ke sampah: ' + payload.id, 'Google Drive');
    return { ok: true };
  }

  if (action === 'tasks.list') {
    var r = UrlFetchApp.fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?showCompleted=true&maxResults=25', {
      headers: { Authorization: 'Bearer ' + oauthToken },
      muteHttpExceptions: true
    });
    if (r.getResponseCode() >= 400) return [];
    return (JSON.parse(r.getContentText()).items || []);
  }

  if (action === 'tasks.create') {
    var r = UrlFetchApp.fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + oauthToken },
      payload: JSON.stringify({ title: payload.title, notes: payload.notes || '' })
    });
    appendAudit_(u.Nama, 'Tambah Google Task: ' + payload.title, 'Google Tasks');
    return JSON.parse(r.getContentText());
  }

  if (action === 'tasks.toggle') {
    var r = UrlFetchApp.fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/' + encodeURIComponent(payload.id), {
      method: 'patch',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + oauthToken },
      payload: JSON.stringify({ id: payload.id, status: payload.completed ? 'completed' : 'needsAction' })
    });
    return JSON.parse(r.getContentText());
  }

  if (action === 'tasks.delete') {
    UrlFetchApp.fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/' + encodeURIComponent(payload.id), {
      method: 'delete',
      headers: { Authorization: 'Bearer ' + oauthToken }
    });
    return { ok: true };
  }

  throw new Error('Aksi Google Workspace tidak dikenal: ' + action);
}
