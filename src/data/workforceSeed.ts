import type { UserTier, WorkforceCategory } from '../types.ts';

export interface WorkforceSeedRecord {
  ID: string;
  Nama: string;
  Jabatan: string;
  Unit: string;
  Tier: UserTier;
  Email: string;
  Aktif: 'YA' | 'TIDAK';
  Fase?: 1 | 2 | 3;
  StatusKepegawaian?: WorkforceCategory;
}

interface UnitDef {
  code: string;
  nama: string;
  fte: readonly [number, number, number];
  kepala: string;
}

const UNITS: readonly UnitDef[] = [
  { code: 'D1', nama: 'Kas & Pendapatan Tetap', fte: [2, 4, 8], kepala: 'Head of Fixed Income & Treasury' },
  { code: 'D2', nama: 'Ekuitas Publik', fte: [1, 3, 5], kepala: 'Head of Public Equity' },
  { code: 'D3', nama: 'Seleksi Reksa Dana & ETF', fte: [1, 2, 3], kepala: 'Head of Manager Research' },
  { code: 'D4', nama: 'Valas, Komoditas & Derivatif', fte: [1, 2, 5], kepala: 'Head of Macro & Derivatives' },
  { code: 'D5', nama: 'Kripto & Aset Digital Trading', fte: [1, 2, 4], kepala: 'Head of Digital Assets' },
  { code: 'D6', nama: 'Bisnis Digital & Kekayaan Intelektual', fte: [1, 3, 6], kepala: 'Head of Digital & IP Assets' },
  { code: 'D7', nama: 'Properti & Tanah', fte: [2, 5, 12], kepala: 'Head of Real Estate' },
  { code: 'D8', nama: 'Aset Fisik Produktif', fte: [2, 6, 14], kepala: 'Head of Productive Assets' },
  { code: 'D9', nama: 'Agrikultur & Alam', fte: [1, 2, 6], kepala: 'Head of Agri & Natural Assets' },
  { code: 'D10', nama: 'Koleksi & Aset Gaya Hidup', fte: [1, 2, 4], kepala: 'Head of Collectibles' },
  { code: 'D11', nama: 'Asuransi & Pensiun', fte: [0, 1, 2], kepala: 'Head of Protection & Retirement' },
  { code: 'D12', nama: 'Bisnis & Usaha Langsung', fte: [1, 2, 6], kepala: 'Head of Direct Business' },
  { code: 'S1', nama: 'CIO Office & Investment Committee', fte: [1, 2, 4], kepala: 'Direktur Utama' },
  { code: 'S2', nama: 'Risk, Compliance & APU-PPT', fte: [1, 4, 8], kepala: 'Head of Compliance & Risk' },
  { code: 'S3', nama: 'Finance, Tax & Accounting', fte: [1, 4, 9], kepala: 'Finance & Tax Lead' },
  { code: 'S4', nama: 'Operations, Settlement & Custody', fte: [1, 4, 9], kepala: 'Head of Operations & Custody' },
  { code: 'S5', nama: 'Legal & Corporate Secretary', fte: [0, 2, 4], kepala: 'General Counsel & Corp Sec' },
  { code: 'S6', nama: 'People & Culture', fte: [0, 1, 4], kepala: 'Head of People & Culture' },
  { code: 'S7', nama: 'Technology, Data & AI Engineering', fte: [2, 5, 10], kepala: 'Head of Technology & AI' },
  { code: 'S8', nama: 'Capital & Stakeholder Relations', fte: [1, 2, 5], kepala: 'Head of Stakeholder Relations' },
  { code: 'S9', nama: 'Internal Audit', fte: [0, 1, 2], kepala: 'Head of Internal Audit' },
  { code: 'S10', nama: 'AI Operations Center (Kantor AI)', fte: [1, 3, 7], kepala: 'AI Operations Director' },
  { code: 'S11', nama: 'Business Development & Deal Sourcing', fte: [1, 2, 5], kepala: 'Head of Deal Sourcing' },
  { code: 'S12', nama: 'General Affairs, Fasilitas & Umum', fte: [3, 7, 14], kepala: 'GA Manager' },
];

const PRIMARY: Record<string, [string, string, string, UserTier, string]> = {
  D1: ['OWN1', 'Slamet Sugiono', 'Pemilik Utama & Investor', 'Pemilik', 'slametsugiono.studio@gmail.com'],
  S1: ['M1', 'Rangga Adhisurya', 'Direktur Utama', 'Pemilik', 'rangga.direksi@holding-investasi.id'],
  D2: ['M2', 'Kirana Prameswari', 'Head of Investment', 'Manajemen', 'kirana.investasi@holding-investasi.id'],
  D3: ['M3', 'Bimo Saputra', 'Dealer Saham & Obligasi', 'Staf', 'bimo.pasarmodal@holding-investasi.id'],
  D7: ['M4', 'Nadia Kusuma', 'Analis Properti & Aset Fisik', 'Staf', 'nadia.properti@holding-investasi.id'],
  S2: ['M5', 'Aditya Rahim', 'Compliance & Legal Officer', 'Manajemen', 'aditya.kepatuhan@holding-investasi.id'],
  S3: ['M6', 'Sari Handayani', 'Finance & Tax Lead', 'Manajemen', 'sari.keuangan@holding-investasi.id'],
  S12: ['M7', 'Yusuf Maulana', 'GA Manager', 'Manajemen', 'yusuf.ga@holding-investasi.id'],
};

const FIRST_NAMES = [
  'Bagus', 'Citra', 'Darma', 'Eka', 'Farhan', 'Gita', 'Hendra', 'Intan', 'Joko', 'Kartika',
  'Lutfi', 'Maya', 'Naufal', 'Olivia', 'Prasetya', 'Qori', 'Rama', 'Sinta', 'Taufik', 'Utami',
  'Vina', 'Wahyu', 'Yogi', 'Zahra', 'Andi', 'Bella', 'Cakra', 'Dewi', 'Erlangga', 'Fanny',
  'Galih', 'Hana', 'Ilham', 'Jasmine', 'Kevin', 'Laras', 'Mahendra', 'Nabila', 'Oki', 'Putri',
];

const LAST_NAMES = [
  'Wibowo', 'Nugroho', 'Santoso', 'Pratiwi', 'Kusumo', 'Hartono', 'Setiawan', 'Lestari',
  'Purnama', 'Gunawan', 'Permata', 'Halim', 'Suryadi', 'Wijaya', 'Hidayat', 'Kencana',
  'Siregar', 'Panggabean', 'Ramadhan', 'Mulyono', 'Subekti', 'Utomo', 'Sanjaya', 'Puspita',
];

const FREELANCERS: ReadonlyArray<readonly [string, string, string, string, string]> = [
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
  ['FL-11', 'Dody Kurniawan', 'Freelancer Teknisi MEP & Audit Aset', 'D8 · Aset Fisik Produktif (Proyek)', 'dody.teknisi@mitra.id'],
];

/**
 * Seed 170 akun: 156 Karyawan FTE (Fase 1=26, Fase 2=71, Fase 3=156)
 * + 12 Freelancer Proyek + 2 Eksternal. Sama dengan buildSeedUsers_() di Code.gs.
 */
export function buildWorkforceSeed(): WorkforceSeedRecord[] {
  const rows: WorkforceSeedRecord[] = [];
  let seq = 0;

  for (const u of UNITS) {
    const [f1, f2, f3] = u.fte;
    const unitLabel = `${u.code} · ${u.nama}`;
    for (let seat = 1; seat <= f3; seat++) {
      const fase = (seat <= f1 ? 1 : seat <= f2 ? 2 : 3) as 1 | 2 | 3;
      if (seat === 1 && PRIMARY[u.code]) {
        const [id, nama, jabatan, tier, email] = PRIMARY[u.code];
        rows.push({
          ID: id,
          Nama: nama,
          Jabatan: jabatan,
          Unit: unitLabel,
          Tier: tier,
          Email: email,
          Aktif: 'YA',
          Fase: fase,
          StatusKepegawaian: 'Karyawan FTE',
        });
        continue;
      }
      const fn = FIRST_NAMES[seq % FIRST_NAMES.length];
      const ln = LAST_NAMES[(Math.floor(seq / FIRST_NAMES.length) + seq * 3) % LAST_NAMES.length];
      seq += 1;
      const tier: UserTier = seat === 1 ? 'Manajemen' : 'Staf';
      const jabatan = seat === 1 ? u.kepala || `Lead ${u.nama}` : `Analis & Pelaksana ${u.nama}`;
      const pad = seat < 10 ? `0${seat}` : String(seat);
      rows.push({
        ID: `${u.code}-${pad}`,
        Nama: `${fn} ${ln}`,
        Jabatan: jabatan,
        Unit: unitLabel,
        Tier: tier,
        Email: `${u.code.toLowerCase()}.${pad}.${fn.toLowerCase()}@holding-investasi.id`,
        Aktif: 'YA',
        Fase: fase,
        StatusKepegawaian: 'Karyawan FTE',
      });
    }
  }

  for (const [id, nama, jabatan, unit, email] of FREELANCERS) {
    rows.push({
      ID: id,
      Nama: nama,
      Jabatan: jabatan,
      Unit: unit,
      Tier: 'Freelancer',
      Email: email,
      Aktif: 'YA',
      StatusKepegawaian: 'Freelancer',
    });
  }

  rows.push({
    ID: 'M8',
    Nama: 'KAP Wijaya & Rekan',
    Jabatan: 'Auditor Eksternal (Tamu)',
    Unit: 'Eksternal · Audit KAP',
    Tier: 'Auditor',
    Email: 'audit.wijaya@eksternal.id',
    Aktif: 'YA',
    StatusKepegawaian: 'Eksternal',
  });
  rows.push({
    ID: 'M9',
    Nama: 'PT Bersih Cemerlang',
    Jabatan: 'Vendor Fasilitas (Tamu)',
    Unit: 'Eksternal · Vendor',
    Tier: 'Tamu',
    Email: 'vendor.bersih@mitra.id',
    Aktif: 'YA',
    StatusKepegawaian: 'Eksternal',
  });

  return rows;
}
