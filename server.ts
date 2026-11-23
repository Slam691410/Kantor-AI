import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import { PORTAL_DATA } from './src/data/portalData.ts';
import { buildOperationalTaskSeed } from './src/data/taskSeed.ts';
import { buildWorkforceSeed } from './src/data/workforceSeed.ts';
import type {
  AbsenItem,
  AbsenVerifikasi,
  AuditItem,
  AuthProfileOption,
  DokumenItem,
  GeminiAssistMode,
  IntakeItem,
  IntakeStatus,
  KeuanganItem,
  KeuanganJenis,
  KeuanganStatus,
  RekonsiliasiStatus,
  TugasItem,
  TugasStatus,
  UserPublic,
  UserTier,
  WorkforceCategory,
} from './src/types.ts';

interface PenggunaRecord {
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

interface DatabaseSchema {
  pengguna: PenggunaRecord[];
  tugas: TugasItem[];
  intake: IntakeItem[];
  keuangan: KeuanganItem[];
  absen: AbsenItem[];
  dokumen: DokumenItem[];
  audit: AuditItem[];
}

interface SessionEntry {
  userId: string;
  expiresAt: number;
}

interface OtpEntry {
  userId: string;
  email: string;
  salt: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
}

interface AuthedRequest extends Request {
  authUser?: PenggunaRecord;
  authToken?: string;
}

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'holding-db.json');
const SESSION_TTL_MS = 6 * 60 * 60 * 1000;
const OTP_TTL_MS = 5 * 60 * 1000;
const OFFICE_LAT = -6.2297;
const OFFICE_LNG = 106.8095;

const VALID_TIERS: ReadonlySet<UserTier> = new Set([
  'Pemilik',
  'Manajemen',
  'Staf',
  'Auditor',
  'Tamu',
  'Freelancer',
]);

const VALID_INTAKE_STATUS: ReadonlySet<IntakeStatus> = new Set([
  'Masuk',
  'Direview',
  'Perlu Info',
  'Disetujui',
  'Ditolak',
]);

const VALID_TUGAS_STATUS: ReadonlySet<TugasStatus> = new Set([
  'Belum',
  'Proses',
  'Selesai',
]);

const VALID_KEUANGAN_STATUS: ReadonlySet<KeuanganStatus> = new Set([
  'Draft',
  'Terverifikasi',
  'Disetujui',
]);

const VALID_REKONSILIASI: ReadonlySet<RekonsiliasiStatus> = new Set([
  'Belum',
  'Sudah',
]);

const VALID_WORKFORCE_CATEGORIES: ReadonlySet<WorkforceCategory> = new Set([
  'Karyawan FTE',
  'Freelancer',
  'Eksternal',
]);

const SEED_USERS: PenggunaRecord[] = buildWorkforceSeed();

const VALID_AI_MODES: ReadonlySet<GeminiAssistMode> = new Set([
  'instruksi_agen',
  'risalah_rapat',
  'draf_surat',
  'ringkas_eksekutif',
]);

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

function sekarangWib(): string {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const map: Record<string, string> = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }
  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second} WIB`;
}

function tanggalWib(): string {
  return sekarangWib().slice(0, 10);
}

function normalizeEmail(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim().toLowerCase() : '';
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 160;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const visible = local.length <= 2 ? local[0] || '' : local.slice(0, 2);
  return `${visible}***@${domain}`;
}

function hashOtp(code: string, salt: string): string {
  return crypto.scryptSync(code, salt, 32).toString('hex');
}

function verifyOtpHash(code: string, salt: string, expectedHex: string): boolean {
  if (!code || !salt || !expectedHex) return false;
  const computed = crypto.scryptSync(code, salt, 32);
  const expected = Buffer.from(expectedHex, 'hex');
  if (computed.length !== expected.length) return false;
  return crypto.timingSafeEqual(computed, expected);
}

function validateFaceImage(faceImage: unknown): { ok: true; digest: string } | { ok: false; error: string } {
  if (typeof faceImage !== 'string') {
    return { ok: false, error: 'Foto verifikasi wajah wajib diambil terlebih dahulu.' };
  }
  const trimmed = faceImage.trim();
  if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(trimmed)) {
    return { ok: false, error: 'Format foto wajah tidak valid (wajib JPEG/PNG/WebP).' };
  }
  if (trimmed.length < 400 || trimmed.length > 1_200_000) {
    return { ok: false, error: 'Ukuran foto wajah tidak valid untuk verifikasi.' };
  }
  const digest = crypto.createHash('sha256').update(trimmed).digest('hex').slice(0, 12).toUpperCase();
  return { ok: true, digest };
}

function validateCoordinates(latRaw: unknown, lngRaw: unknown): { ok: true; lat: number; lng: number; jarakMeter: number } | { ok: false; error: string } {
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, error: 'Koordinat lokasi Google Maps wajib tersedia.' };
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { ok: false, error: 'Koordinat lintang/bujur di luar rentang valid.' };
  }
  // Haversine distance to Kantor Pusat Holding Investasi (Jakarta)
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat - OFFICE_LAT);
  const dLng = toRad(lng - OFFICE_LNG);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(OFFICE_LAT)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const jarakMeter = Math.round(R * c);
  return {
    ok: true,
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
    jarakMeter,
  };
}

function peringkat(u: Pick<PenggunaRecord, 'Jabatan' | 'Tier'> | null | undefined): number {
  if (!u) return 0;
  if (/Komisaris|Direktur|Pemilik Utama/i.test(u.Jabatan) || u.Tier === 'Pemilik') return 3;
  if (u.Tier === 'Manajemen') return 2;
  if (u.Tier === 'Staf') return 1;
  return 0;
}

function jalurRapid(nilai: number): { label: string; rank: number } {
  const n = Number(nilai) || 0;
  if (n > 5_000_000_000) return { label: 'Direksi / Komisaris', rank: 3 };
  if (n > 500_000_000) return { label: 'CIO', rank: 2 };
  return { label: 'Desk Head', rank: 1 };
}

function inferWorkforceCategory(tier: UserTier, raw?: unknown): WorkforceCategory {
  if (typeof raw === 'string' && VALID_WORKFORCE_CATEGORIES.has(raw as WorkforceCategory)) {
    return raw as WorkforceCategory;
  }
  if (tier === 'Freelancer') return 'Freelancer';
  if (tier === 'Auditor' || tier === 'Tamu') return 'Eksternal';
  return 'Karyawan FTE';
}

function toPublicUser(u: PenggunaRecord): UserPublic {
  return {
    ID: u.ID,
    Nama: u.Nama,
    Jabatan: u.Jabatan,
    Unit: u.Unit,
    Tier: u.Tier,
    Email: u.Email,
    Peringkat: peringkat(u),
    Fase: u.Fase,
    StatusKepegawaian: inferWorkforceCategory(u.Tier, u.StatusKepegawaian),
  };
}

function makeSeedDb(): DatabaseSchema {
  const now = sekarangWib();
  const today = tanggalWib();

  return {
    pengguna: SEED_USERS.map((u) => ({ ...u })),
    tugas: buildOperationalTaskSeed(),
    intake: [
      {
        ID: 'INT-SEED01',
        Judul: 'Alokasi Obligasi Korporasi Tenor 3 Tahun — Seri A',
        Kategori: 'Investasi',
        Nilai: 6_500_000_000,
        Unit: 'D2 Investasi',
        Pengaju: 'Kirana Prameswari',
        Status: 'Direview',
        Riwayat: `${now} dibuat Kirana Prameswari | ${now} Kirana Prameswari -> Direview`,
        TanggalBuat: today,
      },
      {
        ID: 'INT-SEED02',
        Judul: 'Penambahan Posisi Ekuitas Blue-Chip Sektor Perbankan',
        Kategori: 'Investasi',
        Nilai: 1_250_000_000,
        Unit: 'D3 Pasar Modal',
        Pengaju: 'Bimo Saputra',
        Status: 'Masuk',
        Riwayat: `${now} dibuat Bimo Saputra`,
        TanggalBuat: today,
      },
      {
        ID: 'INT-SEED03',
        Judul: 'Pembaruan Lisensi Terminal Data & Sistem Kepatuhan',
        Kategori: 'Operasional',
        Nilai: 185_000_000,
        Unit: 'S12 GA',
        Pengaju: 'Yusuf Maulana',
        Status: 'Masuk',
        Riwayat: `${now} dibuat Yusuf Maulana`,
        TanggalBuat: today,
      },
    ],
    keuangan: [
      {
        ID: 'KAS-SEED01',
        Tanggal: today,
        Jenis: 'Masuk',
        Kategori: 'Modal Disetor',
        Nominal: 12_500_000_000,
        Keterangan: 'Penempatan modal sendiri pemegang saham kuartal berjalan',
        Oleh: 'Rangga Adhisurya',
        Status: 'Disetujui',
        Rekonsiliasi: 'Sudah',
      },
      {
        ID: 'KAS-SEED02',
        Tanggal: today,
        Jenis: 'Masuk',
        Kategori: 'Dividen & Kupon',
        Nominal: 420_000_000,
        Keterangan: 'Penerimaan kupon obligasi seri pemerintah & dividen portofolio',
        Oleh: 'Kirana Prameswari',
        Status: 'Terverifikasi',
        Rekonsiliasi: 'Sudah',
      },
      {
        ID: 'KAS-SEED03',
        Tanggal: today,
        Jenis: 'Keluar',
        Kategori: 'Operasional Kantor',
        Nominal: 48_500_000,
        Keterangan: 'Biaya sewa ruang kerja, utilitas, dan vendor kebersihan bulanan',
        Oleh: 'Yusuf Maulana',
        Status: 'Draft',
        Rekonsiliasi: 'Belum',
      },
    ],
    absen: [],
    dokumen: [
      {
        ID: 'DOK-SEED01',
        Judul: 'Piagam Tata Kelola Modal Sendiri & Matriks RAPID',
        Jenis: 'Kebijakan',
        Oleh: 'Rangga Adhisurya',
        Isi: 'Holding beroperasi murni menggunakan modal sendiri (bukan pialang/perantara efek publik). Persetujuan alokasi mengikuti jalur RAPID: <= Rp500 juta oleh Desk Head, > Rp500 juta oleh CIO/Manajemen, dan > Rp5 miliar wajib Direksi/Komisaris. Pengeluaran kas > Rp100 juta wajib otorisasi Direktur.',
        Tanggal: today,
      },
      {
        ID: 'DOK-SEED02',
        Judul: 'Ringkasan Komite Investasi — Alokasi Pendapatan Tetap',
        Jenis: 'Memo Investasi',
        Oleh: 'Kirana Prameswari',
        Isi: 'Menjaga likuiditas kas operasional minimal 15% dari total modal kerja sebelum penempatan instrumen jangka menengah.',
        Tanggal: today,
      },
    ],
    audit: [
      {
        Waktu: now,
        Siapa: 'SISTEM',
        Aksi: 'Database Holding Investasi disiapkan (156 Karyawan FTE Fase 1–3 + 12 Freelancer Terpisah + 2 Eksternal)',
        Modul: 'Sistem',
      },
    ],
  };
}

function migrateUsers(existing: Array<Partial<PenggunaRecord> & { Garam?: string; PinHash?: string }>): {
  users: PenggunaRecord[];
  changed: boolean;
} {
  let changed = false;
  const seedById = new Map(SEED_USERS.map((s) => [s.ID, s]));
  const users: PenggunaRecord[] = existing.map((raw) => {
    const id = String(raw.ID || '').trim();
    const seed = seedById.get(id);
    const email = raw.Email && isValidEmail(raw.Email)
      ? raw.Email.trim().toLowerCase()
      : seed?.Email || `${id.toLowerCase()}@holding-investasi.id`;
    const tier = (raw.Tier && VALID_TIERS.has(raw.Tier) ? raw.Tier : seed?.Tier || 'Staf') as UserTier;
    const statusKepeg = inferWorkforceCategory(tier, raw.StatusKepegawaian ?? seed?.StatusKepegawaian);
    const fase = raw.Fase ?? seed?.Fase;
    const unit = seed?.Unit && (!raw.Unit || !raw.Unit.includes('·')) ? seed.Unit : String(raw.Unit || seed?.Unit || 'Umum');
    if (
      !raw.Email ||
      raw.Garam ||
      raw.PinHash ||
      !raw.StatusKepegawaian ||
      (seed?.Fase && !raw.Fase) ||
      unit !== raw.Unit
    ) {
      changed = true;
    }
    return {
      ID: id,
      Nama: String(raw.Nama || seed?.Nama || id),
      Jabatan: String(raw.Jabatan || seed?.Jabatan || 'Anggota'),
      Unit: unit,
      Tier: tier,
      Email: email,
      Aktif: raw.Aktif === 'TIDAK' ? 'TIDAK' : 'YA',
      ...(fase ? { Fase: fase } : {}),
      StatusKepegawaian: statusKepeg,
    };
  });

  const existingIds = new Set(users.map((u) => u.ID));
  for (const seed of SEED_USERS) {
    if (!existingIds.has(seed.ID)) {
      users.push({ ...seed });
      changed = true;
    }
  }
  return { users, changed };
}

function migrateTasks(existing: TugasItem[]): {
  tasks: TugasItem[];
  changed: boolean;
} {
  const master = buildOperationalTaskSeed();
  const hasNewMaster = existing.some((t) => /^TGS-\d{3}$/.test(t.ID));
  const customOnly = existing.filter((t) => !['TGS-01', 'TGS-02', 'TGS-03'].includes(t.ID));
  if (!hasNewMaster && existing.length <= 3) {
    return {
      tasks: [...master, ...customOnly],
      changed: true,
    };
  }
  const existingIds = new Set(existing.map((t) => t.ID));
  const tasks = [...existing];
  let changed = false;
  for (const item of master) {
    if (!existingIds.has(item.ID)) {
      tasks.push({ ...item });
      changed = true;
    }
  }
  return { tasks, changed };
}

function loadOrInitDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial = makeSeedDb();
    saveDb(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
    if (!Array.isArray(parsed.pengguna) || parsed.pengguna.length === 0) {
      const initial = makeSeedDb();
      saveDb(initial);
      return initial;
    }
    const { users, changed } = migrateUsers(parsed.pengguna);
    const taskMig = migrateTasks(parsed.tugas ?? []);
    const loaded: DatabaseSchema = {
      pengguna: users,
      tugas: taskMig.tasks,
      intake: parsed.intake ?? [],
      keuangan: parsed.keuangan ?? [],
      absen: parsed.absen ?? [],
      dokumen: parsed.dokumen ?? [],
      audit: parsed.audit ?? [],
    };
    if (changed || taskMig.changed) {
      saveDb(loaded);
    }
    return loaded;
  } catch {
    const initial = makeSeedDb();
    saveDb(initial);
    return initial;
  }
}

function saveDb(db: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempFile = path.resolve(DATA_DIR, `holding-db.${process.pid}.tmp`);
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tempFile, DB_FILE);
}

const db: DatabaseSchema = loadOrInitDb();
const sessions = new Map<string, SessionEntry>();
const otpStore = new Map<string, OtpEntry>();
const otpRequestLimits = new Map<string, { count: number; resetAt: number }>();
const failedLoginAttempts = new Map<string, { count: number; resetAt: number }>();

function appendAudit(who: string, aksi: string, modul: string): void {
  db.audit.push({
    Waktu: sekarangWib(),
    Siapa: who,
    Aksi: aksi,
    Modul: modul,
  });
  if (db.audit.length > 1000) {
    db.audit.splice(0, db.audit.length - 1000);
  }
  saveDb(db);
}

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

function requireAuth(tiers?: UserTier[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction): void => {
    const token = extractBearer(req);
    if (!token) {
      res.status(401).json({ error: 'Belum masuk / sesi berakhir. Silakan verifikasi ulang.' });
      return;
    }
    const entry = sessions.get(token);
    if (!entry || entry.expiresAt < Date.now()) {
      sessions.delete(token);
      res.status(401).json({ error: 'Sesi berakhir. Silakan verifikasi ulang.' });
      return;
    }
    const user = db.pengguna.find((x) => x.ID === entry.userId);
    if (!user || user.Aktif !== 'YA') {
      sessions.delete(token);
      res.status(401).json({ error: 'Akun tidak aktif atau tidak ditemukan.' });
      return;
    }
    if (tiers && !tiers.includes(user.Tier)) {
      appendAudit(user.Nama, `AKSES DITOLAK (${req.method} ${req.path})`, 'Keamanan');
      res.status(403).json({
        error: `Akses ditolak untuk peran ${user.Tier} (dicatat di audit).`,
      });
      return;
    }
    req.authUser = user;
    req.authToken = token;
    next();
  };
}

function generateId(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${ts}${rnd}`;
}

async function sendEmailOtp(email: string, nama: string, otp: string): Promise<'email' | 'preview'> {
  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  const mailFrom = (process.env.MAIL_FROM || 'Holding Investasi <onboarding@resend.dev>').trim();

  if (!resendKey) {
    console.log(`[OTP EMAIL PREVIEW] Kirim ke ${email} (${nama}): ${otp}`);
    return 'preview';
  }

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: mailFrom,
      to: [email],
      subject: `Kode OTP Masuk Holding Investasi: ${otp}`,
      text: `Halo ${nama},\n\nGunakan kode OTP berikut untuk melengkapi verifikasi Wajah & Google Maps Anda:\n\n${otp}\n\nKode berlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun.`,
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    console.error('Resend API error:', resp.status, errText);
    throw new Error('Gagal mengirim email OTP melalui penyedia email.');
  }

  return 'email';
}

async function createApp(): Promise<void> {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'holding-investasi', auth: 'face-maps-email-otp' });
  });

  app.get('/api/auth/profiles', (_req, res) => {
    const profiles: AuthProfileOption[] = db.pengguna
      .filter((u) => u.Aktif === 'YA')
      .map((u) => ({
        ID: u.ID,
        Nama: u.Nama,
        Jabatan: u.Jabatan,
        Unit: u.Unit,
        Tier: u.Tier,
        Email: u.Email,
        Fase: u.Fase,
        StatusKepegawaian: inferWorkforceCategory(u.Tier, u.StatusKepegawaian),
      }));
    res.json(profiles);
  });

  app.post('/api/auth/otp/request', async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Alamat email tidak valid.' });
      return;
    }

    const rateKey = `${req.ip || 'local'}:${email}`;
    const rate = otpRequestLimits.get(rateKey);
    if (rate && rate.resetAt > Date.now() && rate.count >= 8) {
      res.status(429).json({ error: 'Terlalu banyak permintaan OTP. Tunggu beberapa menit.' });
      return;
    }

    const user = db.pengguna.find((u) => u.Email.toLowerCase() === email && u.Aktif === 'YA');
    if (!user) {
      res.status(404).json({
        error: 'Email tidak terdaftar atau akun dinonaktifkan. Pilih anggota atau daftarkan email oleh Pemilik.',
      });
      return;
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const salt = crypto.randomBytes(16).toString('hex');
    otpStore.set(email, {
      userId: user.ID,
      email,
      salt,
      codeHash: hashOtp(otp, salt),
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
    });

    otpRequestLimits.set(rateKey, {
      count: rate && rate.resetAt > Date.now() ? rate.count + 1 : 1,
      resetAt: Date.now() + 5 * 60 * 1000,
    });

    try {
      const delivery = await sendEmailOtp(email, user.Nama, otp);
      appendAudit(user.Nama, `Permintaan OTP Email (${maskEmail(email)}) [${delivery}]`, 'Autentikasi');
      res.json({
        ok: true,
        delivery,
        maskedEmail: maskEmail(email),
        expiresInSec: Math.round(OTP_TTL_MS / 1000),
        ...(delivery === 'preview' ? { previewOtp: otp } : {}),
      });
    } catch (err) {
      res.status(502).json({
        error: err instanceof Error ? err.message : 'Gagal mengirim OTP Email.',
      });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const otp = typeof req.body?.otp === 'string' ? req.body.otp.trim() : '';
    const lokasiLabel =
      typeof req.body?.lokasiLabel === 'string' && req.body.lokasiLabel.trim()
        ? req.body.lokasiLabel.trim().slice(0, 120)
        : 'Lokasi Terpetakan';

    if (!isValidEmail(email) || !/^\d{6}$/.test(otp)) {
      res.status(400).json({ error: 'Email dan kode OTP 6 digit wajib diisi.' });
      return;
    }

    const rateKey = `${req.ip || 'local'}:${email}`;
    const rateState = failedLoginAttempts.get(rateKey);
    if (rateState && rateState.resetAt > Date.now() && rateState.count >= 10) {
      res.status(429).json({ error: 'Terlalu banyak percobaan gagal. Coba lagi beberapa menit.' });
      return;
    }

    const faceCheck = validateFaceImage(req.body?.faceImage);
    if (!faceCheck.ok) {
      res.status(400).json({ error: faceCheck.error });
      return;
    }

    const coordCheck = validateCoordinates(req.body?.lat, req.body?.lng);
    if (!coordCheck.ok) {
      res.status(400).json({ error: coordCheck.error });
      return;
    }

    const user = db.pengguna.find((x) => x.Email.toLowerCase() === email);
    const otpEntry = otpStore.get(email);

    if (!user || user.Aktif !== 'YA' || !otpEntry || otpEntry.expiresAt < Date.now()) {
      otpStore.delete(email);
      const nextCount = rateState && rateState.resetAt > Date.now() ? rateState.count + 1 : 1;
      failedLoginAttempts.set(rateKey, { count: nextCount, resetAt: Date.now() + 5 * 60 * 1000 });
      appendAudit(email || '?', 'LOGIN GAGAL (OTP tidak ditemukan / kedaluwarsa)', 'Keamanan');
      res.status(401).json({ error: 'Kode OTP belum diminta, sudah kedaluwarsa, atau email tidak aktif.' });
      return;
    }

    if (otpEntry.attempts >= 5 || !verifyOtpHash(otp, otpEntry.salt, otpEntry.codeHash)) {
      otpEntry.attempts += 1;
      if (otpEntry.attempts >= 5) {
        otpStore.delete(email);
      }
      const nextCount = rateState && rateState.resetAt > Date.now() ? rateState.count + 1 : 1;
      failedLoginAttempts.set(rateKey, { count: nextCount, resetAt: Date.now() + 5 * 60 * 1000 });
      appendAudit(user.Nama, 'LOGIN GAGAL (OTP Email salah)', 'Keamanan');
      res.status(401).json({ error: 'Kode OTP Email salah. Periksa kembali kotak masuk Anda.' });
      return;
    }

    // Consume OTP & issue session
    otpStore.delete(email);
    failedLoginAttempts.delete(rateKey);
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, {
      userId: user.ID,
      expiresAt: Date.now() + SESSION_TTL_MS,
    });

    appendAudit(
      user.Nama,
      `Login Wajah(${faceCheck.digest}) + Maps(${coordCheck.lat},${coordCheck.lng} · ${coordCheck.jarakMeter}m) + OTP(${maskEmail(email)}) [${lokasiLabel}]`,
      'Autentikasi'
    );

    res.json({ token, user: toPublicUser(user) });
  });

  app.post('/api/auth/logout', requireAuth(), (req: AuthedRequest, res) => {
    if (req.authToken) {
      sessions.delete(req.authToken);
    }
    if (req.authUser) {
      appendAudit(req.authUser.Nama, 'Keluar dari sesi terpadu', 'Autentikasi');
    }
    res.json({ ok: true });
  });

  app.get('/api/auth/me', requireAuth(), (req: AuthedRequest, res) => {
    res.json({ user: toPublicUser(req.authUser!) });
  });

  app.get('/api/dashboard', requireAuth(), (_req, res) => {
    let totalMasuk = 0;
    let totalKeluar = 0;
    for (const k of db.keuangan) {
      const nom = Number(k.Nominal) || 0;
      if (k.Jenis === 'Masuk') totalMasuk += nom;
      else totalKeluar += nom;
    }
    const antrean = db.intake.filter(
      (x) => x.Status === 'Masuk' || x.Status === 'Direview' || x.Status === 'Perlu Info'
    ).length;
    const tugasSelesai = db.tugas.filter((x) => x.Status === 'Selesai').length;
    const absenMenunggu = db.absen.filter(
      (x) => x.StatusVerifikasi === 'menunggu-verifikasi-atasan'
    ).length;

    res.json({
      antrean,
      totalIntake: db.intake.length,
      tugasSelesai,
      totalTugas: db.tugas.length,
      saldoKas: totalMasuk - totalKeluar,
      totalMasuk,
      totalKeluar,
      dokumen: db.dokumen.length,
      absenMenunggu,
      auditTerakhir: db.audit.slice(-8).reverse(),
    });
  });

  // Intake & Penjaga RAPID
  app.get('/api/intake', requireAuth(), (_req, res) => {
    res.json([...db.intake].reverse());
  });

  app.post(
    '/api/intake',
    requireAuth(['Pemilik', 'Manajemen', 'Staf', 'Freelancer']),
    (req: AuthedRequest, res) => {
      const user = req.authUser!;
      const judul = typeof req.body?.judul === 'string' ? req.body.judul.trim() : '';
      const kategori =
        typeof req.body?.kategori === 'string' && req.body.kategori.trim()
          ? req.body.kategori.trim().slice(0, 60)
          : 'Operasional';
      const unit =
        typeof req.body?.unit === 'string' && req.body.unit.trim()
          ? req.body.unit.trim().slice(0, 60)
          : user.Unit;
      const nilaiNum = Number(req.body?.nilai ?? 0);

      if (!judul || judul.length > 200) {
        res.status(400).json({ error: 'Judul permintaan wajib diisi (maks 200 karakter).' });
        return;
      }
      if (!Number.isFinite(nilaiNum) || nilaiNum < 0) {
        res.status(400).json({ error: 'Nilai pengajuan harus berupa angka >= 0.' });
        return;
      }

      const item: IntakeItem = {
        ID: generateId('INT'),
        Judul: judul,
        Kategori: kategori,
        Nilai: Math.round(nilaiNum),
        Unit: unit,
        Pengaju: user.Nama,
        Status: 'Masuk',
        Riwayat: `${sekarangWib()} dibuat ${user.Nama}`,
        TanggalBuat: tanggalWib(),
      };
      db.intake.push(item);
      appendAudit(user.Nama, `Intake ${item.ID} (${item.Kategori})`, 'Intake');
      res.status(201).json(item);
    }
  );

  app.patch(
    '/api/intake/:id/status',
    requireAuth(['Pemilik', 'Manajemen', 'Staf']),
    (req: AuthedRequest, res) => {
      const user = req.authUser!;
      const id = req.params.id;
      const aksi = req.body?.aksi as IntakeStatus;

      if (!VALID_INTAKE_STATUS.has(aksi)) {
        res.status(400).json({ error: 'Status intake tidak valid.' });
        return;
      }

      const item = db.intake.find((x) => x.ID === id);
      if (!item) {
        res.status(404).json({ error: 'Permintaan intake tidak ditemukan.' });
        return;
      }

      if (aksi === 'Disetujui') {
        const jalur = jalurRapid(item.Nilai);
        if (peringkat(user) < jalur.rank) {
          appendAudit(
            user.Nama,
            `PERCOBAAN setujui di luar wewenang ${id} (wajib ${jalur.label})`,
            'Intake'
          );
          res.status(403).json({
            error: `Ditolak: nilai ini wajib persetujuan ${jalur.label} (peringkat >= ${jalur.rank}).`,
          });
          return;
        }
      }

      item.Status = aksi;
      item.Riwayat = `${item.Riwayat} | ${sekarangWib()} ${user.Nama} -> ${aksi}`;
      appendAudit(user.Nama, `Intake ${id} -> ${aksi}`, 'Intake');
      res.json(item);
    }
  );

  // Keuangan & Penjaga Kas Rp100 Juta
  app.get(
    '/api/keuangan',
    requireAuth(['Pemilik', 'Manajemen', 'Staf', 'Auditor']),
    (_req, res) => {
      res.json([...db.keuangan].reverse());
    }
  );

  app.post(
    '/api/keuangan',
    requireAuth(['Pemilik', 'Manajemen', 'Staf']),
    (req: AuthedRequest, res) => {
      const user = req.authUser!;
      const jenis = req.body?.jenis as KeuanganJenis;
      const kategori =
        typeof req.body?.kategori === 'string' ? req.body.kategori.trim().slice(0, 80) : '';
      const keterangan =
        typeof req.body?.keterangan === 'string' ? req.body.keterangan.trim().slice(0, 300) : '';
      const tanggal =
        typeof req.body?.tanggal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.body.tanggal)
          ? req.body.tanggal
          : tanggalWib();
      const nominal = Number(req.body?.nominal);

      if (jenis !== 'Masuk' && jenis !== 'Keluar') {
        res.status(400).json({ error: 'Jenis transaksi harus Masuk atau Keluar.' });
        return;
      }
      if (!Number.isFinite(nominal) || nominal <= 0) {
        res.status(400).json({ error: 'Nominal harus lebih besar dari 0.' });
        return;
      }

      if (jenis === 'Keluar' && nominal > 100_000_000 && peringkat(user) < 3) {
        appendAudit(
          user.Nama,
          `PERCOBAAN pengeluaran besar Rp${Math.round(nominal).toLocaleString('id-ID')}`,
          'Keuangan'
        );
        res.status(403).json({
          error: 'Ditolak: pengeluaran > Rp100 juta wajib Direktur / Pemilik.',
        });
        return;
      }

      const item: KeuanganItem = {
        ID: generateId('KAS'),
        Tanggal: tanggal,
        Jenis: jenis,
        Kategori: kategori || 'Umum',
        Nominal: Math.round(nominal),
        Keterangan: keterangan,
        Oleh: user.Nama,
        Status: 'Draft',
        Rekonsiliasi: 'Belum',
      };
      db.keuangan.push(item);
      appendAudit(
        user.Nama,
        `Kas ${item.ID} ${item.Jenis} Rp${item.Nominal.toLocaleString('id-ID')}`,
        'Keuangan'
      );
      res.status(201).json(item);
    }
  );

  app.patch(
    '/api/keuangan/:id',
    requireAuth(['Pemilik', 'Manajemen']),
    (req: AuthedRequest, res) => {
      const user = req.authUser!;
      const item = db.keuangan.find((x) => x.ID === req.params.id);
      if (!item) {
        res.status(404).json({ error: 'Catatan kas tidak ditemukan.' });
        return;
      }
      if (req.body?.status !== undefined) {
        const nextStatus = req.body.status as KeuanganStatus;
        if (!VALID_KEUANGAN_STATUS.has(nextStatus)) {
          res.status(400).json({ error: 'Status kas tidak valid.' });
          return;
        }
        if (
          nextStatus === 'Disetujui' &&
          item.Jenis === 'Keluar' &&
          item.Nominal > 100_000_000 &&
          peringkat(user) < 3
        ) {
          appendAudit(user.Nama, `PERCOBAAN setujui kas besar ${item.ID}`, 'Keuangan');
          res.status(403).json({ error: 'Persetujuan pengeluaran > Rp100 juta wajib Direktur.' });
          return;
        }
        item.Status = nextStatus;
      }
      if (req.body?.rekonsiliasi !== undefined) {
        const nextRek = req.body.rekonsiliasi as RekonsiliasiStatus;
        if (!VALID_REKONSILIASI.has(nextRek)) {
          res.status(400).json({ error: 'Status rekonsiliasi tidak valid.' });
          return;
        }
        item.Rekonsiliasi = nextRek;
      }
      appendAudit(
        user.Nama,
        `Kas ${item.ID} diperbarui (Status: ${item.Status}, Rekonsiliasi: ${item.Rekonsiliasi})`,
        'Keuangan'
      );
      res.json(item);
    }
  );

  // Tugas
  app.get(
    '/api/tugas',
    requireAuth(['Pemilik', 'Manajemen', 'Staf', 'Freelancer']),
    (_req, res) => {
      res.json(db.tugas);
    }
  );

  app.post(
    '/api/tugas',
    requireAuth(['Pemilik', 'Manajemen', 'Staf']),
    (req: AuthedRequest, res) => {
      const user = req.authUser!;
      const kategori =
        typeof req.body?.kategori === 'string' && req.body.kategori.trim()
          ? req.body.kategori.trim().slice(0, 60)
          : 'Operasional';
      const tugasText = typeof req.body?.tugas === 'string' ? req.body.tugas.trim() : '';
      const pengerja =
        typeof req.body?.pengerja === 'string' && req.body.pengerja.trim()
          ? req.body.pengerja.trim().slice(0, 40)
          : 'On-site';
      const eksekutor =
        typeof req.body?.eksekutor === 'string' && req.body.eksekutor.trim()
          ? req.body.eksekutor.trim().slice(0, 60)
          : user.Nama;

      if (!tugasText || tugasText.length > 200) {
        res.status(400).json({ error: 'Deskripsi tugas wajib diisi (maks 200 karakter).' });
        return;
      }

      const item: TugasItem = {
        ID: generateId('TGS'),
        Kategori: kategori,
        Tugas: tugasText,
        Pengerja: pengerja,
        Eksekutor: eksekutor,
        Status: 'Belum',
      };
      db.tugas.push(item);
      appendAudit(user.Nama, `Tugas baru ${item.ID}: ${item.Tugas}`, 'Tugas');
      res.status(201).json(item);
    }
  );

  app.patch(
    '/api/tugas/:id',
    requireAuth(['Pemilik', 'Manajemen', 'Staf', 'Freelancer']),
    (req: AuthedRequest, res) => {
      const user = req.authUser!;
      const status = req.body?.status as TugasStatus;
      if (!VALID_TUGAS_STATUS.has(status)) {
        res.status(400).json({ error: 'Status tugas harus Belum, Proses, atau Selesai.' });
        return;
      }
      const item = db.tugas.find((x) => x.ID === req.params.id);
      if (!item) {
        res.status(404).json({ error: 'Tugas tidak ditemukan.' });
        return;
      }
      item.Status = status;
      appendAudit(user.Nama, `Tugas ${item.ID} -> ${status}`, 'Tugas');
      res.json(item);
    }
  );

  // Absensi Wajah + Google Maps
  app.get(
    '/api/absen',
    requireAuth(['Pemilik', 'Manajemen', 'Staf']),
    (req: AuthedRequest, res) => {
      const user = req.authUser!;
      const list =
        peringkat(user) >= 2
          ? db.absen
          : db.absen.filter((x) => x.UserID === user.ID);
      res.json([...list].reverse());
    }
  );

  app.post(
    '/api/absen',
    requireAuth(['Pemilik', 'Manajemen', 'Staf']),
    (req: AuthedRequest, res) => {
      const user = req.authUser!;
      const jenis = req.body?.jenis === 'out' ? 'out' : 'in';
      const lokasi =
        typeof req.body?.lokasi === 'string' && req.body.lokasi.trim()
          ? req.body.lokasi.trim().slice(0, 120)
          : 'Lokasi Google Maps';

      const faceCheck = validateFaceImage(req.body?.faceImage);
      if (!faceCheck.ok) {
        res.status(400).json({ error: faceCheck.error });
        return;
      }

      const coordCheck = validateCoordinates(req.body?.lat, req.body?.lng);
      if (!coordCheck.ok) {
        res.status(400).json({ error: coordCheck.error });
        return;
      }

      const now = sekarangWib();
      const item: AbsenItem = {
        ID: generateId('ABS'),
        Tanggal: now.slice(0, 10),
        Jam: now.slice(11, 19),
        Nama: user.Nama,
        UserID: user.ID,
        Jenis: jenis,
        Lokasi: lokasi,
        Lat: coordCheck.lat,
        Lng: coordCheck.lng,
        JarakMeter: coordCheck.jarakMeter,
        FaceDigest: faceCheck.digest,
        StatusVerifikasi: 'menunggu-verifikasi-atasan',
      };
      db.absen.push(item);
      appendAudit(
        user.Nama,
        `Absen ${item.Jenis} Wajah(${faceCheck.digest}) · Maps(${coordCheck.lat},${coordCheck.lng}, ${coordCheck.jarakMeter}m) [${item.Lokasi}]`,
        'Absensi'
      );
      res.status(201).json(item);
    }
  );

  app.patch(
    '/api/absen/:id/verify',
    requireAuth(['Pemilik', 'Manajemen']),
    (req: AuthedRequest, res) => {
      const user = req.authUser!;
      const status = req.body?.status as AbsenVerifikasi;
      if (status !== 'terverifikasi' && status !== 'ditolak') {
        res.status(400).json({ error: 'Status verifikasi absen tidak valid.' });
        return;
      }
      const item = db.absen.find((x) => x.ID === req.params.id);
      if (!item) {
        res.status(404).json({ error: 'Data absen tidak ditemukan.' });
        return;
      }
      item.StatusVerifikasi = status;
      item.DiverifikasiOleh = user.Nama;
      appendAudit(user.Nama, `Verifikasi absen ${item.ID} -> ${status}`, 'Absensi');
      res.json(item);
    }
  );

  // Dokumen & Memo
  app.get(
    '/api/dokumen',
    requireAuth(['Pemilik', 'Manajemen', 'Staf', 'Auditor', 'Freelancer']),
    (_req, res) => {
      res.json([...db.dokumen].reverse());
    }
  );

  app.post(
    '/api/dokumen',
    requireAuth(['Pemilik', 'Manajemen', 'Staf']),
    (req: AuthedRequest, res) => {
      const user = req.authUser!;
      const judul = typeof req.body?.judul === 'string' ? req.body.judul.trim() : '';
      const jenis =
        typeof req.body?.jenis === 'string' && req.body.jenis.trim()
          ? req.body.jenis.trim().slice(0, 60)
          : 'Memo Investasi';
      const isi = typeof req.body?.isi === 'string' ? req.body.isi.trim() : '';

      if (!judul || !isi) {
        res.status(400).json({ error: 'Judul dan isi dokumen wajib diisi.' });
        return;
      }

      const item: DokumenItem = {
        ID: generateId('DOK'),
        Judul: judul.slice(0, 180),
        Jenis: jenis,
        Oleh: user.Nama,
        Isi: isi.slice(0, 5000),
        Tanggal: tanggalWib(),
      };
      db.dokumen.push(item);
      appendAudit(user.Nama, `Dokumen ${item.ID}: ${item.Judul}`, 'Dokumen');
      res.status(201).json(item);
    }
  );

  // Audit Log
  app.get(
    '/api/audit',
    requireAuth(['Pemilik', 'Manajemen', 'Auditor']),
    (_req, res) => {
      res.json(db.audit.slice(-200).reverse());
    }
  );

  // Manajemen Pengguna & Sistem (Pemilik only)
  app.get('/api/pengguna', requireAuth(['Pemilik']), (_req, res) => {
    res.json(
      db.pengguna.map((u) => ({
        ...toPublicUser(u),
        Aktif: u.Aktif,
      }))
    );
  });

  app.post('/api/pengguna', requireAuth(['Pemilik']), (req: AuthedRequest, res) => {
    const actor = req.authUser!;
    const id = typeof req.body?.id === 'string' ? req.body.id.trim().toUpperCase() : '';
    const nama = typeof req.body?.nama === 'string' ? req.body.nama.trim() : '';
    const jabatan = typeof req.body?.jabatan === 'string' ? req.body.jabatan.trim() : '';
    const unit = typeof req.body?.unit === 'string' ? req.body.unit.trim() : '';
    const tier = req.body?.tier as UserTier;
    const email = normalizeEmail(req.body?.email);

    if (!id || !/^[A-Z0-9_-]{2,16}$/.test(id)) {
      res.status(400).json({ error: 'ID pengguna wajib 2-16 karakter alfanumerik.' });
      return;
    }
    if (db.pengguna.some((u) => u.ID.toUpperCase() === id)) {
      res.status(409).json({ error: `ID ${id} sudah terdaftar.` });
      return;
    }
    if (!nama || !jabatan || !unit || !VALID_TIERS.has(tier)) {
      res.status(400).json({ error: 'Nama, jabatan, unit, dan tier wajib valid.' });
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Alamat email wajib valid untuk verifikasi OTP.' });
      return;
    }
    if (db.pengguna.some((u) => u.Email.toLowerCase() === email)) {
      res.status(409).json({ error: `Email ${email} sudah digunakan akun lain.` });
      return;
    }

    const rec: PenggunaRecord = {
      ID: id,
      Nama: nama.slice(0, 100),
      Jabatan: jabatan.slice(0, 100),
      Unit: unit.slice(0, 80),
      Tier: tier,
      Email: email,
      Aktif: 'YA',
      StatusKepegawaian: inferWorkforceCategory(tier, req.body?.statusKepegawaian),
      ...(req.body?.fase === 1 || req.body?.fase === 2 || req.body?.fase === 3
        ? { Fase: req.body.fase as 1 | 2 | 3 }
        : tier === 'Pemilik' || tier === 'Manajemen' || tier === 'Staf'
          ? { Fase: 3 as const }
          : {}),
    };
    db.pengguna.push(rec);
    appendAudit(
      actor.Nama,
      `Akun baru dibuat: ${rec.ID} (${rec.Tier}, ${rec.StatusKepegawaian}, ${rec.Email})`,
      'Keamanan'
    );
    res.status(201).json({ ...toPublicUser(rec), Aktif: rec.Aktif });
  });

  app.patch('/api/pengguna/:id/email', requireAuth(['Pemilik']), (req: AuthedRequest, res) => {
    const actor = req.authUser!;
    const target = db.pengguna.find((u) => u.ID === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
      return;
    }
    const email = normalizeEmail(req.body?.email);
    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Email baru tidak valid.' });
      return;
    }
    if (db.pengguna.some((u) => u.ID !== target.ID && u.Email.toLowerCase() === email)) {
      res.status(409).json({ error: `Email ${email} sudah terdaftar di akun lain.` });
      return;
    }
    target.Email = email;
    appendAudit(actor.Nama, `Email OTP diperbarui untuk ${target.ID} -> ${email}`, 'Keamanan');
    res.json({ ...toPublicUser(target), Aktif: target.Aktif });
  });

  app.patch('/api/pengguna/:id/status', requireAuth(['Pemilik']), (req: AuthedRequest, res) => {
    const actor = req.authUser!;
    const target = db.pengguna.find((u) => u.ID === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
      return;
    }
    if (target.ID === actor.ID) {
      res.status(400).json({ error: 'Tidak dapat menonaktifkan akun yang sedang digunakan.' });
      return;
    }
    const aktif = req.body?.aktif === 'TIDAK' ? 'TIDAK' : 'YA';
    target.Aktif = aktif;
    appendAudit(actor.Nama, `Status akun ${target.ID} -> ${aktif}`, 'Keamanan');
    res.json({ ...toPublicUser(target), Aktif: target.Aktif });
  });

  // Ekosistem Google AI — Gemini Assistant (server-side @google/genai)
  app.post('/api/ai/assist', requireAuth(), async (req: AuthedRequest, res) => {
    const user = req.authUser!;
    const mode = req.body?.mode as GeminiAssistMode;
    const promptText = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    const agentId = typeof req.body?.agentId === 'string' ? req.body.agentId.trim() : '';
    const unit = typeof req.body?.unit === 'string' ? req.body.unit.trim() : user.Unit;

    if (!VALID_AI_MODES.has(mode)) {
      res.status(400).json({ error: 'Mode asisten Gemini tidak valid.' });
      return;
    }
    if (!promptText || promptText.length > 3000) {
      res.status(400).json({ error: 'Instruksi / topik wajib diisi (maks 3000 karakter).' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'GEMINI_API_KEY belum tersedia di panel Secrets. Atur kunci API Gemini pada panel Settings > Secrets untuk menjalankan Asisten AI Google.',
      });
      return;
    }

    const selectedAgent = agentId
      ? PORTAL_DATA.agents.find((a) => a.id.toUpperCase() === agentId.toUpperCase())
      : undefined;

    const systemContext = [
      'Anda adalah Asisten AI Ekosistem Google (Gemini) resmi untuk Holding Investasi Modal Sendiri Indonesia.',
      'Prinsip tata kelola: modal sendiri (bukan pialang/mengelola dana publik), pemisahan tugas (maker-checker), persetujuan RAPID (<= Rp500 jt Desk Head, > Rp500 jt CIO/Manajemen, > Rp5 M Direksi/Komisaris), dan batas kas keluar > Rp100 jt wajib Direktur.',
      'Skala organisasi: 24 unit (D1–D12, S1–S12), 18 Agen AI, dan tenaga kerja bertahap Fase 1 (26 FTE) -> Fase 2 (71 FTE) -> Fase 3 (156 FTE) dengan akses Freelancer terpisah.',
      `Pengguna aktif saat ini: ${user.Nama} (${user.Jabatan}, ${user.Tier}, Unit ${unit}).`,
      selectedAgent
        ? `Agen AI yang ditugaskan: ${selectedAgent.id} — ${selectedAgent.nama} | Ruang: ${selectedAgent.ruang} | Pemilik: ${selectedAgent.owner} | Misi: ${selectedAgent.misi} | SLA/Otoritas: ${selectedAgent.ot}.`
        : '',
      'Berikan jawaban dalam Bahasa Indonesia yang ringkas, terstruktur dengan poin bernomor yang siap langsung ditempel ke risalah rapat, surat resmi, atau keputusan eksekutif. Jangan mengarang angka transaksi jika tidak diberikan.',
    ]
      .filter(Boolean)
      .join('\n');

    const modeInstruction: Record<GeminiAssistMode, string> = {
      instruksi_agen:
        'Buat rencana eksekusi operasional langkah demi langkah, checklist verifikasi manusia (maker-checker), dan batasan guardrail RAPID sesuai misi Agen AI yang ditunjuk.',
      risalah_rapat:
        'Susun draf Risalah Rapat terstruktur (Agenda, Ringkasan Keputusan, Tindak Lanjut & PIC, Tenggat Waktu, Status Persetujuan RAPID) siap ekspor ke Google Docs/Calendar.',
      draf_surat:
        'Susun draf Surat Internal / Disposisi Profesional (Subjek, Tujuan, Latar Belakang Singkat, Poin Keputusan/Permintaan, Catatan Kepatuhan) siap dikirim via Gmail.',
      ringkas_eksekutif:
        'Susun Ringkasan Eksekutif & Penilaian Risiko RAPID/Kas untuk Direksi dan Pemilik Utama berdasarkan konteks yang diberikan.',
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `${modeInstruction[mode]}\n\nPermintaan pengguna:\n${promptText}`,
        config: {
          systemInstruction: systemContext,
        },
      });
      const text = (response.text ?? '').trim();
      if (!text) {
        res.status(502).json({ error: 'Gemini mengembalikan respons kosong. Silakan coba lagi.' });
        return;
      }
      appendAudit(
        user.Nama,
        `Gemini AI (${mode}${selectedAgent ? ` · ${selectedAgent.id}` : ''})`,
        'Kantor AI'
      );
      res.json({
        text,
        model: 'gemini-4-hydrogen',
        mode,
        timestamp: sekarangWib(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghubungi layanan Gemini AI.';
      console.error('Gemini API error:', err);
      res.status(502).json({ error: `Gagal memproses Gemini AI: ${message}` });
    }
  });

  app.get('/api/system/status', requireAuth(['Pemilik']), (_req, res) => {
    res.json({
      tables: {
        Pengguna: db.pengguna.length,
        Tugas: db.tugas.length,
        Intake: db.intake.length,
        Keuangan: db.keuangan.length,
        Absen: db.absen.length,
        Dokumen: db.dokumen.length,
        Audit: db.audit.length,
      },
      storagePath: 'data/holding-db.json',
      timezone: 'Asia/Jakarta (WIB)',
      activeSessions: sessions.size,
    });
  });

  const APPSCRIPT_FILES = new Map<string, { fileName: string; contentType: string }>([
    ['Code.gs', { fileName: 'Code.gs', contentType: 'text/plain; charset=utf-8' }],
    ['Index.html', { fileName: 'Index.html', contentType: 'text/html; charset=utf-8' }],
    ['appsscript.json', { fileName: 'appsscript.json', contentType: 'application/json; charset=utf-8' }],
    ['DEPLOY.md', { fileName: 'DEPLOY.md', contentType: 'text/markdown; charset=utf-8' }],
  ]);

  app.get('/api/appscript/status', requireAuth(['Pemilik']), (_req, res) => {
    const dir = path.resolve(process.cwd(), 'versi-appscript');
    const files = Array.from(APPSCRIPT_FILES.keys()).map((name) => {
      const fullPath = path.resolve(dir, name);
      if (!fs.existsSync(fullPath)) {
        return { name, exists: false, sizeKb: 0 };
      }
      const stat = fs.statSync(fullPath);
      return { name, exists: true, sizeKb: Math.max(1, Math.round(stat.size / 1024)) };
    });
    res.json({ files });
  });

  app.get('/api/appscript/file/:name', requireAuth(['Pemilik']), (req: AuthedRequest, res) => {
    const entry = APPSCRIPT_FILES.get(String(req.params.name || ''));
    if (!entry) {
      res.status(404).json({ error: 'Berkas Apps Script tidak ditemukan dalam daftar ekspor.' });
      return;
    }
    const fullPath = path.resolve(process.cwd(), 'versi-appscript', entry.fileName);
    if (!fs.existsSync(fullPath)) {
      res.status(404).json({
        error: `Berkas ${entry.fileName} belum dibuat. Jalankan npm run build:appscript terlebih dahulu.`,
      });
      return;
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    appendAudit(
      req.authUser!.Nama,
      `Unduh paket Google Apps Script: ${entry.fileName}`,
      'Sistem'
    );
    res.setHeader('Content-Type', entry.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${entry.fileName}"`);
    res.send(content);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Holding Investasi server aktif pada http://0.0.0.0:${PORT}`);
  });
}

createApp().catch((err) => {
  console.error('Gagal menjalankan server:', err);
  process.exit(1);
});
