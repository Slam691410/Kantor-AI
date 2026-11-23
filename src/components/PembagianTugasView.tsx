import React, { useMemo, useState } from 'react';
import { PORTAL_DATA } from '../data/portalData';

type FilterMode = 'Semua' | 'AI' | 'Remote' | 'On-site' | 'Vendor';

const MODES: FilterMode[] = ['Semua', 'AI', 'Remote', 'On-site', 'Vendor'];

const MODE_STYLE: Record<string, string> = {
  AI: 'text-[#6ee7b7] bg-[#0e2b23] border-[#175c49]',
  Remote: 'text-[#7dd3fc] bg-[#0f2136] border-[#1d4670]',
  'On-site': 'text-[#fbbf24] bg-[#2a2113] border-[#5b4a17]',
  Vendor: 'text-[#c4b5fd] bg-[#241a35] border-[#43306b]',
};

const DELEGASI_AI_POINTS: ReadonlyArray<{ judul: string; agen: string; penghematan: string }> = [
  {
    judul: 'Intake, Routing & Jadwal Rapat / Google Calendar',
    agen: 'AG-01 + Gemini AI + AG-18',
    penghematan: 'Menggantikan admin input manual; nol tiket tertinggal',
  },
  {
    judul: 'Riset Deal, Memo Investasi, DD & Valuasi 3 Skenario',
    agen: 'AG-02, AG-03, AG-04, AG-06, AG-11',
    penghematan: 'Analis & Legal SDM fokus pada survei fisik & negosiasi final',
  },
  {
    judul: 'Pemantauan 24/7 Pasar, Deposito, Kupon, Kurs, Kripto & IoT',
    agen: 'AG-05, AG-07, AG-08, AG-09, AG-10',
    penghematan: 'Menghilangkan shift pemantauan layar manual 24 jam oleh SDM',
  },
  {
    judul: 'Keuangan, Pajak, Tagihan Sewa/Royalti & Intercompany 7 PT/SPV',
    agen: 'AG-14 + AG-12 + AG-17',
    penghematan: 'Jurnal harian, proyeksi kas, draf SPT & data room audit disusun otomatis',
  },
  {
    judul: 'Rekrutmen Awal, KPI Karyawan, Kontrak Vendor & Pelatihan AI',
    agen: 'AG-16 + AG-13 + AG-18',
    penghematan: 'HR & GA SDM hanya menangani wawancara, disiplin & persetujuan akhir',
  },
  {
    judul: 'Pra-Audit 100% Transaksi, Korespondensi Regulator & Investor Update',
    agen: 'AG-13, AG-14, AG-15, AG-17',
    penghematan: 'Internal Audit SDM fokus pada uji petik lapangan & verifikasi fisik',
  },
];

const WAJIB_SDM_POINTS: ReadonlyArray<string> = [
  'Persetujuan alokasi modal RAPID (≤ Rp500 jt Desk Head, > Rp500 jt CIO, > Rp5 M Direksi/Komisaris)',
  'Tanda tangan akta notaris/PPJB/SPA, pelepasan transfer bank (> Rp100 jt wajib Direktur), & multi-sig kripto 2-dari-3',
  'Survei fisik properti, cek sertifikat BPN/PPAT, opname emas/koleksi, audit cabang UMKM & inspeksi kebun/panen',
  'Negosiasi special rate bank, negosiasi harga jual-beli, presentasi co-investor & hubungan regulator/kepolisian',
  'Wawancara kandidat senior, penanganan disiplin/PHK karyawan & pengawasan vendor fisik di lokasi (cleaning, satpam, teknisi)',
];

export const PembagianTugasView: React.FC = () => {
  const [filter, setFilter] = useState<FilterMode>('Semua');
  const [catFilter, setCatFilter] = useState<string>('Semua');
  const [search, setSearch] = useState('');
  const [showMatrix, setShowMatrix] = useState(true);

  const counts = useMemo(() => {
    const c: Record<string, number> = { AI: 0, Remote: 0, 'On-site': 0, Vendor: 0 };
    for (const t of PORTAL_DATA.tasks) {
      c[t[2]] = (c[t[2]] || 0) + 1;
    }
    return c;
  }, []);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const t of PORTAL_DATA.tasks) {
      seen.add(t[0]);
    }
    return Array.from(seen);
  }, []);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PORTAL_DATA.tasks.filter((t) => {
      if (filter !== 'Semua' && t[2] !== filter) return false;
      if (catFilter !== 'Semua' && t[0] !== catFilter) return false;
      if (!q) return true;
      return (t[0] + ' ' + t[1] + ' ' + t[3] + ' ' + t[5] + ' ' + t[6])
        .toLowerCase()
        .includes(q);
    });
  }, [filter, catFilter, search]);

  const total = PORTAL_DATA.tasks.length;
  const aiCount = counts.AI || 0;
  const officePool = aiCount + (counts.Remote || 0);
  const officeAiShare = officePool ? Math.round((aiCount / officePool) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-[17px] font-semibold text-[#e8eefc]">
            2 · Pembagian Tugas Lengkap (AI vs SDM)
          </h2>
          <p className="text-[12.5px] text-[#9fb0d0]">
            Daftar komprehensif <b>{total} pekerjaan</b> mencakup seluruh 14 kelompok aset (160 jenis),
            12 desk (D1–D12), 12 fungsi pendukung (S1–S12), 7 entitas PT/SPV, &amp; 12 Freelancer Proyek.
            Di luar kerja fisik lapangan &amp; vendor, AI menangani <b>{officeAiShare}%</b> pekerjaan analisis &amp; administrasi kantor.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowMatrix((v) => !v)}
          className="px-3 py-1.5 rounded-lg bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] text-xs font-semibold text-[#cfe0ff] cursor-pointer whitespace-nowrap"
        >
          {showMatrix ? 'Sembunyikan Ringkasan Delegasi' : 'Lihat Ringkasan Delegasi AI vs SDM'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(['AI', 'Remote', 'On-site', 'Vendor'] as const).map((k) => {
          const v = counts[k] || 0;
          const pct = Math.round((v / total) * 100);
          const roleNote =
            k === 'AI'
              ? 'Delegasi AI (Meminimalisir SDM)'
              : k === 'Remote'
                ? 'SDM Inti (Keputusan & Negosiasi)'
                : k === 'On-site'
                  ? 'SDM Fisik / Lapangan / Legal'
                  : 'Alih Daya Pihak Ketiga';
          return (
            <div
              key={k}
              className="bg-[#131f36] border border-[#22365c] rounded-[12px] px-4 py-3"
            >
              <div className="text-[10px] tracking-[0.08em] uppercase text-[#9fb0d0]">
                {roleNote}
              </div>
              <div className="mt-1 text-[22px] font-bold text-[#e8eefc] font-mono tabular-nums">
                {v}{' '}
                <small className="text-[11px] font-medium text-[#9fb0d0] font-sans">
                  tugas ({pct}%)
                </small>
              </div>
              <div className="h-1 rounded bg-[#1c2d4a] mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0f9d8a] to-[#59c9e8]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {showMatrix && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-[#131f36] border border-[#175c49] rounded-[12px] p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[13.5px] font-bold text-[#6ee7b7]">
                Didelegasikan ke AI ({aiCount} Tugas · Pangkas Beban SDM)
              </h3>
              <span className="text-[10.5px] font-mono text-[#34d399] bg-[#0e2b23] border border-[#175c49] px-2 py-0.5 rounded">
                18 Agen + Gemini AI
              </span>
            </div>
            <div className="space-y-2">
              {DELEGASI_AI_POINTS.map((item) => (
                <div
                  key={item.judul}
                  className="bg-[#0f1a2c] border border-[#1c2d4a] rounded-lg px-3 py-2 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <b className="text-[#e8eefc]">{item.judul}</b>
                    <span className="text-[10.5px] font-mono text-[#38bdf8]">{item.agen}</span>
                  </div>
                  <div className="text-[11px] text-[#9fb0d0] mt-0.5">{item.penghematan}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#131f36] border border-[#5b4a17] rounded-[12px] p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[13.5px] font-bold text-[#fbbf24]">
                Tetap Wajib SDM &amp; Otorisasi Manusia ({(counts.Remote || 0) + (counts['On-site'] || 0)} Tugas)
              </h3>
              <span className="text-[10.5px] font-mono text-[#fbbf24] bg-[#2a2113] border border-[#5b4a17] px-2 py-0.5 rounded">
                Tidak Didelegasikan ke AI
              </span>
            </div>
            <ul className="space-y-2 text-xs text-[#cfe0ff]">
              {WAJIB_SDM_POINTS.map((pt) => (
                <li
                  key={pt}
                  className="bg-[#0f1a2c] border border-[#1c2d4a] rounded-lg px-3 py-2 text-[11.5px] leading-relaxed"
                >
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {MODES.map((m) => {
            const count = m === 'Semua' ? total : counts[m] || 0;
            const active = filter === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setFilter(m)}
                className={`px-3 py-1.5 rounded-lg text-[11.5px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#38bdf8] border-[#38bdf8] text-[#06222f]'
                    : 'bg-[#182845] border-[#22365c] text-[#cfe0ff] hover:border-[#38bdf8]'
                }`}
              >
                {m} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <select
            aria-label="Filter kategori unit usaha"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg bg-[#0f1a2c] border border-[#22365c] text-xs text-[#e8eefc] focus:outline-none focus:border-[#38bdf8] max-w-full sm:max-w-[240px]"
          >
            <option value="Semua">Semua Unit &amp; Bidang ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari tugas, agen AI, desk, output…"
            className="h-9 px-3 rounded-lg bg-[#0f1a2c] border border-[#22365c] text-xs text-[#e8eefc] placeholder:text-[#7c8fb3] w-full sm:w-64 focus:outline-none focus:border-[#38bdf8]"
          />
        </div>
      </div>

      <div className="overflow-auto max-h-[65vh] border border-[#22365c] rounded-[12px] bg-[#131f36]">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky top-0 z-10 bg-[#182845] text-[#cfe0ff] text-left px-3 py-2.5 text-[10.5px] tracking-[0.06em] uppercase w-[38%]">
                Tugas / Pekerjaan ({rows.length})
              </th>
              <th className="sticky top-0 z-10 bg-[#182845] text-[#cfe0ff] text-left px-3 py-2.5 text-[10.5px] tracking-[0.06em] uppercase">
                Pengerja
              </th>
              <th className="sticky top-0 z-10 bg-[#182845] text-[#cfe0ff] text-left px-3 py-2.5 text-[10.5px] tracking-[0.06em] uppercase">
                Eksekutor
              </th>
              <th className="sticky top-0 z-10 bg-[#182845] text-[#cfe0ff] text-left px-3 py-2.5 text-[10.5px] tracking-[0.06em] uppercase">
                Frekuensi
              </th>
              <th className="sticky top-0 z-10 bg-[#182845] text-[#cfe0ff] text-left px-3 py-2.5 text-[10.5px] tracking-[0.06em] uppercase">
                Kontrol Manusia
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t, idx) => (
              <tr
                key={`${t[0]}-${idx}`}
                className={idx % 2 === 1 ? 'bg-[#101c31]' : 'bg-[#131f36]'}
              >
                <td className="px-3 py-2 border-t border-[#1c2d4a] align-top">
                  <div className="font-semibold text-[#e8eefc]">{t[0]}</div>
                  <div className="text-[11.5px] text-[#9fb0d0]">{t[1]}</div>
                  {t[5] && (
                    <div className="text-[10.5px] text-[#34d399] mt-0.5">Output: {t[5]}</div>
                  )}
                </td>
                <td className="px-3 py-2 border-t border-[#1c2d4a] align-top whitespace-nowrap">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${
                      MODE_STYLE[t[2]] || 'text-[#cfe0ff] border-[#22365c]'
                    }`}
                  >
                    {t[2]}
                  </span>
                </td>
                <td className="px-3 py-2 border-t border-[#1c2d4a] align-top text-[#cfe0ff]">
                  {t[3]}
                </td>
                <td className="px-3 py-2 border-t border-[#1c2d4a] align-top text-[#9fb0d0] whitespace-nowrap">
                  {t[4]}
                </td>
                <td className="px-3 py-2 border-t border-[#1c2d4a] align-top text-[#9fb0d0]">
                  {t[6]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4">
        <h3 className="text-[13px] font-semibold text-[#e8eefc]">
          Yang dialihdayakan — dibayar sebagai jasa, bukan FTE
        </h3>
        <p className="text-[12px] text-[#9fb0d0] mb-3">
          Pekerjaan berikut lebih efisien dikerjakan pihak ketiga agar struktur SDM inti tetap ramping.
        </p>
        <div className="divide-y divide-dashed divide-[#22365c]">
          {PORTAL_DATA.outsource.map((o) => (
            <div
              key={o[0]}
              className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
            >
              <div>
                <b className="text-[#e8eefc]">{o[0]}</b> ·{' '}
                <span className="text-[#9fb0d0]">{o[1]}</span>
                <div className="text-[11px] text-[#7c8fb3]">{o[3]}</div>
              </div>
              <span className="font-mono text-[11px] font-bold text-[#34d399] whitespace-nowrap">
                {o[2]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
