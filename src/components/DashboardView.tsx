import React from 'react';
import type { DashboardData, UserPublic } from '../types';
import { canAccessSection, formatRupiah } from '../utils/format';
import type { SistemSubSection } from './SistemKerjaView';

interface DashboardViewProps {
  user: UserPublic;
  data: DashboardData | null;
  loading: boolean;
  onNavigate: (section: SistemSubSection) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  data,
  loading,
  onNavigate,
}) => {
  if (loading && !data) {
    return (
      <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4 text-sm text-[#9fb0d0]">
        Memuat…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4 text-sm text-[#9fb0d0]">
        Data dashboard tidak tersedia.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('intake')}
          className="bg-[#131f36] border border-[#22365c] hover:border-[#38bdf8] rounded-[12px] px-4 py-3 text-left transition-colors cursor-pointer"
        >
          <div className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
            Antrean Intake
          </div>
          <div className="mt-1 text-[22px] font-bold text-[#e8eefc] font-mono tabular-nums">
            {data.antrean}{' '}
            <small className="text-[11px] font-normal text-[#9fb0d0] font-sans">
              / {data.totalIntake} total
            </small>
          </div>
        </button>

        <button
          type="button"
          disabled={!canAccessSection(user.Tier, 'tugas')}
          onClick={() => onNavigate('tugas')}
          className="bg-[#131f36] border border-[#22365c] hover:border-[#38bdf8] disabled:hover:border-[#22365c] disabled:cursor-default rounded-[12px] px-4 py-3 text-left transition-colors cursor-pointer"
        >
          <div className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
            Tugas Selesai
          </div>
          <div className="mt-1 text-[22px] font-bold text-[#34d399] font-mono tabular-nums">
            {data.tugasSelesai}{' '}
            <small className="text-[11px] font-normal text-[#9fb0d0] font-sans">
              / {data.totalTugas} tugas
            </small>
          </div>
        </button>

        <button
          type="button"
          disabled={!canAccessSection(user.Tier, 'keuangan')}
          onClick={() => onNavigate('keuangan')}
          className="bg-[#131f36] border border-[#22365c] hover:border-[#38bdf8] disabled:hover:border-[#22365c] disabled:cursor-default rounded-[12px] px-4 py-3 text-left transition-colors cursor-pointer"
        >
          <div className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
            Saldo Kas Tercatat
          </div>
          <div className="mt-1 text-[20px] font-bold text-[#38bdf8] font-mono tabular-nums truncate">
            {formatRupiah(data.saldoKas)}
          </div>
        </button>

        <button
          type="button"
          disabled={!canAccessSection(user.Tier, 'dokumen')}
          onClick={() => onNavigate('dokumen')}
          className="bg-[#131f36] border border-[#22365c] hover:border-[#38bdf8] disabled:hover:border-[#22365c] disabled:cursor-default rounded-[12px] px-4 py-3 text-left transition-colors cursor-pointer"
        >
          <div className="text-[10px] tracking-[0.1em] uppercase text-[#9fb0d0]">
            Dokumen &amp; Absensi
          </div>
          <div className="mt-1 text-[22px] font-bold text-[#e8eefc] font-mono tabular-nums">
            {data.dokumen}{' '}
            <small className="text-[11px] font-normal text-[#fbbf24] font-sans">
              · {data.absenMenunggu} tunggu verif
            </small>
          </div>
        </button>
      </div>

      <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-xs font-bold tracking-[0.06em] uppercase text-[#9fb0d0]">
            Aktivitas Audit Terakhir
          </h3>
          {canAccessSection(user.Tier, 'audit') && (
            <button
              type="button"
              onClick={() => onNavigate('audit')}
              className="text-xs font-semibold text-[#38bdf8] hover:text-[#7dd3fc] cursor-pointer"
            >
              Lihat semua →
            </button>
          )}
        </div>

        {data.auditTerakhir.length === 0 ? (
          <div className="text-[12.5px] text-[#9fb0d0]">Belum ada aktivitas audit.</div>
        ) : (
          <div>
            {data.auditTerakhir.map((a, idx) => (
              <div
                key={`${a.Waktu}-${idx}`}
                className="py-[7px] border-b border-dashed border-[#22365c] last:border-b-0 text-[12.5px] text-[#cfe0ff]"
              >
                <span className="font-mono text-[#9fb0d0] tabular-nums">{a.Waktu}</span> —{' '}
                <b className="text-[#e8eefc]">{a.Siapa}</b> {a.Aksi}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
