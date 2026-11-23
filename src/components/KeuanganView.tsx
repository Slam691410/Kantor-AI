import React, { useState } from 'react';
import { api } from '../api';
import type {
  KeuanganItem,
  KeuanganJenis,
  KeuanganStatus,
  RekonsiliasiStatus,
  UserPublic,
} from '../types';
import { formatRupiah } from '../utils/format';

interface KeuanganViewProps {
  token: string;
  user: UserPublic;
  items: KeuanganItem[];
  loading: boolean;
  onRefresh: () => void;
  onNotify: (msg: string, isError?: boolean) => void;
}

export const KeuanganView: React.FC<KeuanganViewProps> = ({
  token,
  user,
  items,
  loading,
  onRefresh,
  onNotify,
}) => {
  const [jenis, setJenis] = useState<KeuanganJenis>('Masuk');
  const [kategori, setKategori] = useState('');
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canWrite = ['Pemilik', 'Manajemen', 'Staf'].includes(user.Tier);
  const canVerify = ['Pemilik', 'Manajemen'].includes(user.Tier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createKeuangan(token, {
        jenis,
        kategori: kategori.trim() || 'Umum',
        nominal: Number(nominal),
        keterangan: keterangan.trim(),
      });
      setKategori('');
      setNominal('');
      setKeterangan('');
      onNotify('Tersimpan.');
      onRefresh();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Gagal menyimpan.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePatch = async (
    id: string,
    payload: { status?: KeuanganStatus; rekonsiliasi?: RekonsiliasiStatus }
  ) => {
    try {
      await api.updateKeuangan(token, id, payload);
      onNotify(`Kas ${id} diperbarui.`);
      onRefresh();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Gagal memperbarui.', true);
    }
  };

  return (
    <div className="space-y-3">
      {canWrite && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4"
        >
          <b className="text-sm text-[#e8eefc]">Catat kas</b>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
            <div>
              <label htmlFor="fJenis" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
                Jenis
              </label>
              <select
                id="fJenis"
                value={jenis}
                onChange={(e) => setJenis(e.target.value as KeuanganJenis)}
                className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
              >
                <option value="Masuk">Masuk</option>
                <option value="Keluar">Keluar</option>
              </select>
            </div>
            <div>
              <label htmlFor="fKat" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
                Kategori
              </label>
              <input
                id="fKat"
                type="text"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div>
              <label htmlFor="fNom" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
                Nominal
              </label>
              <input
                id="fNom"
                type="number"
                min={1}
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                required
                className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] font-mono tabular-nums focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div>
              <label htmlFor="fKet" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
                Keterangan
              </label>
              <input
                id="fKet"
                type="text"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#38bdf8] hover:bg-[#7dd3fc] disabled:opacity-60 text-[#06222f] font-bold text-xs rounded-[8px] px-3.5 py-2 cursor-pointer whitespace-nowrap"
            >
              {submitting ? 'Menyimpan…' : 'Simpan'}
            </button>
            <span className="text-[11.5px] text-[#fbbf24]">
              Pengeluaran &gt; Rp100 juta wajib Direktur.
            </span>
          </div>
        </form>
      )}

      <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4">
        {loading && items.length === 0 ? (
          <div className="text-sm text-[#9fb0d0]">Memuat…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-[#9fb0d0]">Belum ada transaksi.</div>
        ) : (
          <div>
            {items.map((x) => (
              <div
                key={x.ID}
                className="py-2.5 border-b border-dashed border-[#22365c] last:border-b-0 text-[12.5px] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="text-[#cfe0ff]">
                    <b
                      className={`font-mono tabular-nums ${
                        x.Jenis === 'Masuk' ? 'text-[#34d399]' : 'text-[#f87171]'
                      }`}
                    >
                      {x.Jenis} {formatRupiah(x.Nominal)}
                    </b>{' '}
                    — {x.Kategori} · {x.Oleh} · <b className="text-[#e8eefc]">{x.Status}</b> (
                    <span className="font-mono tabular-nums text-[#9fb0d0]">{x.Tanggal}</span>)
                  </div>
                  <div className="text-[#9fb0d0]">{x.Keterangan || '—'}</div>
                </div>
                {canVerify && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <select
                      aria-label={`Status ${x.ID}`}
                      value={x.Status}
                      onChange={(e) =>
                        handlePatch(x.ID, { status: e.target.value as KeuanganStatus })
                      }
                      className="border border-[#22365c] rounded-[8px] px-2 py-1.5 text-xs text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Terverifikasi">Terverifikasi</option>
                      <option value="Disetujui">Disetujui</option>
                    </select>
                    <select
                      aria-label={`Rekonsiliasi ${x.ID}`}
                      value={x.Rekonsiliasi}
                      onChange={(e) =>
                        handlePatch(x.ID, {
                          rekonsiliasi: e.target.value as RekonsiliasiStatus,
                        })
                      }
                      className="border border-[#22365c] rounded-[8px] px-2 py-1.5 text-xs text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
                    >
                      <option value="Belum">Belum Rekonsiliasi</option>
                      <option value="Sudah">Sudah Rekonsiliasi</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
