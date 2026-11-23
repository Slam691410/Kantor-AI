import React from 'react';

export const RingkasanView: React.FC = () => {
  const kpis = [
    { label: 'Jenis aset', val: '160', sub: '14 kelompok', pct: 100 },
    { label: 'Desk investasi', val: '12', sub: '40 jabatan', pct: 52 },
    { label: 'Fungsi pendukung', val: '12', sub: '50 jabatan', pct: 48 },
    { label: 'Opex fase 1', val: 'Rp15,2', sub: 'miliar/tahun', pct: 19 },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[17px] font-semibold text-[#e8eefc]">1 · Ringkasan</h2>
        <p className="text-[12.5px] text-[#9fb0d0]">
          Angka kunci dari 160 jenis aset yang dikelola satu holding dengan modal sendiri.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="bg-[#131f36] border border-[#22365c] rounded-[12px] px-4 py-3.5"
          >
            <div className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
              {k.label}
            </div>
            <div className="mt-1 text-[23px] font-bold text-[#e8eefc] font-mono tabular-nums leading-tight">
              {k.val}{' '}
              <small className="text-[11px] font-medium text-[#9fb0d0] font-sans">
                {k.sub}
              </small>
            </div>
            <div className="h-1 rounded bg-[#1c2d4a] mt-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0f9d8a] to-[#59c9e8]"
                style={{ width: `${k.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4">
          <h3 className="text-sm font-semibold text-[#e8eefc]">Pembagian kerja 160 aset</h3>
          <p className="text-[12.5px] text-[#9fb0d0] mt-0.5 mb-3">
            Rata-rata tertimbang beban kerja per jenis aset — bukan porsi keputusan.
          </p>
          <div className="flex h-7 rounded-lg overflow-hidden border border-[#22365c] text-[11px] font-bold tabular-nums">
            <div
              className="grid place-items-center bg-gradient-to-r from-[#0f9d8a] to-[#3ec7b3] text-[#04231f]"
              style={{ width: '50%' }}
            >
              AI 50%
            </div>
            <div
              className="grid place-items-center bg-gradient-to-r from-[#6ea8fe] to-[#9cc3ff] text-[#0b1e38]"
              style={{ width: '27%' }}
            >
              Remote 26%
            </div>
            <div
              className="grid place-items-center bg-gradient-to-r from-[#e0a83a] to-[#f3c46b] text-[#2a1d00]"
              style={{ width: '23%' }}
            >
              Kantor 22%
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-[11px] text-[#9fb0d0] mt-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-[#3ec7b3]" />
              AI: riset, draft, monitoring, rekonsiliasi
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-[#9cc3ff]" />
              Remote: analisis, negosiasi, eksekusi sistem
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-[#f3c46b]" />
              Kantor/on-site: fisik, tanda tangan
            </span>
          </div>
        </div>

        <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4">
          <h3 className="text-sm font-semibold text-[#e8eefc]">Tiga keputusan desain</h3>
          <ul className="mt-2.5 pl-4 list-disc space-y-2 text-[12.5px] text-[#cfe0ff]">
            <li>
              <b>12 desk, bukan 160 tim.</b> Tujuh kompetensi berulang dipakai ulang; 160 tim
              berarti 480+ orang.
            </li>
            <li>
              <b>Aset dipisah per badan hukum</b> agar risiko, asuransi, dan pembukuan tidak
              bercampur.
            </li>
            <li>
              <b>AI sebagai pintu masuk tunggal</b> dengan batas wewenang tertulis; keputusan
              kapital tetap manusia.
            </li>
          </ul>
          <p className="mt-3 text-[12px] text-[#9fb0d0]">
            Sumber data lengkap: <b>MASTER_Holding_Investasi.xlsx</b> (35 sheet).
          </p>
        </div>
      </div>
    </div>
  );
};
