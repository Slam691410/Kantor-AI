import React, { useMemo, useState } from 'react';
import { KATALOG_ASET } from '../data/katalog';

const KELOMPOK = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
const KELAS = [
  'AS-ALT',
  'AS-DER',
  'AS-DIG',
  'AS-EQ',
  'AS-FI',
  'AS-INS',
  'AS-KAS',
  'AS-KOM',
  'AS-RA',
  'AS-SBN',
];

export const KatalogView: React.FC = () => {
  const [cari, setCari] = useState('');
  const [kelompok, setKelompok] = useState('');
  const [kelas, setKelas] = useState('');

  const filtered = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return KATALOG_ASET.filter((r) => {
      if (kelompok && r[3] !== kelompok) return false;
      if (kelas && r[4] !== kelas) return false;
      if (!q) return true;
      return (r[0] + ' ' + r[1] + ' ' + r[2] + ' ' + r[10]).toLowerCase().includes(q);
    });
  }, [cari, kelompok, kelas]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[17px] font-semibold text-[#e8eefc]">7 · Katalog 160 Aset</h2>
        <p className="text-[12.5px] text-[#9fb0d0]">
          Seluruh produk &amp; aset yang dikelola holding, satu per satu — sumbernya{' '}
          <b>MASTER_Holding_Investasi.xlsx</b> (tab A1).
        </p>
      </div>

      <div className="bg-[#182845] border border-[#22365c] rounded-[10px] p-3.5">
        <div className="text-xs font-bold text-[#e8eefc] mb-2.5">Penyaring</div>
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="search"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari nama, kode, atau pengelola…"
            className="flex-1 min-w-[220px] h-10 px-3 rounded-[10px] bg-[#0f1a2c] border border-[#22365c] text-sm text-[#e8eefc] placeholder:text-[#7c8fb3] focus:outline-none focus:border-[#38bdf8]"
          />
          <select
            aria-label="Filter kelompok"
            value={kelompok}
            onChange={(e) => setKelompok(e.target.value)}
            className="h-10 px-3 rounded-[10px] bg-[#0f1a2c] border border-[#22365c] text-sm text-[#e8eefc]"
          >
            <option value="">Semua kelompok</option>
            {KELOMPOK.map((k) => (
              <option key={k} value={k}>
                Kelompok {k}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter kelas"
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            className="h-10 px-3 rounded-[10px] bg-[#0f1a2c] border border-[#22365c] text-sm text-[#e8eefc]"
          >
            <option value="">Semua kelas</option>
            {KELAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="text-[13px] font-semibold text-[#9fb0d0] font-mono tabular-nums">
            {filtered.length} dari {KATALOG_ASET.length} aset
          </span>
        </div>
      </div>

      <div className="overflow-auto max-h-[68vh] border border-[#22365c] rounded-[12px] bg-[#131f36]">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {[
                'ID',
                'Nama aset',
                'Kelompok',
                'Kelas',
                'Wujud',
                'Risiko',
                'Return p.a.',
                'Min. modal',
                'Likuiditas',
                'Pengelola',
              ].map((h) => (
                <th
                  key={h}
                  className="sticky top-0 z-10 bg-[#0f1a2c] text-left px-3 py-2.5 text-[11px] uppercase tracking-[0.05em] text-[#cfe0ff]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <tr
                key={r[0]}
                className={`border-t border-[#1c2d4a] ${
                  idx % 2 === 1 ? 'bg-[#101c31]' : 'bg-[#131f36]'
                }`}
              >
                <td className="px-3 py-2 text-[#7dd3fc] font-mono text-xs whitespace-nowrap">
                  {r[0]}
                </td>
                <td className="px-3 py-2">
                  <b className="text-[#e8eefc]">{r[2]}</b>
                  <div className="text-[#9fb0d0] text-[11px] font-mono">{r[1]}</div>
                </td>
                <td className="px-3 py-2 font-mono">{r[3]}</td>
                <td className="px-3 py-2 font-mono text-xs">{r[4]}</td>
                <td className="px-3 py-2">{r[5]}</td>
                <td className="px-3 py-2 font-mono tabular-nums">{r[6]}</td>
                <td className="px-3 py-2 tabular-nums">{r[7]}</td>
                <td className="px-3 py-2 font-mono tabular-nums">
                  {Number(r[8]) ? `Rp${Number(r[8]).toLocaleString('id-ID')}` : '0'}
                </td>
                <td className="px-3 py-2 text-[#cfe0ff]">{r[9]}</td>
                <td className="px-3 py-2 text-[#9fb0d0]">{r[10]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
