import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { isAppsScriptRuntime } from '../utils/gasBridge';
import type {
  PenggunaAdminItem,
  SystemHealth,
  UserPublic,
  UserTier,
  WorkforceCategory,
} from '../types';

interface PenggunaViewProps {
  token: string;
  currentUser: UserPublic;
  users: PenggunaAdminItem[];
  systemHealth: SystemHealth | null;
  loading: boolean;
  onRefresh: () => void;
  onNotify: (msg: string, isError?: boolean) => void;
}

const TIERS: UserTier[] = ['Pemilik', 'Manajemen', 'Staf', 'Auditor', 'Tamu', 'Freelancer'];
const CATEGORIES: WorkforceCategory[] = ['Karyawan FTE', 'Freelancer', 'Eksternal'];
const PAGE_SIZE = 25;

export const PenggunaView: React.FC<PenggunaViewProps> = ({
  token,
  currentUser,
  users,
  systemHealth,
  loading,
  onRefresh,
  onNotify,
}) => {
  const [newId, setNewId] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newJabatan, setNewJabatan] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newTier, setNewTier] = useState<UserTier>('Staf');
  const [newCategory, setNewCategory] = useState<WorkforceCategory>('Karyawan FTE');
  const [newFase, setNewFase] = useState<1 | 2 | 3>(3);
  const [newEmail, setNewEmail] = useState('');
  const [creating, setCreating] = useState(false);

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<'semua' | WorkforceCategory>('semua');
  const [faseFilter, setFaseFilter] = useState<'semua' | '1' | '2' | '3'>('semua');
  const [page, setPage] = useState(1);

  const [emailInputs, setEmailInputs] = useState<Record<string, string>>({});
  const [gasFiles, setGasFiles] = useState<Array<{ name: string; exists: boolean; sizeKb: number }>>([]);
  const [downloadingGas, setDownloadingGas] = useState<string | null>(null);
  const inGasRuntime = isAppsScriptRuntime();

  useEffect(() => {
    if (inGasRuntime) return;
    let active = true;
    api
      .getAppsScriptStatus(token)
      .then((res) => {
        if (active) setGasFiles(res.files || []);
      })
      .catch(() => {
        /* ignore optional status */
      });
    return () => {
      active = false;
    };
  }, [token, inGasRuntime]);

  const handleDownloadGasFile = async (name: string) => {
    setDownloadingGas(name);
    try {
      const blob = await api.downloadAppsScriptFile(token, name);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onNotify(`Berkas ${name} berhasil diunduh.`);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : `Gagal mengunduh ${name}.`, true);
    } finally {
      setDownloadingGas(null);
    }
  };

  const summary = useMemo(() => {
    const fte = users.filter((u) => (u.StatusKepegawaian || 'Karyawan FTE') === 'Karyawan FTE');
    const freelance = users.filter((u) => u.Tier === 'Freelancer' || u.StatusKepegawaian === 'Freelancer');
    const external = users.filter((u) => u.Tier === 'Auditor' || u.Tier === 'Tamu' || u.StatusKepegawaian === 'Eksternal');
    return {
      total: users.length,
      fte: fte.length,
      f1: fte.filter((u) => u.Fase === 1).length,
      f2: fte.filter((u) => u.Fase === 1 || u.Fase === 2).length,
      f3: fte.length,
      freelance: freelance.length,
      external: external.length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const cat =
        u.StatusKepegawaian ||
        (u.Tier === 'Freelancer'
          ? 'Freelancer'
          : u.Tier === 'Auditor' || u.Tier === 'Tamu'
            ? 'Eksternal'
            : 'Karyawan FTE');
      if (catFilter !== 'semua' && cat !== catFilter) return false;
      if (faseFilter !== 'semua') {
        const maxFase = Number(faseFilter);
        if (cat !== 'Karyawan FTE' || !u.Fase || u.Fase > maxFase) return false;
      }
      if (q) {
        const hay = `${u.ID} ${u.Nama} ${u.Jabatan} ${u.Unit} ${u.Email} ${u.Tier}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [users, search, catFilter, faseFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleUsers = filteredUsers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.createPengguna(token, {
        id: newId.trim().toUpperCase(),
        nama: newNama.trim(),
        jabatan: newJabatan.trim(),
        unit: newUnit.trim(),
        tier: newTier,
        email: newEmail.trim().toLowerCase(),
        statusKepegawaian: newCategory,
        ...(newCategory === 'Karyawan FTE' ? { fase: newFase } : {}),
      });
      setNewId('');
      setNewNama('');
      setNewJabatan('');
      setNewUnit('');
      setNewEmail('');
      onNotify('Akun dengan OTP Email dibuat.');
      onRefresh();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Gagal membuat akun.', true);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateEmail = async (id: string) => {
    const email = (emailInputs[id] || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      onNotify('Masukkan alamat email yang valid.', true);
      return;
    }
    try {
      await api.updateUserEmail(token, id, email);
      setEmailInputs((prev) => ({ ...prev, [id]: '' }));
      onNotify(`Email OTP ${id} diperbarui.`);
      onRefresh();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Gagal memperbarui email.', true);
    }
  };

  const handleToggleAktif = async (u: PenggunaAdminItem) => {
    const next = u.Aktif === 'YA' ? 'TIDAK' : 'YA';
    try {
      await api.toggleUserStatus(token, u.ID, next);
      onNotify(`${u.ID} -> ${next}`);
      onRefresh();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Gagal mengubah status.', true);
    }
  };

  return (
    <div className="space-y-3">
      {systemHealth && (
        <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4 text-[12.5px] text-[#cfe0ff]">
          <b className="text-[#34d399]">Status Server:</b>{' '}
          <span className="font-mono tabular-nums">
            {Object.entries(systemHealth.tables)
              .map(([k, v]) => `${k}: ${v}`)
              .join(' · ')}
          </span>{' '}
          <span className="text-[#9fb0d0]">({systemHealth.timezone})</span>
        </div>
      )}

      {!inGasRuntime && (
        <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <b className="text-sm text-[#e8eefc]">
                Paket Unggah Google Apps Script (Spreadsheet + Workspace)
              </b>
              <p className="text-[12px] text-[#9fb0d0] mt-0.5">
                Unduh 4 berkas di bawah ini untuk mengunggah portal lengkap (156 FTE + 12 Freelancer + 2 Eksternal, OTP Email, Gemini AI, &amp; Ekosistem Google) ke Google Apps Script tanpa terminal.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            {(['Code.gs', 'Index.html', 'appsscript.json', 'DEPLOY.md'] as const).map((name) => {
              const info = gasFiles.find((f) => f.name === name);
              const ready = info ? info.exists : true;
              return (
                <button
                  key={name}
                  type="button"
                  disabled={!ready || downloadingGas === name}
                  onClick={() => handleDownloadGasFile(name)}
                  className="text-left bg-[#0f1a2c] border border-[#22365c] hover:border-[#38bdf8] disabled:opacity-50 rounded-[10px] px-3 py-2.5 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-mono text-xs font-bold text-[#7dd3fc]">{name}</span>
                    <span className="text-[10.5px] text-[#34d399] font-mono">
                      {downloadingGas === name
                        ? 'Mengunduh…'
                        : info && info.exists
                          ? `${info.sizeKb} KB`
                          : 'Unduh'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#9fb0d0] mt-1">
                    {name === 'Code.gs'
                      ? 'Server GAS, Spreadsheet DB, & Workspace'
                      : name === 'Index.html'
                        ? 'Antarmuka SPA tunggal siap tempel'
                        : name === 'appsscript.json'
                          ? 'Manifest & izin OAuth Google'
                          : 'Panduan langkah unggah & deploy'}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="text-[11.5px] text-[#9fb0d0] bg-[#0f1a2c] border border-[#1d2e4f] rounded-[8px] px-3 py-2">
            <b className="text-[#e8eefc]">Urutan unggah:</b> 1) Buat Google Spreadsheet baru → 2) Buka{' '}
            <span className="text-[#cfe0ff]">Extensions → Apps Script</span> → 3) Salin isi{' '}
            <code className="text-[#7dd3fc]">Code.gs</code>, buat HTML bernama{' '}
            <code className="text-[#7dd3fc]">Index</code> untuk isi <code className="text-[#7dd3fc]">Index.html</code>, dan aktifkan manifest{' '}
            <code className="text-[#7dd3fc]">appsscript.json</code> → 4) Jalankan{' '}
            <code className="text-[#34d399]">siapkanDatabase()</code> sekali → 5) Klik{' '}
            <span className="text-[#cfe0ff]">Deploy → New deployment → Web app</span>.
          </div>
        </div>
      )}

      {/* Ringkasan Kapasitas 156 Karyawan FTE + Freelancer Terpisah */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-3.5">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#34d399]">
            Karyawan Tetap (FTE)
          </div>
          <div className="text-xl font-bold text-[#e8eefc] tabular-nums mt-0.5">
            {summary.fte} Karyawan
          </div>
          <div className="text-[11px] text-[#9fb0d0] mt-0.5 font-mono">
            Fase 1: {summary.f1} · Fase 2: {summary.f2} · Fase 3: {summary.f3}
          </div>
        </div>
        <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-3.5">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#c4b5fd]">
            Freelancer Proyek (Terpisah)
          </div>
          <div className="text-xl font-bold text-[#e8eefc] tabular-nums mt-0.5">
            {summary.freelance} Akun
          </div>
          <div className="text-[11px] text-[#9fb0d0] mt-0.5">
            Di luar kuota {summary.fte} Karyawan FTE — akses terbatas per proyek
          </div>
        </div>
        <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-3.5">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#fbbf24]">
            Eksternal (Auditor &amp; Tamu)
          </div>
          <div className="text-xl font-bold text-[#e8eefc] tabular-nums mt-0.5">
            {summary.external} Akun
          </div>
          <div className="text-[11px] text-[#9fb0d0] mt-0.5">
            Total seluruh akun aktif &amp; nonaktif: {summary.total}
          </div>
        </div>
      </div>

      <form
        onSubmit={handleCreateUser}
        className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4"
      >
        <b className="text-sm text-[#e8eefc]">
          Tambah Pengguna (Verifikasi Wajah · Maps · OTP Email)
        </b>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 mt-2">
          <div>
            <label htmlFor="uId" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
              ID
            </label>
            <input
              id="uId"
              type="text"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              placeholder="FL-12"
              required
              className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] font-mono uppercase placeholder:text-[#7c8fb3] focus:outline-none focus:border-[#38bdf8]"
            />
          </div>
          <div>
            <label htmlFor="uNama" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
              Nama
            </label>
            <input
              id="uNama"
              type="text"
              value={newNama}
              onChange={(e) => setNewNama(e.target.value)}
              required
              className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
            />
          </div>
          <div>
            <label htmlFor="uJab" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
              Jabatan
            </label>
            <input
              id="uJab"
              type="text"
              value={newJabatan}
              onChange={(e) => setNewJabatan(e.target.value)}
              required
              className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
            />
          </div>
          <div>
            <label htmlFor="uUnit" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
              Unit
            </label>
            <input
              id="uUnit"
              type="text"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              placeholder="D2 · Ekuitas Publik"
              required
              className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
            />
          </div>
          <div>
            <label htmlFor="uTier" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
              Tier Wewenang
            </label>
            <select
              id="uTier"
              value={newTier}
              onChange={(e) => {
                const t = e.target.value as UserTier;
                setNewTier(t);
                if (t === 'Freelancer') setNewCategory('Freelancer');
                else if (t === 'Auditor' || t === 'Tamu') setNewCategory('Eksternal');
                else setNewCategory('Karyawan FTE');
              }}
              className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
            >
              {TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="uCat" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
              Status Kepegawaian
            </label>
            <select
              id="uCat"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as WorkforceCategory)}
              className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="uFase" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
              Fase FTE
            </label>
            <select
              id="uFase"
              disabled={newCategory !== 'Karyawan FTE'}
              value={newFase}
              onChange={(e) => setNewFase(Number(e.target.value) as 1 | 2 | 3)}
              className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] disabled:opacity-50 focus:outline-none focus:border-[#38bdf8]"
            >
              <option value={1}>Fase 1 (26 FTE)</option>
              <option value={2}>Fase 2 (71 FTE)</option>
              <option value={3}>Fase 3 (156 FTE)</option>
            </select>
          </div>
          <div>
            <label htmlFor="uEmail" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
              Email OTP
            </label>
            <input
              id="uEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="nama@holding-investasi.id"
              required
              className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="mt-3 bg-[#38bdf8] hover:bg-[#7dd3fc] disabled:opacity-60 text-[#06222f] font-bold text-xs rounded-[8px] px-3.5 py-2 cursor-pointer whitespace-nowrap"
        >
          {creating ? 'Menyimpan…' : 'Simpan Pengguna'}
        </button>
      </form>

      <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <b className="text-sm text-[#e8eefc]">
            Daftar Pengguna &amp; Email OTP ({filteredUsers.length} dari {users.length})
          </b>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari ID, nama, unit, email…"
              className="w-48 border border-[#22365c] rounded-[8px] px-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#0f1a2c] placeholder:text-[#7c8fb3] focus:outline-none focus:border-[#38bdf8]"
            />
            <select
              aria-label="Filter kategori"
              value={catFilter}
              onChange={(e) => {
                setCatFilter(e.target.value as 'semua' | WorkforceCategory);
                setPage(1);
              }}
              className="border border-[#22365c] rounded-[8px] px-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="semua">Semua Kategori</option>
              <option value="Karyawan FTE">Karyawan FTE ({summary.fte})</option>
              <option value="Freelancer">Freelancer ({summary.freelance})</option>
              <option value="Eksternal">Eksternal ({summary.external})</option>
            </select>
            <select
              aria-label="Filter fase"
              value={faseFilter}
              onChange={(e) => {
                setFaseFilter(e.target.value as 'semua' | '1' | '2' | '3');
                setPage(1);
              }}
              className="border border-[#22365c] rounded-[8px] px-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="semua">Semua Fase</option>
              <option value="1">Fase 1 ({summary.f1})</option>
              <option value="2">Fase 2 ({summary.f2})</option>
              <option value="3">Fase 3 ({summary.f3})</option>
            </select>
          </div>
        </div>

        {loading && users.length === 0 ? (
          <div className="mt-2 text-sm text-[#9fb0d0]">Memuat…</div>
        ) : (
          <div>
            {visibleUsers.map((u) => (
              <div
                key={u.ID}
                className="py-2.5 border-b border-dashed border-[#22365c] last:border-b-0 text-[12.5px] flex flex-col lg:flex-row lg:items-center justify-between gap-2"
              >
                <div className="text-[#cfe0ff]">
                  <b className="text-[#e8eefc]">
                    {u.ID} · {u.Nama}
                  </b>{' '}
                  — {u.Jabatan} ({u.Tier}
                  {u.StatusKepegawaian ? ` · ${u.StatusKepegawaian}` : ''}
                  {u.Fase ? ` · Fase ${u.Fase}` : ''}, {u.Unit}) ·{' '}
                  <span className="font-mono text-[#7dd3fc]">{u.Email}</span> · Aktif:{' '}
                  <b className={u.Aktif === 'YA' ? 'text-[#34d399]' : 'text-[#f87171]'}>
                    {u.Aktif}
                  </b>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={u.ID === currentUser.ID}
                    onClick={() => handleToggleAktif(u)}
                    className="bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] text-[#e8eefc] font-bold text-xs rounded-[8px] px-2.5 py-1 cursor-pointer disabled:opacity-40 whitespace-nowrap"
                  >
                    {u.Aktif === 'YA' ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <input
                    type="email"
                    aria-label={`Email baru ${u.ID}`}
                    value={emailInputs[u.ID] || ''}
                    onChange={(e) =>
                      setEmailInputs((prev) => ({ ...prev, [u.ID]: e.target.value }))
                    }
                    placeholder="Email OTP baru"
                    className="w-48 border border-[#22365c] rounded-[8px] px-2 py-1 text-xs text-[#e8eefc] bg-[#0f1a2c] placeholder:text-[#7c8fb3] focus:outline-none focus:border-[#38bdf8]"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdateEmail(u.ID)}
                    className="bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#06222f] font-bold text-xs rounded-[8px] px-2.5 py-1 cursor-pointer whitespace-nowrap"
                  >
                    Perbarui Email
                  </button>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 text-xs text-[#9fb0d0]">
                <span>
                  Halaman {safePage} dari {totalPages}
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded bg-[#182845] border border-[#22365c] disabled:opacity-40 cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 rounded bg-[#182845] border border-[#22365c] disabled:opacity-40 cursor-pointer"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
