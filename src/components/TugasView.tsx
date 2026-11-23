import React, { useMemo, useState } from 'react';
import { api } from '../api';
import type { TugasItem, TugasStatus, UserPublic } from '../types';

interface TugasViewProps {
  token: string;
  user: UserPublic;
  items: TugasItem[];
  loading: boolean;
  onRefresh: () => void;
  onNotify: (msg: string, isError?: boolean) => void;
}

const PENGERJA_FILTERS = ['Semua', 'AI', 'On-site', 'Remote', 'Vendor'] as const;
const PAGE_SIZE = 25;

const KATEGORI_OPTIONS = [
  'Operasional',
  'Investasi & Deal',
  'Keuangan & Pajak',
  'SDM & Administrasi',
  'Kepatuhan & Korporasi',
  'Fasilitas & Kantor',
  'Aset Fisik & Lapangan',
  'D1 · Kas & Pendapatan Tetap (A, B)',
  'D2 & D3 · Ekuitas, Reksa Dana & ETF (C, D)',
  'D4 · Valas, Komoditas & Derivatif (E, N)',
  'D5 · Kripto & Aset Digital Trading (F1–F10)',
  'D6 · Bisnis Digital, SaaS & HKI (F11–F20, L)',
  'D7 · Properti & Tanah (G)',
  'D8 · Aset Fisik Produktif (H)',
  'D9 · Agrikultur & Alam (I)',
  'D10 · Koleksi & Aset Gaya Hidup (J)',
  'D11 · Asuransi & Pensiun (M)',
  'D12 · Bisnis Langsung & UMKM (K)',
  'Tata Kelola Grup & Multi-Entitas (7 PT/SPV)',
];

const PENGERJA_BADGE: Record<string, string> = {
  AI: 'text-[#6ee7b7] bg-[#0e2b23] border-[#175c49]',
  Remote: 'text-[#7dd3fc] bg-[#0f2136] border-[#1d4670]',
  'On-site': 'text-[#fbbf24] bg-[#2a2113] border-[#5b4a17]',
  Vendor: 'text-[#c4b5fd] bg-[#241a35] border-[#43306b]',
};

export const TugasView: React.FC<TugasViewProps> = ({
  token,
  user,
  items,
  loading,
  onRefresh,
  onNotify,
}) => {
  const [kategori, setKategori] = useState('Operasional');
  const [tugasText, setTugasText] = useState('');
  const [pengerja, setPengerja] = useState('AI');
  const [eksekutor, setEksekutor] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [pengerjaFilter, setPengerjaFilter] = useState<(typeof PENGERJA_FILTERS)[number]>('Semua');
  const [katFilter, setKatFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const canCreate = ['Pemilik', 'Manajemen', 'Staf'].includes(user.Tier);

  const stats = useMemo(() => {
    let ai = 0;
    let sdm = 0;
    let vendor = 0;
    for (const it of items) {
      if (it.Pengerja === 'AI') ai += 1;
      else if (it.Pengerja === 'Vendor') vendor += 1;
      else sdm += 1;
    }
    return {
      total: items.length,
      ai,
      sdm,
      vendor,
      aiPct: items.length ? Math.round((ai / items.length) * 100) : 0,
    };
  }, [items]);

  const itemCategories = useMemo(() => {
    const s = new Set<string>();
    for (const it of items) s.add(it.Kategori);
    return Array.from(s);
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (pengerjaFilter !== 'Semua' && it.Pengerja !== pengerjaFilter) return false;
      if (katFilter !== 'Semua' && it.Kategori !== katFilter) return false;
      if (q) {
        const hay = `${it.ID} ${it.Kategori} ${it.Tugas} ${it.Pengerja} ${it.Eksekutor}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, pengerjaFilter, katFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleItems = filteredItems.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tugasText.trim()) return;
    setSubmitting(true);
    try {
      await api.createTugas(token, {
        kategori,
        tugas: tugasText.trim(),
        pengerja,
        eksekutor: eksekutor.trim() || (pengerja === 'AI' ? 'AG-01 Router' : user.Nama),
      });
      setTugasText('');
      setEksekutor('');
      onNotify('Tugas ditambahkan.');
      onRefresh();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Gagal menambah tugas.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: TugasStatus) => {
    try {
      await api.updateTugas(token, id, status);
      onNotify('Tersimpan.');
      onRefresh();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Gagal menyimpan.', true);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-3">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#9fb0d0]">
            Total Tugas Usaha
          </div>
          <div className="text-xl font-bold text-[#e8eefc] tabular-nums mt-0.5">
            {stats.total}
          </div>
        </div>
        <div className="bg-[#131f36] border border-[#175c49] rounded-[12px] p-3">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#6ee7b7]">
            Didelegasikan ke AI
          </div>
          <div className="text-xl font-bold text-[#34d399] tabular-nums mt-0.5">
            {stats.ai}{' '}
            <span className="text-xs font-normal text-[#9fb0d0]">({stats.aiPct}%)</span>
          </div>
        </div>
        <div className="bg-[#131f36] border border-[#5b4a17] rounded-[12px] p-3">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#fbbf24]">
            SDM (On-site &amp; Remote)
          </div>
          <div className="text-xl font-bold text-[#e8eefc] tabular-nums mt-0.5">
            {stats.sdm}
          </div>
        </div>
        <div className="bg-[#131f36] border border-[#43306b] rounded-[12px] p-3">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#c4b5fd]">
            Vendor / Alih Daya
          </div>
          <div className="text-xl font-bold text-[#e8eefc] tabular-nums mt-0.5">
            {stats.vendor}
          </div>
        </div>
      </div>

      {canCreate && (
        <form
          onSubmit={handleCreate}
          className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4"
        >
          <b className="text-sm text-[#e8eefc]">Tambah tugas baru (Delegasikan ke AI atau SDM)</b>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 mt-2">
            <div className="sm:col-span-3">
              <label htmlFor="tKat" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
                Kategori
              </label>
              <select
                id="tKat"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
              >
                {KATEGORI_OPTIONS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-5">
              <label htmlFor="tTugas" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
                Tugas
              </label>
              <input
                id="tTugas"
                type="text"
                value={tugasText}
                onChange={(e) => setTugasText(e.target.value)}
                placeholder="Mis. Audit traffic SaaS mingguan atau cek patok tanah…"
                required
                className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] placeholder:text-[#7c8fb3] focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="tPeng" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
                Pengerja
              </label>
              <select
                id="tPeng"
                value={pengerja}
                onChange={(e) => setPengerja(e.target.value)}
                className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
              >
                <option value="AI">AI</option>
                <option value="Remote">Remote (SDM)</option>
                <option value="On-site">On-site (SDM)</option>
                <option value="Vendor">Vendor</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="tEks" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
                Eksekutor
              </label>
              <input
                id="tEks"
                type="text"
                value={eksekutor}
                onChange={(e) => setEksekutor(e.target.value)}
                placeholder={pengerja === 'AI' ? 'AG-01..AG-18' : user.Nama}
                className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] placeholder:text-[#7c8fb3] focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 bg-[#38bdf8] hover:bg-[#7dd3fc] disabled:opacity-60 text-[#06222f] font-bold text-xs rounded-[8px] px-3.5 py-2 cursor-pointer whitespace-nowrap"
          >
            {submitting ? 'Menyimpan…' : 'Simpan'}
          </button>
        </form>
      )}

      <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {PENGERJA_FILTERS.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setPengerjaFilter(mode);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                  pengerjaFilter === mode
                    ? 'bg-[#38bdf8] border-[#38bdf8] text-[#06222f]'
                    : 'bg-[#182845] border-[#22365c] text-[#cfe0ff] hover:border-[#38bdf8]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Filter kategori tugas"
              value={katFilter}
              onChange={(e) => {
                setKatFilter(e.target.value);
                setPage(1);
              }}
              className="border border-[#22365c] rounded-[8px] px-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#0f1a2c] max-w-[220px] focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="Semua">Semua Bidang ({items.length})</option>
              {itemCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari tugas atau agen/PIC…"
              className="w-48 border border-[#22365c] rounded-[8px] px-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#0f1a2c] placeholder:text-[#7c8fb3] focus:outline-none focus:border-[#38bdf8]"
            />
          </div>
        </div>

        {loading && items.length === 0 ? (
          <div className="text-sm text-[#9fb0d0]">Memuat…</div>
        ) : visibleItems.length === 0 ? (
          <div className="text-sm text-[#9fb0d0]">Tidak ada tugas yang cocok.</div>
        ) : (
          <div>
            {visibleItems.map((t) => (
              <div
                key={t.ID}
                className="py-2.5 border-b border-dashed border-[#22365c] last:border-b-0 text-[12.5px] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="text-[#cfe0ff] space-y-0.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[11px] text-[#7c8fb3]">{t.ID}</span>
                    <span
                      className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        PENGERJA_BADGE[t.Pengerja] || 'text-[#cfe0ff] border-[#22365c]'
                      }`}
                    >
                      {t.Pengerja}
                    </span>
                    <b className="text-[#e8eefc]">{t.Kategori}</b>
                  </div>
                  <div>
                    {t.Tugas}{' '}
                    <span className="text-[#9fb0d0]">({t.Eksekutor})</span>
                  </div>
                </div>
                <select
                  aria-label={`Status tugas ${t.ID}`}
                  value={t.Status}
                  onChange={(e) => handleStatusChange(t.ID, e.target.value as TugasStatus)}
                  className="border border-[#22365c] rounded-[8px] px-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#0f1a2c] w-full sm:w-auto focus:outline-none focus:border-[#38bdf8]"
                >
                  <option value="Belum">Belum</option>
                  <option value="Proses">Proses</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 text-xs text-[#9fb0d0]">
                <span>
                  Halaman {safePage} dari {totalPages} ({filteredItems.length} tugas)
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
