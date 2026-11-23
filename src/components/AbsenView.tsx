import React, { useState } from 'react';
import { api } from '../api';
import type { AbsenItem, AbsenJenis, UserPublic } from '../types';
import { FaceCaptureBox } from './FaceCaptureBox';
import { MapsLocationBox, type SelectedGeoLocation } from './MapsLocationBox';

interface AbsenViewProps {
  token: string;
  user: UserPublic;
  items: AbsenItem[];
  loading: boolean;
  onRefresh: () => void;
  onAbsenRecorded?: (item: AbsenItem) => void;
  onNotify: (msg: string, isError?: boolean) => void;
}

export const AbsenView: React.FC<AbsenViewProps> = ({
  token,
  user,
  items,
  loading,
  onRefresh,
  onAbsenRecorded,
  onNotify,
}) => {
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [geoLocation, setGeoLocation] = useState<SelectedGeoLocation | null>(null);
  const [catatanLokasi, setCatatanLokasi] = useState('');
  const [submitting, setSubmitting] = useState<AbsenJenis | null>(null);
  const [aMsg, setAMsg] = useState('');

  const canVerify = user.Peringkat >= 2;

  const absen = async (jenis: AbsenJenis) => {
    if (!faceImage) {
      onNotify('Ambil foto wajah terlebih dahulu untuk absensi.', true);
      return;
    }
    if (!geoLocation) {
      onNotify('Ambil GPS atau tandai lokasi pada Google Maps terlebih dahulu.', true);
      return;
    }
    setSubmitting(jenis);
    try {
      const lokasiText = catatanLokasi.trim()
        ? `${catatanLokasi.trim()} (${geoLocation.lokasiLabel})`
        : geoLocation.lokasiLabel;
      const x = await api.submitAbsen(token, {
        jenis,
        faceImage,
        lat: geoLocation.lat,
        lng: geoLocation.lng,
        lokasi: lokasiText,
      });
      setAMsg(
        `Tercatat ${x.Jam} WIB · Wajah #${x.FaceDigest || 'OK'} · Jarak ${x.JarakMeter ?? 0} m — status: ${x.StatusVerifikasi}`
      );
      setFaceImage(null);
      onAbsenRecorded?.(x);
      onNotify(`Absen ${jenis === 'in' ? 'masuk' : 'keluar'} tercatat via Wajah + Google Maps.`);
      onRefresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Absen gagal.';
      setAMsg(msg);
      onNotify(msg, true);
    } finally {
      setSubmitting(null);
    }
  };

  const handleVerify = async (id: string, status: 'terverifikasi' | 'ditolak') => {
    try {
      await api.verifyAbsen(token, id, status);
      onNotify(`Absen ${id} -> ${status}`);
      onRefresh();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Gagal verifikasi.', true);
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4 space-y-3">
        <div>
          <b className="text-sm text-[#e8eefc]">Absensi Biometrik Wajah + Google Maps</b>
          <p className="mt-1 text-xs text-[#9fb0d0]">
            Tanpa PIN: gunakan kamera wajah dan titik GPS/Google Maps langsung. Hasil absen
            tersinkron ke Denah Kantor AI &amp; menunggu verifikasi atasan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <FaceCaptureBox
            value={faceImage}
            onChange={setFaceImage}
            title="1. Foto Wajah Absensi"
          />
          <MapsLocationBox
            value={geoLocation}
            onChange={setGeoLocation}
            title="2. Lokasi Google Maps"
          />
        </div>

        <div>
          <label htmlFor="aLok" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
            Catatan Tambahan Lokasi (opsional)
          </label>
          <input
            id="aLok"
            type="text"
            value={catatanLokasi}
            onChange={(e) => setCatatanLokasi(e.target.value)}
            placeholder="Mis. Lantai 2 Dealing Room / Kunjungan Notaris"
            className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] placeholder:text-[#7c8fb3] focus:outline-none focus:border-[#38bdf8]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={submitting !== null || !faceImage || !geoLocation}
            onClick={() => absen('in')}
            className="bg-[#38bdf8] hover:bg-[#7dd3fc] disabled:opacity-50 text-[#06222f] font-bold text-xs rounded-[8px] px-3.5 py-2 cursor-pointer whitespace-nowrap"
          >
            {submitting === 'in' ? 'Memproses…' : 'Absen Masuk (Wajah + Maps)'}
          </button>
          <button
            type="button"
            disabled={submitting !== null || !faceImage || !geoLocation}
            onClick={() => absen('out')}
            className="bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] disabled:opacity-50 text-[#e8eefc] font-bold text-xs rounded-[8px] px-3.5 py-2 cursor-pointer whitespace-nowrap"
          >
            {submitting === 'out' ? 'Memproses…' : 'Absen Keluar (Wajah + Maps)'}
          </button>
        </div>

        {aMsg && (
          <div className="text-[12.5px] text-[#34d399] font-mono">{aMsg}</div>
        )}
      </div>

      <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4">
        <b className="text-sm text-[#e8eefc]">Riwayat Absensi</b>
        <div className="mt-2">
          {loading && items.length === 0 ? (
            <div className="text-sm text-[#9fb0d0]">Memuat…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-[#9fb0d0]">Belum ada catatan absensi.</div>
          ) : (
            items.map((x) => (
              <div
                key={x.ID}
                className="py-2.5 border-b border-dashed border-[#22365c] last:border-b-0 text-[12.5px] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="text-[#cfe0ff] space-y-0.5">
                  <div>
                    <span className="font-mono text-[#9fb0d0] tabular-nums">
                      {x.Tanggal} {x.Jam}
                    </span>{' '}
                    — <b className="text-[#e8eefc]">{x.Nama}</b> ({x.Jenis.toUpperCase()}) ·{' '}
                    {x.Lokasi} ·{' '}
                    <span
                      className={`font-semibold ${
                        x.StatusVerifikasi === 'terverifikasi'
                          ? 'text-[#34d399]'
                          : x.StatusVerifikasi === 'ditolak'
                            ? 'text-[#f87171]'
                            : 'text-[#fbbf24]'
                      }`}
                    >
                      {x.StatusVerifikasi}
                    </span>
                  </div>
                  {(x.FaceDigest || x.Lat !== undefined) && (
                    <div className="text-[11px] font-mono tabular-nums text-[#9fb0d0]">
                      {x.FaceDigest ? `Wajah #${x.FaceDigest}` : ''}
                      {x.FaceDigest && x.Lat !== undefined ? ' · ' : ''}
                      {x.Lat !== undefined && x.Lng !== undefined
                        ? `Maps ${x.Lat.toFixed(5)}, ${x.Lng.toFixed(5)} (${x.JarakMeter ?? 0} m dari kantor)`
                        : ''}
                    </div>
                  )}
                </div>
                {canVerify && x.StatusVerifikasi === 'menunggu-verifikasi-atasan' && (
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleVerify(x.ID, 'terverifikasi')}
                      className="bg-[#34d399] hover:bg-[#6ee7b7] text-[#06281f] font-bold text-xs rounded-[8px] px-2.5 py-1 cursor-pointer whitespace-nowrap"
                    >
                      Verifikasi
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerify(x.ID, 'ditolak')}
                      className="bg-[#2b1414] border border-[#5b2c2c] hover:border-[#f87171] text-[#fca5a5] font-bold text-xs rounded-[8px] px-2.5 py-1 cursor-pointer whitespace-nowrap"
                    >
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
