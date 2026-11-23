import React, { useState } from 'react';
import { api } from '../api';
import type { IntakeItem, IntakeStatus, UserPublic } from '../types';
import { formatRupiah, getRapidRequirement } from '../utils/format';

interface IntakeViewProps {
  token: string;
  user: UserPublic;
  items: IntakeItem[];
  loading: boolean;
  onRefresh: () => void;
  onNotify: (msg: string, isError?: boolean) => void;
}

const STATUS_STYLE: Record<IntakeStatus, string> = {
  Masuk: 'text-[#7dd3fc] bg-[#0f2136] border-[#1d4670]',
  Direview: 'text-[#c4b5fd] bg-[#241a35] border-[#43306b]',
  'Perlu Info': 'text-[#fbbf24] bg-[#2a2113] border-[#5b4a17]',
  Disetujui: 'text-[#6ee7b7] bg-[#0e2b23] border-[#175c49]',
  Ditolak: 'text-[#fca5a5] bg-[#2b1414] border-[#5b2c2c]',
};

export const IntakeView: React.FC<IntakeViewProps> = ({
  token,
  user,
  items,
  loading,
  onRefresh,
  onNotify,
}) => {
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState('Investasi');
  const [nilai, setNilai] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openHistoryId, setOpenHistoryId] = useState<string | null>(null);

  const canCreate = ['Pemilik', 'Manajemen', 'Staf', 'Freelancer'].includes(user.Tier);
  const canAct = ['Pemilik', 'Manajemen', 'Staf'].includes(user.Tier);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) return;
    setSubmitting(true);
    try {
      await api.createIntake(token, {
        judul: judul.trim(),
        kategori,
        nilai: Number(nilai) || 0,
      });
      setJudul('');
      setNilai('');
      onNotify('Terkirim.');
      onRefresh();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Gagal mengirim.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id: string, aksi: IntakeStatus) => {
    setBusyId(id);
    try {
      await api.updateIntakeStatus(token, id, aksi);
      onNotify(`${id} -> ${aksi}`);
      onRefresh();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Ditolak.', true);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-3">
      {canCreate && (
        <form
          onSubmit={handleCreate}
          className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4"
        >
          <b className="text-sm text-[#e8eefc]">Permintaan baru (Intake &amp; RAPID)</b>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 mt-2">
            <div className="sm:col-span-6">
              <label htmlFor="iJudul" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
                Judul
              </label>
              <input
                id="iJudul"
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                required
                className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="iKat" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
                Kategori
              </label>
              <select
                id="iKat"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
              >
                <option value="Investasi">Investasi</option>
                <option value="Operasional">Operasional</option>
                <option value="Fasilitas">Fasilitas</option>
                <option value="Legal & Kepatuhan">Legal &amp; Kepatuhan</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="iNilai" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
                Nilai (Rp)
              </label>
              <input
                id="iNilai"
                type="number"
                min={0}
                value={nilai}
                onChange={(e) => setNilai(e.target.value)}
                className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] font-mono tabular-nums focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#38bdf8] hover:bg-[#7dd3fc] disabled:opacity-60 text-[#06222f] font-bold text-xs rounded-[8px] px-3.5 py-2 cursor-pointer whitespace-nowrap"
            >
              {submitting ? 'Mengirim…' : 'Kirim Permintaan'}
            </button>
            <span className="text-[11.5px] text-[#9fb0d0] font-mono tabular-nums">
              {getRapidRequirement(Number(nilai) || 0).ringkas}
            </span>
          </div>
        </form>
      )}

      <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4">
        {loading && items.length === 0 ? (
          <div className="text-sm text-[#9fb0d0]">Memuat…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-[#9fb0d0]">Antrean kosong.</div>
        ) : (
          <div>
            {items.map((x) => {
              const rapid = getRapidRequirement(x.Nilai);
              const isBusy = busyId === x.ID;
              const isOpen = openHistoryId === x.ID;
              return (
                <div
                  key={x.ID}
                  className="py-2.5 border-b border-dashed border-[#22365c] last:border-b-0 text-[12.5px]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <b className="text-[#e8eefc]">
                      {x.ID} · {x.Judul}
                    </b>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_STYLE[x.Status]}`}
                    >
                      {x.Status}
                    </span>
                    <span className="font-mono tabular-nums text-[#38bdf8]">
                      {formatRupiah(x.Nilai)}
                    </span>
                    <span className="text-[#9fb0d0]">
                      · {x.Pengaju} · Wajib <b className="text-[#fbbf24]">{rapid.label}</b>
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {canAct &&
                      (['Direview', 'Perlu Info', 'Disetujui', 'Ditolak'] as IntakeStatus[]).map(
                        (aksi) => (
                          <button
                            key={aksi}
                            type="button"
                            disabled={isBusy || x.Status === aksi}
                            onClick={() => handleAction(x.ID, aksi)}
                            className="bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] disabled:opacity-40 text-[#e8eefc] font-semibold text-xs rounded-[8px] px-3 py-1.5 cursor-pointer whitespace-nowrap"
                          >
                            {aksi}
                          </button>
                        )
                      )}
                    <button
                      type="button"
                      onClick={() => setOpenHistoryId(isOpen ? null : x.ID)}
                      className="bg-[#0f1a2c] border border-[#22365c] text-[#9fb0d0] hover:text-[#e8eefc] font-semibold text-xs rounded-[8px] px-2.5 py-1.5 cursor-pointer whitespace-nowrap"
                    >
                      {isOpen ? 'Tutup Riwayat' : 'Riwayat'}
                    </button>
                  </div>
                  {isOpen && (
                    <div className="mt-2 rounded-[8px] bg-[#0f1a2c] border border-[#1c2d4a] px-3 py-2 text-[11.5px] text-[#9fb0d0] font-mono">
                      {x.Riwayat}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
