import React from 'react';
import { PORTAL_DATA } from '../data/portalData';
import type { DrawerSelection } from './DetailDrawer';

interface StrukturInvestasiViewProps {
  onSelect: (sel: DrawerSelection) => void;
}

export const StrukturInvestasiView: React.FC<StrukturInvestasiViewProps> = ({ onSelect }) => {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-[17px] font-semibold text-[#e8eefc]">3 · Struktur Investasi</h2>
        <p className="text-[12.5px] text-[#9fb0d0]">
          Dari modal pemegang saham sampai aset nyata. Klik kelas aset untuk melihat desk dan mode
          kerjanya.
        </p>
      </div>

      <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4">
        <div className="text-[9.5px] tracking-[0.14em] uppercase text-[#9fb0d0] mb-2">
          Lapisan 1 · Sumber modal
        </div>
        <div className="flex justify-center">
          <div className="bg-gradient-to-b from-[#182845] to-[#131f36] border border-[#2b4370] rounded-[11px] px-5 py-2.5 text-center">
            <div className="text-[9.5px] tracking-[0.1em] uppercase text-[#9fb0d0]">
              Pemegang saham
            </div>
            <div className="font-bold text-[13px] text-[#e8eefc]">Modal disetor</div>
            <div className="text-[11px] text-[#9fb0d0]">
              Dana sendiri — bukan dana pihak lain
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-[#5f7292] text-sm leading-none">▼</div>

      <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4">
        <div className="text-[9.5px] tracking-[0.14em] uppercase text-[#9fb0d0] mb-2">
          Lapisan 2 · Induk
        </div>
        <div className="flex justify-center">
          <div className="bg-gradient-to-b from-[#182845] to-[#131f36] border border-[#2b4370] rounded-[11px] px-5 py-2.5 text-center">
            <div className="text-[9.5px] tracking-[0.1em] uppercase text-[#9fb0d0]">
              KBLI 64200
            </div>
            <div className="font-bold text-[13px] text-[#e8eefc]">PT HOLDING</div>
            <div className="text-[11px] text-[#9fb0d0]">
              Kebijakan investasi · kepemilikan saham anak · portofolio
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-[#5f7292] text-sm leading-none">▼</div>

      <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4">
        <div className="text-[9.5px] tracking-[0.14em] uppercase text-[#9fb0d0] mb-2.5">
          Lapisan 3 · Badan hukum pelaksana
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PORTAL_DATA.entitas.map((e) => (
            <div
              key={e.peran}
              className="bg-[#182845] border border-[#22365c] rounded-[9px] p-2.5 space-y-1"
            >
              <div className="text-[11.5px] font-bold text-[#e8eefc]">{e.peran}</div>
              <div className="text-[10.5px] text-[#38bdf8]">{e.nama}</div>
              <div className="text-[10px] font-mono text-[#9fb0d0]">KBLI {e.kbli}</div>
              <div className="text-[10.5px] text-[#9fb0d0]">{e.fungsi}</div>
              <div className="text-[10px] text-[#7c8fb3] border-t border-[#22365c] pt-1 mt-1">
                {e.izin}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-[#5f7292] text-sm leading-none">▼</div>

      <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4">
        <div className="text-[9.5px] tracking-[0.14em] uppercase text-[#9fb0d0] mb-2.5">
          Lapisan 4 · Kelas aset
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PORTAL_DATA.kelas.map((k) => (
            <button
              key={k.kode}
              type="button"
              onClick={() => onSelect({ type: 'kelas', kode: k.kode })}
              className="bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] hover:bg-[#1b2f52] rounded-[9px] p-2.5 text-left transition-colors cursor-pointer"
            >
              <div className="text-[11.5px] font-bold text-[#e8eefc]">{k.nama}</div>
              <div className="text-[10.5px] text-[#9fb0d0] mt-0.5 tabular-nums">
                {k.jumlah} aset · {k.desk.join(', ')}
              </div>
              <div className="flex h-1.5 rounded bg-[#1c2d4a] mt-2 overflow-hidden">
                <span style={{ width: `${k.ai}%`, backgroundColor: '#3ec7b3' }} />
                <span style={{ width: `${k.rm}%`, backgroundColor: '#9cc3ff' }} />
                <span style={{ width: `${k.of}%`, backgroundColor: '#f3c46b' }} />
              </div>
              <div className="text-[10px] text-[#9fb0d0] mt-1 tabular-nums">
                AI {k.ai}% · Remote {k.rm}% · On-site {k.of}%
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-[#9fb0d0] mt-3 pt-3 border-t border-[#22365c]">
          <span className="px-2.5 py-1 rounded-md bg-[#182845] border border-[#22365c] text-[#38bdf8] font-semibold">
            alokasi IPS
          </span>
          <span>→</span>
          <span className="px-2.5 py-1 rounded-md bg-[#182845] border border-[#22365c] text-[#38bdf8] font-semibold">
            desk pelaksana
          </span>
          <span>→</span>
          <span className="px-2.5 py-1 rounded-md bg-[#182845] border border-[#22365c] text-[#38bdf8] font-semibold">
            aset nyata
          </span>
          <span>→</span>
          <span className="px-2.5 py-1 rounded-md bg-[#182845] border border-[#22365c] text-[#38bdf8] font-semibold">
            yield + capital gain
          </span>
          <span>→</span>
          <span className="px-2.5 py-1 rounded-md bg-[#182845] border border-[#22365c] text-[#38bdf8] font-semibold">
            dividen / laba ditahan
          </span>
        </div>
      </div>

      <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4">
        <div className="text-[9.5px] tracking-[0.14em] uppercase text-[#9fb0d0] mb-1.5">
          Batas kepatuhan
        </div>
        <p className="text-[12.5px] text-[#9fb0d0]">
          Dana sendiri: tidak memerlukan izin pialang, manajer investasi, penasihat investasi,
          kustodian, atau penyelenggara P2P/SCF. Bila kelak menerima dana pihak luar, jalurnya
          adalah penyertaan saham di holding atau SPV per proyek — bukan “dana kelolaan”.
        </p>
      </div>
    </div>
  );
};
