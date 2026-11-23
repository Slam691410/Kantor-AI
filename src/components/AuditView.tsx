import React from 'react';
import type { AuditItem } from '../types';

interface AuditViewProps {
  items: AuditItem[];
  loading: boolean;
}

export const AuditView: React.FC<AuditViewProps> = ({ items, loading }) => {
  return (
    <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4">
      <h3 className="text-xs font-bold tracking-[0.06em] uppercase text-[#9fb0d0] mb-2">
        Catatan Audit Sistem
      </h3>
      {loading && items.length === 0 ? (
        <div className="text-sm text-[#9fb0d0]">Memuat…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-[#9fb0d0]">Belum ada catatan audit.</div>
      ) : (
        <div>
          {items.map((a, idx) => (
            <div
              key={`${a.Waktu}-${idx}`}
              className="py-[7px] border-b border-dashed border-[#22365c] last:border-b-0 text-[12.5px] text-[#cfe0ff]"
            >
              <span className="font-mono text-[#9fb0d0] tabular-nums">{a.Waktu}</span> —{' '}
              <b className="text-[#e8eefc]">{a.Siapa}</b> {a.Aksi}{' '}
              <span className="text-[#38bdf8]">({a.Modul})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
