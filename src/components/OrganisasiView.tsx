import React from 'react';
import { PORTAL_DATA } from '../data/portalData';
import type { DrawerSelection } from './DetailDrawer';

interface OrganisasiViewProps {
  onSelect: (sel: DrawerSelection) => void;
}

const DIREKSI = [
  ['Direktur Utama', 'Akuntabilitas akhir'],
  ['CIO', 'Kebijakan investasi'],
  ['CFO', 'Keuangan & pajak'],
  ['CRO', 'Risiko & kepatuhan'],
  ['COO', 'Operasi & kustodian'],
  ['CTO', 'Teknologi, data & AI'],
  ['Legal / Corsec', 'Akta & kontrak'],
];

export const OrganisasiView: React.FC<OrganisasiViewProps> = ({ onSelect }) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[17px] font-semibold text-[#e8eefc]">4 · Bagan Organisasi</h2>
        <p className="text-[12.5px] text-[#9fb0d0]">
          Klik unit untuk melihat pimpinan, FTE, lingkup aset, dan rincian perannya.
        </p>
      </div>

      <div className="flex flex-col items-center">
        <div className="bg-gradient-to-b from-[#182845] to-[#131f36] border border-[#2b4370] rounded-[11px] px-4 py-2.5 text-center min-w-[220px]">
          <div className="text-[9.5px] tracking-[0.1em] uppercase text-[#9fb0d0]">Tertinggi</div>
          <div className="font-bold text-[13px] text-[#e8eefc]">RUPS — Pemegang Saham</div>
          <div className="text-[11px] text-[#9fb0d0]">Modal disetor · persetujuan material</div>
        </div>
        <div className="w-[2px] h-4 bg-[#22365c]" />
        <div className="bg-gradient-to-b from-[#182845] to-[#131f36] border border-[#2b4370] rounded-[11px] px-4 py-2.5 text-center min-w-[220px]">
          <div className="text-[9.5px] tracking-[0.1em] uppercase text-[#9fb0d0]">Pengawasan</div>
          <div className="font-bold text-[13px] text-[#e8eefc]">Dewan Komisaris</div>
          <div className="text-[11px] text-[#9fb0d0]">+ Komite Audit</div>
        </div>
        <div className="w-[2px] h-4 bg-[#22365c]" />
        <div className="flex flex-wrap justify-center gap-2.5">
          {DIREKSI.map(([role, desc]) => (
            <div
              key={role}
              className="bg-[#131f36] border border-[#22365c] border-t-[3px] border-t-[#38bdf8] rounded-[11px] px-3.5 py-2.5 text-center min-w-[145px]"
            >
              <div className="text-[9.5px] tracking-[0.1em] uppercase text-[#9fb0d0]">Direksi</div>
              <div className="font-bold text-[13px] text-[#e8eefc]">{role}</div>
              <div className="text-[11px] text-[#9fb0d0] mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
        <div className="w-[2px] h-4 bg-[#22365c]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4">
          <h3 className="text-[13px] font-semibold text-[#e8eefc]">12 DESK INVESTASI</h3>
          <p className="text-[12px] text-[#9fb0d0] mb-3">
            Penghasil return. Format FTE: Fase 1 / Fase 2 / Fase 3.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PORTAL_DATA.desks.map((u) => (
              <button
                key={u.code}
                type="button"
                onClick={() => onSelect({ type: 'unit', code: u.code })}
                className="flex items-center justify-between gap-2 bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] hover:bg-[#1b2f52] rounded-[8px] px-2.5 py-2 text-left transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-[9.5px] font-bold tracking-[0.06em] text-[#34d399]">
                    {u.code} · DESK
                  </div>
                  <div className="text-[11.5px] font-semibold text-[#e8eefc] leading-snug">
                    {u.nama}
                  </div>
                </div>
                <div className="font-mono text-[10.5px] text-[#9fb0d0] tabular-nums whitespace-nowrap">
                  {u.fte.join('/')}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4">
          <h3 className="text-[13px] font-semibold text-[#e8eefc]">12 FUNGSI PENDUKUNG</h3>
          <p className="text-[12px] text-[#9fb0d0] mb-3">
            Penjaga kendali: risiko, uang, operasi, legal, dan kantor AI.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PORTAL_DATA.support.map((u) => (
              <button
                key={u.code}
                type="button"
                onClick={() => onSelect({ type: 'unit', code: u.code })}
                className="flex items-center justify-between gap-2 bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] hover:bg-[#1b2f52] rounded-[8px] px-2.5 py-2 text-left transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-[9.5px] font-bold tracking-[0.06em] text-[#fbbf24]">
                    {u.code} · FUNGSI
                  </div>
                  <div className="text-[11.5px] font-semibold text-[#e8eefc] leading-snug">
                    {u.nama}
                  </div>
                </div>
                <div className="font-mono text-[10.5px] text-[#9fb0d0] tabular-nums whitespace-nowrap">
                  {u.fte.join('/')}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 text-[11px] text-[#9fb0d0] pt-1">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-[#38bdf8]" />
          Direksi
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-[#34d399]" />
          Desk investasi
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-[#fbbf24]" />
          Fungsi pendukung
        </span>
      </div>
    </div>
  );
};
