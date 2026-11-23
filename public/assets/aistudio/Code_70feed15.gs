/**
 * Holding Investasi — Versi Google Apps Script (BUKAN pialang; modal sendiri)
 * Database: Google Spreadsheet. Antarmuka: HtmlService (Index.html).
 * Cara pasang & batasnya: baca README.md di folder ini.
 *
 * KEAMANAN: PIN disimpan sebagai hash SHA-256 (garam per pengguna).
 * Ini versi ringkas dari server utama — penjaga RAPID & kas ditegakkan di sini juga.
 */
var SHEET = {
  pengguna: 'Pengguna', tugas: 'Tugas', intake: 'Intake', keuangan: 'Keuangan',
  absen: 'Absen', dokumen: 'Dokumen', audit: 'Audit'
};
function ss_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID belum diisi — jalankan menu Holding > Siapkan Database dulu, atau isi lewat Project Settings > Script Properties.');
  return SpreadsheetApp.openById(id);
}
function sheet_(nama) { var s = ss_().getSheetByName(nama); if (!s) throw new Error('Sheet hilang: ' + nama + ' — jalankan Siapkan Database.'); return s; }
function baca(nama) { var v = sheet_(nama).getDataRange().getValues(); var head = v.shift(); return v.filter(function(r){ return r.join('') !== ''; }).map(function(r){ var o = {}; head.forEach(function(h,i){ o[h] = r[i]; }); o._baris = 0; return o; }); }
function bacaMentah(nama) { return sheet_(nama).getDataRange().getValues(); }
function tambah(nama, obj) { var s = sheet_(nama); var head = s.getRange(1,1,1,s.getLastColumn()).getValues()[0]; s.appendRow(head.map(function(h){ var v = obj[h]; return (v === undefined || v === null) ? '' : (Object.prototype.toString.call(v) === '[object Array]' || typeof v === 'object' ? JSON.stringify(v) : v); })); }
function perbarui(nama, indeksData, obj) { // indeksData 0-based mengikuti urutan baca()
  var s = sheet_(nama); var head = s.getRange(1,1,1,s.getLastColumn()).getValues()[0]; var baris = indeksData + 2;
  head.forEach(function(h,i){ if (obj[h] !== undefined) s.getRange(baris, i+1).setValue(typeof obj[h] === 'object' ? JSON.stringify(obj[h]) : obj[h]); });
}
function sekarang() { return Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss') + ' WIB'; }
function hashPin(pin, garam) { var d = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, garam + ':' + pin); return d.map(function(b){ return ('0' + (b & 0xff).toString(16)).slice(-2); }).join(''); }
function audit(who, aksi, modul) { tambah(SHEET.audit, { Waktu: sekarang(), Siapa: who, Aksi: aksi, Modul: modul }); }
function peringkat(u) { if (!u) return 0; if (/Komisaris|Direktur/i.test(u.Jabatan) || u.Tier === 'Pemilik') return 3; if (u.Tier === 'Manajemen') return 2; if (u.Tier === 'Staf') return 1; return 0; }
function jalurRapid(n) { n = +n || 0; if (n > 5e9) return { label: 'Direksi / Komisaris', rank: 3 }; if (n > 5e8) return { label: 'CIO', rank: 2 }; return { label: 'Desk Head', rank: 1 }; }

/* ---------------- penyiapan database (jalankan sekali dari editor) ---------------- */
function siapkanDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Buka file ini dari Spreadsheet (Extensions > Apps Script) agar database menempel otomatis, atau buat Spreadsheet lalu isi SPREADSHEET_ID.');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  var def = {};
  def[SHEET.pengguna] = ['ID','Nama','Jabatan','Unit','Tier','Garam','PinHash','Aktif'];
  def[SHEET.tugas] = ['Kategori','Tugas','Pengerja','Eksekutor','Status'];
  def[SHEET.intake] = ['ID','Judul','Kategori','Nilai','Unit','Pengaju','Status','Riwayat'];
  def[SHEET.keuangan] = ['ID','Tanggal','Jenis','Kategori','Nominal','Keterangan','Oleh','Status','Rekonsiliasi'];
  def[SHEET.absen] = ['ID','Tanggal','Jam','Nama','Jenis','Lokasi','StatusVerifikasi'];
  def[SHEET.dokumen] = ['ID','Judul','Jenis','Oleh','Isi','Tanggal'];
  def[SHEET.audit] = ['Waktu','Siapa','Aksi','Modul'];
  Object.keys(def).forEach(function(nama) {
    var s = ss.getSheetByName(nama) || ss.insertSheet(nama);
    if (s.getLastRow() === 0) s.appendRow(def[nama]);
  });
  var contohPengguna = [
    ['M1','Rangga Adhisurya','Direktur Utama','D1 Direksi','Pemilik','1111'],
    ['M2','Kirana Prameswari','Head of Investment','D2 Investasi','Manajemen','2222'],
    ['M3','Bimo Saputra','Staf','D3 Pasar Modal','Staf','3333'],
    ['M7','Yusuf Maulana','GA Manager','S12 GA','Manajemen','7777'],
    ['M8','KAP Wijaya & Rekan','Auditor Eksternal (tamu)','Tamu','Auditor','8888'],
    ['M9','PT Bersih Cemerlang','Vendor (tamu)','Tamu','Tamu','9999'],
    ['M10','Dimas Prasetyo (contoh)','Freelancer proyek','Proyek D6','Freelancer','1010']
  ];
  var ada = baca(SHEET.pengguna).length;
  if (!ada) contohPengguna.forEach(function(u) { var g = Utilities.getUuid().slice(0,8); tambah(SHEET.pengguna, { ID: u[0], Nama: u[1], Jabatan: u[2], Unit: u[3], Tier: u[4], Garam: g, PinHash: hashPin(u[5], g), Aktif: 'YA' }); });
  if (!baca(SHEET.tugas).length) [['Fasilitas','Membuka kantor & cek fasilitas','On-site','Office Boy','Belum'],['Investasi','Menyusun memo investasi','AI','AG-02','Belum'],['Keuangan','Rekonsiliasi bank bulanan','AI','AG-14','Belum']].forEach(function(t){ tambah(SHEET.tugas, { Kategori:t[0], Tugas:t[1], Pengerja:t[2], Eksekutor:t[3], Status:t[4] }); });
  audit('SISTEM', 'Database disiapkan', 'Sistem');
  return 'Database siap di spreadsheet ini. PIN contoh sama seperti server utama (WAJIB diganti untuk produksi).';
}

/* ---------------- web app ---------------- */
function doGet() { return HtmlService.createHtmlOutputFromFile('Index').setTitle('Holding Investasi — Apps Script').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); }
function sesi_(token) { if (!token) return null; var mentah = CacheService.getScriptCache().get('sesi_' + token); if (!mentah) return null; var id = JSON.parse(mentah).id; var u = baca(SHEET.pengguna).filter(function(x){ return x.ID === id; })[0]; return (u && u.Aktif === 'YA') ? u : null; }
function wajib(token, tiers) { var u = sesi_(token); if (!u) throw new Error('Belum masuk / sesi berakhir. Login lagi.'); if (tiers && tiers.indexOf(u.Tier) < 0) { audit(u.Nama, 'AKSES DITOLAK', 'Keamanan'); throw new Error('Akses ditolak untuk peran ' + u.Tier + ' (dicatat).'); } return u; }
function publik(u) { return { ID: u.ID, Nama: u.Nama, Jabatan: u.Jabatan, Unit: u.Unit, Tier: u.Tier }; }

function login(id, pin) {
  var u = baca(SHEET.pengguna).filter(function(x){ return String(x.ID).toUpperCase() === String(id || '').toUpperCase(); })[0];
  if (!u || u.Aktif !== 'YA' || hashPin(String(pin || ''), u.Garam) !== u.PinHash) { audit(String(id || '?'), 'LOGIN GAGAL', 'Keamanan'); throw new Error('ID atau PIN salah.'); }
  var token = Utilities.getUuid().replace(/-/g, '');
  CacheService.getScriptCache().put('sesi_' + token, JSON.stringify({ id: u.ID }), 60 * 60 * 6);
  audit(u.Nama, 'Login berhasil', 'Autentikasi');
  return { token: token, user: publik(u) };
}
function getDashboard(token) { wajib(token); var keu = baca(SHEET.keuangan); var saldo = keu.reduce(function(a,x){ return a + (x.Jenis === 'Masuk' ? +x.Nominal || 0 : -(+x.Nominal || 0)); }, 0); return { antrean: baca(SHEET.intake).filter(function(x){ return ['Masuk','Direview','Perlu Info'].indexOf(x.Status) >= 0; }).length, tugasSelesai: baca(SHEET.tugas).filter(function(x){ return x.Status === 'Selesai'; }).length, totalTugas: baca(SHEET.tugas).length, saldoKas: saldo, dokumen: baca(SHEET.dokumen).length, auditTerakhir: baca(SHEET.audit).slice(-8).reverse() }; }
function listIntake(token) { wajib(token); return baca(SHEET.intake).reverse(); }
function buatIntake(token, data) { var u = wajib(token, ['Pemilik','Manajemen','Staf','Freelancer']); if (!data.judul) throw new Error('Judul wajib.'); var x = { ID: 'INT-' + new Date().getTime().toString(36).toUpperCase(), Judul: data.judul, Kategori: data.kategori || 'Operasional', Nilai: +data.nilai || 0, Unit: data.unit || u.Unit, Pengaju: u.Nama, Status: 'Masuk', Riwayat: sekarang() + ' dibuat ' + u.Nama }; tambah(SHEET.intake, x); audit(u.Nama, 'Intake ' + x.ID, 'Intake'); return x; }
function aksiIntake(token, id, aksi) { var u = wajib(token); var list = baca(SHEET.intake); var idx = -1; list.forEach(function(x,i){ if (x.ID === id) idx = i; }); if (idx < 0) throw new Error('Tidak ditemukan.'); var x = list[idx]; if (aksi === 'Disetujui') { var j = jalurRapid(x.Nilai); if (peringkat(u) < j.rank) { audit(u.Nama, 'PERCOBAAN setujui di luar wewenang ' + id, 'Intake'); throw new Error('Ditolak: nilai ini wajib ' + j.label + '.'); } } perbarui(SHEET.intake, idx, { Status: aksi, Riwayat: String(x.Riwayat || '') + ' | ' + sekarang() + ' ' + u.Nama + ' -> ' + aksi }); audit(u.Nama, 'Intake ' + id + ' -> ' + aksi, 'Intake'); return true; }
function listKeuangan(token) { wajib(token, ['Pemilik','Manajemen','Staf','Auditor']); return baca(SHEET.keuangan).reverse(); }
function tambahKeuangan(token, data) { var u = wajib(token, ['Pemilik','Manajemen','Staf']); if (!(+data.nominal > 0)) throw new Error('Nominal harus > 0.'); if (data.jenis === 'Keluar' && +data.nominal > 1e8 && peringkat(u) < 3) { audit(u.Nama, 'PERCOBAAN pengeluaran besar', 'Keuangan'); throw new Error('Ditolak: pengeluaran > Rp100 juta wajib Direktur.'); } var x = { ID: 'KAS-' + new Date().getTime().toString(36).toUpperCase(), Tanggal: data.tanggal || sekarang().slice(0,10), Jenis: data.jenis, Kategori: data.kategori || '', Nominal: +data.nominal, Keterangan: data.keterangan || '', Oleh: u.Nama, Status: 'Draft', Rekonsiliasi: 'Belum' }; tambah(SHEET.keuangan, x); audit(u.Nama, 'Kas ' + x.ID + ' ' + x.Jenis, 'Keuangan'); return x; }
function listTugas(token) { wajib(token, ['Pemilik','Manajemen','Staf','Freelancer']); return baca(SHEET.tugas); }
function ubahTugas(token, indeks, status) { var u = wajib(token, ['Pemilik','Manajemen','Staf','Freelancer']); perbarui(SHEET.tugas, +indeks, { Status: status }); audit(u.Nama, 'Tugas #' + indeks + ' -> ' + status, 'Tugas'); return true; }
function absen(token, pin, jenis, lokasi) { var u = wajib(token, ['Pemilik','Manajemen','Staf']); if (hashPin(String(pin || ''), u.Garam) !== u.PinHash) { audit(u.Nama, 'PIN ABSEN SALAH', 'Absensi'); throw new Error('PIN salah — absen ditolak.'); } var x = { ID: 'ABS-' + new Date().getTime().toString(36).toUpperCase(), Tanggal: sekarang().slice(0,10), Jam: sekarang().slice(11,19), Nama: u.Nama, Jenis: jenis === 'out' ? 'out' : 'in', Lokasi: lokasi || '-', StatusVerifikasi: 'menunggu-verifikasi-atasan' }; tambah(SHEET.absen, x); audit(u.Nama, 'Absen ' + x.Jenis, 'Absensi'); return x; }
function listAudit(token) { wajib(token, ['Pemilik','Manajemen','Auditor']); return baca(SHEET.audit).slice(-100).reverse(); }

/* ===== HELPER ADMIN — jalankan manual dari editor Apps Script =====
   Cara pakai: pilih nama fungsi di menu Run editor, klik Run.
   - cekInstalasi()      : memeriksa semua sheet & jumlah data.
   - gantiPinPengguna()  : GANTI PIN akun contoh sebelum go-live.
     Ubah dulu nilai di bawah, lalu Run. Jangan simpan PIN asli
     sebagai teks biasa di berkas ini setelah selesai mengganti. */
function cekInstalasi() {
  var hasil = {};
  Object.keys(SHEET).forEach(function(k){ var nm = SHEET[k]; var sh = ss_().getSheetByName(nm); hasil[nm] = sh ? Math.max(0, sh.getLastRow() - 1) + ' baris data' : 'HILANG — jalankan siapkanDatabase()'; });
  Logger.log(JSON.stringify(hasil, null, 2));
  return hasil;
}
function gantiPinPengguna() {
  var ID_PENGGUNA = 'M1';        // << ganti: ID akun yang mau diganti PIN-nya
  var PIN_BARU    = 'GANTI-SAYA'; // << ganti sementara, Run, lalu kembalikan teks ini
  if (PIN_BARU === 'GANTI-SAYA') throw new Error('Isi PIN_BARU dulu (jangan pakai teks contoh).');
  var list = baca(SHEET.pengguna); var idx = -1;
  list.forEach(function(x, i){ if (x.ID === ID_PENGGUNA) idx = i; });
  if (idx < 0) throw new Error('Pengguna tidak ditemukan: ' + ID_PENGGUNA);
  var garam = Utilities.getUuid().replace(/-/g, '').slice(0, 16);
  perbarui(SHEET.pengguna, idx, { Garam: garam, PinHash: hashPin(String(PIN_BARU), garam) });
  audit(ID_PENGGUNA, 'PIN diganti via editor oleh pemilik proyek', 'Keamanan');
  Logger.log('PIN ' + ID_PENGGUNA + ' berhasil diganti. Kembalikan PIN_BARU ke teks contoh sekarang.');
  return true;
}
