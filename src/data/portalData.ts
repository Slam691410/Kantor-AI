/**
 * Data portal statis Holding Investasi.
 * Sumber: portal-penuh-v2 (D) — 12 desk, 12 fungsi pendukung, 14 kelas aset,
 * 7 entitas, 18 agen AI, 94 tugas, 15 alih daya, 6 skenario, dan office layout 3 lantai.
 * Desk/support diperkaya dengan tujuan, tugas, mode, gaji, agen pendamping, dan daftar jabatan.
 */

export interface UnitRecord {
  code: string;
  kind: string;
  nama: string;
  lingkup: string;
  fte: readonly number[];
  kepala: string;
  tujuan: string;
  tugas: readonly string[];
  mode: string;
  gaji: string;
  agents: readonly string[];
  jabatan: readonly string[];
  jumlah: number;
}

export interface KelasRecord {
  kode: string;
  nama: string;
  jumlah: number;
  desk: readonly string[];
  ai: number;
  rm: number;
  of: number;
  contoh: readonly string[];
}

export interface EntitasRecord {
  peran: string;
  nama: string;
  kbli: string;
  fungsi: string;
  izin: string;
}

export interface AgentRecord {
  id: string;
  nama: string;
  ruang: string;
  misi: string;
  proses: readonly string[];
  input: string;
  output: string;
  ot: string;
  sla: string;
  tools: string;
  guard: string;
  owner: string;
  eskalasi: string;
  kpi: string;
  fail: string;
}

export type TaskTuple = readonly [string, string, string, string, string, string, string];
export type OutsourceTuple = readonly [string, string, string, string];
export type ScenarioStep = readonly [string, string, string] | readonly [string, string, string, string];

export interface ScenarioRecord {
  k: string;
  label: string;
  steps: readonly ScenarioStep[];
}

export interface OfficeMember {
  id: string;
  nama: string;
  jabatan: string;
  unit: string;
  tier: string;
  warna: string;
  ruang: string;
  akses: readonly string[];
  tugas: ReadonlyArray<readonly [string, string, string, string]>;
}

export interface OfficeLayoutFloor {
  nama: string;
  sub: string;
  rooms: ReadonlyArray<{ k: string; n: string; x: number; y: number; w: number; d: number; f: string; type: string }>;
  furn: ReadonlyArray<readonly [number, number, number, number, number, string]>;
  seats?: ReadonlyArray<{ x: number; y: number; i?: number }>;
  meet?: ReadonlyArray<{ x: number; y: number }>;
  pantry?: ReadonlyArray<{ x: number; y: number }>;
  lobby?: ReadonlyArray<{ x: number; y: number }>;
}

export interface OfficeLayoutPerson {
  id: string;
  nama: string;
  warna: string;
  jabatan: string;
  unit: string;
  floor: number;
  seat: { x: number; y: number; i?: number };
  kind: string;
  guest?: boolean;
}

export interface OfficeLayoutAgent {
  id: string;
  nama: string;
  floor: number;
  seat: { x: number; y: number };
}

export interface OfficeLayoutStaff {
  id: string;
  nama: string;
  warna: string;
  floor: number;
  cycle: number;
  route: ReadonlyArray<readonly [number, number]>;
  cap?: boolean;
}

export interface OfficeLayout {
  floors: readonly OfficeLayoutFloor[];
  people: readonly OfficeLayoutPerson[];
  agents: readonly OfficeLayoutAgent[];
  staff: readonly OfficeLayoutStaff[];
}

export interface OfficeData {
  members: readonly OfficeMember[];
  meets: ReadonlyArray<readonly [string, string, number, number, string, readonly string[], string]>;
  letters: ReadonlyArray<readonly [string, string, string, string, string, string, string]>;
  projects: ReadonlyArray<readonly [string, string, string, string, string]>;
  chats: Record<string, ReadonlyArray<readonly [string, string, number]>>;
  kanal: ReadonlyArray<readonly [string, string]>;
  label: Record<string, string>;
  tamu: ReadonlyArray<readonly [string, string, string, string, string, string, string]>;
  cuti: ReadonlyArray<readonly [string, string, string, string, string, string, string]>;
  saldo: Record<string, number>;
  tiket: ReadonlyArray<readonly [string, string, string, string, string, string, string]>;
  peng: ReadonlyArray<readonly [string, string, string, string, string, string]>;
  arsip: ReadonlyArray<readonly [string, string, string, string, string, string]>;
  poll: { tanya: string; opsi: ReadonlyArray<readonly [string, number]>; voted: readonly string[] };
  ttd: ReadonlyArray<readonly [string, string, string, string, string]>;
  shift: ReadonlyArray<readonly [string, string, string]>;
  absen: Record<string, readonly [number | null, number | null]>;
  layout: OfficeLayout;
}

export interface PortalData {
  desks: readonly UnitRecord[];
  support: readonly UnitRecord[];
  kelas: readonly KelasRecord[];
  entitas: readonly EntitasRecord[];
  agents: readonly AgentRecord[];
  tasks: readonly TaskTuple[];
  outsource: readonly OutsourceTuple[];
  total_aset: number;
  scenarios: readonly ScenarioRecord[];
  office: OfficeData;
}

export const PORTAL_DATA: PortalData = {
  "desks": [
    {
      "code": "D1",
      "kind": "desk",
      "nama": "Kas & Pendapatan Tetap",
      "lingkup": "A, B",
      "fte": [
        2,
        4,
        8
      ],
      "kepala": "Head of Fixed Income & Treasury",
      "tujuan": "Mengelola kas, deposito, dan pendapatan tetap agar likuiditas selalu aman dan yield optimal.",
      "tugas": [
        "Memantau jatuh tempo deposito dan jadwal kupon obligasi",
        "Negosiasi special rate dengan treasury bank",
        "Menjaga rasio likuiditas minimum 15% modal kerja"
      ],
      "mode": "Hybrid — AI 65% · Remote 30% · Kantor 5%",
      "gaji": "Rp35–55 jt/bln",
      "agents": [
        "AG-05",
        "AG-14",
        "AG-12"
      ],
      "jabatan": [
        "Head of Fixed Income & Treasury",
        "Fixed Income Analyst",
        "Treasury Dealer"
      ],
      "jumlah": 3
    },
    {
      "code": "D2",
      "kind": "desk",
      "nama": "Ekuitas Publik",
      "lingkup": "C",
      "fte": [
        1,
        3,
        5
      ],
      "kepala": "Head of Public Equity",
      "tujuan": "Membangun portofolio ekuitas publik blue-chip dengan disiplin valuasi dan batas konsentrasi.",
      "tugas": [
        "Screening saham IDX dan global sesuai tesis investasi",
        "Menetapkan limit order dan eksekusi rebalancing",
        "Audit overlap dengan reksa dana/ETF"
      ],
      "mode": "Hybrid — AI 65% · Remote 30% · Kantor 5%",
      "gaji": "Rp35–55 jt/bln",
      "agents": [
        "AG-02",
        "AG-05",
        "AG-12"
      ],
      "jabatan": [
        "Head of Public Equity",
        "Equity Analyst",
        "Dealer Saham"
      ],
      "jumlah": 3
    },
    {
      "code": "D3",
      "kind": "desk",
      "nama": "Seleksi Reksa Dana & ETF",
      "lingkup": "D",
      "fte": [
        1,
        2,
        3
      ],
      "kepala": "Head of Manager Research",
      "tujuan": "Memilih manajer investasi dan ETF terbaik melalui riset kuantitatif dan kualitatif.",
      "tugas": [
        "Riset manajer dan produk reksa dana/ETF",
        "Evaluasi tracking error dan biaya",
        "Rekomendasi alokasi kolektif ke CIO"
      ],
      "mode": "Hybrid — AI 65% · Remote 30% · Kantor 5%",
      "gaji": "Rp30–48 jt/bln",
      "agents": [
        "AG-02",
        "AG-12"
      ],
      "jabatan": [
        "Head of Manager Research",
        "Fund Analyst",
        "ETF Specialist"
      ],
      "jumlah": 3
    },
    {
      "code": "D4",
      "kind": "desk",
      "nama": "Valas, Komoditas & Derivatif",
      "lingkup": "E, N-01..N-06",
      "fte": [
        1,
        2,
        5
      ],
      "kepala": "Head of Macro & Derivatives",
      "tujuan": "Mengelola eksposur valas, komoditas, dan derivatif dengan stress test harian.",
      "tugas": [
        "Memantau kurs spot dan spread emas",
        "Keputusan hedging valas",
        "Stress test limit 3% harian"
      ],
      "mode": "Hybrid — AI 43% · Remote 20% · Kantor 37%",
      "gaji": "Rp35–55 jt/bln",
      "agents": [
        "AG-04",
        "AG-05",
        "AG-13"
      ],
      "jabatan": [
        "Head of Macro & Derivatives",
        "FX Trader",
        "Commodity Analyst"
      ],
      "jumlah": 3
    },
    {
      "code": "D5",
      "kind": "desk",
      "nama": "Kripto & Aset Digital Trading",
      "lingkup": "F-01..F-10",
      "fte": [
        1,
        2,
        4
      ],
      "kepala": "Head of Digital Assets",
      "tujuan": "Trading kripto dan aset digital dengan kustodi multi-sig dan pemantauan on-chain 24/7.",
      "tugas": [
        "Awasi dompet on-chain dan health factor DeFi",
        "Hitung PPh 22 0,21% atas transaksi",
        "Uji pemulihan seed phrase berkala"
      ],
      "mode": "Hybrid — AI 68% · Remote 26% · Kantor 6%",
      "gaji": "Rp35–55 jt/bln",
      "agents": [
        "AG-10",
        "AG-14"
      ],
      "jabatan": [
        "Head of Digital Assets",
        "Crypto Trader",
        "On-chain Analyst"
      ],
      "jumlah": 3
    },
    {
      "code": "D6",
      "kind": "desk",
      "nama": "Bisnis Digital & Kekayaan Intelektual",
      "lingkup": "F-11..F-20, L",
      "fte": [
        1,
        3,
        6
      ],
      "kepala": "Head of Digital & IP Assets",
      "tujuan": "Mengelola bisnis digital, SaaS, dan kekayaan intelektual untuk pendapatan berulang.",
      "tugas": [
        "Audit traffic SaaS, MRR, dan churn",
        "Rekonsiliasi royalti dan lisensi HKI",
        "Alert perpanjangan domain dan HKI"
      ],
      "mode": "Hybrid — AI 55% · Remote 40% · Kantor 5%",
      "gaji": "Rp30–48 jt/bln",
      "agents": [
        "AG-11",
        "AG-17",
        "AG-13"
      ],
      "jabatan": [
        "Head of Digital & IP Assets",
        "SaaS Product Analyst",
        "IP Licensing Specialist",
        "Content Strategist"
      ],
      "jumlah": 4
    },
    {
      "code": "D7",
      "kind": "desk",
      "nama": "Properti & Tanah",
      "lingkup": "G",
      "fte": [
        2,
        5,
        12
      ],
      "kepala": "Head of Real Estate",
      "tujuan": "Akuisisi dan pengelolaan properti serta tanah dengan yield sewa optimal.",
      "tugas": [
        "Survei lokasi dan cek sertifikat BPN/PPAT",
        "Penagihan sewa otomatis dan pengingat kontrak H-60",
        "Pengawasan renovasi dan patok tanah"
      ],
      "mode": "Hybrid — AI 40% · Remote 25% · Kantor 35%",
      "gaji": "Rp30–48 jt/bln",
      "agents": [
        "AG-06",
        "AG-04",
        "AG-03"
      ],
      "jabatan": [
        "Head of Real Estate",
        "Property Acquisition Analyst",
        "Site Officer",
        "Leasing Officer"
      ],
      "jumlah": 4
    },
    {
      "code": "D8",
      "kind": "desk",
      "nama": "Aset Fisik Produktif",
      "lingkup": "H",
      "fte": [
        2,
        6,
        14
      ],
      "kepala": "Head of Productive Assets",
      "tujuan": "Mengoperasikan aset fisik produktif (vending, alat berat, tower) dengan telemetri IoT.",
      "tugas": [
        "Pantau telemetri IoT mesin dan vending",
        "Restock dan perbaikan lapangan",
        "Pengurusan izin laik operasi SIA/SILO"
      ],
      "mode": "Hybrid — AI 25% · Remote 15% · Kantor 60%",
      "gaji": "Rp28–45 jt/bln",
      "agents": [
        "AG-07",
        "AG-14"
      ],
      "jabatan": [
        "Head of Productive Assets",
        "Field Ops Manager",
        "Technician MEP",
        "IoT Monitoring Analyst"
      ],
      "jumlah": 4
    },
    {
      "code": "D9",
      "kind": "desk",
      "nama": "Agrikultur & Alam",
      "lingkup": "I",
      "fte": [
        1,
        2,
        6
      ],
      "kepala": "Head of Agri & Natural Assets",
      "tujuan": "Mengelola agrikultur dan aset alam dengan proyeksi panen dan bagi hasil petani.",
      "tugas": [
        "Proyeksi cuaca/panen berbasis satelit",
        "Deteksi dini hama dan penyakit",
        "Hitung bagi hasil petani/plasma"
      ],
      "mode": "Hybrid — AI 25% · Remote 15% · Kantor 60%",
      "gaji": "Rp28–45 jt/bln",
      "agents": [
        "AG-08",
        "AG-14"
      ],
      "jabatan": [
        "Head of Agri & Natural Assets",
        "Agronomist",
        "Field Coordinator"
      ],
      "jumlah": 3
    },
    {
      "code": "D10",
      "kind": "desk",
      "nama": "Koleksi & Aset Gaya Hidup",
      "lingkup": "J",
      "fte": [
        1,
        2,
        4
      ],
      "kepala": "Head of Collectibles",
      "tujuan": "Mengelola koleksi dan aset gaya hidup dengan autentikasi dan asuransi penuh.",
      "tugas": [
        "Pelacakan harga lelang global dan provenans",
        "Autentikasi fisik objek bernilai tinggi",
        "Jadwal perawatan dan climate control brankas"
      ],
      "mode": "Hybrid — AI 35% · Remote 30% · Kantor 35%",
      "gaji": "Rp28–45 jt/bln",
      "agents": [
        "AG-09",
        "AG-07",
        "AG-13"
      ],
      "jabatan": [
        "Head of Collectibles",
        "Curator",
        "Authenticator"
      ],
      "jumlah": 3
    },
    {
      "code": "D11",
      "kind": "desk",
      "nama": "Asuransi & Pensiun",
      "lingkup": "M",
      "fte": [
        0,
        1,
        2
      ],
      "kepala": "Head of Protection & Retirement",
      "tujuan": "Mengelola proteksi asuransi dan pensiun untuk direksi dan karyawan inti.",
      "tugas": [
        "Audit isi polis unit-link, jiwa, dan anuitas",
        "Evaluasi proteksi grup dan klaim besar",
        "Negosiasi retensi premi"
      ],
      "mode": "Hybrid — AI 65% · Remote 30% · Kantor 5%",
      "gaji": "Rp28–45 jt/bln",
      "agents": [
        "AG-13",
        "AG-14",
        "AG-12"
      ],
      "jabatan": [
        "Head of Protection & Retirement",
        "Insurance Analyst",
        "Pension Specialist"
      ],
      "jumlah": 3
    },
    {
      "code": "D12",
      "kind": "desk",
      "nama": "Bisnis & Usaha Langsung",
      "lingkup": "K",
      "fte": [
        1,
        2,
        6
      ],
      "kepala": "Head of Direct Business",
      "tujuan": "Mengelola bisnis langsung dan UMKM (franchise, klinik, patungan) hingga arus kas positif.",
      "tugas": [
        "Konsolidasi POS kasir harian dan deteksi selisih stok",
        "Pra-DD UMKM dan akuisisi bisnis berjalan",
        "Inspeksi SOP cabang dan kepatuhan izin"
      ],
      "mode": "Hybrid — AI 30% · Remote 15% · Kantor 55%",
      "gaji": "Rp28–45 jt/bln",
      "agents": [
        "AG-14",
        "AG-12",
        "AG-03"
      ],
      "jabatan": [
        "Head of Direct Business",
        "Business Development Analyst",
        "Operations Supervisor",
        "Finance Liaison"
      ],
      "jumlah": 4
    }
  ],
  "support": [
    {
      "code": "S1",
      "kind": "sup",
      "nama": "CIO Office & Investment Committee",
      "lingkup": "",
      "fte": [
        1,
        2,
        4
      ],
      "kepala": "Direktur Utama",
      "tujuan": "Menyusun kebijakan investasi dan keputusan alokasi modal di atas wewenang desk.",
      "tugas": [
        "Menyelenggarakan Investment Committee mingguan",
        "Menetapkan IPS dan batas risiko portofolio",
        "Menilai usulan di atas Rp500 juta"
      ],
      "mode": "Hybrid — Direksi · Remote untuk analisis, Kantor untuk keputusan",
      "gaji": "Rp60–120 jt/bln",
      "agents": [
        "AG-18",
        "AG-02"
      ],
      "jabatan": [
        "Chief Investment Officer",
        "Investment Committee Secretary",
        "Portfolio Analyst"
      ],
      "jumlah": 3
    },
    {
      "code": "S2",
      "kind": "sup",
      "nama": "Risk, Compliance & APU-PPT",
      "lingkup": "",
      "fte": [
        1,
        4,
        8
      ],
      "kepala": "Head of Compliance & Risk",
      "tujuan": "Menjaga kepatuhan POJK/PMK, APU-PPT, dan batas risiko seluruh holding.",
      "tugas": [
        "Memantau aturan baru dan screening PEP/sanksi",
        "Menjawab surat permintaan data regulator",
        "Audit kepatuhan transaksi harian"
      ],
      "mode": "Hybrid — AI 65% · Remote 30% · Kantor 5%",
      "gaji": "Rp35–55 jt/bln",
      "agents": [
        "AG-13",
        "AG-17"
      ],
      "jabatan": [
        "Head of Compliance & Risk",
        "Compliance Officer",
        "Legal Officer",
        "APU-PPT Analyst"
      ],
      "jumlah": 4
    },
    {
      "code": "S3",
      "kind": "sup",
      "nama": "Finance, Tax & Accounting",
      "lingkup": "",
      "fte": [
        1,
        4,
        9
      ],
      "kepala": "Finance & Tax Lead",
      "tujuan": "Mengelola keuangan, pajak, dan akuntansi grup 7 PT/SPV secara akurat dan tepat waktu.",
      "tugas": [
        "Jurnal harian dan rekonsiliasi bank",
        "Hitung dan setor PPh 21/23/final dan PPN",
        "Laporan keuangan dan konsolidasi bulanan"
      ],
      "mode": "Hybrid — AI 65% · Remote 30% · Kantor 5%",
      "gaji": "Rp35–55 jt/bln",
      "agents": [
        "AG-14",
        "AG-12"
      ],
      "jabatan": [
        "Finance & Tax Lead",
        "Accountant",
        "Tax Specialist",
        "Financial Controller"
      ],
      "jumlah": 4
    },
    {
      "code": "S4",
      "kind": "sup",
      "nama": "Operations, Settlement & Custody",
      "lingkup": "",
      "fte": [
        1,
        4,
        9
      ],
      "kepala": "Head of Operations & Custody",
      "tujuan": "Menjamin settlement, kustodi, dan pencatatan aset yang aman dan teraudit.",
      "tugas": [
        "Settlement order saham, obligasi, dan kripto",
        "Kustodi emas, sertifikat, dan dokumen berharga",
        "Rekonsiliasi kustodian harian"
      ],
      "mode": "Hybrid — AI 50% · Remote 20% · Kantor 30%",
      "gaji": "Rp30–48 jt/bln",
      "agents": [
        "AG-07",
        "AG-17"
      ],
      "jabatan": [
        "Head of Operations & Custody",
        "Settlement Officer",
        "Custodian",
        "Trade Support"
      ],
      "jumlah": 4
    },
    {
      "code": "S5",
      "kind": "sup",
      "nama": "Legal & Corporate Secretary",
      "lingkup": "",
      "fte": [
        0,
        2,
        4
      ],
      "kepala": "General Counsel & Corp Sec",
      "tujuan": "Mengelola akta, kontrak, dan corporate secretary grup secara tertib dan terdokumentasi.",
      "tugas": [
        "Penyelenggaraan RUPS dan notulen",
        "Pembaruan OSS/AHU dan perizinan",
        "Penyiapan PPJB, SPA, dan perjanjian vendor"
      ],
      "mode": "Hybrid — AI 55% · Remote 25% · Kantor 20%",
      "gaji": "Rp35–55 jt/bln",
      "agents": [
        "AG-17",
        "AG-13"
      ],
      "jabatan": [
        "General Counsel & Corp Sec",
        "Legal Staff",
        "Document Control"
      ],
      "jumlah": 3
    },
    {
      "code": "S6",
      "kind": "sup",
      "nama": "People & Culture",
      "lingkup": "",
      "fte": [
        0,
        1,
        4
      ],
      "kepala": "Head of People & Culture",
      "tujuan": "Mengelola people, culture, dan rekrutmen bertahap Fase 1–3 secara adil dan transparan.",
      "tugas": [
        "Rekrutmen dan onboarding karyawan FTE",
        "Penilaian KPI dan pelatihan kepatuhan/AI",
        "Penanganan disiplin dan hubungan industrial"
      ],
      "mode": "Hybrid — AI 55% · Remote 25% · Kantor 20%",
      "gaji": "Rp28–45 jt/bln",
      "agents": [
        "AG-16",
        "AG-18"
      ],
      "jabatan": [
        "Head of People & Culture",
        "HR Business Partner",
        "Recruiter"
      ],
      "jumlah": 3
    },
    {
      "code": "S7",
      "kind": "sup",
      "nama": "Technology, Data & AI Engineering",
      "lingkup": "",
      "fte": [
        2,
        5,
        10
      ],
      "kepala": "Head of Technology & AI",
      "tujuan": "Membangun teknologi, data, dan AI engineering untuk portal, otomasi, dan keamanan.",
      "tugas": [
        "Pengembangan portal dan Apps Script",
        "Pipeline data dan integrasi API",
        "Pentest dan monitoring server 24/7"
      ],
      "mode": "Hybrid — AI 60% · Remote 35% · Kantor 5%",
      "gaji": "Rp40–65 jt/bln",
      "agents": [
        "AG-18",
        "AG-11"
      ],
      "jabatan": [
        "Head of Technology & AI",
        "Backend Engineer",
        "Data Engineer",
        "AI Engineer"
      ],
      "jumlah": 4
    },
    {
      "code": "S8",
      "kind": "sup",
      "nama": "Capital & Stakeholder Relations",
      "lingkup": "",
      "fte": [
        1,
        2,
        5
      ],
      "kepala": "Head of Stakeholder Relations",
      "tujuan": "Mengelola hubungan pemegang saham, co-investor, bank, dan regulator.",
      "tugas": [
        "Investor update dan presentasi co-investor",
        "Negosiasi special rate bank",
        "Hubungan regulator dan media"
      ],
      "mode": "Hybrid — AI 40% · Remote 40% · Kantor 20%",
      "gaji": "Rp30–48 jt/bln",
      "agents": [
        "AG-15",
        "AG-17"
      ],
      "jabatan": [
        "Head of Stakeholder Relations",
        "Investor Relations",
        "Communications Specialist"
      ],
      "jumlah": 3
    },
    {
      "code": "S9",
      "kind": "sup",
      "nama": "Internal Audit",
      "lingkup": "",
      "fte": [
        0,
        1,
        2
      ],
      "kepala": "Head of Internal Audit",
      "tujuan": "Audit internal independen atas 100% transaksi dan pengendalian lapangan.",
      "tugas": [
        "Pra-audit 100% transaksi dan uji petik lapangan",
        "Verifikasi fisik aset dan stok",
        "Tindak lanjut temuan audit"
      ],
      "mode": "Hybrid — AI 60% · Remote 20% · Kantor 20%",
      "gaji": "Rp35–55 jt/bln",
      "agents": [
        "AG-13",
        "AG-14"
      ],
      "jabatan": [
        "Head of Internal Audit",
        "Internal Auditor",
        "Audit Support"
      ],
      "jumlah": 3
    },
    {
      "code": "S10",
      "kind": "sup",
      "nama": "AI Operations Center (Kantor AI)",
      "lingkup": "",
      "fte": [
        1,
        3,
        7
      ],
      "kepala": "AI Operations Director",
      "tujuan": "Mengoperasikan Kantor AI dan 18 agen AI agar bekerja 24 jam dengan guardrail tertulis.",
      "tugas": [
        "Monitoring agen AI dan eskalasi ke manusia",
        "Evaluasi KPI agen dan prompt",
        "Orkestrasi antar-agen dan Gemini AI"
      ],
      "mode": "Hybrid — AI 70% · Remote 25% · Kantor 5%",
      "gaji": "Rp40–65 jt/bln",
      "agents": [
        "AG-18",
        "AG-01"
      ],
      "jabatan": [
        "AI Operations Director",
        "AI Office Manager",
        "Prompt Engineer"
      ],
      "jumlah": 3
    },
    {
      "code": "S11",
      "kind": "sup",
      "nama": "Business Development & Deal Sourcing",
      "lingkup": "",
      "fte": [
        1,
        2,
        5
      ],
      "kepala": "Head of Deal Sourcing",
      "tujuan": "Sourcing deal dan pipeline akuisisi dari broker, bank, dan jaringan mitra.",
      "tugas": [
        "Sourcing listing properti, bisnis, dan aset digital",
        "Briefing NDA dan milestone freelancer",
        "Pipeline CRM dan scoring deal"
      ],
      "mode": "Hybrid — AI 50% · Remote 35% · Kantor 15%",
      "gaji": "Rp30–48 jt/bln",
      "agents": [
        "AG-01",
        "AG-02"
      ],
      "jabatan": [
        "Head of Deal Sourcing",
        "Deal Analyst",
        "Partnership Scout"
      ],
      "jumlah": 3
    },
    {
      "code": "S12",
      "kind": "sup",
      "nama": "General Affairs, Fasilitas & Umum",
      "lingkup": "",
      "fte": [
        3,
        7,
        14
      ],
      "kepala": "GA Manager",
      "tujuan": "Mengelola fasilitas, pengadaan, dan layanan umum agar kantor berjalan lancar.",
      "tugas": [
        "Membuka kantor dan cek fasilitas harian",
        "Pengadaan dan perbandingan vendor",
        "Layanan tamu, kurir, dan kebersihan"
      ],
      "mode": "Hybrid — AI 40% · Remote 15% · Kantor 45%",
      "gaji": "Rp25–40 jt/bln",
      "agents": [
        "AG-16",
        "AG-14"
      ],
      "jabatan": [
        "GA Manager",
        "Receptionist",
        "Office Admin",
        "Facility Coordinator"
      ],
      "jumlah": 4
    }
  ],
  "kelas": [
    {
      "kode": "A",
      "nama": "Kas & Setara Kas",
      "jumlah": 8,
      "desk": [
        "D1"
      ],
      "ai": 65,
      "rm": 30,
      "of": 5,
      "contoh": [
        "Tabungan bank (IDR)",
        "Giro",
        "Deposito berjangka (IDR)",
        "Deposito valas (USD/SGD)"
      ]
    },
    {
      "kode": "B",
      "nama": "Pendapatan Tetap & Kredit",
      "jumlah": 22,
      "desk": [
        "D1"
      ],
      "ai": 65,
      "rm": 30,
      "of": 5,
      "contoh": [
        "Obligasi Negara Ritel (ORI)",
        "Sukuk Ritel (SR)",
        "Savings Bond Ritel (SBR)",
        "Sukuk Tabungan (ST)"
      ]
    },
    {
      "kode": "C",
      "nama": "Ekuitas",
      "jumlah": 6,
      "desk": [
        "D2"
      ],
      "ai": 65,
      "rm": 30,
      "of": 5,
      "contoh": [
        "Saham IDX (large cap)",
        "Saham kecil / papan akselerasi",
        "Saham syariah (ISSI/JII)",
        "Saham global (US/EU/Asia)"
      ]
    },
    {
      "kode": "D",
      "nama": "Kolektif (Reksa Dana/ETF)",
      "jumlah": 9,
      "desk": [
        "D3"
      ],
      "ai": 65,
      "rm": 30,
      "of": 5,
      "contoh": [
        "ETF saham IDX",
        "ETF global (S&P500, MSCI World)",
        "Reksa dana saham",
        "Reksa dana campuran"
      ]
    },
    {
      "kode": "E",
      "nama": "Valas & Komoditas",
      "jumlah": 8,
      "desk": [
        "D4"
      ],
      "ai": 65,
      "rm": 30,
      "of": 5,
      "contoh": [
        "Valas spot (USD/SGD/EUR)",
        "Emas batangan fisik",
        "Emas digital (tabungan emas)",
        "Perak batangan"
      ]
    },
    {
      "kode": "F",
      "nama": "Kripto & Aset Digital",
      "jumlah": 19,
      "desk": [
        "D5",
        "D6"
      ],
      "ai": 68,
      "rm": 26,
      "of": 6,
      "contoh": [
        "Kripto spot di exchange lokal",
        "Kripto spot di exchange global",
        "Stablecoin (USDT/USDC)",
        "Staking / crypto earn"
      ]
    },
    {
      "kode": "G",
      "nama": "Properti & Tanah",
      "jumlah": 15,
      "desk": [
        "D7"
      ],
      "ai": 40,
      "rm": 25,
      "of": 35,
      "contoh": [
        "Rumah baru (primary)",
        "Rumah second (bekas)",
        "Apartemen untuk disewakan",
        "Kos-kosan / rumah sewa kamar"
      ]
    },
    {
      "kode": "H",
      "nama": "Aset Fisik Produktif",
      "jumlah": 17,
      "desk": [
        "D8"
      ],
      "ai": 25,
      "rm": 15,
      "of": 60,
      "contoh": [
        "Vending machine",
        "Mesin ATM / EDG mandiri",
        "Usaha laundry kiloan",
        "Alat berat (excavator, vibro)"
      ]
    },
    {
      "kode": "I",
      "nama": "Agrikultur & Alam",
      "jumlah": 8,
      "desk": [
        "D9"
      ],
      "ai": 25,
      "rm": 15,
      "of": 60,
      "contoh": [
        "Kebun sawit (kemitraan/plasma)",
        "Bagi hasil tanaman pangan",
        "Greenhouse hortikultura",
        "Penggemukan sapi"
      ]
    },
    {
      "kode": "J",
      "nama": "Koleksi",
      "jumlah": 16,
      "desk": [
        "D10"
      ],
      "ai": 35,
      "rm": 30,
      "of": 35,
      "contoh": [
        "Karya seni / lukisan",
        "Jam tangan mewah",
        "Mobil klasik / premium",
        "Sneaker edisi terbatas"
      ]
    },
    {
      "kode": "K",
      "nama": "Bisnis & Usaha Langsung",
      "jumlah": 8,
      "desk": [
        "D12"
      ],
      "ai": 30,
      "rm": 15,
      "of": 55,
      "contoh": [
        "Franchise minimarket",
        "Apotek / klinik pratama",
        "Patungan bisnis / equity UMKM",
        "Akuisisi UMKM berjalan"
      ]
    },
    {
      "kode": "L",
      "nama": "HKI & Royalti",
      "jumlah": 6,
      "desk": [
        "D6"
      ],
      "ai": 55,
      "rm": 40,
      "of": 5,
      "contoh": [
        "Royalti musik / katalog lagu",
        "Lisensi paten / teknologi",
        "Royalti film / hak distribusi",
        "Royalti buku / konten berlisensi"
      ]
    },
    {
      "kode": "M",
      "nama": "Asuransi & Pensiun",
      "jumlah": 9,
      "desk": [
        "D11"
      ],
      "ai": 65,
      "rm": 30,
      "of": 5,
      "contoh": [
        "Asuransi unit link",
        "Asuransi jiwa tradisional (endowment)",
        "Asuransi pendidikan",
        "Anuitas (immediate/deferred)"
      ]
    },
    {
      "kode": "N",
      "nama": "Derivatif & Spekulatif",
      "jumlah": 9,
      "desk": [
        "D4",
        "S2"
      ],
      "ai": 43,
      "rm": 20,
      "of": 3,
      "contoh": [
        "Opsi saham (US options)",
        "Waran terstruktur (IDX)",
        "Forex leverage / CFD",
        "Margin trading saham"
      ]
    }
  ],
  "entitas": [
    {
      "peran": "PT HOLDING (induk)",
      "nama": "PT [Nama] Investasi",
      "kbli": "64200 - Aktivitas Perusahaan Holding",
      "fungsi": "Pemilik saham anak perusahaan, portofolio finansial, kebijakan investasi",
      "izin": "NIB (OSS) - risiko rendah; NPWP; tidak perlu izin pialang/MI selama dana sendiri"
    },
    {
      "peran": "PT Properti",
      "nama": "PT [Nama] Properti",
      "kbli": "68110/68111 - Real estat",
      "fungsi": "Rumah, apartemen, kos, ruko, gudang, tanah, HGU",
      "izin": "NIB + izin usaha; sertifikat atas nama PT"
    },
    {
      "peran": "PT Aset Produktif & Agri",
      "nama": "PT [Nama] Aset Produktif",
      "kbli": "68200/01610/49210",
      "fungsi": "Vending, alat berat, truk, tower, agri, ternak",
      "izin": "NIB + izin sektoral (Kementan/ESDM/Pemda)"
    },
    {
      "peran": "PT Digital & IP",
      "nama": "PT [Nama] Digital",
      "kbli": "62010/63122/77400",
      "fungsi": "Website, SaaS, app, domain, royalti, HKI",
      "izin": "NIB; pendaftaran HKI di DJKI; PDP compliance"
    },
    {
      "peran": "PT Koleksi & Kustodian",
      "nama": "PT [Nama] Koleksi",
      "kbli": "47799/91020",
      "fungsi": "Seni, jam, mobil, koleksi; penyimpanan",
      "izin": "NIB + asuransi aset; PPN perhiasan"
    },
    {
      "peran": "PT Shared Services / Kantor AI",
      "nama": "PT [Nama] Teknologi",
      "kbli": "62019/63112",
      "fungsi": "Menyediakan SDM, TI, robot AI, akuntansi ke seluruh grup",
      "izin": "NIB; perjanjian antar-perusahaan (transfer pricing)"
    },
    {
      "peran": "SPV per Transaksi (opsional)",
      "nama": "PT [Nama] SPV-01",
      "kbli": "64200",
      "fungsi": "Memisahkan risiko satu proyek/co-investor",
      "izin": "NIB; jika ada investor eksternal: perjanjian pemegang saham"
    }
  ],
  "agents": [
    {
      "id": "AG-01",
      "nama": "Router & Intake",
      "ruang": "1 · Resepsionis & Routing",
      "misi": "Menjadi satu-satunya pintu masuk permintaan sehingga tidak ada pekerjaan yang hilang atau dikerjakan dua kali.",
      "proses": [
        "Membaca pesan dari semua kanal dan mengubahnya menjadi tiket",
        "Mengklasifikasikan jenis permintaan dan menilai urgensi",
        "Menetapkan PIC, agent pendukung, dan tenggat SLA",
        "Mengirim notifikasi ke pemilik pekerjaan",
        "Menutup tiket setelah ada bukti penyelesaian"
      ],
      "input": "E-mail, WhatsApp Business, form web, API mitra, surat fisik hasil pindai",
      "output": "Tiket bernomor + klasifikasi + PIC + tenggat",
      "ot": "A1 — menyiapkan & mengarahkan",
      "sla": "< 15 menit",
      "tools": "Parser e-mail/WA, CRM, katalog 160 aset, kalender SLA",
      "guard": "Tidak boleh menerima atau menolak transaksi atas nama perusahaan; tidak boleh membuat janji waktu di luar SLA",
      "owner": "AI Office Manager (S10)",
      "eskalasi": "Tiket bernilai > Rp1 M atau menyebut regulator → langsung ke Direksi",
      "kpi": "Ketepatan klasifikasi > 95%, nol tiket hilang",
      "fail": "Salah rute, tiket ganda, klasifikasi salah"
    },
    {
      "id": "AG-02",
      "nama": "Deal Memo Analyst",
      "ruang": "2 · Riset & Valuasi",
      "misi": "Menyusun bahan keputusan yang ringkas dan jujur, sehingga IC tidak membaca 40 halaman untuk satu keputusan.",
      "proses": [
        "Menarik data aset dari katalog dan CRM",
        "Menyusun ringkasan peluang, risiko, dan angka kunci",
        "Memberi skor risiko dan kesesuaian dengan IPS",
        "Menyiapkan pertanyaan due diligence yang belum terjawab",
        "Memperbarui memo bila ada data baru"
      ],
      "input": "Katalog 160 aset, data pasar, pipeline CRM, DD report",
      "output": "Draft memo 2 halaman + skor risiko + daftar pertanyaan terbuka",
      "ot": "A1 — draft untuk ditinjau",
      "sla": "< 2 jam",
      "tools": "Katalog, data warehouse, template memo, IPS",
      "guard": "Wajib menyebut sumber setiap angka; tidak boleh merekomendasikan pembelian; wajib menandai data yang belum diverifikasi",
      "owner": "Kepala Desk terkait",
      "eskalasi": "Ada red flag atau nilai > Rp5 M → IC",
      "kpi": "Ketepatan angka dan kelengkapan risiko",
      "fail": "Memo tanpa sumber, skor risiko kosong"
    },
    {
      "id": "AG-03",
      "nama": "Data Room & Due Diligence",
      "ruang": "2 · Riset & Valuasi",
      "misi": "Mengelola dokumen due diligence agar tidak ada yang lolos: sertifikat, kontrak, kewajiban tersembunyi.",
      "proses": [
        "Menyusun checklist DD sesuai jenis aset",
        "Mengekstrak isi dokumen dan mencocokkan dengan daftar wajib",
        "Menandai dokumen hilang, tidak konsisten, atau kedaluwarsa",
        "Menelusuri sengketa dan kewajiban tersembunyi",
        "Menyusun DD report dengan daftar red flag"
      ],
      "input": "Dokumen legal, laporan keuangan, sertifikat, kontrak, hasil wawancara",
      "output": "DD report + daftar red flag berperingkat",
      "ot": "A1 — menyiapkan",
      "sla": "< 1 hari per paket dokumen",
      "tools": "DMS, OCR, checklist DD per kelas aset, basis data sengketa",
      "guard": "Tidak boleh menyatakan dokumen 'asli' atau 'bersih'; verifikasi fisik dan instansi tetap oleh manusia",
      "owner": "Legal Counsel (S5) & Kepala Desk",
      "eskalasi": "Red flag berat (sertifikat ganda, sengketa) → CRO + Direksi",
      "kpi": "Kelengkapan temuan DD, waktu penyelesaian",
      "fail": "Dokumen terlewat, salah membaca nama pemilik"
    },
    {
      "id": "AG-04",
      "nama": "Valuation Engine",
      "ruang": "2 · Riset & Valuasi",
      "misi": "Menghitung nilai dengan beberapa metode agar keputusan tidak bergantung pada satu angka harapan.",
      "proses": [
        "Menjalankan DCF, multiple, dan nilai pembanding",
        "Menyusun tiga skenario (pesimis, dasar, optimis)",
        "Menguji sensitivitas variabel kunci",
        "Menghitung nilai likuidasi dan biaya keluar",
        "Menandai asumsi yang paling memengaruhi hasil"
      ],
      "input": "Data sewa, komparasi, ARR/profit, harga pasar, asumsi biaya",
      "output": "3 skenario nilai + tabel sensitivitas + daftar asumsi",
      "ot": "A0 — saran saja",
      "sla": "< 4 jam",
      "tools": "Model valuasi per kelas aset, data pasar, data sewa",
      "guard": "Tidak menetapkan harga tawar; nilai final wajib disahkan penilai/manusia; semua asumsi harus ditampilkan",
      "owner": "Appraisal Officer / Kepala Desk",
      "eskalasi": "Nilai dipakai untuk transaksi > Rp5 M → IC + penilai independen",
      "kpi": "Akurasi vs realisasi, kelengkapan asumsi",
      "fail": "Overfitting, asumsi optimistis tanpa dasar"
    },
    {
      "id": "AG-05",
      "nama": "Market & Macro Monitor",
      "ruang": "3 · Pemantauan Pasar & Aset",
      "misi": "Membuat perusahaan selalu tahu apa yang terjadi di pasar sebelum membuka posisi.",
      "proses": [
        "Memantau harga, yield, kurs, rating, dan berita",
        "Menyusun briefing pagi untuk seluruh desk",
        "Menjalankan alert berbasis ambang (mis. yield naik 25 bps)",
        "Mencatat peristiwa penting ke kronologi portofolio",
        "Menyiapkan ringkasan mingguan"
      ],
      "input": "Feed harga, rilis BI/BPS, berita, laporan riset",
      "output": "Briefing 07.00 + alert real-time",
      "ot": "A2 — eksekusi terbatas (alert)",
      "sla": "Real-time; briefing < 07.00",
      "tools": "Feed data pasar, API berita, kalender ekonomi",
      "guard": "Tidak boleh melakukan order; tidak boleh menyimpulkan rekomendasi beli/jual",
      "owner": "Head of Macro (D4) / CIO",
      "eskalasi": "Pergerakan ekstrem (>3% sehari) → telepon CIO",
      "kpi": "Ketepatan waktu briefing, jumlah alert palsu",
      "fail": "Alert berlebihan (noise), berita bohong"
    },
    {
      "id": "AG-06",
      "nama": "Property & Land Coordinator",
      "ruang": "3 · Pemantauan Pasar & Aset",
      "misi": "Menyiapkan paket akuisisi properti agar survei lapangan dan verifikasi legal berjalan sekali jalan.",
      "proses": [
        "Menarik NJOP, harga pembanding, dan riwayat listing",
        "Menyusun jadwal survei dan dokumen yang perlu dibawa",
        "Mengecek status dasar hukum lahan secara daring",
        "Menyiapkan checklist PPAT/notaris",
        "Menyusun perbandingan biaya transaksi (BPHTB, PPh, notaris)"
      ],
      "input": "Peta, NJOP, data PPAT, listing, data sewa",
      "output": "Paket akuisisi + jadwal survei + estimasi biaya transaksi",
      "ot": "A1 — menyiapkan",
      "sla": "< 1 hari",
      "tools": "Data pertanahan daring, peta, database sewa",
      "guard": "Tidak boleh menyatakan legalitas bersih; cek fisik dan instansi wajib oleh manusia/PPAT",
      "owner": "Kepala Desk D7",
      "eskalasi": "Indikasi sengketa → Legal Counsel",
      "kpi": "Kelengkapan paket, ketepatan biaya",
      "fail": "NJOP/listing kedaluwarsa dianggap harga pasar"
    },
    {
      "id": "AG-07",
      "nama": "Field Ops Coordinator",
      "ruang": "4 · Operasi Lapangan",
      "misi": "Menjadwalkan dan memantau pekerjaan lapangan agar aset fisik tidak mati dan kasnya tidak bocor.",
      "proses": [
        "Menerima alert kerusakan/stok dari sensor atau laporan",
        "Membuat work order dan menugaskan teknisi",
        "Menyusun rute dan jadwal restock",
        "Memantau penyelesaian tiket dan downtime",
        "Menyusun laporan utilisasi dan kas harian"
      ],
      "input": "Telemetri/IoT, tiket kerja, GPS, laporan supervisor",
      "output": "Work order + jadwal + laporan utilisasi",
      "ot": "A2 — eksekusi terbatas (penugasan)",
      "sla": "Harian (06.00-22.00)",
      "tools": "Aplikasi work order, sensor, spreadsheet kas",
      "guard": "Tidak boleh mengelola atau menyetujui kas tunai; perbaikan di atas anggaran wajib persetujuan manusia",
      "owner": "Field Ops Manager (D8)",
      "eskalasi": "Kerusakan besar / kehilangan kas → COO + audit",
      "kpi": "Downtime, penyelesaian tiket, selisih kas",
      "fail": "Penugasan tidak realistis, kas tidak terverifikasi"
    },
    {
      "id": "AG-08",
      "nama": "Agri Yield Monitor",
      "ruang": "3 · Pemantauan Pasar & Aset",
      "misi": "Memberi peringatan dini tentang panen dan margin sebelum kerugian terjadi.",
      "proses": [
        "Menggabungkan data cuaca, harga, dan laporan lapangan",
        "Memproyeksikan yield dan margin per siklus",
        "Menandai risiko hama/penyakit dari pola laporan",
        "Menyusun jadwal tanam dan pupuk",
        "Menyiapkan laporan siklus"
      ],
      "input": "Data cuaca, harga komoditas, catatan Field Coordinator",
      "output": "Forecast yield + margin + peringatan risiko",
      "ot": "A1 — menyiapkan",
      "sla": "Mingguan",
      "tools": "Data satelit/cuaca, harga komoditas, catatan lapangan",
      "guard": "Tidak menetapkan keputusan tanam; rekomendasi teknis harus disetujui agronomist",
      "owner": "Agronomist (D9)",
      "eskalasi": "Prediksi gagal panen > 20% → Head D9 + CRO",
      "kpi": "Akurasi forecast",
      "fail": "Model terlalu optimistis di musim ekstrem"
    },
    {
      "id": "AG-09",
      "nama": "Collectibles Authenticator",
      "ruang": "3 · Pemantauan Pasar & Aset",
      "misi": "Menyaring objek bernilai tinggi dengan data provenans dan harga lelang sebelum diperiksa fisik.",
      "proses": [
        "Menelusuri riwayat lelang dan provenans",
        "Membandingkan harga hasil lelang terakhir",
        "Memeriksa kelengkapan sertifikat dan grading",
        "Menandai kejanggalan (harga terlalu murah, cerita tidak konsisten)",
        "Menyusun berkas pemeriksaan untuk kurator"
      ],
      "input": "Database lelang, sertifikat, foto objek, keterangan penjual",
      "output": "Skor autentisitas awal + rentang harga + daftar hal yang harus diperiksa fisik",
      "ot": "A1 — menyiapkan",
      "sla": "< 1 hari",
      "tools": "Database lelang, arsip sertifikat, riwayat harga",
      "guard": "Tidak boleh menyatakan objek asli/palsu; autentikasi final wajib kurator bersertifikat secara fisik",
      "owner": "Authenticator & Appraiser (D10)",
      "eskalasi": "Objek > Rp500 jt → kurator + ahli eksternal",
      "kpi": "Ketepatan penyaringan, kelengkapan berkas",
      "fail": "Menganggap foto sebagai bukti keaslian"
    },
    {
      "id": "AG-10",
      "nama": "On-chain & Crypto Analyst",
      "ruang": "3 · Pemantauan Pasar & Aset",
      "misi": "Mengawasi posisi digital 24 jam karena pasar kripto tidak pernah tutup.",
      "proses": [
        "Memantau saldo wallet dan posisi exchange",
        "Menghitung yield staking/lending berjalan",
        "Memeriksa kesehatan protokol dan kontrak",
        "Menandai transaksi keluar yang tidak wajar",
        "Menyusun laporan posisi dan pajak transaksi"
      ],
      "input": "Block explorer, API exchange, data protokol",
      "output": "Laporan posisi + alert risiko + rekap PPh 22",
      "ot": "A2 — monitoring & alert",
      "sla": "Real-time",
      "tools": "Block explorer, API exchange PAKD, data on-chain",
      "guard": "Tidak boleh memindahkan aset; penarikan wajib 2 manusia dengan multi-signature",
      "owner": "Custody & Key Manager (D5)",
      "eskalasi": "Transaksi keluar tak dikenal → D5 + CRO segera",
      "kpi": "Deteksi anomali, akurasi posisi",
      "fail": "Salah alamat, salah membaca kontrak"
    },
    {
      "id": "AG-11",
      "nama": "Digital Asset Diligence",
      "ruang": "2 · Riset & Valuasi",
      "misi": "Memisahkan aset digital yang benar-benar menghasilkan uang dari yang tampak bagus di dashboard.",
      "proses": [
        "Mengaudit sumber dan kualitas trafik",
        "Memeriksa pendapatan, churn, dan biaya",
        "Mendeteksi ketergantungan platform dan risiko deindex",
        "Menilai kualitas konten/backlink dan riwayat penalti",
        "Menyusun skor kualitas dan rentang harga"
      ],
      "input": "Analytics, Stripe/Ads API, data trafik, riwayat domain",
      "output": "Skor kualitas aset digital + rentang valuasi + red flag",
      "ot": "A1 — menyiapkan",
      "sla": "< 2 hari",
      "tools": "GA4, API pembayaran, tools SEO, arsip domain",
      "guard": "Tidak menetapkan harga final; negosiasi dan penandatanganan SPA oleh manusia",
      "owner": "Digital Acquisitions Analyst (D6)",
      "eskalasi": "Indikasi traffic palsu → Head D6 + CRO",
      "kpi": "Akurasi proyeksi pendapatan",
      "fail": "Tertipu trafik bot/revenue fiktif"
    },
    {
      "id": "AG-12",
      "nama": "Portfolio Monitoring & Reporting",
      "ruang": "6 · Komunikasi & Pelaporan",
      "misi": "Menjaga satu angka NAV yang konsisten untuk semua pihak: manajemen, pemegang saham, dan audit.",
      "proses": [
        "Mengumpulkan data posisi dari semua sistem",
        "Merekonsiliasi dengan kustodian dan bank",
        "Menghitung NAV, exposure, dan kinerja per kelas aset",
        "Menyusun laporan bulanan dan dashboard",
        "Menandai selisih dan meminta penjelasan"
      ],
      "input": "Data warehouse, konfirmasi kustodian, rekening bank, register aset",
      "output": "Laporan bulanan + dashboard + daftar selisih",
      "ot": "A2 — eksekusi terbatas (penyusunan)",
      "sla": "Bulanan (H+5)",
      "tools": "Data warehouse, API kustodian, BI",
      "guard": "Tidak boleh menerbitkan laporan ke pihak luar; laporan resmi wajib ditandatangani manusia",
      "owner": "Portfolio Strategist (S1) / CFO",
      "eskalasi": "Selisih NAV > 0,5% → CFO + audit",
      "kpi": "Ketepatan NAV, ketepatan waktu",
      "fail": "Salah agregasi, kurs keliru"
    },
    {
      "id": "AG-13",
      "nama": "Compliance & Legal Watch",
      "ruang": "5 · Keuangan, Pajak & Kepatuhan",
      "misi": "Memastikan perusahaan tahu kewajibannya sebelum tenggat, bukan sesudah sanksi.",
      "proses": [
        "Memantau POJK, PMK, UU, dan pengumuman OJK/DJP",
        "Memperbarui register kewajiban dan kalender kepatuhan",
        "Menjalankan screening sanksi dan PEP",
        "Menandai transaksi yang perlu review",
        "Menyiapkan bahan untuk tanggapan regulator"
      ],
      "input": "JDIH OJK, situs DJP, daftar sanksi, OSS, transaksi internal",
      "output": "Register kepatuhan + daftar tugas + peringatan tenggat",
      "ot": "A2 — eksekusi terbatas (register)",
      "sla": "Harian",
      "tools": "JDIH, daftar sanksi, sistem register",
      "guard": "Tidak memberi pendapat hukum final; tidak menyampaikan surat ke regulator tanpa persetujuan",
      "owner": "Compliance Officer (S2)",
      "eskalasi": "Surat resmi regulator → CRO + Direksi hari yang sama",
      "kpi": "Kelengkapan register, nol tenggat terlewat",
      "fail": "Salah tafsir aturan, ketinggalan aturan baru"
    },
    {
      "id": "AG-14",
      "nama": "Finance & Tax Agent",
      "ruang": "5 · Keuangan, Pajak & Kepatuhan",
      "misi": "Mengurangi pekerjaan buku besar yang repetitif tanpa mengorbankan ketelitian.",
      "proses": [
        "Mengimpor transaksi bank dan membuat jurnal",
        "Merekonsiliasi bank dan akun antar-perusahaan",
        "Menghitung pajak (PPh 21/23/final, PPN bila PKP)",
        "Menyusun draft SPT dan bukti potong",
        "Menandai transaksi tidak wajar atau duplikat"
      ],
      "input": "Rekening koran, e-Faktur, Coretax, sistem akuntansi",
      "output": "Jurnal, rekonsiliasi, draft SPT, daftar selisih",
      "ot": "A2 — eksekusi terbatas (pencatatan)",
      "sla": "Bulanan (H+5)",
      "tools": "Sistem akuntansi, Coretax, API bank",
      "guard": "Tidak boleh menyetor pajak, menandatangani SPT, atau menyetujui pembayaran",
      "owner": "Accounting Manager / Tax Specialist (S3)",
      "eskalasi": "Selisih rekonsiliasi atau pajak > Rp50 jt → CFO",
      "kpi": "Ketepatan jurnal, nol denda",
      "fail": "Salah klasifikasi akun, dobel bayar"
    },
    {
      "id": "AG-15",
      "nama": "Capital & Investor Relations",
      "ruang": "6 · Komunikasi & Pelaporan",
      "misi": "Menjawab pertanyaan pemegang saham dan mitra dengan cepat dan konsisten, tanpa melebih-lebihkan.",
      "proses": [
        "Menyiapkan jawaban atas pertanyaan rutin",
        "Menyusun paket informasi periodik",
        "Memelihara data room investor",
        "Mencatat komitmen dan tenggat",
        "Meringkas hasil pertemuan menjadi catatan"
      ],
      "input": "CRM, laporan portofolio, korespondensi",
      "output": "Balasan siap kirim + paket informasi + catatan komitmen",
      "ot": "A1 — menyiapkan",
      "sla": "< 1 hari",
      "tools": "CRM, template laporan, data room",
      "guard": "Tidak boleh menjanjikan imbal hasil, komitmen dana, atau akses informasi rahasia",
      "owner": "Head of Capital (S8)",
      "eskalasi": "Pertanyaan tentang exit/dividen → Direksi",
      "kpi": "Kecepatan & konsistensi jawaban",
      "fail": "Janji berlebihan, informasi rahasia bocor"
    },
    {
      "id": "AG-16",
      "nama": "HR & Vendor Ops",
      "ruang": "6 · Komunikasi & Pelaporan",
      "misi": "Menghilangkan pekerjaan administrasi SDM dan vendor yang menyita waktu tim inti.",
      "proses": [
        "Menyaring pelamar dan menjadwalkan wawancara",
        "Menyiapkan draft kontrak dan dokumen onboarding",
        "Memeriksa invoice vendor terhadap kontrak dan PO",
        "Menyusun jadwal pembayaran",
        "Mengevaluasi kinerja vendor secara periodik"
      ],
      "input": "ATS, payroll, invoice, kontrak vendor",
      "output": "Shortlist kandidat + draft kontrak + jadwal bayar",
      "ot": "A1 — menyiapkan",
      "sla": "< 2 hari",
      "tools": "ATS, sistem payroll, sistem AP",
      "guard": "Tidak menetapkan gaji, tidak merekrut/memberhentikan, tidak menyetujui pembayaran",
      "owner": "HR Manager (S6) / CFO",
      "eskalasi": "Isu disiplin atau terminasi → Direksi",
      "kpi": "Waktu rekrutmen, akurasi invoice",
      "fail": "Salah hitung pajak/BPJS, vendor fiktif"
    },
    {
      "id": "AG-17",
      "nama": "Document Generator",
      "ruang": "5 · Keuangan, Pajak & Kepatuhan",
      "misi": "Menyiapkan dokumen yang rapi dan konsisten agar manusia tinggal memeriksa dan menandatangani.",
      "proses": [
        "Menyusun draft surat, memo, dan notulen",
        "Menyiapkan draft perjanjian dari template yang disetujui",
        "Mengisi data perusahaan secara konsisten",
        "Menyimpan versi dan riwayat perubahan",
        "Menandai klausul yang perlu perhatian legal"
      ],
      "input": "Template legal, keputusan IC, data perusahaan",
      "output": "Draft dokumen siap tanda tangan + daftar klausul berisiko",
      "ot": "A1 — draft",
      "sla": "< 4 jam",
      "tools": "DMS, template legal, register keputusan",
      "guard": "Tidak boleh menandatangani, memalsukan tanda tangan, atau menerbitkan dokumen tanpa persetujuan",
      "owner": "Corporate Secretary / Legal Counsel (S5)",
      "eskalasi": "Dokumen ke regulator/notaris → Direksi",
      "kpi": "Konsistensi & kelengkapan dokumen",
      "fail": "Klausul tidak sesuai, data perusahaan salah"
    },
    {
      "id": "AG-18",
      "nama": "AI Office Orchestrator",
      "ruang": "1 · Resepsionis & Routing",
      "misi": "Mengawasi 17 agent lain: mendeteksi konflik, antrean, kegagalan, dan biaya sebelum menjadi masalah.",
      "proses": [
        "Memantau antrean tiket dan beban setiap agent",
        "Mendeteksi tiket yang tertahan atau berulang",
        "Mengukur kualitas dan biaya per agent",
        "Mengusulkan perbaikan routing dan prioritas",
        "Menyusun laporan mingguan kantor AI"
      ],
      "input": "Log semua agent, umpan balik manusia, metrik biaya",
      "output": "Laporan kinerja + daftar eskalasi + rekomendasi perbaikan",
      "ot": "A2 — eksekusi terbatas (orkestrasi)",
      "sla": "Real-time",
      "tools": "Log terpusat, dashboard, metrik token",
      "guard": "Tidak boleh mengubah guardrail atau prioritas kebijakan sendiri; tidak boleh menonaktifkan audit log",
      "owner": "AI Office Manager (S10)",
      "eskalasi": "Kegagalan berulang agent → AI Office Manager + CTO",
      "kpi": "SLA keseluruhan, biaya per tiket",
      "fail": "Konflik prioritas, agent berhenti tanpa terdeteksi"
    }
  ],
  "tasks": [
    [
      "Fasilitas & Kantor",
      "Membuka kantor, menyalakan listrik/AC, cek fasilitas",
      "On-site",
      "Office Boy",
      "Harian",
      "Checklist pagi terisi",
      "GA Manager memeriksa acak"
    ],
    [
      "Fasilitas & Kantor",
      "Membersihkan ruang kerja, toilet, dan ruang rapat",
      "Vendor",
      "Vendor cleaning service",
      "Harian",
      "Area bersih sesuai SLA",
      "Inspeksi kebersihan mingguan"
    ],
    [
      "Fasilitas & Kantor",
      "Menyiapkan ruang rapat (meja, proyektor, jamuan)",
      "On-site",
      "Office Boy + Pantry",
      "Per rapat",
      "Ruang siap 15 menit sebelum rapat",
      "Pemesan rapat mengonfirmasi"
    ],
    [
      "Fasilitas & Kantor",
      "Menerima tamu dan mengarahkan ke ruang tunggu",
      "On-site",
      "Receptionist",
      "Harian",
      "Buku tamu terisi",
      "Security memverifikasi identitas"
    ],
    [
      "Fasilitas & Kantor",
      "Mencatat dan menyerahkan paket masuk",
      "On-site",
      "Receptionist",
      "Harian",
      "Log paket",
      "GA mencocokkan dengan pesanan"
    ],
    [
      "Fasilitas & Kantor",
      "Mengelola kartu akses dan daftar tamu",
      "On-site",
      "Security Coordinator",
      "Bulanan",
      "Daftar akses diperbarui",
      "HR mengonfirmasi status karyawan"
    ],
    [
      "Fasilitas & Kantor",
      "Membeli kebutuhan kantor mendesak (ATK, air, tisu)",
      "On-site",
      "Kurir + GA",
      "Mingguan",
      "Bukti belanja",
      "GA memeriksa terhadap anggaran"
    ],
    [
      "Fasilitas & Kantor",
      "Membayar tagihan listrik, air, internet, telepon",
      "Remote",
      "Finance (S3) + AI AG-14",
      "Bulanan",
      "Bukti bayar & jurnal",
      "CFO menyetujui"
    ],
    [
      "Fasilitas & Kantor",
      "Memperpanjang sewa kantor dan memperbarui domisili",
      "On-site",
      "GA Manager + Legal",
      "Tahunan",
      "Perjanjian sewa baru",
      "Direksi menandatangani"
    ],
    [
      "Fasilitas & Kantor",
      "Mengatur tata letak dan mutasi meja kerja",
      "On-site",
      "GA Manager",
      "Per kebutuhan",
      "Layout & denah",
      "COO menyetujui"
    ],
    [
      "Fasilitas & Kantor",
      "Menyusun anggaran GA dan mengendalikan realisasi",
      "Remote",
      "GA Manager",
      "Bulanan",
      "Laporan realisasi vs anggaran",
      "CFO mereview"
    ],
    [
      "Fasilitas & Kantor",
      "Menangani keadaan darurat gedung (listrik padam, banjir)",
      "On-site",
      "GA + Teknisi + Vendor",
      "Insidental",
      "Laporan insiden & perbaikan",
      "COO diberi tahu < 1 jam"
    ],
    [
      "Kebersihan & Kenyamanan",
      "Membersihkan area pantry dan mesin kopi",
      "On-site",
      "Pantry Officer",
      "Harian",
      "Area pantry bersih",
      "Checklist GA"
    ],
    [
      "Kebersihan & Kenyamanan",
      "Mengelola stok kopi, teh, air minum",
      "On-site",
      "Pantry Officer",
      "Mingguan",
      "Stok tersedia",
      "GA memeriksa biaya"
    ],
    [
      "Kebersihan & Kenyamanan",
      "Menyiapkan jamuan untuk tamu direksi",
      "On-site",
      "Pantry Officer",
      "Per acara",
      "Jamuan siap",
      "Protokol direksi menyetujui"
    ],
    [
      "Kebersihan & Kenyamanan",
      "Memotong rumput dan merawat tanaman",
      "Vendor",
      "Vendor taman",
      "Bulanan",
      "Taman terawat",
      "Inspeksi GA"
    ],
    [
      "Kebersihan & Kenyamanan",
      "Menguras saluran air dan membersihkan parkir",
      "Vendor",
      "Vendor cleaning",
      "Triwulanan",
      "Area luar bersih",
      "Inspeksi GA"
    ],
    [
      "Kebersihan & Kenyamanan",
      "Fumigasi dan pengendalian hama",
      "Vendor",
      "Vendor pest control",
      "Triwulanan",
      "Sertifikat fumigasi",
      "GA menyimpan bukti"
    ],
    [
      "Transportasi & Dokumen",
      "Mengantar dokumen asli ke bank/notaris/instansi",
      "On-site",
      "Kurir",
      "Harian",
      "Tanda terima dokumen",
      "Document Controller mencatat"
    ],
    [
      "Transportasi & Dokumen",
      "Mengambil hasil legalisasi dan akta",
      "On-site",
      "Kurir",
      "Per kebutuhan",
      "Dokumen diterima lengkap",
      "Legal memverifikasi"
    ],
    [
      "Transportasi & Dokumen",
      "Menyetor berkas ke kantor pajak/OSS/BPN",
      "On-site",
      "Kurir",
      "Per kebutuhan",
      "Bukti setor/registrasi",
      "Compliance mencatat"
    ],
    [
      "Transportasi & Dokumen",
      "Mengantar-jemput direksi dan tamu penting",
      "On-site",
      "Driver",
      "Harian",
      "Log perjalanan",
      "GA memeriksa jadwal"
    ],
    [
      "Transportasi & Dokumen",
      "Mengantar tim ke lokasi aset/properti (survei)",
      "On-site",
      "Driver",
      "Per kunjungan",
      "Log perjalanan & BBM",
      "Surveyor mengisi laporan"
    ],
    [
      "Transportasi & Dokumen",
      "Mengirim paket ke mitra/co-investor",
      "Vendor",
      "Jasa ekspedisi",
      "Per kebutuhan",
      "Resi pengiriman",
      "IR mencatat pengiriman"
    ],
    [
      "Keamanan",
      "Menjaga gerbang, memeriksa tamu, dan ronde area",
      "Vendor",
      "Vendor satpam",
      "24/7",
      "Log jaga & ronde",
      "Security Coordinator memeriksa"
    ],
    [
      "Keamanan",
      "Memantau CCTV dan menyimpan rekaman",
      "On-site",
      "Security Coordinator",
      "Harian",
      "Rekaman 30 hari",
      "GA mengaudit akses"
    ],
    [
      "Keamanan",
      "Mengelola brankas dokumen dan kunci aset",
      "On-site",
      "Security + Custody Admin",
      "Harian",
      "Log buka-tutup brankas",
      "Audit internal menguji"
    ],
    [
      "Keamanan",
      "Menangani insiden keamanan dan laporan ke polisi",
      "On-site",
      "Security Coordinator",
      "Insidental",
      "Laporan insiden",
      "COO & Legal menangani"
    ],
    [
      "Keamanan",
      "Menguji alarm kebakaran dan APAR",
      "Vendor",
      "Vendor K3",
      "Semesteran",
      "Sertifikat uji",
      "GA menyimpan bukti"
    ],
    [
      "Teknis & Pemeliharaan",
      "Servis AC, genset, dan panel listrik",
      "Vendor",
      "Vendor teknisi",
      "Triwulanan",
      "Berita acara servis",
      "Building Technician mengawasi"
    ],
    [
      "Teknis & Pemeliharaan",
      "Menangani listrik padam / AC mati saat jam kerja",
      "On-site",
      "Building Technician",
      "Insidental",
      "Perbaikan selesai",
      "GA melaporkan downtime"
    ],
    [
      "Teknis & Pemeliharaan",
      "Memelihara lift dan sistem pemadam",
      "Vendor",
      "Vendor lift/K3",
      "Bulanan",
      "Sertifikat layak",
      "GA memverifikasi"
    ],
    [
      "Teknis & Pemeliharaan",
      "Memelihara kendaraan operasional",
      "Vendor",
      "Bengkel rekanan",
      "Per 5.000 km",
      "Nota servis",
      "GA memeriksa biaya"
    ],
    [
      "Teknis & Pemeliharaan",
      "Memperbaiki perangkat kantor (printer, jaringan)",
      "Vendor",
      "Vendor IT",
      "Insidental",
      "Tiket selesai",
      "CTO memverifikasi"
    ],
    [
      "Teknis & Pemeliharaan",
      "Mengganti lampu, kunci, dan perabot rusak",
      "On-site",
      "Building Technician",
      "Insidental",
      "Bukti penggantian",
      "GA menyetujui pembelian"
    ],
    [
      "Teknis & Pemeliharaan",
      "Menyusun jadwal pemeliharaan preventif tahunan",
      "Remote",
      "GA Manager + Teknisi",
      "Tahunan",
      "Kalender pemeliharaan",
      "COO menyetujui"
    ],
    [
      "Pengadaan & Vendor",
      "Menerima permintaan pembelian dari unit",
      "AI",
      "AG-16 HR & Vendor",
      "Harian",
      "Tiket pengadaan",
      "GA memverifikasi kebutuhan"
    ],
    [
      "Pengadaan & Vendor",
      "Membandingkan minimal 3 penawaran vendor",
      "AI",
      "AG-16 + Procurement Admin",
      "Per pembelian",
      "Tabel perbandingan",
      "Procurement Admin menetapkan"
    ],
    [
      "Pengadaan & Vendor",
      "Menyusun dan memperbarui kontrak vendor",
      "AI",
      "AG-17 Document",
      "Per kontrak",
      "Draft kontrak",
      "Legal menelaah, Direksi tanda tangan"
    ],
    [
      "Pengadaan & Vendor",
      "Mengevaluasi kinerja vendor per kuartal",
      "AI",
      "AG-16 HR & Vendor",
      "Triwulanan",
      "Skor vendor",
      "GA memutuskan perpanjangan"
    ],
    [
      "Pengadaan & Vendor",
      "Memeriksa invoice vendor terhadap PO",
      "AI",
      "AG-14 Finance",
      "Bulanan",
      "Daftar invoice cocok/tidak",
      "Finance menyetujui pembayaran"
    ],
    [
      "Pengadaan & Vendor",
      "Menagih dan menutup kontrak vendor yang buruk",
      "Remote",
      "Procurement + Legal",
      "Per kasus",
      "Surat & berita acara",
      "CFO menyetujui pengakhiran"
    ],
    [
      "Pengadaan & Vendor",
      "Menjaga daftar vendor dan tanggal kedaluwarsa kontrak",
      "AI",
      "AG-16 (pengingat otomatis)",
      "Harian",
      "Alert 60 hari sebelum habis",
      "GA menindaklanjuti"
    ],
    [
      "Pengadaan & Vendor",
      "Onboarding vendor baru (KYC & kelengkapan)",
      "AI",
      "AG-13 Compliance",
      "Per vendor",
      "Berkas KYC lengkap",
      "Compliance menyetujui"
    ],
    [
      "Investasi & Deal",
      "Memantau listing dan tawaran masuk",
      "AI",
      "AG-01 Router + AG-05",
      "Harian",
      "Pipeline baru",
      "Head of BD menyaring"
    ],
    [
      "Investasi & Deal",
      "Menyusun memo investasi & skor risiko",
      "AI",
      "AG-02 Deal Memo",
      "Per deal",
      "Draft memo",
      "Kepala Desk mereview"
    ],
    [
      "Investasi & Deal",
      "Mengumpulkan dan mengekstrak dokumen due diligence",
      "AI",
      "AG-03 Data Room",
      "Per deal",
      "DD report + red flag",
      "Legal memverifikasi asli"
    ],
    [
      "Investasi & Deal",
      "Menghitung valuasi 3 skenario",
      "AI",
      "AG-04 Valuation",
      "Per deal",
      "Tabel valuasi",
      "Penilai/manusia menetapkan nilai"
    ],
    [
      "Investasi & Deal",
      "Survei lokasi properti & pengukuran",
      "On-site",
      "Site Surveyor",
      "Per deal",
      "Laporan kondisi & foto",
      "Kepala D7 memverifikasi"
    ],
    [
      "Investasi & Deal",
      "Cek sertifikat ke BPN/PPAT dan wawancara tetangga",
      "On-site",
      "Land Legal Officer",
      "Per deal",
      "Hasil pengecekan legal",
      "Legal Counsel menyatakan clean"
    ],
    [
      "Investasi & Deal",
      "Autentikasi fisik koleksi (seni, jam, kartu)",
      "On-site",
      "Authenticator + ahli eksternal",
      "Per objek",
      "Sertifikat/opini autentikasi",
      "Kurator menandatangani"
    ],
    [
      "Investasi & Deal",
      "Mengeksekusi order saham/obligasi via sekuritas",
      "Remote",
      "Dealer / Settlement Officer",
      "Harian",
      "Konfirmasi transaksi",
      "Kepala Desk menyetujui"
    ],
    [
      "Investasi & Deal",
      "Memindahkan aset kripto (multi-sig)",
      "On-site",
      "Custody Manager + 1 pejabat",
      "Per transaksi",
      "Bukti transaksi on-chain",
      "Dua tanda tangan manusia"
    ],
    [
      "Investasi & Deal",
      "Menandatangani perjanjian & instruksi transfer",
      "On-site",
      "Direktur",
      "Per transaksi",
      "Dokumen bertanda tangan",
      "Tidak dapat didelegasikan ke AI"
    ],
    [
      "Investasi & Deal",
      "Rapat Investment Committee",
      "On-site",
      "Direksi + Kepala Desk",
      "Mingguan",
      "Notulen keputusan",
      "Kuorum 3 orang"
    ],
    [
      "Investasi & Deal",
      "Memantau kinerja aset & menyusun laporan bulanan",
      "AI",
      "AG-12 Reporting",
      "Bulanan",
      "Laporan & dashboard",
      "CFO/Strategist mengesahkan"
    ],
    [
      "Keuangan & Pajak",
      "Mengimpor transaksi bank dan membuat jurnal",
      "AI",
      "AG-14 Finance & Tax",
      "Harian",
      "Jurnal harian",
      "Accounting Manager mereview"
    ],
    [
      "Keuangan & Pajak",
      "Merekonsiliasi bank dan akun antar-perusahaan",
      "AI",
      "AG-14 Finance & Tax",
      "Bulanan",
      "Rekonsiliasi & selisih",
      "Accounting Manager menutup"
    ],
    [
      "Keuangan & Pajak",
      "Menghitung dan menyetorkan PPh 21/23/final & PPN",
      "AI",
      "AG-14 + Tax Specialist",
      "Bulanan",
      "Bukti setor & SPT",
      "Tax Specialist tanda tangan"
    ],
    [
      "Keuangan & Pajak",
      "Menyusun laporan keuangan bulanan & konsolidasi",
      "AI",
      "AG-12 + Reporting Officer",
      "Bulanan",
      "Laporan keuangan",
      "CFO menandatangani"
    ],
    [
      "Keuangan & Pajak",
      "Menyiapkan data audit dan menjawab auditor",
      "Remote",
      "CFO + Accounting Manager",
      "Tahunan",
      "Data room audit",
      "Komisaris menerima hasil"
    ],
    [
      "Keuangan & Pajak",
      "Menyetujui dan melepas pembayaran",
      "Remote",
      "CFO / Direktur",
      "Harian",
      "Bukti transfer",
      "Empat mata untuk > Rp500 jt"
    ],
    [
      "Keuangan & Pajak",
      "Mengambil uang tunai / setor kas ke bank",
      "On-site",
      "Kurir + Finance",
      "Mingguan",
      "Bukti setor",
      "Finance mencocokkan"
    ],
    [
      "Keuangan & Pajak",
      "Menagih piutang sewa, royalti, bagi hasil",
      "AI",
      "AG-12 + AR Officer",
      "Bulanan",
      "Daftar piutang & surat tagih",
      "CFO memeriksa umur piutang"
    ],
    [
      "Keuangan & Pajak",
      "Menilai dan mengasuransikan aset fisik",
      "Remote",
      "GA + Finance",
      "Tahunan",
      "Polis asuransi",
      "Direksi menyetujui premi"
    ],
    [
      "Keuangan & Pajak",
      "Menyusun anggaran tahunan & proyeksi kas",
      "Remote",
      "CFO + GA Manager",
      "Tahunan",
      "Anggaran disetujui",
      "Pemegang saham menyetujui"
    ],
    [
      "SDM & Administrasi",
      "Menulis iklan lowongan & menyaring pelamar",
      "AI",
      "AG-16 HR & Vendor",
      "Per posisi",
      "Shortlist kandidat",
      "HR Manager memutuskan"
    ],
    [
      "SDM & Administrasi",
      "Melakukan wawancara & asesmen",
      "Remote",
      "HR + Kepala Unit",
      "Per posisi",
      "Penilaian kandidat",
      "Direksi menyetujui level senior"
    ],
    [
      "SDM & Administrasi",
      "Menyiapkan kontrak kerja & dokumen onboarding",
      "AI",
      "AG-17 Document",
      "Per karyawan",
      "Kontrak & berkas",
      "HR menandatangani bersama karyawan"
    ],
    [
      "SDM & Administrasi",
      "Menghitung payroll, BPJS, dan THR",
      "AI",
      "AG-14 + HR",
      "Bulanan",
      "Slip gaji & bukti setor",
      "HR Manager memverifikasi"
    ],
    [
      "SDM & Administrasi",
      "Mengelola absensi, cuti, dan lembur",
      "AI",
      "AG-16",
      "Harian",
      "Rekap absensi",
      "HR memeriksa anomali"
    ],
    [
      "SDM & Administrasi",
      "Menyerahkan seragam, kartu akses, dan perlengkapan",
      "On-site",
      "GA + HR",
      "Per karyawan",
      "Berita acara serah terima",
      "GA mencatat inventaris"
    ],
    [
      "SDM & Administrasi",
      "Menyelenggarakan pelatihan kepatuhan & AI",
      "Remote",
      "Compliance + AI Office",
      "Triwulanan",
      "Daftar hadir & materi",
      "CRO menilai efektivitas"
    ],
    [
      "SDM & Administrasi",
      "Menangani keluhan & disiplin karyawan",
      "On-site",
      "HR Manager",
      "Insidental",
      "Berita acara",
      "Direksi memutuskan sanksi"
    ],
    [
      "SDM & Administrasi",
      "Menilai kinerja tahunan (KPI)",
      "Remote",
      "HR + atasan langsung",
      "Tahunan",
      "Form penilaian",
      "Direksi mengesahkan"
    ],
    [
      "SDM & Administrasi",
      "Mengurus pemutusan hubungan kerja & serah terima",
      "On-site",
      "HR + Legal",
      "Insidental",
      "Dokumen PHK & exit clearance",
      "Direksi menyetujui"
    ],
    [
      "Kepatuhan & Korporasi",
      "Memantau aturan baru (POJK, PMK, UU)",
      "AI",
      "AG-13 Compliance",
      "Harian",
      "Register kepatuhan",
      "Compliance memberi pendapat"
    ],
    [
      "Kepatuhan & Korporasi",
      "Screening sanksi & PEP untuk mitra baru",
      "AI",
      "AG-13 Compliance",
      "Per mitra",
      "Hasil screening",
      "Compliance memutuskan lanjut/tidak"
    ],
    [
      "Kepatuhan & Korporasi",
      "Menjawab surat permintaan data regulator",
      "Remote",
      "CRO + Legal + Kurir",
      "Per surat",
      "Surat jawaban",
      "Direksi menandatangani"
    ],
    [
      "Kepatuhan & Korporasi",
      "Menyelenggarakan RUPS & notulen",
      "On-site",
      "Corporate Secretary + Notaris",
      "Tahunan",
      "Akta & notulen",
      "Pemegang saham menandatangani"
    ],
    [
      "Kepatuhan & Korporasi",
      "Memperbarui data OSS/AHU (direksi, alamat, KBLI)",
      "On-site",
      "Corporate Secretary + Kurir",
      "Per perubahan",
      "Bukti pembaruan",
      "Direksi mengesahkan"
    ],
    [
      "Kepatuhan & Korporasi",
      "Melakukan audit internal lapangan (kas, stok, aset)",
      "On-site",
      "Internal Audit",
      "Triwulanan",
      "Laporan temuan",
      "Komisaris menerima laporan"
    ],
    [
      "Kepatuhan & Korporasi",
      "Menguji kepatuhan penggunaan AI & audit log",
      "AI",
      "AG-18 + AI QA",
      "Bulanan",
      "Laporan uji",
      "AI Office Manager menindaklanjuti"
    ],
    [
      "Kepatuhan & Korporasi",
      "Menangani sengketa & somasi",
      "Remote",
      "Legal Counsel + Law firm",
      "Insidental",
      "Strategi & dokumen",
      "Direksi memutuskan"
    ],
    [
      "Aset Fisik & Lapangan",
      "Merestock vending machine & mesin",
      "On-site",
      "Technician",
      "2-3x/minggu per unit",
      "Laporan restock & kas",
      "Field Supervisor memeriksa"
    ],
    [
      "Aset Fisik & Lapangan",
      "Memperbaiki mesin/unit yang rusak",
      "On-site",
      "Technician",
      "Per tiket",
      "Work order selesai",
      "Field Ops Manager menutup tiket"
    ],
    [
      "Aset Fisik & Lapangan",
      "Mengumpulkan dan menyetor uang tunai unit",
      "On-site",
      "Field Supervisor",
      "Harian",
      "Bukti setor bank",
      "Finance merekonsiliasi"
    ],
    [
      "Aset Fisik & Lapangan",
      "Stock opname suku cadang & inventaris",
      "On-site",
      "Field Supervisor + Procurement",
      "Bulanan",
      "Berita acara opname",
      "Internal Audit menguji acak"
    ],
    [
      "Aset Fisik & Lapangan",
      "Mengawasi pekerjaan operator/tenant properti",
      "On-site",
      "Property Officer",
      "Mingguan",
      "Laporan kunjungan",
      "Kepala D7 memverifikasi"
    ],
    [
      "Aset Fisik & Lapangan",
      "Mendampingi petani/peternak mitra",
      "On-site",
      "Field Coordinator",
      "Mingguan",
      "Catatan lapangan",
      "Agronomist menganalisis"
    ],
    [
      "Aset Fisik & Lapangan",
      "Mengukur hasil panen dan mengirim ke offtaker",
      "On-site",
      "Field Coordinator",
      "Per panen",
      "Berat & harga jual",
      "Head D9 menyetujui"
    ],
    [
      "Aset Fisik & Lapangan",
      "Menjaga aset di lokasi (gudang, kebun, lahan)",
      "Vendor",
      "Vendor satpam lokal",
      "Harian",
      "Log jaga",
      "Field Ops Manager memeriksa"
    ],
    [
      "Aset Fisik & Lapangan",
      "Memindahkan/menyerahkan aset baru (serah terima)",
      "On-site",
      "Field Supervisor + Procurement",
      "Per akuisisi",
      "Berita acara serah terima",
      "Custody Admin mencatat register"
    ],
    [
      "Aset Fisik & Lapangan",
      "Memotret & mendokumentasikan kondisi aset",
      "On-site",
      "AG-07 + Field Supervisor",
      "Bulanan",
      "Foto & laporan kondisi",
      "Audit membandingkan fisik"
    ]
  ],
  "outsource": [
    [
      "Cleaning service & office boy",
      "Harian",
      "Rp4–8 jt/bln per 2 orang",
      "SLA kebersihan, penalti keterlambatan"
    ],
    [
      "Security / satpam",
      "24/7 (3 shift)",
      "Rp18–35 jt/bln per 3 orang",
      "Sertifikat Gada Pratama, laporan ronde"
    ],
    [
      "Kurir & ekspedisi",
      "Sesuai kebutuhan",
      "Rp1–4 jt/bln",
      "Asuransi pengiriman dokumen"
    ],
    [
      "Driver (bila tidak in-house)",
      "Harian/bulanan",
      "Rp6–10 jt/bln per orang",
      "SIM aktif, log perjalanan"
    ],
    [
      "Pantry & katering rapat",
      "Harian",
      "Rp3–6 jt/bln",
      "Standar higienis, daftar menu"
    ],
    [
      "Taman & kebersihan luar",
      "Bulanan",
      "Rp2–5 jt/bln",
      "Jadwal perawatan"
    ],
    [
      "Pemeliharaan AC, lift, genset",
      "Triwulanan",
      "Rp3–8 jt/bln",
      "Berita acara servis"
    ],
    [
      "Pest control & K3",
      "Triwulanan/semesteran",
      "Rp1–3 jt/bln",
      "Sertifikat resmi"
    ],
    [
      "IT support & helpdesk",
      "Jam kerja",
      "Rp5–15 jt/bln",
      "SLA respons 4 jam"
    ],
    [
      "Payroll & administrasi BPJS",
      "Bulanan",
      "Rp2–5 jt/bln",
      "Kerahasiaan data"
    ],
    [
      "Notaris & PPAT",
      "Per transaksi",
      "Rp5–25 jt per akta",
      "Retainer tahunan tersedia"
    ],
    [
      "KAP (audit tahunan)",
      "Tahunan",
      "Rp60–200 jt/tahun",
      "Independensi & opini"
    ],
    [
      "Law firm",
      "Per kasus/retainer",
      "Rp25–100 jt/tahun",
      "Kerahasiaan & konflik kepentingan"
    ],
    [
      "KJPP (appraisal properti)",
      "Per 3 tahun",
      "Rp5–20 jt per objek",
      "Penilai berizin"
    ],
    [
      "Broker asuransi",
      "Tahunan",
      "Komisi dari premi",
      "Perbandingan minimal 3 polis"
    ]
  ],
  "total_aset": 160,
  "scenarios": [
    {
      "k": "properti",
      "label": "Tawaran properti (kos 12 kamar)",
      "steps": [
        [
          "Eksternal",
          "Agen properti mengirim brosur & harga lewat WhatsApp Business",
          "ext"
        ],
        [
          "AG-01",
          "Membuat tiket, klasifikasi properti/akuisisi, prioritas menengah",
          "ai"
        ],
        [
          "AG-06",
          "Menarik NJOP, komparasi 5 listing, jadwal survei, cek status sertifikat",
          "ai"
        ],
        [
          "D7",
          "Analis properti menelaah hasil, menyusun proyeksi yield & IRR",
          "human"
        ],
        [
          "AG-04",
          "Menghitung 3 skenario nilai + sensitivitas okupansi",
          "ai"
        ],
        [
          "AG-03",
          "Menyiapkan checklist DD: sertifikat, IMB/PBG, sengketa, pajak",
          "ai"
        ],
        [
          "D7 + S5",
          "Survei lokasi + verifikasi sertifikat ke PPAT/BPN",
          "human"
        ],
        [
          "IC",
          "Rapat Investment Committee: setuju / tolak / negosiasi harga",
          "human",
          "approve"
        ],
        [
          "AG-17",
          "Menyiapkan draft PPJB & dokumen pembayaran",
          "ai"
        ],
        [
          "Direktur",
          "Menandatangani perjanjian & instruksi transfer",
          "human",
          "approve"
        ]
      ]
    },
    {
      "k": "saham",
      "label": "Alokasi ke saham & ETF",
      "steps": [
        [
          "AG-05",
          "Briefing pagi: harga, berita emiten, perubahan rating",
          "ai"
        ],
        [
          "D2",
          "Analis ekuitas menetapkan kandidat & tesis investasi",
          "human"
        ],
        [
          "AG-02",
          "Menyusun memo singkat + skor risiko + ukuran posisi",
          "ai"
        ],
        [
          "S2",
          "Cek kepatuhan: limit 10% per emiten, daftar larangan",
          "ai"
        ],
        [
          "Kepala Desk",
          "Menyetujui pembelian sesuai kewenangan (≤ Rp500 jt)",
          "human",
          "approve"
        ],
        [
          "S4",
          "Eksekusi via sekuritas berizin, settlement T+2, rekonsiliasi",
          "human"
        ],
        [
          "AG-12",
          "Memperbarui NAV & exposure harian",
          "ai"
        ]
      ]
    },
    {
      "k": "digital",
      "label": "Akuisisi website / SaaS",
      "steps": [
        [
          "Eksternal",
          "Marketplace mengirim listing: profit USD 8k/bulan, harga 3,2x ARR",
          "ext"
        ],
        [
          "AG-01",
          "Tiket: aset digital, prioritas tinggi (deal flow langka)",
          "ai"
        ],
        [
          "AG-11",
          "Audit trafik, kanal pendapatan, churn, dependensi platform",
          "ai"
        ],
        [
          "D6",
          "Analis menilai kualitas trafik & risiko algoritma",
          "human"
        ],
        [
          "AG-03",
          "DD legal: kepemilikan domain, kontrak, sengketa merek",
          "ai"
        ],
        [
          "AG-04",
          "Valuasi banding 3 metode + skenario trafik turun 30%",
          "ai"
        ],
        [
          "IC",
          "Keputusan: batas harga maksimum",
          "human",
          "approve"
        ],
        [
          "S5 + AG-17",
          "Draft SPA, escrow, migrasi aset, POA",
          "human"
        ],
        [
          "Direktur",
          "Menandatangani SPA & melepas pembayaran via escrow",
          "human",
          "approve"
        ]
      ]
    },
    {
      "k": "kripto",
      "label": "Pembelian & custody kripto",
      "steps": [
        [
          "AG-10",
          "Cek posisi, harga, likuiditas, dan batas keras 3% portofolio",
          "ai"
        ],
        [
          "S2",
          "Verifikasi batas & sumber dana (KYC)",
          "ai"
        ],
        [
          "D5",
          "Kepala desk menyetujui pembelian sesuai limit",
          "human",
          "approve"
        ],
        [
          "S4",
          "Eksekusi di PAKD berizin; pencatatan PPh 22 final 0,21%",
          "human"
        ],
        [
          "AG-10 + 2 pejabat",
          "Penyimpanan: multi-sig, 2 dari 3 tanda tangan manusia",
          "human",
          "approve"
        ],
        [
          "AG-12",
          "Laporan posisi & rekap pajak transaksi",
          "ai"
        ]
      ]
    },
    {
      "k": "vendor",
      "label": "Tagihan vendor & pembayaran",
      "steps": [
        [
          "Eksternal",
          "Vendor mengirim invoice via e-mail kantorai@",
          "ext"
        ],
        [
          "AG-01",
          "Tiket: keuangan/pembayaran; verifikasi vendor terdaftar",
          "ai"
        ],
        [
          "AG-16",
          "Cek kontrak, termin, dan evaluasi kinerja vendor",
          "ai"
        ],
        [
          "AG-14",
          "Verifikasi invoice vs PO, hitung pajak, siapkan jurnal",
          "ai"
        ],
        [
          "CFO",
          "Menyetujui pembayaran ≤ Rp500 jt (empat mata)",
          "human",
          "approve"
        ],
        [
          "Direktur",
          "Menyetujui pembayaran > Rp500 jt",
          "human",
          "approve"
        ],
        [
          "S3",
          "Transfer & arsip bukti; AG-12 mencatat ke arus kas",
          "human"
        ]
      ]
    },
    {
      "k": "regulator",
      "label": "Surat dari regulator (OJK/DJP)",
      "steps": [
        [
          "Eksternal",
          "Surat permintaan data diterima (scan/fisik)",
          "ext"
        ],
        [
          "AG-01",
          "Tiket: kepatuhan, prioritas tertinggi, tenggat dipasang",
          "ai",
          "approve"
        ],
        [
          "AG-13",
          "Membaca surat, menyusun daftar data yang diminta & dasar hukum",
          "ai"
        ],
        [
          "S2 + S5",
          "Menelaah jawaban, memastikan tidak ada pengakuan yang salah",
          "human",
          "approve"
        ],
        [
          "D1/D2/S3",
          "Mengumpulkan data portofolio & transaksi",
          "human"
        ],
        [
          "Direktur",
          "Menandatangani surat jawaban",
          "human",
          "approve"
        ],
        [
          "AG-12",
          "Mengarsipkan korespondensi 10 tahun + catat di register",
          "ai"
        ]
      ]
    }
  ],
  "office": {
    "members": [
      {
        "id": "M1",
        "nama": "Rangga Adhisurya",
        "jabatan": "Direktur Utama",
        "unit": "S1 · CIO Office & Investment Committee",
        "tier": "Pemilik",
        "warna": "#b8860b",
        "ruang": "direksi",
        "akses": [
          "absen",
          "kom",
          "surat",
          "laporan",
          "proyek",
          "rapat",
          "log",
          "kelola",
          "tamu",
          "cuti",
          "tiket",
          "pengumuman",
          "kalender",
          "arsip",
          "polling",
          "tugas",
          "shift",
          "ttd"
        ],
        "tugas": [
          [
            "Memantau listing dan tawaran masuk",
            "AI",
            "AG-01 Router + AG-05",
            "Harian"
          ],
          [
            "Menyusun memo investasi & skor risiko",
            "AI",
            "AG-02 Deal Memo",
            "Per deal"
          ],
          [
            "Mengumpulkan dan mengekstrak dokumen due diligence",
            "AI",
            "AG-03 Data Room",
            "Per deal"
          ],
          [
            "Menghitung valuasi 3 skenario",
            "AI",
            "AG-04 Valuation",
            "Per deal"
          ]
        ]
      },
      {
        "id": "M2",
        "nama": "Kirana Prameswari",
        "jabatan": "Head of Investment",
        "unit": "D2 · Ekuitas Publik",
        "tier": "Manajemen",
        "warna": "#2e5c8a",
        "ruang": "dealing",
        "akses": [
          "absen",
          "kom",
          "surat",
          "laporan",
          "proyek",
          "rapat",
          "log",
          "cuti",
          "kalender",
          "arsip",
          "polling",
          "tugas",
          "tiket",
          "ttd",
          "pengumuman"
        ],
        "tugas": [
          [
            "Memantau listing dan tawaran masuk",
            "AI",
            "AG-01 Router + AG-05",
            "Harian"
          ],
          [
            "Menyusun memo investasi & skor risiko",
            "AI",
            "AG-02 Deal Memo",
            "Per deal"
          ],
          [
            "Mengumpulkan dan mengekstrak dokumen due diligence",
            "AI",
            "AG-03 Data Room",
            "Per deal"
          ],
          [
            "Menghitung valuasi 3 skenario",
            "AI",
            "AG-04 Valuation",
            "Per deal"
          ]
        ]
      },
      {
        "id": "M3",
        "nama": "Bimo Saputra",
        "jabatan": "Dealer Saham & Obligasi",
        "unit": "D3 · Seleksi Reksa Dana & ETF",
        "tier": "Staf",
        "warna": "#0f9d8a",
        "ruang": "dealing",
        "akses": [
          "absen",
          "kom",
          "surat",
          "proyek",
          "rapat",
          "cuti",
          "kalender",
          "tugas",
          "pengumuman",
          "polling"
        ],
        "tugas": [
          [
            "Memantau listing dan tawaran masuk",
            "AI",
            "AG-01 Router + AG-05",
            "Harian"
          ],
          [
            "Menyusun memo investasi & skor risiko",
            "AI",
            "AG-02 Deal Memo",
            "Per deal"
          ],
          [
            "Mengumpulkan dan mengekstrak dokumen due diligence",
            "AI",
            "AG-03 Data Room",
            "Per deal"
          ],
          [
            "Menghitung valuasi 3 skenario",
            "AI",
            "AG-04 Valuation",
            "Per deal"
          ]
        ]
      },
      {
        "id": "M4",
        "nama": "Nadia Kusuma",
        "jabatan": "Analis Properti & Aset Fisik",
        "unit": "D7 · Properti & Tanah",
        "tier": "Staf",
        "warna": "#7a5bb5",
        "ruang": "proyek",
        "akses": [
          "absen",
          "kom",
          "laporan",
          "proyek",
          "rapat",
          "cuti",
          "kalender",
          "tugas",
          "arsip",
          "pengumuman"
        ],
        "tugas": [
          [
            "Memantau listing dan tawaran masuk",
            "AI",
            "AG-01 Router + AG-05",
            "Harian"
          ],
          [
            "Menyusun memo investasi & skor risiko",
            "AI",
            "AG-02 Deal Memo",
            "Per deal"
          ],
          [
            "Mengumpulkan dan mengekstrak dokumen due diligence",
            "AI",
            "AG-03 Data Room",
            "Per deal"
          ],
          [
            "Menghitung valuasi 3 skenario",
            "AI",
            "AG-04 Valuation",
            "Per deal"
          ]
        ]
      },
      {
        "id": "M5",
        "nama": "Aditya Rahim",
        "jabatan": "Compliance & Legal Officer",
        "unit": "S2 · Risk, Compliance & APU-PPT",
        "tier": "Manajemen",
        "warna": "#b4493c",
        "ruang": "kepatuhan",
        "akses": [
          "absen",
          "kom",
          "surat",
          "laporan",
          "rapat",
          "log",
          "cuti",
          "arsip",
          "ttd",
          "pengumuman",
          "tiket"
        ],
        "tugas": [
          [
            "Memantau aturan baru (POJK, PMK, UU)",
            "AI",
            "AG-13 Compliance",
            "Harian"
          ],
          [
            "Screening sanksi & PEP untuk mitra baru",
            "AI",
            "AG-13 Compliance",
            "Per mitra"
          ],
          [
            "Menjawab surat permintaan data regulator",
            "Remote",
            "CRO + Legal + Kurir",
            "Per surat"
          ],
          [
            "Menyelenggarakan RUPS & notulen",
            "On-site",
            "Corporate Secretary + Notaris",
            "Tahunan"
          ]
        ]
      },
      {
        "id": "M6",
        "nama": "Sari Handayani",
        "jabatan": "Finance & Tax Lead",
        "unit": "S3 · Finance, Tax & Accounting",
        "tier": "Manajemen",
        "warna": "#c98a12",
        "ruang": "keuangan",
        "akses": [
          "absen",
          "kom",
          "surat",
          "laporan",
          "proyek",
          "cuti",
          "tiket",
          "arsip",
          "ttd",
          "pengumuman",
          "shift"
        ],
        "tugas": [
          [
            "Mengimpor transaksi bank dan membuat jurnal",
            "AI",
            "AG-14 Finance & Tax",
            "Harian"
          ],
          [
            "Merekonsiliasi bank dan akun antar-perusahaan",
            "AI",
            "AG-14 Finance & Tax",
            "Bulanan"
          ],
          [
            "Menghitung dan menyetorkan PPh 21/23/final & PPN",
            "AI",
            "AG-14 + Tax Specialist",
            "Bulanan"
          ],
          [
            "Menyusun laporan keuangan bulanan & konsolidasi",
            "AI",
            "AG-12 + Reporting Officer",
            "Bulanan"
          ]
        ]
      },
      {
        "id": "M7",
        "nama": "Yusuf Maulana",
        "jabatan": "GA Manager",
        "unit": "S12 · General Affairs, Fasilitas & Umum",
        "tier": "Manajemen",
        "warna": "#3f7d4f",
        "ruang": "ga",
        "akses": [
          "absen",
          "kom",
          "surat",
          "laporan",
          "proyek",
          "rapat",
          "tamu",
          "cuti",
          "tiket",
          "pengumuman",
          "kalender",
          "shift",
          "tugas"
        ],
        "tugas": [
          [
            "Membuka kantor, menyalakan listrik/AC, cek fasilitas",
            "On-site",
            "Office Boy",
            "Harian"
          ],
          [
            "Membersihkan ruang kerja, toilet, dan ruang rapat",
            "Vendor",
            "Vendor cleaning service",
            "Harian"
          ],
          [
            "Menyiapkan ruang rapat (meja, proyektor, jamuan)",
            "On-site",
            "Office Boy + Pantry",
            "Per rapat"
          ],
          [
            "Menerima tamu dan mengarahkan ke ruang tunggu",
            "On-site",
            "Receptionist",
            "Harian"
          ]
        ]
      },
      {
        "id": "M8",
        "nama": "KAP Wijaya & Rekan",
        "jabatan": "Auditor Eksternal (Tamu)",
        "unit": "Eksternal · Audit KAP",
        "tier": "Auditor",
        "warna": "#5f6f86",
        "ruang": "tamu",
        "akses": [
          "laporan",
          "surat",
          "log",
          "arsip"
        ],
        "tugas": [
          [
            "Memantau aturan baru (POJK, PMK, UU)",
            "AI",
            "AG-13 Compliance",
            "Harian"
          ],
          [
            "Screening sanksi & PEP untuk mitra baru",
            "AI",
            "AG-13 Compliance",
            "Per mitra"
          ],
          [
            "Menjawab surat permintaan data regulator",
            "Remote",
            "CRO + Legal + Kurir",
            "Per surat"
          ],
          [
            "Menyelenggarakan RUPS & notulen",
            "On-site",
            "Corporate Secretary + Notaris",
            "Tahunan"
          ]
        ]
      },
      {
        "id": "M9",
        "nama": "PT Bersih Cemerlang",
        "jabatan": "Vendor Fasilitas (Tamu)",
        "unit": "Eksternal · Vendor",
        "tier": "Tamu",
        "warna": "#8a6a3c",
        "ruang": "tamu",
        "akses": [
          "kom",
          "surat"
        ],
        "tugas": [
          [
            "Membersihkan area pantry dan mesin kopi",
            "On-site",
            "Pantry Officer",
            "Harian"
          ],
          [
            "Mengelola stok kopi, teh, air minum",
            "On-site",
            "Pantry Officer",
            "Mingguan"
          ],
          [
            "Menyiapkan jamuan untuk tamu direksi",
            "On-site",
            "Pantry Officer",
            "Per acara"
          ],
          [
            "Memotong rumput dan merawat tanaman",
            "Vendor",
            "Vendor taman",
            "Bulanan"
          ]
        ]
      }
    ],
    "meets": [
      [
        "G1",
        "Rapat Investasi Mingguan",
        540,
        585,
        "rapat",
        [
          "M1",
          "M2",
          "M3",
          "M4",
          "M5"
        ],
        "Alokasi kas bulan ini, tinjauan 6 tawaran properti, keputusan beli/tunda"
      ],
      [
        "G2",
        "Disposisi Surat & Tanda Tangan",
        660,
        690,
        "direksi",
        [
          "M1",
          "M5",
          "M7"
        ],
        "Tanda tangan perjanjian vendor kebersihan dan instruksi transfer termin 1"
      ],
      [
        "G3",
        "Tender Vendor Kebersihan 2027",
        810,
        855,
        "rapat",
        [
          "M1",
          "M6",
          "M7"
        ],
        "Evaluasi 4 penawaran, verifikasi BPJS & izin usaha, penetapan pemenang"
      ],
      [
        "G4",
        "Tinjauan Kepatuhan Triwulan",
        900,
        940,
        "kepatuhan",
        [
          "M1",
          "M5",
          "M8"
        ],
        "Uji petik 30 transaksi, cek pemisahan rekening titipan, temuan audit"
      ]
    ],
    "letters": [
      [
        "001/HI/XI/2026",
        "2026-11-03",
        "Masuk",
        "PT Bersih Cemerlang",
        "Penawaran jasa kebersihan 12 bulan",
        "S12 · GA",
        "Didisposisi"
      ],
      [
        "002/HI/XI/2026",
        "2026-11-05",
        "Masuk",
        "Notaris Ratna & Rekan",
        "Draf akta pendirian PT Holding",
        "S2 · Kepatuhan",
        "Selesai"
      ],
      [
        "003/HI/XI/2026",
        "2026-11-06",
        "Keluar",
        "Bank Kustodian",
        "Permohonan pembukaan rekening efek perusahaan",
        "S3 · Keuangan",
        "Terkirim"
      ],
      [
        "004/HI/XI/2026",
        "2026-11-10",
        "Masuk",
        "KJPP Mitra Nilai",
        "Laporan penilaian ruko Kemang (Rp4,8 M)",
        "D7 · Properti",
        "Didisposisi"
      ],
      [
        "005/HI/XI/2026",
        "2026-11-12",
        "Keluar",
        "Vendor AC & Genset",
        "Instruksi pemeliharaan preventif lantai 3",
        "S12 · GA",
        "Terkirim"
      ],
      [
        "006/HI/XI/2026",
        "2026-11-17",
        "Masuk",
        "OJK — Satgas PAKDM",
        "Permintaan klarifikasi produk kripto yang dipasarkan",
        "S2 · Kepatuhan",
        "Perlu jawaban"
      ]
    ],
    "projects": [
      [
        "Akuisisi ruko Kemang",
        "M4",
        "berjalan",
        "2026-12-15",
        "DD sertifikat, NJOP, survei 2x selesai"
      ],
      [
        "Kustodian kripto multi-sig 2-dari-3",
        "M2",
        "review",
        "2026-11-30",
        "Uji pemulihan kunci, audit prosedur"
      ],
      [
        "Renovasi lantai 3 (ruang rapat)",
        "M7",
        "berjalan",
        "2027-01-20",
        "Kontraktor terpilih, IMB proses"
      ],
      [
        "Implementasi Coretax & e-Bupot",
        "M6",
        "berjalan",
        "2026-12-01",
        "Migrasi 3 tahun data, uji pelaporan"
      ],
      [
        "Perjanjian vendor kebersihan 2027",
        "M7",
        "rencana",
        "2026-12-05",
        "Tender G3, target hemat 8%"
      ],
      [
        "Pemisahan rekening titipan klien",
        "M5",
        "review",
        "2026-11-25",
        "Rekonsiliasi harian otomatis"
      ],
      [
        "Rebalance portofolio obligasi",
        "M3",
        "berjalan",
        "2026-12-10",
        "Durasi 3,2 → 2,7 tahun"
      ],
      [
        "Sertifikasi HKI merek dagang",
        "M5",
        "rencana",
        "2027-02-10",
        "Pendaftaran 3 kelas"
      ],
      [
        "Audit KAP tahun buku 2026",
        "M8",
        "rencana",
        "2027-03-31",
        "Uji petik Q1 mulai Desember"
      ],
      [
        "Digitalisasi arsip fisik 2019–2025",
        "M7",
        "selesai",
        "2026-11-10",
        "12.400 dokumen, indeks selesai"
      ]
    ],
    "chats": {
      "umum": [
        [
          "M7",
          "Selamat pagi. AC lantai 3 sudah normal, teknisi selesai 07:40.",
          455
        ],
        [
          "M2",
          "Terima kasih. Rapat investasi pindah ke ruang rapat utama ya.",
          470
        ]
      ],
      "investasi": [
        [
          "M3",
          "Order SUN FR0104 tereksekusi 2,1 M di 98,45. Konfirmasi kustodian masuk.",
          505
        ],
        [
          "M4",
          "Ruko Kemang: NJOP 3,1 M, penawaran 4,8 M. Yield kotor 7,4%.",
          520
        ]
      ],
      "ga-fasilitas": [
        [
          "M7",
          "Stok pantry minggu ini: air 12 dus, kopi 4 kg. Kurir ambil dokumen 14:00.",
          500
        ],
        [
          "M9",
          "Tim cleaning 2 orang datang 16:00 untuk wax lantai lobi.",
          512
        ]
      ],
      "kepatuhan": [
        [
          "M5",
          "Surat OJK 006 wajib dijawab maksimal 5 hari kerja.",
          540
        ],
        [
          "M8",
          "Kami butuh akses log transaksi Oktober untuk uji petik.",
          560
        ]
      ],
      "vendor-eksternal": [
        [
          "M9",
          "Penawaran kami 24 juta/bulan, termasuk 2 orang shift malam.",
          552
        ]
      ]
    },
    "kanal": [
      [
        "umum",
        "#umum"
      ],
      [
        "investasi",
        "#investasi"
      ],
      [
        "ga-fasilitas",
        "#ga-fasilitas"
      ],
      [
        "kepatuhan",
        "#kepatuhan"
      ],
      [
        "vendor-eksternal",
        "#vendor-eksternal (eksternal)"
      ]
    ],
    "label": {
      "absen": "Absensi",
      "kom": "Komunikasi",
      "surat": "Surat",
      "laporan": "Laporan",
      "proyek": "Proyek",
      "rapat": "Rapat",
      "log": "Log audit",
      "kelola": "Kelola anggota",
      "tugas": "Papan Tugas",
      "cuti": "Cuti & Izin",
      "tiket": "Helpdesk",
      "tamu": "Buku Tamu",
      "pengumuman": "Pengumuman",
      "kalender": "Kalender",
      "arsip": "Arsip",
      "polling": "Polling",
      "shift": "Shift & Lembur",
      "ttd": "Tanda Tangan"
    },
    "tamu": [
      [
        "T-001",
        "Budi Hartono",
        "PT Bersih Cemerlang",
        "Presentasi penawaran kebersihan 2027",
        "09:05",
        "09:52",
        "M7"
      ],
      [
        "T-002",
        "Ratna Sari, S.H.",
        "Notaris Ratna & Rekan",
        "Penyerahan draf akta pendirian",
        "10:20",
        "",
        "M5"
      ],
      [
        "T-003",
        "Agus Prakoso",
        "KJPP Mitra Nilai",
        "Diskusi penilaian ruko Kemang",
        "13:30",
        "",
        "M4"
      ]
    ],
    "cuti": [
      [
        "C-2611-01",
        "M4",
        "Cuti tahunan",
        "2026-11-24",
        "2026-11-26",
        "Keperluan keluarga",
        "Menunggu"
      ],
      [
        "C-2611-02",
        "M3",
        "Izin",
        "2026-11-20",
        "2026-11-20",
        "Urusan bank",
        "Disetujui"
      ],
      [
        "C-2611-03",
        "M6",
        "Cuti tahunan",
        "2026-12-28",
        "2026-12-31",
        "Liburan akhir tahun",
        "Menunggu"
      ]
    ],
    "saldo": {
      "M1": 12,
      "M2": 10,
      "M3": 8,
      "M4": 9,
      "M5": 11,
      "M6": 7,
      "M7": 6
    },
    "tiket": [
      [
        "HD-041",
        "AC",
        "AC ruang rapat tidak dingin",
        "Ruang Rapat",
        "Tinggi",
        "Teknisi AC (vendor)",
        "Proses"
      ],
      [
        "HD-042",
        "Listrik",
        "Stop kontak pantry mati",
        "Pantry",
        "Sedang",
        "Teknisi gedung",
        "Selesai"
      ],
      [
        "HD-043",
        "IT",
        "Printer lantai 3 macet",
        "Umum & Fasilitas",
        "Rendah",
        "IT support (vendor)",
        "Baru"
      ],
      [
        "HD-044",
        "Kebersihan",
        "Kaca lobi banyak sidik jari",
        "Lobi",
        "Rendah",
        "Cleaning service",
        "Proses"
      ]
    ],
    "peng": [
      [
        "P-01",
        "Tender vendor kebersihan 2027",
        "Evaluasi 4 penawaran hari ini 13:30 di Ruang Rapat. Wajib hadir: GA, Finance, Direktur.",
        "Penting",
        "M7",
        "2026-11-19"
      ],
      [
        "P-02",
        "Jawaban surat OJK",
        "Batas 5 hari kerja. Data portofolio & transaksi Oktober dikumpulkan hari ini.",
        "Mendesak",
        "M5",
        "2026-11-19"
      ],
      [
        "P-03",
        "Renovasi lantai 3",
        "Pekerjaan mulai Senin; ruang rapat pindah sementara ke Rapat Kecil.",
        "Biasa",
        "M7",
        "2026-11-18"
      ]
    ],
    "arsip": [
      [
        "AR-001",
        "Akta pendirian PT Holding",
        "Akta",
        "Kepatuhan",
        "2026-11-06",
        "Rahasia"
      ],
      [
        "AR-002",
        "NPWP & NIB perusahaan",
        "Perizinan",
        "Kepatuhan",
        "2026-11-08",
        "Internal"
      ],
      [
        "AR-003",
        "Laporan penilaian ruko Kemang",
        "Laporan",
        "Properti",
        "2026-11-10",
        "Rahasia"
      ],
      [
        "AR-004",
        "Perjanjian sewa kantor lantai 3",
        "Perjanjian",
        "Umum",
        "2026-10-01",
        "Internal"
      ],
      [
        "AR-005",
        "Kontrak vendor kebersihan 2026",
        "Perjanjian",
        "Umum",
        "2026-01-05",
        "Internal"
      ],
      [
        "AR-006",
        "Rekening koran kustodian Oktober",
        "Keuangan",
        "Keuangan",
        "2026-11-02",
        "Rahasia"
      ],
      [
        "AR-007",
        "Berita acara RUPS triwulan III",
        "Risalah",
        "Korporasi",
        "2026-10-20",
        "Internal"
      ]
    ],
    "poll": {
      "tanya": "Vendor kebersihan 2027: pilih pemenang?",
      "opsi": [
        [
          "PT Bersih Cemerlang — Rp24 jt/bln",
          3
        ],
        [
          "PT Kilau Kantor — Rp26 jt/bln",
          1
        ],
        [
          "CV Sapu Bersih — Rp22 jt/bln",
          1
        ]
      ],
      "voted": []
    },
    "ttd": [
      [
        "TT-01",
        "Perjanjian jasa kebersihan 2027",
        "M1",
        "Menunggu tanda tangan",
        ""
      ],
      [
        "TT-02",
        "Surat jawaban OJK (draf 2)",
        "M1",
        "Menunggu tanda tangan",
        ""
      ],
      [
        "TT-03",
        "Berita acara serah terima arsip",
        "M7",
        "Sudah ditandatangani",
        "9f2c…a71"
      ],
      [
        "TT-04",
        "Instruksi transfer termin 1 vendor",
        "M1",
        "Menunggu tanda tangan",
        ""
      ]
    ],
    "shift": [
      [
        "Pagi",
        "06:00–14:00",
        "Satpam A, OB-1, Resepsionis"
      ],
      [
        "Siang",
        "14:00–22:00",
        "Satpam B, OB-2"
      ],
      [
        "Malam",
        "22:00–06:00",
        "Satpam C (alih daya 24/7)"
      ]
    ],
    "absen": {
      "M1": [
        468,
        null
      ],
      "M2": [
        472,
        null
      ],
      "M3": [
        489,
        null
      ],
      "M4": [
        null,
        null
      ],
      "M5": [
        470,
        null
      ],
      "M6": [
        466,
        null
      ],
      "M7": [
        462,
        null
      ],
      "M8": [
        555,
        615
      ],
      "M9": [
        560,
        610
      ]
    },
    "layout": {
      "floors": [
        {
          "nama": "Lantai 1 — Investasi",
          "sub": "12 unit investasi + direksi",
          "rooms": [
            {
              "k": "D1",
              "n": "Kas & Pendapatan Tetap",
              "x": 1,
              "y": 1,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "D2",
              "n": "Ekuitas Publik",
              "x": 7,
              "y": 1,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "D3",
              "n": "Seleksi Reksa Dana & ETF",
              "x": 13,
              "y": 1,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "D4",
              "n": "Valas, Komoditas & Derivatif",
              "x": 19,
              "y": 1,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "D5",
              "n": "Kripto & Aset Digital Trading",
              "x": 1,
              "y": 6,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "D6",
              "n": "Bisnis Digital & Kekayaan Intelektual",
              "x": 7,
              "y": 6,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "D7",
              "n": "Properti & Tanah",
              "x": 13,
              "y": 6,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "D8",
              "n": "Aset Fisik Produktif",
              "x": 19,
              "y": 6,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "D9",
              "n": "Agrikultur & Alam",
              "x": 1,
              "y": 11,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "D10",
              "n": "Koleksi & Aset Gaya Hidup",
              "x": 7,
              "y": 11,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "D11",
              "n": "Asuransi & Pensiun",
              "x": 13,
              "y": 11,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "D12",
              "n": "Bisnis & Usaha Langsung",
              "x": 19,
              "y": 11,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "DIR",
              "n": "Direksi",
              "x": 1,
              "y": 16,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "rapat",
              "n": "Ruang Rapat",
              "x": 7,
              "y": 16,
              "w": 5,
              "d": 4,
              "f": "carpet",
              "type": "rapat"
            },
            {
              "k": "pantry",
              "n": "Pantry",
              "x": 13,
              "y": 16,
              "w": 5,
              "d": 4,
              "f": "tile",
              "type": "pantry"
            },
            {
              "k": "tamu",
              "n": "Lobby & Ruang Tamu",
              "x": 19,
              "y": 16,
              "w": 5,
              "d": 4,
              "f": "carpet",
              "type": "tamu"
            }
          ],
          "furn": [
            [
              1.35,
              1.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              5.25,
              4.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              1.4,
              4.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              7.35,
              1.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              11.25,
              4.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              7.4,
              4.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              13.35,
              1.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              17.25,
              4.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              13.4,
              4.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              19.35,
              1.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              23.25,
              4.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              19.4,
              4.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              1.35,
              6.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              5.25,
              9.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              1.4,
              9.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              7.35,
              6.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              11.25,
              9.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              7.4,
              9.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              13.35,
              6.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              14.9,
              6.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              17.25,
              9.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              13.4,
              9.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              19.35,
              6.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              20.900000000000002,
              6.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              23.25,
              9.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              19.4,
              9.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              1.35,
              11.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              5.25,
              14.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              1.4,
              14.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              7.35,
              11.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              11.25,
              14.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              7.4,
              14.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              13.35,
              11.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              17.25,
              14.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              13.4,
              14.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              19.35,
              11.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              23.25,
              14.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              19.4,
              14.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              1.35,
              16.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              2.9000000000000004,
              16.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              5.25,
              19.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              1.4,
              19.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              8,
              17,
              3,
              0.9,
              0.44,
              "table"
            ],
            [
              7.4,
              16.15,
              1.8,
              0.16,
              0.9,
              "board"
            ],
            [
              11.25,
              19.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              13.3,
              16.4,
              3,
              0.7,
              0.86,
              "counter"
            ],
            [
              16.9,
              16.4,
              0.9,
              1.4,
              0.86,
              "counter"
            ],
            [
              14.3,
              18.1,
              1.3,
              0.7,
              0.4,
              "table"
            ],
            [
              17.25,
              19.3,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              19.4,
              16.5,
              2,
              0.8,
              0.5,
              "sofa"
            ],
            [
              22,
              16.5,
              1.5,
              0.75,
              0.46,
              "desk"
            ],
            [
              20.9,
              17.5,
              1.2,
              0.55,
              0.36,
              "ctable"
            ],
            [
              23.25,
              19.3,
              0.55,
              0.55,
              1.05,
              "plant"
            ]
          ],
          "seats": {
            "D1": [
              {
                "x": 2.05,
                "y": 3.3,
                "i": 0
              }
            ],
            "D2": [
              {
                "x": 8.049999999999999,
                "y": 3.3,
                "i": 0
              }
            ],
            "D3": [
              {
                "x": 14.049999999999999,
                "y": 3.3,
                "i": 0
              }
            ],
            "D4": [
              {
                "x": 20.05,
                "y": 3.3,
                "i": 0
              }
            ],
            "D5": [
              {
                "x": 2.05,
                "y": 8.3,
                "i": 0
              }
            ],
            "D6": [
              {
                "x": 8.049999999999999,
                "y": 8.3,
                "i": 0
              }
            ],
            "D7": [
              {
                "x": 14.049999999999999,
                "y": 8.3,
                "i": 0
              },
              {
                "x": 15.6,
                "y": 8.3,
                "i": 1
              }
            ],
            "D8": [
              {
                "x": 20.05,
                "y": 8.3,
                "i": 0
              },
              {
                "x": 21.6,
                "y": 8.3,
                "i": 1
              }
            ],
            "D9": [
              {
                "x": 2.05,
                "y": 13.3,
                "i": 0
              }
            ],
            "D10": [
              {
                "x": 8.049999999999999,
                "y": 13.3,
                "i": 0
              }
            ],
            "D11": [
              {
                "x": 14.049999999999999,
                "y": 13.3,
                "i": 0
              }
            ],
            "D12": [
              {
                "x": 20.05,
                "y": 13.3,
                "i": 0
              }
            ]
          },
          "meet": [
            {
              "x": 8.4,
              "y": 16.45
            },
            {
              "x": 9.5,
              "y": 16.45
            },
            {
              "x": 10.6,
              "y": 16.45
            },
            {
              "x": 8.4,
              "y": 18.5
            },
            {
              "x": 9.5,
              "y": 18.5
            },
            {
              "x": 10.6,
              "y": 18.5
            }
          ],
          "pantry": [
            {
              "x": 14,
              "y": 17.5
            },
            {
              "x": 15.1,
              "y": 17.5
            },
            {
              "x": 16.2,
              "y": 17.5
            },
            {
              "x": 14.9,
              "y": 19.1
            },
            {
              "x": 16.4,
              "y": 19.1
            },
            {
              "x": 17.4,
              "y": 18.4
            }
          ],
          "lobby": [
            {
              "x": 22.75,
              "y": 18.15
            },
            {
              "x": 20,
              "y": 19
            },
            {
              "x": 21.2,
              "y": 19
            },
            {
              "x": 22.4,
              "y": 19
            },
            {
              "x": 23.4,
              "y": 19
            }
          ]
        },
        {
          "nama": "Lantai 2 — Pendukung",
          "sub": "12 unit pendukung & umum",
          "rooms": [
            {
              "k": "S1",
              "n": "CIO Office & Investment Committee",
              "x": 1,
              "y": 1,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "S2",
              "n": "Risk, Compliance & APU-PPT",
              "x": 7,
              "y": 1,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "S3",
              "n": "Finance, Tax & Accounting",
              "x": 13,
              "y": 1,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "S4",
              "n": "Operations, Settlement & Custody",
              "x": 19,
              "y": 1,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "S5",
              "n": "Legal & Corporate Secretary",
              "x": 1,
              "y": 6,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "S6",
              "n": "People & Culture",
              "x": 7,
              "y": 6,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "S7",
              "n": "Technology, Data & AI Engineering",
              "x": 13,
              "y": 6,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "S8",
              "n": "Capital & Stakeholder Relations",
              "x": 19,
              "y": 6,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "S9",
              "n": "Internal Audit",
              "x": 1,
              "y": 11,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "S10",
              "n": "AI Operations Center (Kantor AI)",
              "x": 7,
              "y": 11,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "S11",
              "n": "Business Development & Deal Sourcing",
              "x": 13,
              "y": 11,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "S12",
              "n": "General Affairs, Fasilitas & Umum",
              "x": 19,
              "y": 11,
              "w": 5,
              "d": 4,
              "f": "wood",
              "type": "unit"
            },
            {
              "k": "rapat",
              "n": "Rapat Kecil",
              "x": 1,
              "y": 16,
              "w": 5,
              "d": 4,
              "f": "carpet",
              "type": "rapat"
            },
            {
              "k": "pantry",
              "n": "Pantry",
              "x": 7,
              "y": 16,
              "w": 5,
              "d": 4,
              "f": "tile",
              "type": "pantry"
            },
            {
              "k": "tamu",
              "n": "Ruang Tamu & Sekretariat",
              "x": 13,
              "y": 16,
              "w": 5,
              "d": 4,
              "f": "carpet",
              "type": "tamu"
            },
            {
              "k": "arsip",
              "n": "Arsip & Gudang",
              "x": 19,
              "y": 16,
              "w": 5,
              "d": 4,
              "f": "tile",
              "type": "arsip"
            }
          ],
          "furn": [
            [
              1.35,
              1.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              5.25,
              4.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              1.4,
              4.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              7.35,
              1.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              11.25,
              4.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              7.4,
              4.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              13.35,
              1.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              17.25,
              4.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              13.4,
              4.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              19.35,
              1.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              23.25,
              4.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              19.4,
              4.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              1.35,
              6.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              5.25,
              9.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              1.4,
              9.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              7.35,
              6.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              11.25,
              9.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              7.4,
              9.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              13.35,
              6.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              14.9,
              6.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              17.25,
              9.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              13.4,
              9.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              19.35,
              6.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              23.25,
              9.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              19.4,
              9.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              1.35,
              11.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              5.25,
              14.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              1.4,
              14.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              7.35,
              11.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              11.25,
              14.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              7.4,
              14.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              13.35,
              11.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              17.25,
              14.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              13.4,
              14.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              19.35,
              11.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              20.900000000000002,
              11.6,
              1.4,
              0.8,
              0.46,
              "desk"
            ],
            [
              23.25,
              14.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              19.4,
              14.3,
              1.9,
              0.16,
              0.9,
              "board"
            ],
            [
              2,
              17,
              3,
              0.9,
              0.44,
              "table"
            ],
            [
              1.4,
              16.15,
              1.8,
              0.16,
              0.9,
              "board"
            ],
            [
              5.25,
              19.25,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              7.3,
              16.4,
              3,
              0.7,
              0.86,
              "counter"
            ],
            [
              10.9,
              16.4,
              0.9,
              1.4,
              0.86,
              "counter"
            ],
            [
              8.3,
              18.1,
              1.3,
              0.7,
              0.4,
              "table"
            ],
            [
              11.25,
              19.3,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              13.4,
              16.5,
              2,
              0.8,
              0.5,
              "sofa"
            ],
            [
              16,
              16.5,
              1.5,
              0.75,
              0.46,
              "desk"
            ],
            [
              14.9,
              17.5,
              1.2,
              0.55,
              0.36,
              "ctable"
            ],
            [
              17.25,
              19.3,
              0.55,
              0.55,
              1.05,
              "plant"
            ],
            [
              19.5,
              16.35,
              1,
              0.42,
              0.86,
              "shelf"
            ],
            [
              19.5,
              17.15,
              1,
              0.42,
              0.72,
              "shelf"
            ],
            [
              21.7,
              16.45,
              0.9,
              0.7,
              0.38,
              "box"
            ],
            [
              21.7,
              17.55,
              0.9,
              0.7,
              0.38,
              "box"
            ],
            [
              23.25,
              19.3,
              0.55,
              0.55,
              1.05,
              "plant"
            ]
          ],
          "seats": {
            "S1": [
              {
                "x": 2.05,
                "y": 3.3,
                "i": 0
              }
            ],
            "S2": [
              {
                "x": 8.049999999999999,
                "y": 3.3,
                "i": 0
              }
            ],
            "S3": [
              {
                "x": 14.049999999999999,
                "y": 3.3,
                "i": 0
              }
            ],
            "S4": [
              {
                "x": 20.05,
                "y": 3.3,
                "i": 0
              }
            ],
            "S5": [
              {
                "x": 2.05,
                "y": 8.3,
                "i": 0
              }
            ],
            "S6": [
              {
                "x": 8.049999999999999,
                "y": 8.3,
                "i": 0
              }
            ],
            "S7": [
              {
                "x": 14.049999999999999,
                "y": 8.3,
                "i": 0
              },
              {
                "x": 15.6,
                "y": 8.3,
                "i": 1
              }
            ],
            "S8": [
              {
                "x": 20.05,
                "y": 8.3,
                "i": 0
              }
            ],
            "S9": [
              {
                "x": 2.05,
                "y": 13.3,
                "i": 0
              }
            ],
            "S10": [
              {
                "x": 8.049999999999999,
                "y": 13.3,
                "i": 0
              }
            ],
            "S11": [
              {
                "x": 14.049999999999999,
                "y": 13.3,
                "i": 0
              }
            ],
            "S12": [
              {
                "x": 20.05,
                "y": 13.3,
                "i": 0
              },
              {
                "x": 21.6,
                "y": 13.3,
                "i": 1
              }
            ]
          },
          "meet": [
            {
              "x": 2.4,
              "y": 16.45
            },
            {
              "x": 3.5,
              "y": 16.45
            },
            {
              "x": 4.6,
              "y": 16.45
            },
            {
              "x": 2.4,
              "y": 18.5
            },
            {
              "x": 3.5,
              "y": 18.5
            },
            {
              "x": 4.6,
              "y": 18.5
            }
          ],
          "pantry": [
            {
              "x": 8,
              "y": 17.5
            },
            {
              "x": 9.1,
              "y": 17.5
            },
            {
              "x": 10.2,
              "y": 17.5
            },
            {
              "x": 8.9,
              "y": 19.1
            },
            {
              "x": 10.4,
              "y": 19.1
            },
            {
              "x": 11.4,
              "y": 18.4
            }
          ],
          "lobby": [
            {
              "x": 16.75,
              "y": 18.15
            },
            {
              "x": 14,
              "y": 19
            },
            {
              "x": 15.2,
              "y": 19
            },
            {
              "x": 16.4,
              "y": 19
            },
            {
              "x": 17.4,
              "y": 19
            }
          ]
        },
        {
          "nama": "Lantai 3 — Agent AI",
          "sub": "18 agent, aktif 24 jam",
          "rooms": [
            {
              "k": "aihall",
              "n": "Aula Agent AI",
              "x": 1,
              "y": 1,
              "w": 24,
              "d": 18,
              "f": "server",
              "type": "ai"
            }
          ],
          "furn": [
            [
              2,
              2.2,
              1.1,
              0.8,
              1.5,
              "rack"
            ],
            [
              4.6,
              2.2,
              1.1,
              0.8,
              1.5,
              "rack"
            ],
            [
              7.2,
              2.2,
              1.1,
              0.8,
              1.5,
              "rack"
            ],
            [
              9.8,
              2.2,
              1.1,
              0.8,
              1.5,
              "rack"
            ],
            [
              12.4,
              2.2,
              1.1,
              0.8,
              1.5,
              "rack"
            ],
            [
              15,
              2.2,
              1.1,
              0.8,
              1.5,
              "rack"
            ],
            [
              17.6,
              2.2,
              1.1,
              0.8,
              1.5,
              "rack"
            ],
            [
              20.2,
              2.2,
              1.1,
              0.8,
              1.5,
              "rack"
            ],
            [
              2.4,
              6,
              2,
              0.7,
              0.5,
              "aidesk"
            ],
            [
              6,
              6,
              2,
              0.7,
              0.5,
              "aidesk"
            ],
            [
              9.6,
              6,
              2,
              0.7,
              0.5,
              "aidesk"
            ],
            [
              13.200000000000001,
              6,
              2,
              0.7,
              0.5,
              "aidesk"
            ],
            [
              16.8,
              6,
              2,
              0.7,
              0.5,
              "aidesk"
            ],
            [
              20.4,
              6,
              2,
              0.7,
              0.5,
              "aidesk"
            ],
            [
              2.4,
              10,
              2,
              0.7,
              0.5,
              "aidesk"
            ],
            [
              6,
              10,
              2,
              0.7,
              0.5,
              "aidesk"
            ],
            [
              9.6,
              10,
              2,
              0.7,
              0.5,
              "aidesk"
            ],
            [
              13.200000000000001,
              10,
              2,
              0.7,
              0.5,
              "aidesk"
            ],
            [
              16.8,
              10,
              2,
              0.7,
              0.5,
              "aidesk"
            ],
            [
              20.4,
              10,
              2,
              0.7,
              0.5,
              "aidesk"
            ],
            [
              2.4,
              14,
              2,
              0.7,
              0.5,
              "aidesk"
            ],
            [
              6,
              14,
              2,
              0.7,
              0.5,
              "aidesk"
            ],
            [
              9.6,
              14,
              2,
              0.7,
              0.5,
              "aidesk"
            ],
            [
              13.200000000000001,
              14,
              2,
              0.7,
              0.5,
              "aidesk"
            ],
            [
              16.8,
              14,
              2,
              0.7,
              0.5,
              "aidesk"
            ],
            [
              20.4,
              14,
              2,
              0.7,
              0.5,
              "aidesk"
            ]
          ],
          "seats": {}
        }
      ],
      "people": [
        {
          "id": "E01",
          "nama": "Adi Nugroho",
          "warna": "#2e5c8a",
          "jabatan": "Head of Fixed Income & Treasury",
          "unit": "D1 · Kas & Pendapatan Tetap",
          "floor": 0,
          "seat": {
            "x": 2.05,
            "y": 3.3,
            "i": 0
          },
          "kind": "desk"
        },
        {
          "id": "M3",
          "nama": "Bimo Saputra",
          "warna": "#0f9d8a",
          "jabatan": "Dealer Saham & Obligasi",
          "unit": "D3 · Seleksi Reksa Dana & ETF",
          "floor": 0,
          "seat": {
            "x": 14.05,
            "y": 3.3,
            "i": 0
          },
          "kind": "desk"
        },
        {
          "id": "E03",
          "nama": "Candra Wijaya",
          "warna": "#7a5bb5",
          "jabatan": "Head of Manager Research",
          "unit": "D3 · Seleksi Reksa Dana & ETF",
          "floor": 0,
          "seat": {
            "x": 15.6,
            "y": 3.3,
            "i": 1
          },
          "kind": "desk"
        },
        {
          "id": "E04",
          "nama": "Dewi Lestari",
          "warna": "#b4493c",
          "jabatan": "Head of Macro & Derivatives",
          "unit": "D4 · Valas, Komoditas & Derivatif",
          "floor": 0,
          "seat": {
            "x": 20.05,
            "y": 3.3,
            "i": 0
          },
          "kind": "desk"
        },
        {
          "id": "E05",
          "nama": "Eko Prasetyo",
          "warna": "#c98a12",
          "jabatan": "Head of Digital Assets",
          "unit": "D5 · Kripto & Aset Digital Trading",
          "floor": 0,
          "seat": {
            "x": 2.05,
            "y": 8.3,
            "i": 0
          },
          "kind": "desk"
        },
        {
          "id": "E06",
          "nama": "Fitri Ramadhani",
          "warna": "#3f7d4f",
          "jabatan": "Head of Digital & IP",
          "unit": "D6 · Bisnis Digital & Kekayaan Intelektual",
          "floor": 0,
          "seat": {
            "x": 8.049999999999999,
            "y": 8.3,
            "i": 0
          },
          "kind": "desk"
        },
        {
          "id": "M4",
          "nama": "Nadia Kusuma",
          "warna": "#8a6a3c",
          "jabatan": "Analis Properti & Aset Fisik",
          "unit": "D7 · Properti & Tanah",
          "floor": 0,
          "seat": {
            "x": 14.049999999999999,
            "y": 8.3,
            "i": 0
          },
          "kind": "desk"
        },
        {
          "id": "E08",
          "nama": "Hana Maharani",
          "warna": "#4a6fa5",
          "jabatan": "Acquisition Analyst",
          "unit": "D7 · Properti & Tanah",
          "floor": 0,
          "seat": {
            "x": 15.6,
            "y": 8.3,
            "i": 1
          },
          "kind": "desk"
        },
        {
          "id": "E09",
          "nama": "Indra Kusuma",
          "warna": "#a0522d",
          "jabatan": "Head of Productive Assets",
          "unit": "D8 · Aset Fisik Produktif",
          "floor": 0,
          "seat": {
            "x": 20.05,
            "y": 8.3,
            "i": 0
          },
          "kind": "desk"
        },
        {
          "id": "E10",
          "nama": "Jihan Aulia",
          "warna": "#5f6f86",
          "jabatan": "Field Ops Manager",
          "unit": "D8 · Aset Fisik Produktif",
          "floor": 0,
          "seat": {
            "x": 21.6,
            "y": 8.3,
            "i": 1
          },
          "kind": "desk"
        },
        {
          "id": "E11",
          "nama": "Krisna Bayu",
          "warna": "#9c4f7a",
          "jabatan": "Head of Agri & Natural Assets",
          "unit": "D9 · Agrikultur & Alam",
          "floor": 0,
          "seat": {
            "x": 2.05,
            "y": 13.3,
            "i": 0
          },
          "kind": "desk"
        },
        {
          "id": "E12",
          "nama": "Laras Ayuning",
          "warna": "#2f7f8f",
          "jabatan": "Head of Collectibles / Curator",
          "unit": "D10 · Koleksi & Aset Gaya Hidup",
          "floor": 0,
          "seat": {
            "x": 8.049999999999999,
            "y": 13.3,
            "i": 0
          },
          "kind": "desk"
        },
        {
          "id": "E13",
          "nama": "Mahesa Putra",
          "warna": "#2e5c8a",
          "jabatan": "Head of Direct Business",
          "unit": "D12 · Bisnis & Usaha Langsung",
          "floor": 0,
          "seat": {
            "x": 20.05,
            "y": 13.3,
            "i": 0
          },
          "kind": "desk"
        },
        {
          "id": "M1",
          "nama": "Rangga Adhisurya",
          "warna": "#b8860b",
          "jabatan": "Direktur Utama",
          "unit": "S1 · CIO Office & Investment Committee",
          "floor": 0,
          "seat": {
            "x": 2.05,
            "y": 18.3,
            "i": 0
          },
          "kind": "desk"
        },
        {
          "id": "M2",
          "nama": "Kirana Prameswari",
          "warna": "#2e5c8a",
          "jabatan": "Head of Investment",
          "unit": "D2 · Ekuitas Publik",
          "floor": 0,
          "seat": {
            "x": 3.6000000000000005,
            "y": 18.3,
            "i": 1
          },
          "kind": "desk"
        },
        {
          "id": "E16",
          "nama": "Putri Anjani",
          "warna": "#b4493c",
          "jabatan": "Chief Investment Officer (CIO)",
          "unit": "S1 · CIO Office & Investment Committee",
          "floor": 1,
          "seat": {
            "x": 2.05,
            "y": 3.3,
            "i": 0
          },
          "kind": "desk"
        },
        {
          "id": "M5",
          "nama": "Aditya Rahim",
          "warna": "#c98a12",
          "jabatan": "Compliance & Legal Officer",
          "unit": "S2 · Risk, Compliance & APU-PPT",
          "floor": 1,
          "seat": {
            "x": 8.049999999999999,
            "y": 3.3,
            "i": 0
          },
          "kind": "desk"
        },
        {
          "id": "M6",
          "nama": "Sari Handayani",
          "warna": "#3f7d4f",
          "jabatan": "Finance & Tax Lead",
          "unit": "S3 · Finance, Tax & Accounting",
          "floor": 1,
          "seat": {
            "x": 14.049999999999999,
            "y": 3.3,
            "i": 0
          },
          "kind": "desk"
        },
        {
          "id": "E19",
          "nama": "Teguh Santoso",
          "warna": "#8a6a3c",
          "jabatan": "Chief Operating Officer (COO)",
          "unit": "S4 · Operations, Settlement & Custody",
          "floor": 1,
          "seat": {
            "x": 20.05,
            "y": 3.3,
            "i": 0
          },
          "kind": "desk"
        },
        {
          "id": "E20",
          "nama": "Umi Kalsum",
          "warna": "#4a6fa5",
          "jabatan": "Chief Technology Officer (CTO)",
          "unit": "S7 · Technology, Data & AI Engineering",
          "floor": 1,
          "seat": {
            "x": 14.049999999999999,
            "y": 8.3,
            "i": 0
          },
          "kind": "desk"
        },
        {
          "id": "E21",
          "nama": "Vino Alfarizi",
          "warna": "#a0522d",
          "jabatan": "Backend & Automation Engineer",
          "unit": "S7 · Technology, Data & AI Engineering",
          "floor": 1,
          "seat": {
            "x": 15.6,
            "y": 8.3,
            "i": 1
          },
          "kind": "desk"
        },
        {
          "id": "E22",
          "nama": "Wulan Sari",
          "warna": "#5f6f86",
          "jabatan": "Head of Capital & Stakeholder Relations",
          "unit": "S8 · Capital & Stakeholder Relations",
          "floor": 1,
          "seat": {
            "x": 20.05,
            "y": 8.3,
            "i": 0
          },
          "kind": "desk"
        },
        {
          "id": "E23",
          "nama": "Yoga Pratama",
          "warna": "#9c4f7a",
          "jabatan": "AI Office Manager (Kepala Kantor AI)",
          "unit": "S10 · AI Operations Center (Kantor AI)",
          "floor": 1,
          "seat": {
            "x": 8.049999999999999,
            "y": 13.3,
            "i": 0
          },
          "kind": "desk"
        },
        {
          "id": "E24",
          "nama": "Zahra Nabila",
          "warna": "#2f7f8f",
          "jabatan": "Head of Business Development & Deal Sourcing",
          "unit": "S11 · Business Development & Deal Sourcing",
          "floor": 1,
          "seat": {
            "x": 14.049999999999999,
            "y": 13.3,
            "i": 0
          },
          "kind": "desk"
        },
        {
          "id": "M7",
          "nama": "Yusuf Maulana",
          "warna": "#2e5c8a",
          "jabatan": "GA Manager",
          "unit": "S12 · General Affairs, Fasilitas & Umum",
          "floor": 1,
          "seat": {
            "x": 20.05,
            "y": 13.3,
            "i": 0
          },
          "kind": "desk"
        },
        {
          "id": "E26",
          "nama": "Bunga Citra",
          "warna": "#0f9d8a",
          "jabatan": "Receptionist / Front Office",
          "unit": "S12 · General Affairs, Fasilitas & Umum",
          "floor": 1,
          "seat": {
            "x": 21.6,
            "y": 13.3,
            "i": 1
          },
          "kind": "desk"
        },
        {
          "id": "M8",
          "nama": "KAP Wijaya & Rekan",
          "warna": "#5f6f86",
          "jabatan": "Auditor Eksternal (Tamu)",
          "unit": "Eksternal · Audit KAP",
          "floor": 1,
          "seat": {
            "x": 14,
            "y": 19
          },
          "kind": "desk",
          "guest": true
        },
        {
          "id": "M9",
          "nama": "PT Bersih Cemerlang",
          "warna": "#8a6a3c",
          "jabatan": "Vendor Fasilitas (Tamu)",
          "unit": "Eksternal · Vendor",
          "floor": 1,
          "seat": {
            "x": 15.2,
            "y": 19
          },
          "kind": "desk",
          "guest": true
        }
      ],
      "agents": [
        {
          "id": "AG-01",
          "nama": "Router & Intake",
          "floor": 2,
          "seat": {
            "x": 3.4,
            "y": 7.35
          }
        },
        {
          "id": "AG-02",
          "nama": "Deal Memo Analyst",
          "floor": 2,
          "seat": {
            "x": 7,
            "y": 7.35
          }
        },
        {
          "id": "AG-03",
          "nama": "Data Room & Due Diligence",
          "floor": 2,
          "seat": {
            "x": 10.6,
            "y": 7.35
          }
        },
        {
          "id": "AG-04",
          "nama": "Valuation Engine",
          "floor": 2,
          "seat": {
            "x": 14.200000000000001,
            "y": 7.35
          }
        },
        {
          "id": "AG-05",
          "nama": "Market & Macro Monitor",
          "floor": 2,
          "seat": {
            "x": 17.8,
            "y": 7.35
          }
        },
        {
          "id": "AG-06",
          "nama": "Property & Land Coordinator",
          "floor": 2,
          "seat": {
            "x": 21.4,
            "y": 7.35
          }
        },
        {
          "id": "AG-07",
          "nama": "Field Ops Coordinator",
          "floor": 2,
          "seat": {
            "x": 3.4,
            "y": 11.35
          }
        },
        {
          "id": "AG-08",
          "nama": "Agri Yield Monitor",
          "floor": 2,
          "seat": {
            "x": 7,
            "y": 11.35
          }
        },
        {
          "id": "AG-09",
          "nama": "Collectibles Authenticator",
          "floor": 2,
          "seat": {
            "x": 10.6,
            "y": 11.35
          }
        },
        {
          "id": "AG-10",
          "nama": "On-chain & Crypto Analyst",
          "floor": 2,
          "seat": {
            "x": 14.200000000000001,
            "y": 11.35
          }
        },
        {
          "id": "AG-11",
          "nama": "Digital Asset Diligence",
          "floor": 2,
          "seat": {
            "x": 17.8,
            "y": 11.35
          }
        },
        {
          "id": "AG-12",
          "nama": "Portfolio Monitoring & Reporting",
          "floor": 2,
          "seat": {
            "x": 21.4,
            "y": 11.35
          }
        },
        {
          "id": "AG-13",
          "nama": "Compliance & Legal Watch",
          "floor": 2,
          "seat": {
            "x": 3.4,
            "y": 15.35
          }
        },
        {
          "id": "AG-14",
          "nama": "Finance & Tax Agent",
          "floor": 2,
          "seat": {
            "x": 7,
            "y": 15.35
          }
        },
        {
          "id": "AG-15",
          "nama": "Capital & Investor Relations",
          "floor": 2,
          "seat": {
            "x": 10.6,
            "y": 15.35
          }
        },
        {
          "id": "AG-16",
          "nama": "HR & Vendor Ops",
          "floor": 2,
          "seat": {
            "x": 14.200000000000001,
            "y": 15.35
          }
        },
        {
          "id": "AG-17",
          "nama": "Document Generator",
          "floor": 2,
          "seat": {
            "x": 17.8,
            "y": 15.35
          }
        },
        {
          "id": "AG-18",
          "nama": "AI Office Orchestrator",
          "floor": 2,
          "seat": {
            "x": 21.4,
            "y": 15.35
          }
        }
      ],
      "staff": [
        {
          "id": "ST1",
          "nama": "Satpam",
          "warna": "#2f4661",
          "cap": true,
          "floor": 0,
          "cycle": 16,
          "route": [
            [
              21,
              18.2
            ],
            [
              6,
              18.4
            ],
            [
              12,
              13
            ],
            [
              24,
              6
            ]
          ]
        },
        {
          "id": "ST2",
          "nama": "Resepsionis",
          "warna": "#5f6f86",
          "floor": 0,
          "cycle": 0,
          "route": [
            [
              16.6,
              18.3
            ]
          ]
        },
        {
          "id": "ST3",
          "nama": "Kurir",
          "warna": "#c9772b",
          "floor": 0,
          "cycle": 11,
          "route": [
            [
              12.2,
              18.2
            ],
            [
              6,
              8
            ],
            [
              21,
              12.6
            ]
          ]
        },
        {
          "id": "ST4",
          "nama": "OB",
          "warna": "#2f8f7d",
          "floor": 1,
          "cycle": 20,
          "route": [
            [
              21,
              13
            ],
            [
              12,
              8
            ],
            [
              6,
              18
            ]
          ]
        }
      ]
    }
  }
} as unknown as PortalData;
