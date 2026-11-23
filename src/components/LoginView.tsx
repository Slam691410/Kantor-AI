import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Mail, Search, ShieldCheck, Users } from 'lucide-react';
import { api } from '../api';
import type { AuthProfileOption, UserPublic } from '../types';
import { FaceCaptureBox } from './FaceCaptureBox';
import { MapsLocationBox, type SelectedGeoLocation } from './MapsLocationBox';

interface LoginViewProps {
  prefillId?: string | null;
  onSuccess: (token: string, user: UserPublic) => void;
}

type CategoryFilter = 'semua' | 'Karyawan FTE' | 'Freelancer' | 'Eksternal';
type FaseFilter = 'semua' | '1' | '2' | '3';

const QUICK_ACCESS_IDS = ['OWN1', 'M1', 'M2', 'M5', 'M6', 'M10', 'M8'];

export const LoginView: React.FC<LoginViewProps> = ({ prefillId, onSuccess }) => {
  const [profiles, setProfiles] = useState<AuthProfileOption[]>([]);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [geoLocation, setGeoLocation] = useState<SelectedGeoLocation | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('semua');
  const [faseFilter, setFaseFilter] = useState<FaseFilter>('semua');
  const [unitFilter, setUnitFilter] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const [requestingOtp, setRequestingOtp] = useState(false);
  const [otpSentInfo, setOtpSentInfo] = useState<{
    maskedEmail: string;
    delivery: 'email' | 'preview';
    previewOtp?: string;
    expiresInSec: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .listAuthProfiles()
      .then((list) => {
        setProfiles(list);
        if (prefillId) {
          const match = list.find((p) => p.ID.toUpperCase() === prefillId.toUpperCase());
          if (match) {
            setEmail(match.Email);
          }
        }
      })
      .catch(() => undefined);
  }, [prefillId]);

  useEffect(() => {
    if (prefillId && profiles.length > 0) {
      const match = profiles.find((p) => p.ID.toUpperCase() === prefillId.toUpperCase());
      if (match) {
        setEmail(match.Email);
        setOtp('');
        setOtpSentInfo(null);
        setError('');
      }
    }
  }, [prefillId, profiles]);

  const counts = useMemo(() => {
    const fte = profiles.filter(
      (p) => (p.StatusKepegawaian || (p.Tier === 'Freelancer' ? 'Freelancer' : p.Tier === 'Auditor' || p.Tier === 'Tamu' ? 'Eksternal' : 'Karyawan FTE')) === 'Karyawan FTE'
    );
    return {
      fteTotal: fte.length,
      fase1: fte.filter((p) => p.Fase === 1).length,
      fase2: fte.filter((p) => p.Fase === 1 || p.Fase === 2).length,
      fase3: fte.length,
      freelancer: profiles.filter((p) => p.Tier === 'Freelancer' || p.StatusKepegawaian === 'Freelancer').length,
      eksternal: profiles.filter((p) => p.Tier === 'Auditor' || p.Tier === 'Tamu' || p.StatusKepegawaian === 'Eksternal').length,
    };
  }, [profiles]);

  const unitOptions = useMemo(() => {
    const codes = new Set<string>();
    for (const p of profiles) {
      const code = p.Unit.split(' · ')[0]?.trim();
      if (code) codes.add(code);
    }
    return Array.from(codes);
  }, [profiles]);

  const quickProfiles = useMemo(
    () =>
      QUICK_ACCESS_IDS.map((id) => profiles.find((p) => p.ID === id)).filter(
        (x): x is AuthProfileOption => Boolean(x)
      ),
    [profiles]
  );

  const filteredProfiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return profiles.filter((p) => {
      const cat =
        p.StatusKepegawaian ||
        (p.Tier === 'Freelancer'
          ? 'Freelancer'
          : p.Tier === 'Auditor' || p.Tier === 'Tamu'
            ? 'Eksternal'
            : 'Karyawan FTE');

      if (categoryFilter !== 'semua' && cat !== categoryFilter) return false;
      if (faseFilter !== 'semua') {
        const maxFase = Number(faseFilter);
        if (cat !== 'Karyawan FTE' || !p.Fase || p.Fase > maxFase) return false;
      }
      if (unitFilter !== 'semua') {
        const code = p.Unit.split(' · ')[0]?.trim();
        if (code !== unitFilter) return false;
      }
      if (q) {
        const hay = `${p.ID} ${p.Nama} ${p.Jabatan} ${p.Unit} ${p.Email} ${p.Tier}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [profiles, categoryFilter, faseFilter, unitFilter, searchQuery]);

  const handleSelectProfile = (p: AuthProfileOption) => {
    setEmail(p.Email);
    setOtp('');
    setOtpSentInfo(null);
    setError('');
  };

  const handleRequestOtp = async () => {
    setError('');
    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) {
      setError('Pilih anggota atau masukkan alamat email terdaftar terlebih dahulu.');
      return;
    }
    setRequestingOtp(true);
    try {
      const res = await api.requestEmailOtp(targetEmail);
      setOtpSentInfo({
        maskedEmail: res.maskedEmail,
        delivery: res.delivery,
        previewOtp: res.previewOtp,
        expiresInSec: res.expiresInSec,
      });
      if (res.delivery === 'preview' && res.previewOtp) {
        setOtp(res.previewOtp);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim OTP Email.');
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!faceImage) {
      setError('Langkah 1 belum selesai: ambil foto wajah terlebih dahulu.');
      return;
    }
    if (!geoLocation) {
      setError('Langkah 2 belum selesai: ambil GPS atau tandai lokasi Anda di Google Maps.');
      return;
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Langkah 3 belum selesai: masukkan kode OTP 6 digit dari email Anda.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.loginWithFactors({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        faceImage,
        lat: geoLocation.lat,
        lng: geoLocation.lng,
        lokasiLabel: geoLocation.lokasiLabel,
      });
      onSuccess(res.token, res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verifikasi masuk gagal.');
    } finally {
      setLoading(false);
    }
  };

  const faceReady = Boolean(faceImage);
  const mapsReady = Boolean(geoLocation);
  const otpReady = /^\d{6}$/.test(otp.trim());

  return (
    <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-[#34d399]">
            Gerbang Tunggal Papan Kerja &amp; Sistem Kerja
          </div>
          <h3 className="mt-1 text-[17px] font-bold text-[#e8eefc]">
            Masuk dengan Foto Wajah, Google Maps &amp; OTP Email
          </h3>
          <p className="mt-1 text-[12px] text-[#9fb0d0] max-w-[780px]">
            Mendukung kapasitas penuh <b className="text-[#e8eefc]">{counts.fteTotal} Karyawan FTE</b>{' '}
            (Fase 1: {counts.fase1} · Fase 2: {counts.fase2} · Fase 3: {counts.fase3}) di 24 unit kerja,
            ditambah <b className="text-[#38bdf8]">{counts.freelancer} akses Freelancer Proyek terpisah</b>{' '}
            dan <b className="text-[#fbbf24]">{counts.eksternal} Auditor/Tamu</b>.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
          <span
            className={`px-2 py-1 rounded border ${
              faceReady
                ? 'bg-[#0e2b23] border-[#175c49] text-[#6ee7b7]'
                : 'bg-[#0f1a2c] border-[#22365c] text-[#9fb0d0]'
            }`}
          >
            1. Foto Wajah {faceReady ? '✓' : '·'}
          </span>
          <span
            className={`px-2 py-1 rounded border ${
              mapsReady
                ? 'bg-[#0e2b23] border-[#175c49] text-[#6ee7b7]'
                : 'bg-[#0f1a2c] border-[#22365c] text-[#9fb0d0]'
            }`}
          >
            2. Maps {mapsReady ? '✓' : '·'}
          </span>
          <span
            className={`px-2 py-1 rounded border ${
              otpReady
                ? 'bg-[#0e2b23] border-[#175c49] text-[#6ee7b7]'
                : 'bg-[#0f1a2c] border-[#22365c] text-[#9fb0d0]'
            }`}
          >
            3. OTP Email {otpReady ? '✓' : '·'}
          </span>
        </div>
      </div>

      {/* Pilihan Anggota Cepat + Direktori 156 Karyawan FTE & Freelancer */}
      {profiles.length > 0 && (
        <div className="bg-[#0f1a2c] border border-[#22365c] rounded-[10px] p-3 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#e8eefc]">
              <Users className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>
                Direktori Akses ({counts.fteTotal} Karyawan FTE + {counts.freelancer} Freelancer +{' '}
                {counts.eksternal} Eksternal)
              </span>
            </div>
            <div className="text-[11px] font-mono text-[#9fb0d0]">
              Menampilkan {filteredProfiles.length} akun
            </div>
          </div>

          {/* Akses Cepat Pimpinan & Contoh Peran */}
          <div className="flex flex-wrap gap-1.5">
            {quickProfiles.map((p) => {
              const selected = email.trim().toLowerCase() === p.Email.toLowerCase();
              return (
                <button
                  key={p.ID}
                  type="button"
                  onClick={() => handleSelectProfile(p)}
                  className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold cursor-pointer transition-colors ${
                    selected
                      ? 'bg-[#38bdf8] border-[#38bdf8] text-[#06222f]'
                      : 'bg-[#182845] border-[#22365c] text-[#cfe0ff] hover:border-[#38bdf8]'
                  }`}
                >
                  {p.ID} · {p.Nama.split(' ')[0]} ({p.Tier})
                </button>
              );
            })}
          </div>

          {/* Filter Direktori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#7c8fb3] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, ID, jabatan, email…"
                className="w-full border border-[#22365c] rounded-[8px] pl-8 pr-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#131f36] placeholder:text-[#7c8fb3] focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <select
              aria-label="Filter kategori kepegawaian"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
              className="border border-[#22365c] rounded-[8px] px-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#131f36] focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="semua">Semua Kategori ({profiles.length})</option>
              <option value="Karyawan FTE">Karyawan FTE ({counts.fteTotal})</option>
              <option value="Freelancer">Freelancer Proyek Terpisah ({counts.freelancer})</option>
              <option value="Eksternal">Auditor &amp; Tamu ({counts.eksternal})</option>
            </select>
            <select
              aria-label="Filter fase pertumbuhan"
              value={faseFilter}
              onChange={(e) => setFaseFilter(e.target.value as FaseFilter)}
              className="border border-[#22365c] rounded-[8px] px-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#131f36] focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="semua">Semua Fase FTE</option>
              <option value="1">Fase 1 — Inti ({counts.fase1} Karyawan)</option>
              <option value="2">Fase 2 — Ekspansi (s.d. {counts.fase2} Karyawan)</option>
              <option value="3">Fase 3 — Skala Penuh (s.d. {counts.fase3} Karyawan)</option>
            </select>
            <select
              aria-label="Filter unit kerja"
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="border border-[#22365c] rounded-[8px] px-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#131f36] focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="semua">Semua Unit Kerja (24 + Eksternal)</option>
              {unitOptions.map((code) => (
                <option key={code} value={code}>
                  Unit {code}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[210px] overflow-y-auto pr-1">
            {filteredProfiles.slice(0, 60).map((p) => {
              const selected = email.trim().toLowerCase() === p.Email.toLowerCase();
              const isFreelance = p.Tier === 'Freelancer' || p.StatusKepegawaian === 'Freelancer';
              return (
                <button
                  key={p.ID}
                  type="button"
                  onClick={() => handleSelectProfile(p)}
                  className={`rounded-[9px] border px-2.5 py-2 text-left transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[#173056] border-[#38bdf8]'
                      : 'bg-[#182845] border-[#22365c] hover:border-[#38bdf8]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[11.5px] font-bold text-[#e8eefc] truncate">
                      {p.Nama}
                    </span>
                    <span
                      className={`text-[9.5px] font-mono shrink-0 px-1.5 py-0.5 rounded ${
                        isFreelance
                          ? 'bg-[#1c1b3a] text-[#c4b5fd]'
                          : 'bg-[#0f1a2c] text-[#38bdf8]'
                      }`}
                    >
                      {p.ID} · {p.Tier}
                      {p.Fase ? ` · F${p.Fase}` : ''}
                    </span>
                  </div>
                  <div className="text-[10.5px] text-[#9fb0d0] truncate">
                    {p.Jabatan} ({p.Unit.split(' · ')[0]})
                  </div>
                  <div className="text-[10px] font-mono text-[#7dd3fc] truncate mt-0.5">
                    {p.Email}
                  </div>
                </button>
              );
            })}
            {filteredProfiles.length > 60 && (
              <div className="col-span-full text-[11px] text-[#9fb0d0] text-center py-1">
                Menampilkan 60 teratas dari {filteredProfiles.length} hasil — gunakan pencarian atau
                filter unit untuk menemukan akun spesifik.
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <FaceCaptureBox value={faceImage} onChange={setFaceImage} />
          <MapsLocationBox value={geoLocation} onChange={setGeoLocation} />
        </div>

        {/* Faktor 3: OTP Email */}
        <div className="bg-[#0f1a2c] border border-[#22365c] rounded-[10px] p-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#e8eefc]">
              <Mail className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>3. Verifikasi OTP Email</span>
            </div>
            {otpReady ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#34d399]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Kode 6 Digit Terisi
              </span>
            ) : (
              <span className="text-[11px] text-[#fbbf24]">Kirim &amp; isi OTP 6 digit</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_180px] gap-2.5 items-end">
            <div>
              <label htmlFor="liEmail" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
                Email Terdaftar
              </label>
              <input
                id="liEmail"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setOtpSentInfo(null);
                }}
                placeholder="nama@holding-investasi.id"
                required
                className="w-full border border-[#22365c] rounded-[8px] px-3 py-2 text-sm text-[#e8eefc] bg-[#131f36] placeholder:text-[#7c8fb3] focus:outline-none focus:border-[#38bdf8]"
              />
            </div>

            <button
              type="button"
              disabled={requestingOtp || !email.trim()}
              onClick={handleRequestOtp}
              className="bg-[#182845] border border-[#38bdf8]/60 hover:border-[#38bdf8] hover:bg-[#1e3357] disabled:opacity-50 text-[#e8eefc] font-bold text-xs rounded-[8px] px-3.5 py-2.5 cursor-pointer whitespace-nowrap"
            >
              {requestingOtp ? 'Mengirim OTP…' : otpSentInfo ? 'Kirim Ulang OTP' : 'Kirim Kode OTP'}
            </button>

            <div>
              <label htmlFor="liOtp" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
                Kode OTP (6 Digit)
              </label>
              <input
                id="liOtp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                required
                className="w-full border border-[#22365c] rounded-[8px] px-3 py-2 text-sm text-[#e8eefc] bg-[#131f36] font-mono tracking-[0.2em] text-center tabular-nums placeholder:text-[#7c8fb3] focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
          </div>

          {otpSentInfo && (
            <div className="bg-[#0e2b23] border border-[#175c49] rounded-[8px] px-3 py-2 text-[12px] text-[#a7f3d0] space-y-1">
              <div>
                {otpSentInfo.delivery === 'email'
                  ? `Kode OTP telah dikirim ke email ${otpSentInfo.maskedEmail} (berlaku ${Math.round(otpSentInfo.expiresInSec / 60)} menit).`
                  : `Mode Pratinjau (SMTP/Resend belum dikonfigurasi): OTP untuk ${otpSentInfo.maskedEmail} siap digunakan.`}
              </div>
              {otpSentInfo.delivery === 'preview' && otpSentInfo.previewOtp && (
                <div className="font-mono text-xs text-[#6ee7b7]">
                  Kode OTP Anda: <b className="text-sm tracking-[0.15em]">{otpSentInfo.previewOtp}</b>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !faceReady || !mapsReady || !otpReady}
          className="w-full bg-[#38bdf8] hover:bg-[#7dd3fc] disabled:opacity-50 text-[#06222f] font-bold text-sm rounded-[9px] px-4 py-3 cursor-pointer transition-colors inline-flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          {loading
            ? 'Memvalidasi Foto, Lokasi Maps & OTP…'
            : 'Verifikasi 3 Faktor & Masuk Ruang Kerja'}
        </button>

        {error && (
          <div
            role="alert"
            className="rounded-[8px] bg-[#2b1414] border border-[#5b2c2c] px-3 py-2 text-[12.5px] text-[#fca5a5]"
          >
            {error}
          </div>
        )}
      </form>
    </div>
  );
};
