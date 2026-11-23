import React, { useState } from 'react';
import { api } from '../api';
import type { DokumenItem, UserPublic } from '../types';

interface DokumenViewProps {
  token: string;
  user: UserPublic;
  items: DokumenItem[];
  loading: boolean;
  onRefresh: () => void;
  onNotify: (msg: string, isError?: boolean) => void;
}

export const DokumenView: React.FC<DokumenViewProps> = ({
  token,
  user,
  items,
  loading,
  onRefresh,
  onNotify,
}) => {
  const [judul, setJudul] = useState('');
  const [jenis, setJenis] = useState('Memo Investasi');
  const [isi, setIsi] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canWrite = ['Pemilik', 'Manajemen', 'Staf'].includes(user.Tier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !isi.trim()) return;
    setSubmitting(true);
    try {
      await api.createDokumen(token, {
        judul: judul.trim(),
        jenis,
        isi: isi.trim(),
      });
      setJudul('');
      setIsi('');
      onNotify('Dokumen tersimpan.');
      onRefresh();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Gagal menyimpan.', true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      {canWrite && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4"
        >
          <b className="text-sm text-[#e8eefc]">Dokumen baru</b>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 mt-2">
            <div className="sm:col-span-8">
              <label htmlFor="dJudul" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
                Judul
              </label>
              <input
                id="dJudul"
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                required
                className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div className="sm:col-span-4">
              <label htmlFor="dJenis" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
                Jenis
              </label>
              <select
                id="dJenis"
                value={jenis}
                onChange={(e) => setJenis(e.target.value)}
                className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
              >
                <option value="Memo Investasi">Memo Investasi</option>
                <option value="Kebijakan">Kebijakan</option>
                <option value="Risalah Rapat">Risalah Rapat</option>
              </select>
            </div>
          </div>
          <label htmlFor="dIsi" className="block text-[11px] font-bold text-[#9fb0d0] mt-2.5 mb-1">
            Isi
          </label>
          <textarea
            id="dIsi"
            rows={3}
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            required
            className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-2.5 bg-[#38bdf8] hover:bg-[#7dd3fc] disabled:opacity-60 text-[#06222f] font-bold text-xs rounded-[8px] px-3.5 py-2 cursor-pointer whitespace-nowrap"
          >
            {submitting ? 'Menyimpan…' : 'Simpan'}
          </button>
        </form>
      )}

      <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4">
        {loading && items.length === 0 ? (
          <div className="text-sm text-[#9fb0d0]">Memuat…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-[#9fb0d0]">Belum ada dokumen.</div>
        ) : (
          items.map((dok) => (
            <div
              key={dok.ID}
              className="py-2.5 border-b border-dashed border-[#22365c] last:border-b-0 text-[12.5px]"
            >
              <div className="text-[#cfe0ff]">
                <b className="text-[#e8eefc]">{dok.Judul}</b> —{' '}
                <span className="text-[#38bdf8]">{dok.Jenis}</span> · {dok.Oleh} ·{' '}
                <span className="font-mono text-[#9fb0d0] tabular-nums">{dok.Tanggal}</span>
              </div>
              <div className="mt-1 text-[#cfe0ff] whitespace-pre-line">{dok.Isi}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
