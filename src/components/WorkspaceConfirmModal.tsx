import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface WorkspacePendingAction {
  title: string;
  service: string;
  description: string;
  details: string[];
  destructive?: boolean;
  confirmLabel?: string;
  execute: () => Promise<void>;
}

interface WorkspaceConfirmModalProps {
  action: WorkspacePendingAction | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const WorkspaceConfirmModal: React.FC<WorkspaceConfirmModalProps> = ({
  action,
  busy,
  onCancel,
  onConfirm,
}) => {
  if (!action) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wsConfirmTitle"
    >
      <div className="w-full max-w-md bg-[#131f36] border border-[#2c4678] rounded-[14px] p-4 sm:p-5 space-y-3 shadow-2xl">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle
              className={`w-5 h-5 shrink-0 ${
                action.destructive ? 'text-[#f87171]' : 'text-[#fbbf24]'
              }`}
            />
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#9fb0d0]">
                Konfirmasi Aksi · {action.service}
              </div>
              <h4 id="wsConfirmTitle" className="text-sm font-bold text-[#e8eefc]">
                {action.title}
              </h4>
            </div>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            aria-label="Tutup dialog"
            className="text-[#9fb0d0] hover:text-[#e8eefc] p-1 cursor-pointer disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#cfe0ff] leading-relaxed">{action.description}</p>

        {action.details.length > 0 && (
          <div className="bg-[#0f1a2c] border border-[#22365c] rounded-[9px] p-3 space-y-1 text-[11.5px] text-[#cfe0ff]">
            {action.details.map((line, i) => (
              <div key={i} className="break-words">
                • {line}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="px-3.5 py-2 rounded-[8px] bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] text-[#e8eefc] text-xs font-semibold cursor-pointer disabled:opacity-40"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`px-3.5 py-2 rounded-[8px] text-xs font-bold cursor-pointer disabled:opacity-50 ${
              action.destructive
                ? 'bg-[#ef4444] hover:bg-[#f87171] text-white'
                : 'bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#06222f]'
            }`}
          >
            {busy ? 'Memproses…' : action.confirmLabel || 'Konfirmasi & Jalankan'}
          </button>
        </div>
      </div>
    </div>
  );
};
