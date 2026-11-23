import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { PORTAL_DATA } from '../data/portalData';

export type DrawerSelection =
  | { type: 'unit'; code: string }
  | { type: 'kelas'; kode: string }
  | { type: 'agent'; id: string }
  | null;

interface DetailDrawerProps {
  selection: DrawerSelection;
  onClose: () => void;
}

interface UnitRecord {
  code: string;
  kind: string;
  nama: string;
  lingkup: string;
  fte: readonly number[];
  kepala: string;
  tujuan: string;
  tugas: readonly string[];
  mode: string;
  gaji: string;
  agents: readonly string[];
  jabatan: readonly string[];
  jumlah: number;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({ selection, onClose }) => {
  useEffect(() => {
    if (!selection) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selection, onClose]);

  if (!selection) return null;

  let body: React.ReactNode = null;

  if (selection.type === 'unit') {
    const allUnits = [...PORTAL_DATA.desks, ...PORTAL_DATA.support] as unknown as UnitRecord[];
    const u = allUnits.find((x) => x.code === selection.code);
    if (u) {
      body = (
        <>
          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#34d399]">
            {u.code} · {u.kind === 'desk' ? 'Desk Investasi' : 'Fungsi Pendukung'}
          </div>
          <h3 className="mt-1 text-lg font-bold text-[#e8eefc]">{u.nama}</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
                FTE (F1/F2/F3)
              </dt>
              <dd className="mt-0.5 font-mono text-[#e8eefc] tabular-nums">
                {u.fte.join(' / ')}
              </dd>
            </div>
            {u.kepala && (
              <div>
                <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
                  Pimpinan
                </dt>
                <dd className="mt-0.5 text-[#e8eefc]">{u.kepala}</dd>
              </div>
            )}
            {u.lingkup && (
              <div>
                <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
                  Lingkup Aset
                </dt>
                <dd className="mt-0.5 font-mono text-[#38bdf8]">{u.lingkup}</dd>
              </div>
            )}
            <div>
              <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
                Jumlah Jabatan
              </dt>
              <dd className="mt-0.5 text-[#e8eefc] tabular-nums">{u.jumlah} posisi</dd>
            </div>
            {u.mode && (
              <div>
                <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
                  Mode Kerja Pimpinan
                </dt>
                <dd className="mt-0.5 text-[#cfe0ff]">{u.mode}</dd>
              </div>
            )}
            {u.gaji && (
              <div>
                <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
                  Rentang Gaji Pimpinan
                </dt>
                <dd className="mt-0.5 font-mono text-[#34d399] tabular-nums">{u.gaji}</dd>
              </div>
            )}
            {u.agents.length > 0 && (
              <div>
                <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
                  Agent Pendamping
                </dt>
                <dd className="mt-0.5 font-mono text-[#38bdf8]">{u.agents.join(', ')}</dd>
              </div>
            )}
            <div>
              <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
                Tujuan
              </dt>
              <dd className="mt-0.5 text-[#cfe0ff]">{u.tujuan || '—'}</dd>
            </div>
            {u.tugas.length > 0 && (
              <div>
                <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
                  Tiga Tugas Utama
                </dt>
                <dd className="mt-1">
                  <ul className="list-disc pl-4 space-y-1 text-[#cfe0ff] text-[13px]">
                    {u.tugas.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            {u.jabatan.length > 0 && (
              <div>
                <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
                  Jabatan ({u.jumlah})
                </dt>
                <dd className="mt-1">
                  <ul className="list-disc pl-4 space-y-1 text-[#cfe0ff] text-[13px]">
                    {u.jabatan.map((j) => (
                      <li key={j}>{j}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
        </>
      );
    }
  } else if (selection.type === 'kelas') {
    const k = PORTAL_DATA.kelas.find((x) => x.kode === selection.kode);
    if (k) {
      body = (
        <>
          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#34d399]">
            Kelompok {k.kode}
          </div>
          <h3 className="mt-1 text-lg font-bold text-[#e8eefc]">{k.nama}</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
                Jumlah Jenis Aset
              </dt>
              <dd className="mt-0.5 font-mono text-[#e8eefc] tabular-nums">{k.jumlah}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
                Desk Penanggung Jawab
              </dt>
              <dd className="mt-0.5 font-mono text-[#38bdf8]">{k.desk.join(', ')}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
                Mode Kerja
              </dt>
              <dd className="mt-0.5 text-[#cfe0ff] tabular-nums">
                AI {k.ai}% · Remote {k.rm}% · Kantor/on-site {k.of}%
              </dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
                Contoh Aset
              </dt>
              <dd className="mt-1.5">
                <ul className="list-disc pl-4 space-y-1 text-[#cfe0ff] text-[13px]">
                  {k.contoh.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </>
      );
    }
  } else if (selection.type === 'agent') {
    const a = PORTAL_DATA.agents.find((x) => x.id === selection.id);
    if (a) {
      body = (
        <>
          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#34d399]">
            {a.id} · {a.ruang}
          </div>
          <h3 className="mt-1 text-lg font-bold text-[#e8eefc]">{a.nama}</h3>
          <dl className="mt-4 space-y-3 text-[13px]">
            <div>
              <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">Misi</dt>
              <dd className="mt-0.5 text-[#cfe0ff]">{a.misi}</dd>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
                  Otonomi
                </dt>
                <dd className="mt-0.5 text-[#38bdf8]">{a.ot}</dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">SLA</dt>
                <dd className="mt-0.5 font-mono text-[#e8eefc]">{a.sla}</dd>
              </div>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">Input</dt>
              <dd className="mt-0.5 text-[#cfe0ff]">{a.input}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">Output</dt>
              <dd className="mt-0.5 text-[#cfe0ff]">{a.output}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
                Data &amp; Tools
              </dt>
              <dd className="mt-0.5 text-[#cfe0ff]">{a.tools}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
                Pemilik Manusia
              </dt>
              <dd className="mt-0.5 font-semibold text-[#fbbf24]">{a.owner}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">Eskalasi</dt>
              <dd className="mt-0.5 text-[#cfe0ff]">{a.eskalasi}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">KPI</dt>
              <dd className="mt-0.5 text-[#cfe0ff]">{a.kpi}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
                Mode Kegagalan
              </dt>
              <dd className="mt-0.5 text-[#cfe0ff]">{a.fail}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
                Proses Kerja
              </dt>
              <dd className="mt-1">
                <ul className="list-disc pl-4 space-y-1 text-[#cfe0ff]">
                  {a.proses.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>

          <div className="mt-4 rounded-[9px] bg-[#2b1414] border border-[#5b2c2c] p-3 text-xs text-[#fca5a5]">
            <b className="block text-[10px] tracking-[0.1em] uppercase mb-1 text-[#f87171]">
              Guardrail
            </b>
            {a.guard}
          </div>
        </>
      );
    }
  }

  if (!body) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-[#050a14]/65"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="relative z-10 h-full w-[min(440px,94vw)] bg-[#101c31] border-l border-[#22365c] p-5 overflow-y-auto shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup panel detail"
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-lg border border-[#22365c] bg-[#182845] text-[#cfe0ff] hover:text-white flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
        {body}
      </aside>
    </div>
  );
};
