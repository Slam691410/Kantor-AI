export type UserTier =
  | 'Pemilik'
  | 'Manajemen'
  | 'Staf'
  | 'Auditor'
  | 'Tamu'
  | 'Freelancer';

export type WorkforceCategory = 'Karyawan FTE' | 'Freelancer' | 'Eksternal';

export interface UserPublic {
  ID: string;
  Nama: string;
  Jabatan: string;
  Unit: string;
  Tier: UserTier;
  Email: string;
  Peringkat: number;
  Fase?: 1 | 2 | 3;
  StatusKepegawaian?: WorkforceCategory;
}

export interface AuthProfileOption {
  ID: string;
  Nama: string;
  Jabatan: string;
  Unit: string;
  Tier: UserTier;
  Email: string;
  Fase?: 1 | 2 | 3;
  StatusKepegawaian?: WorkforceCategory;
}

export interface PenggunaAdminItem extends UserPublic {
  Aktif: 'YA' | 'TIDAK';
}

export interface OtpRequestResult {
  ok: boolean;
  delivery: 'email' | 'preview';
  maskedEmail: string;
  expiresInSec: number;
  previewOtp?: string;
}

export type GeminiAssistMode =
  | 'instruksi_agen'
  | 'risalah_rapat'
  | 'draf_surat'
  | 'ringkas_eksekutif';

export interface GeminiAssistResult {
  text: string;
  model: string;
  mode: GeminiAssistMode;
  timestamp: string;
}

export type IntakeStatus =
  | 'Masuk'
  | 'Direview'
  | 'Perlu Info'
  | 'Disetujui'
  | 'Ditolak';

export interface IntakeItem {
  ID: string;
  Judul: string;
  Kategori: string;
  Nilai: number;
  Unit: string;
  Pengaju: string;
  Status: IntakeStatus;
  Riwayat: string;
  TanggalBuat: string;
}

export type KeuanganJenis = 'Masuk' | 'Keluar';
export type KeuanganStatus = 'Draft' | 'Terverifikasi' | 'Disetujui';
export type RekonsiliasiStatus = 'Belum' | 'Sudah';

export interface KeuanganItem {
  ID: string;
  Tanggal: string;
  Jenis: KeuanganJenis;
  Kategori: string;
  Nominal: number;
  Keterangan: string;
  Oleh: string;
  Status: KeuanganStatus;
  Rekonsiliasi: RekonsiliasiStatus;
}

export type TugasStatus = 'Belum' | 'Proses' | 'Selesai';

export interface TugasItem {
  ID: string;
  Kategori: string;
  Tugas: string;
  Pengerja: string;
  Eksekutor: string;
  Status: TugasStatus;
}

export type AbsenJenis = 'in' | 'out';
export type AbsenVerifikasi =
  | 'menunggu-verifikasi-atasan'
  | 'terverifikasi'
  | 'ditolak';

export interface AbsenItem {
  ID: string;
  Tanggal: string;
  Jam: string;
  Nama: string;
  UserID: string;
  Jenis: AbsenJenis;
  Lokasi: string;
  Lat?: number;
  Lng?: number;
  JarakMeter?: number;
  FaceDigest?: string;
  StatusVerifikasi: AbsenVerifikasi;
  DiverifikasiOleh?: string;
}

export interface DokumenItem {
  ID: string;
  Judul: string;
  Jenis: string;
  Oleh: string;
  Isi: string;
  Tanggal: string;
}

export interface AuditItem {
  Waktu: string;
  Siapa: string;
  Aksi: string;
  Modul: string;
}

export interface DashboardData {
  antrean: number;
  totalIntake: number;
  tugasSelesai: number;
  totalTugas: number;
  saldoKas: number;
  totalMasuk: number;
  totalKeluar: number;
  dokumen: number;
  absenMenunggu: number;
  auditTerakhir: AuditItem[];
}

export interface SystemHealth {
  tables: Record<string, number>;
  storagePath: string;
  timezone: string;
  activeSessions: number;
}
