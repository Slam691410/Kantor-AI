import React, { useState } from 'react';
import { PORTAL_DATA } from '../data/portalData';

export const AlurKerjaView: React.FC = () => {
  const [selected, setSelected] = useState<string>(PORTAL_DATA.scenarios[0].k);

  const scenario =
    PORTAL_DATA.scenarios.find((s) => s.k === selected) || PORTAL_DATA.scenarios[0];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[17px] font-semibold text-[#e8eefc]">6 · Alur Kerja</h2>
        <p className="text-[12.5px] text-[#9fb0d0]">
          Dari permintaan masuk sampai keputusan. Perhatikan titik manusia wajib menyetujui.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PORTAL_DATA.scenarios.map((s) => {
          const active = s.k === selected;
          return (
            <button
              key={s.k}
              type="button"
              onClick={() => setSelected(s.k)}
              className={`px-3 py-2 rounded-[9px] text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-[#38bdf8] border-[#38bdf8] text-[#06222f]'
                  : 'bg-[#182845] border-[#22365c] text-[#cfe0ff] hover:border-[#38bdf8]'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        {scenario.steps.map((step, i) => {
          const who = step[0];
          const what = step[1];
          const type = step[2];
          const extra = (step as readonly string[])[3];
          const isApprove = type === 'human' || extra === 'approve';
          const badgeStyle =
            type === 'ai'
              ? 'text-[#6ee7b7] border-[#175c49] bg-[#0e2b23]'
              : type === 'human'
              ? 'text-[#fbbf24] border-[#5b4a17] bg-[#2a2113]'
              : 'text-[#7dd3fc] border-[#1d4670] bg-[#0f2136]';
          const badgeLabel =
            type === 'ai' ? 'AI' : type === 'human' ? 'Manusia' : 'Eksternal';

          return (
            <div
              key={`${scenario.k}-${i}`}
              className={`grid grid-cols-[24px_128px_1fr_auto] items-center gap-3 rounded-[9px] px-3 py-2.5 border ${
                isApprove
                  ? 'bg-[#182845] border-[#5b4a17]'
                  : 'bg-[#131f36] border-[#22365c]'
              }`}
            >
              <div className="w-[22px] h-[22px] rounded-md bg-[#1c2d4a] text-[#9fb0d0] grid place-items-center text-[10.5px] font-mono tabular-nums">
                {i + 1}
              </div>
              <div className="text-[10.5px] tracking-[0.06em] uppercase text-[#9fb0d0] truncate">
                {who}
              </div>
              <div className="text-[12.5px] text-[#e8eefc]">{what}</div>
              <span
                className={`text-[10px] font-semibold px-2.5 py-0.5 rounded border whitespace-nowrap ${badgeStyle}`}
              >
                {badgeLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
