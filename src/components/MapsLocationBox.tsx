import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  APILoadingStatus,
  APIProvider,
  AdvancedMarker,
  Map as GoogleMap,
  Pin,
  useApiLoadingStatus,
  useMap,
} from '@vis.gl/react-google-maps';
import { CheckCircle2, Crosshair, MapPin } from 'lucide-react';
import { getGasMapsKey, isAppsScriptRuntime } from '../utils/gasBridge';

export interface SelectedGeoLocation {
  lat: number;
  lng: number;
  lokasiLabel: string;
  source: 'gps' | 'manual' | 'kantor';
}

interface MapsLocationBoxProps {
  value: SelectedGeoLocation | null;
  onChange: (loc: SelectedGeoLocation) => void;
  title?: string;
}

const OFFICE_COORDS = { lat: -6.2297, lng: 106.8095 }; // Kantor Pusat SCBD Jakarta
const MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) || getGasMapsKey();
// Pakai Map ID milik deployment untuk Advanced Markers; DEMO_MAP_ID hanya fallback lokal.
const MAP_ID = (import.meta.env.VITE_GOOGLE_MAP_ID as string | undefined) || 'DEMO_MAP_ID';

function calcDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

const MapViewportSync: React.FC<{ target: SelectedGeoLocation | null }> = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (map && target) {
      map.panTo({ lat: target.lat, lng: target.lng });
      if ((map.getZoom() || 14) < 15) {
        map.setZoom(16);
      }
    }
  }, [map, target]);
  return null;
};

const MapsStatusAlert: React.FC = () => {
  const status = useApiLoadingStatus();
  if (status === APILoadingStatus.AUTH_FAILURE || status === APILoadingStatus.FAILED) {
    return (
      <div className="text-[11px] text-[#fca5a5] bg-[#2b1414] border border-[#5b2c2c] rounded px-2.5 py-1.5">
        Peta Google Maps gagal dimuat. Periksa kuota API key atau koneksi internet Anda.
      </div>
    );
  }
  return null;
};

export const MapsLocationBox: React.FC<MapsLocationBoxProps> = ({
  value,
  onChange,
  title = '2. Verifikasi Lokasi (Google Maps)',
}) => {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  const distanceMeters = useMemo(() => {
    if (!value) return null;
    return calcDistanceMeters(value.lat, value.lng, OFFICE_COORDS.lat, OFFICE_COORDS.lng);
  }, [value]);

  const handleGetCurrentGps = useCallback(() => {
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('Geolokasi peramban tidak tersedia. Klik peta atau pilih titik kantor pusat.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const dist = calcDistanceMeters(lat, lng, OFFICE_COORDS.lat, OFFICE_COORDS.lng);
        onChange({
          lat,
          lng,
          lokasiLabel: dist <= 300 ? 'Kantor Pusat SCBD (GPS)' : 'Lokasi GPS Terverifikasi',
          source: 'gps',
        });
        setLocating(false);
      },
      (err) => {
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? 'Izin lokasi ditolak peramban. Klik pada peta Google Maps di atas atau pilih titik kantor.'
            : 'Sinyal GPS tidak tersedia pada perangkat ini. Klik peta Google Maps untuk menandai titik lokasi.'
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [onChange]);

  const handlePinOffice = () => {
    setGeoError('');
    onChange({
      lat: OFFICE_COORDS.lat,
      lng: OFFICE_COORDS.lng,
      lokasiLabel: 'Kantor Pusat Holding Investasi (SCBD)',
      source: 'kantor',
    });
  };

  return (
    <div className="bg-[#0f1a2c] border border-[#22365c] rounded-[10px] p-3 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#e8eefc]">
          <MapPin className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>{title}</span>
        </div>
        {value ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#34d399]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Lokasi Terkunci
          </span>
        ) : (
          <span className="text-[11px] text-[#fbbf24]">Wajib pilih / ambil GPS</span>
        )}
      </div>

      {/* Mandatory explicit CSS height on map container (CF2) */}
      <div className="w-full h-[200px] rounded-[8px] overflow-hidden border border-[#22365c] bg-[#080f1d]">
        {MAPS_API_KEY ? (
          <APIProvider
            apiKey={MAPS_API_KEY}
            libraries={['marker']}
            language="id"
            region="ID"
          >
            <GoogleMap
              mapId={MAP_ID}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              defaultCenter={value ? { lat: value.lat, lng: value.lng } : OFFICE_COORDS}
              defaultZoom={15}
              gestureHandling="greedy"
              disableDefaultUI={false}
              streetViewControl={false}
              mapTypeControl={false}
              onClick={(ev) => {
                const ll = ev.detail.latLng;
                if (!ll) return;
                const lat = Number(ll.lat.toFixed(6));
                const lng = Number(ll.lng.toFixed(6));
                const dist = calcDistanceMeters(lat, lng, OFFICE_COORDS.lat, OFFICE_COORDS.lng);
                setGeoError('');
                onChange({
                  lat,
                  lng,
                  lokasiLabel: dist <= 300 ? 'Area Kantor Pusat SCBD' : 'Pin Peta Google Maps',
                  source: 'manual',
                });
              }}
              style={{ width: '100%', height: '100%' }}
            >
              <MapViewportSync target={value} />

              {/* Pin Kantor Pusat Holding Investasi */}
              <AdvancedMarker
                position={OFFICE_COORDS}
                title="Kantor Pusat Holding Investasi (SCBD)"
              >
                <Pin background="#059669" borderColor="#ecfdf5" glyphColor="#ffffff" scale={0.9} />
              </AdvancedMarker>

              {/* Pin Lokasi Pengguna */}
              {value && (
                <AdvancedMarker
                  position={{ lat: value.lat, lng: value.lng }}
                  title={`Lokasi Anda (${value.lokasiLabel})`}
                >
                  <Pin background="#38bdf8" borderColor="#ffffff" glyphColor="#06222f" scale={1.05} />
                </AdvancedMarker>
              )}
            </GoogleMap>
            <MapsStatusAlert />
          </APIProvider>
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 text-center text-xs text-[#9fb0d0]">
            {isAppsScriptRuntime()
              ? 'Mode Apps Script: gunakan tombol "Ambil GPS Sekarang" atau "Titik Kantor Pusat" di bawah (atau isi Script Property GOOGLE_MAPS_API_KEY untuk peta interaktif).'
              : 'Kunci API Google Maps (VITE_GOOGLE_MAPS_API_KEY) belum tersedia di environment.'}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          disabled={locating}
          onClick={handleGetCurrentGps}
          className="bg-[#38bdf8] hover:bg-[#7dd3fc] disabled:opacity-60 text-[#06222f] font-bold text-xs rounded-[8px] px-3 py-1.5 cursor-pointer inline-flex items-center gap-1.5"
        >
          <Crosshair className="w-3.5 h-3.5" />
          {locating ? 'Mencari GPS…' : 'Ambil GPS Sekarang'}
        </button>
        <button
          type="button"
          onClick={handlePinOffice}
          className="bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] text-[#e8eefc] font-semibold text-xs rounded-[8px] px-2.5 py-1.5 cursor-pointer"
        >
          Titik Kantor Pusat
        </button>
      </div>

      {value && (
        <div className="bg-[#131f36] border border-[#22365c] rounded px-2.5 py-1.5 text-[11px] text-[#cfe0ff] space-y-0.5 tabular-nums">
          <div>
            <b>{value.lokasiLabel}</b> ·{' '}
            <span className="font-mono text-[#38bdf8]">
              {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
            </span>
          </div>
          <div className="text-[#9fb0d0]">
            Jarak dari Kantor Pusat:{' '}
            <b className={distanceMeters !== null && distanceMeters <= 300 ? 'text-[#34d399]' : 'text-[#fbbf24]'}>
              {distanceMeters !== null
                ? distanceMeters < 1000
                  ? `${distanceMeters} m (${distanceMeters <= 300 ? 'Di area kantor' : 'Di luar kantor / remote'})`
                  : `${(distanceMeters / 1000).toFixed(2)} km (Remote / luar area)`
                : '—'}
            </b>
          </div>
        </div>
      )}

      {geoError && (
        <div className="text-[11px] text-[#fca5a5] bg-[#2b1414] border border-[#5b2c2c] rounded px-2.5 py-1.5">
          {geoError}
        </div>
      )}

      <div className="text-[10px] text-[#7c8fb3]">
        Klik pada peta untuk menandai titik lokasi atau gunakan GPS perangkat. Integrasi lokasi tunduk pada Ketentuan Layanan Google Maps Platform.
      </div>
    </div>
  );
};
