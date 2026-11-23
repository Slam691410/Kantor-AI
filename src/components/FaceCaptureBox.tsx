import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, RefreshCw, Upload } from 'lucide-react';

interface FaceCaptureBoxProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  title?: string;
}

export const FaceCaptureBox: React.FC<FaceCaptureBoxProps> = ({
  value,
  onChange,
  title = '1. Verifikasi Wajah (Kamera)',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const startCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Peramban tidak mendukung akses kamera langsung. Gunakan unggah foto kamera di bawah.');
      return;
    }
    setStarting(true);
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 360 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => undefined);
        }
      });
    } catch (err) {
      const msg =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Izin kamera ditolak. Izinkan akses kamera pada peramban atau gunakan tombol unggah foto wajah.'
          : 'Kamera tidak terdeteksi atau sedang dipakai aplikasi lain. Anda dapat mengunggah foto wajah langsung.';
      setCameraError(msg);
      stopCamera();
    } finally {
      setStarting(false);
    }
  };

  const captureFromVideo = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError('Video kamera belum siap. Tunggu sebentar lalu coba lagi.');
      return;
    }
    const canvas = document.createElement('canvas');
    const targetW = 320;
    const targetH = Math.max(180, Math.round((video.videoHeight / video.videoWidth) * targetW));
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, targetW, targetH);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    onChange(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCameraError('');
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const targetW = 320;
        const targetH = Math.max(180, Math.round((img.height / img.width) * targetW));
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, targetW, targetH);
        onChange(canvas.toDataURL('image/jpeg', 0.8));
        stopCamera();
      };
      img.onerror = () => {
        setCameraError('Berkas gambar tidak dapat dibaca.');
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="bg-[#0f1a2c] border border-[#22365c] rounded-[10px] p-3 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#e8eefc]">
          <Camera className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>{title}</span>
        </div>
        {value ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#34d399]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Wajah Siap
          </span>
        ) : (
          <span className="text-[11px] text-[#fbbf24]">Wajib diambil</span>
        )}
      </div>

      <div className="relative h-[200px] w-full rounded-[8px] overflow-hidden border border-[#22365c] bg-[#080f1d] flex items-center justify-center">
        {value ? (
          <img
            src={value}
            alt="Hasil tangkapan wajah"
            className="w-full h-full object-cover"
          />
        ) : cameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-36 rounded-[48%] border-2 border-dashed border-[#38bdf8]/80" />
            </div>
          </>
        ) : (
          <div className="text-center px-4">
            <Camera className="w-8 h-8 text-[#5c7299] mx-auto mb-1.5" />
            <p className="text-[11.5px] text-[#9fb0d0]">
              Aktifkan kamera depan untuk memindai wajah Anda secara langsung.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {!value && !cameraActive && (
          <button
            type="button"
            disabled={starting}
            onClick={startCamera}
            className="bg-[#38bdf8] hover:bg-[#7dd3fc] disabled:opacity-60 text-[#06222f] font-bold text-xs rounded-[8px] px-3 py-1.5 cursor-pointer inline-flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            {starting ? 'Membuka Kamera…' : 'Aktifkan Kamera'}
          </button>
        )}

        {cameraActive && !value && (
          <>
            <button
              type="button"
              onClick={captureFromVideo}
              className="bg-[#34d399] hover:bg-[#6ee7b7] text-[#06281f] font-bold text-xs rounded-[8px] px-3 py-1.5 cursor-pointer inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ambil Foto Wajah
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] text-[#e8eefc] font-semibold text-xs rounded-[8px] px-3 py-1.5 cursor-pointer"
            >
              Tutup Kamera
            </button>
          </>
        )}

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              startCamera();
            }}
            className="bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] text-[#e8eefc] font-semibold text-xs rounded-[8px] px-3 py-1.5 cursor-pointer inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Foto Ulang
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] text-[#cfe0ff] font-medium text-xs rounded-[8px] px-2.5 py-1.5 cursor-pointer inline-flex items-center gap-1.5"
        >
          <Upload className="w-3.5 h-3.5" />
          Unggah Foto
        </button>
      </div>

      {cameraError && (
        <div className="text-[11px] text-[#fca5a5] bg-[#2b1414] border border-[#5b2c2c] rounded px-2.5 py-1.5">
          {cameraError}
        </div>
      )}
    </div>
  );
};
