import type { TugasItem } from '../types.ts';

const LIST: ReadonlyArray<readonly [string, string, string, string]> = [
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
  ['Tata Kelola Grup & Multi-Entitas (7 PT/SPV)', 'Pengembangan portal/Apps Script & negosiasi strategis co-investor/bank/regulator', 'Remote', 'CTO S7 + Direksi'],
];

/**
 * Seed 39 tugas operasional (TGS-001..TGS-039). Sama dengan buildSeedTugasRows_() di Code.gs.
 */
export function buildOperationalTaskSeed(): TugasItem[] {
  return LIST.map((row, idx) => {
    const num = idx + 1;
    const pad = num < 10 ? `00${num}` : num < 100 ? `0${num}` : String(num);
    return {
      ID: `TGS-${pad}`,
      Kategori: row[0],
      Tugas: row[1],
      Pengerja: row[2],
      Eksekutor: row[3],
      Status: 'Belum' as const,
    };
  });
}
