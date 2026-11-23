import { callGas, isAppsScriptRuntime } from './utils/gasBridge';
import type {
  AbsenItem,
  AbsenJenis,
  AbsenVerifikasi,
  AuditItem,
  AuthProfileOption,
  DashboardData,
  DokumenItem,
  GeminiAssistMode,
  GeminiAssistResult,
  IntakeItem,
  IntakeStatus,
  KeuanganItem,
  KeuanganJenis,
  KeuanganStatus,
  OtpRequestResult,
  PenggunaAdminItem,
  RekonsiliasiStatus,
  SystemHealth,
  TugasItem,
  TugasStatus,
  UserPublic,
  UserTier,
  WorkforceCategory,
} from './types';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data?.error || `Permintaan gagal (${res.status})`, res.status);
  }
  return data as T;
}

async function gasDispatch<T>(
  route: string,
  token: string | null,
  payload: unknown = {}
): Promise<T> {
  try {
    return await callGas<T>('gasApiDispatch', route, token || '', payload);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Permintaan Apps Script gagal.';
    const status = /Belum masuk|sesi berakhir|Sesi berakhir/i.test(msg)
      ? 401
      : /Ditolak|Akses ditolak/i.test(msg)
        ? 403
        : 400;
    throw new ApiError(msg, status);
  }
}

export const api = {
  listAuthProfiles() {
    if (isAppsScriptRuntime()) return gasDispatch<AuthProfileOption[]>('auth.profiles', null);
    return request<AuthProfileOption[]>('/api/auth/profiles', null);
  },
  requestEmailOtp(email: string) {
    if (isAppsScriptRuntime()) return gasDispatch<OtpRequestResult>('auth.otpRequest', null, { email });
    return request<OtpRequestResult>('/api/auth/otp/request', null, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  loginWithFactors(payload: {
    email: string;
    otp: string;
    faceImage: string;
    lat: number;
    lng: number;
    lokasiLabel: string;
  }) {
    if (isAppsScriptRuntime()) return gasDispatch<{ token: string; user: UserPublic }>('auth.login', null, payload);
    return request<{ token: string; user: UserPublic }>('/api/auth/login', null, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  logout(token: string) {
    if (isAppsScriptRuntime()) return gasDispatch<{ ok: boolean }>('auth.logout', token);
    return request<{ ok: boolean }>('/api/auth/logout', token, { method: 'POST' });
  },
  getMe(token: string) {
    if (isAppsScriptRuntime()) return gasDispatch<{ user: UserPublic }>('auth.me', token);
    return request<{ user: UserPublic }>('/api/auth/me', token);
  },
  getDashboard(token: string) {
    if (isAppsScriptRuntime()) return gasDispatch<DashboardData>('dashboard.get', token);
    return request<DashboardData>('/api/dashboard', token);
  },
  listIntake(token: string) {
    if (isAppsScriptRuntime()) return gasDispatch<IntakeItem[]>('intake.list', token);
    return request<IntakeItem[]>('/api/intake', token);
  },
  createIntake(
    token: string,
    payload: { judul: string; kategori: string; nilai: number; unit?: string }
  ) {
    if (isAppsScriptRuntime()) return gasDispatch<IntakeItem>('intake.create', token, payload);
    return request<IntakeItem>('/api/intake', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateIntakeStatus(token: string, id: string, aksi: IntakeStatus) {
    if (isAppsScriptRuntime()) return gasDispatch<IntakeItem>('intake.status', token, { id, aksi });
    return request<IntakeItem>(`/api/intake/${encodeURIComponent(id)}/status`, token, {
      method: 'PATCH',
      body: JSON.stringify({ aksi }),
    });
  },
  listKeuangan(token: string) {
    if (isAppsScriptRuntime()) return gasDispatch<KeuanganItem[]>('keuangan.list', token);
    return request<KeuanganItem[]>('/api/keuangan', token);
  },
  createKeuangan(
    token: string,
    payload: {
      tanggal?: string;
      jenis: KeuanganJenis;
      kategori: string;
      nominal: number;
      keterangan: string;
    }
  ) {
    if (isAppsScriptRuntime()) return gasDispatch<KeuanganItem>('keuangan.create', token, payload);
    return request<KeuanganItem>('/api/keuangan', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateKeuangan(
    token: string,
    id: string,
    payload: { status?: KeuanganStatus; rekonsiliasi?: RekonsiliasiStatus }
  ) {
    if (isAppsScriptRuntime()) return gasDispatch<KeuanganItem>('keuangan.update', token, { id, ...payload });
    return request<KeuanganItem>(`/api/keuangan/${encodeURIComponent(id)}`, token, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  listTugas(token: string) {
    if (isAppsScriptRuntime()) return gasDispatch<TugasItem[]>('tugas.list', token);
    return request<TugasItem[]>('/api/tugas', token);
  },
  createTugas(
    token: string,
    payload: { kategori: string; tugas: string; pengerja: string; eksekutor: string }
  ) {
    if (isAppsScriptRuntime()) return gasDispatch<TugasItem>('tugas.create', token, payload);
    return request<TugasItem>('/api/tugas', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateTugas(token: string, id: string, status: TugasStatus) {
    if (isAppsScriptRuntime()) return gasDispatch<TugasItem>('tugas.update', token, { id, status });
    return request<TugasItem>(`/api/tugas/${encodeURIComponent(id)}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  listAbsen(token: string) {
    if (isAppsScriptRuntime()) return gasDispatch<AbsenItem[]>('absen.list', token);
    return request<AbsenItem[]>('/api/absen', token);
  },
  submitAbsen(
    token: string,
    payload: {
      jenis: AbsenJenis;
      faceImage: string;
      lat: number;
      lng: number;
      lokasi: string;
    }
  ) {
    if (isAppsScriptRuntime()) return gasDispatch<AbsenItem>('absen.submit', token, payload);
    return request<AbsenItem>('/api/absen', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  verifyAbsen(token: string, id: string, status: AbsenVerifikasi) {
    if (isAppsScriptRuntime()) return gasDispatch<AbsenItem>('absen.verify', token, { id, status });
    return request<AbsenItem>(`/api/absen/${encodeURIComponent(id)}/verify`, token, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  listDokumen(token: string) {
    if (isAppsScriptRuntime()) return gasDispatch<DokumenItem[]>('dokumen.list', token);
    return request<DokumenItem[]>('/api/dokumen', token);
  },
  createDokumen(
    token: string,
    payload: { judul: string; jenis: string; isi: string }
  ) {
    if (isAppsScriptRuntime()) return gasDispatch<DokumenItem>('dokumen.create', token, payload);
    return request<DokumenItem>('/api/dokumen', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  listAudit(token: string) {
    if (isAppsScriptRuntime()) return gasDispatch<AuditItem[]>('audit.list', token);
    return request<AuditItem[]>('/api/audit', token);
  },
  listPengguna(token: string) {
    if (isAppsScriptRuntime()) return gasDispatch<PenggunaAdminItem[]>('pengguna.list', token);
    return request<PenggunaAdminItem[]>('/api/pengguna', token);
  },
  createPengguna(
    token: string,
    payload: {
      id: string;
      nama: string;
      jabatan: string;
      unit: string;
      tier: UserTier;
      email: string;
      fase?: 1 | 2 | 3;
      statusKepegawaian?: WorkforceCategory;
    }
  ) {
    if (isAppsScriptRuntime()) return gasDispatch<PenggunaAdminItem>('pengguna.create', token, payload);
    return request<PenggunaAdminItem>('/api/pengguna', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateUserEmail(token: string, id: string, email: string) {
    if (isAppsScriptRuntime()) return gasDispatch<PenggunaAdminItem>('pengguna.email', token, { id, email });
    return request<PenggunaAdminItem>(`/api/pengguna/${encodeURIComponent(id)}/email`, token, {
      method: 'PATCH',
      body: JSON.stringify({ email }),
    });
  },
  toggleUserStatus(token: string, id: string, aktif: 'YA' | 'TIDAK') {
    if (isAppsScriptRuntime()) return gasDispatch<PenggunaAdminItem>('pengguna.status', token, { id, aktif });
    return request<PenggunaAdminItem>(`/api/pengguna/${encodeURIComponent(id)}/status`, token, {
      method: 'PATCH',
      body: JSON.stringify({ aktif }),
    });
  },
  assistWithGemini(
    token: string,
    payload: {
      mode: GeminiAssistMode;
      prompt: string;
      agentId?: string;
      unit?: string;
    }
  ) {
    if (isAppsScriptRuntime()) return gasDispatch<GeminiAssistResult>('ai.assist', token, payload);
    return request<GeminiAssistResult>('/api/ai/assist', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getSystemHealth(token: string) {
    if (isAppsScriptRuntime()) return gasDispatch<SystemHealth>('system.status', token);
    return request<SystemHealth>('/api/system/status', token);
  },
  getAppsScriptStatus(token: string) {
    if (isAppsScriptRuntime()) {
      return Promise.resolve({ files: [] as Array<{ name: string; exists: boolean; sizeKb: number }> });
    }
    return request<{ files: Array<{ name: string; exists: boolean; sizeKb: number }> }>(
      '/api/appscript/status',
      token
    );
  },
  async downloadAppsScriptFile(token: string, name: string): Promise<Blob> {
    if (isAppsScriptRuntime()) {
      throw new ApiError('Aplikasi sudah berjalan di Google Apps Script.', 400);
    }
    const res = await fetch(`/api/appscript/file/${encodeURIComponent(name)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new ApiError(data?.error || `Gagal mengunduh ${name} (${res.status})`, res.status);
    }
    return res.blob();
  },
};
