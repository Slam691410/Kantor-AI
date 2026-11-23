import React, { useEffect, useState } from 'react';
import { Copy, FilePlus2, FileText, Mail, Sparkles } from 'lucide-react';
import { api, ApiError } from '../api';
import { PORTAL_DATA } from '../data/portalData';
import type { GeminiAssistMode, GeminiAssistResult, UserPublic } from '../types';
import type { WorkspaceSubTab } from './GoogleWorkspacePanel';

interface GeminiAssistPanelProps {
  token: string;
  user: UserPublic;
  selectedAgentId?: string | null;
  onSessionExpired: () => void;
  onNotify: (msg: string, isError?: boolean) => void;
  onLog?: (aksi: string, modul: string) => void;
  onSendToWorkspace?: (tab: WorkspaceSubTab, title: string, body: string) => void;
}

const MODE_LABELS: ReadonlyArray<{ id: GeminiAssistMode; label: string; placeholder: string }> = [
  {
    id: 'instruksi_agen',
    label: 'Instruksi 18 Agen AI',
    placeholder: 'Contoh: Evaluasi pipeline akuisisi gudang logistik Rp4,2 miliar dan siapkan checklist due diligence.',
  },
  {
    id: 'risalah_rapat',
    label: 'Draf Risalah Rapat',
    placeholder: 'Contoh: Rapat Komite Investasi pagi — bahas alokasi kupon obligasi seri A Rp6,5 miliar & likuiditas kas.',
  },
  {
    id: 'draf_surat',
    label: 'Draf Surat / Disposisi',
    placeholder: 'Contoh: Disposisi persetujuan pembaruan terminal data kepatuhan Rp185 juta ke GA & Finance.',
  },
  {
    id: 'ringkas_eksekutif',
    label: 'Analisis RAPID & Kas',
    placeholder: 'Contoh: Ringkas posisi risiko & wewenang penandatanganan untuk pengeluaran capex Rp250 juta.',
  },
];

export const GeminiAssistPanel: React.FC<GeminiAssistPanelProps> = ({
  token,
  user,
  selectedAgentId,
  onSessionExpired,
  onNotify,
  onLog,
  onSendToWorkspace,
}) => {
  const [mode, setMode] = useState<GeminiAssistMode>('instruksi_agen');
  const [agentId, setAgentId] = useState<string>(selectedAgentId || PORTAL_DATA.agents[0]?.id || 'AG-01');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GeminiAssistResult | null>(null);

  useEffect(() => {
    if (selectedAgentId) {
      setAgentId(selectedAgentId);
      setMode('instruksi_agen');
    }
  }, [selectedAgentId]);

  const currentModeInfo = MODE_LABELS.find((m) => m.id === mode) || MODE_LABELS[0];
  const currentAgent = PORTAL_DATA.agents.find((a) => a.id === agentId);
  const canSaveDoc = user.Tier === 'Pemilik' || user.Tier === 'Manajemen' || user.Tier === 'Staf';

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Masukkan topik atau instruksi terlebih dahulu.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.assistWithGemini(token, {
        mode,
        prompt: prompt.trim(),
        agentId: mode === 'instruksi_agen' ? agentId : undefined,
        unit: user.Unit,
      });
      setResult(res);
      onLog?.(`Gemini AI (${currentModeInfo.label})`, 'Asisten AI Google');
      onNotify('Draf berhasil disusun oleh Gemini AI.');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onSessionExpired();
        return;
      }
      const msg = err instanceof Error ? err.message : 'Gagal menghubungi Asisten AI Google.';
      setError(msg);
      onNotify(msg, true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      onNotify('Hasil Gemini AI disalin ke papan klip.');
    } catch {
      onNotify('Gagal menyalin otomatis. Silakan blok teks secara manual.', true);
    }
  };

  const handleSaveToDokumen = async () => {
    if (!result?.text || !canSaveDoc) return;
    setSavingDoc(true);
    try {
      const docTitle = `${currentModeInfo.label}${
        mode === 'instruksi_agen' && currentAgent ? ` (${currentAgent.id})` : ''
      } — ${result.timestamp}`;
      await api.createDokumen(token, {
        judul: docTitle,
        jenis: 'Draf AI Gemini',
        isi: result.text,
      });
      onLog?.(`Simpan draf Gemini ke Dokumen`, 'Dokumen');
      onNotify('Hasil Gemini AI disimpan ke Arsip Dokumen Sistem Kerja.');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onSessionExpired();
        return;
      }
      onNotify(err instanceof Error ? err.message : 'Gagal menyimpan dokumen.', true);
    } finally {
      setSavingDoc(false);
    }
  };

  return (
    <div className="bg-[#0f1a2c] border border-[#22365c] rounded-[11px] p-4 space-y-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#34d399]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ekosistem Google AI · Gemini</span>
          </div>
          <h4 className="text-sm font-bold text-[#e8eefc] mt-0.5">
            Asisten AI Holding &amp; Orkestrasi 18 Agen Kantor AI
          </h4>
          <p className="text-[11.5px] text-[#9fb0d0]">
            Susun risalah rapat, draf surat/disposisi, dan instruksi terstruktur untuk 18 Agen AI.
            Eksekusi tetap tunduk pada guardrail RAPID &amp; persetujuan manusia.
          </p>
        </div>
        <span className="px-2 py-1 rounded-md bg-[#131f36] border border-[#22365c] text-[10.5px] font-mono text-[#7dd3fc]">
          Model: gemini-4-hydrogen
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {MODE_LABELS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
              mode === m.id
                ? 'bg-[#34d399] border-[#34d399] text-[#06281f]'
                : 'bg-[#182845] border-[#22365c] text-[#cfe0ff] hover:border-[#34d399]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleGenerate} className="space-y-3">
        {mode === 'instruksi_agen' && (
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-2.5 items-center bg-[#131f36] border border-[#22365c] rounded-[9px] p-2.5">
            <div>
              <label htmlFor="aiAgentSelect" className="block text-[10.5px] font-bold text-[#9fb0d0] mb-1">
                Pilih Agen AI Kantor
              </label>
              <select
                id="aiAgentSelect"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#34d399]"
              >
                {PORTAL_DATA.agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} · {a.nama}
                  </option>
                ))}
              </select>
            </div>
            {currentAgent && (
              <div className="text-[11px] text-[#cfe0ff] space-y-0.5">
                <div>
                  <b className="text-[#34d399]">{currentAgent.ruang}</b> · Pemilik:{' '}
                  <b>{currentAgent.owner}</b> · Otoritas: <span className="font-mono">{currentAgent.ot}</span>
                </div>
                <div className="text-[#9fb0d0]">Misi: {currentAgent.misi}</div>
              </div>
            )}
          </div>
        )}

        <div>
          <label htmlFor="aiPromptInput" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">
            Konteks / Instruksi ({currentModeInfo.label})
          </label>
          <textarea
            id="aiPromptInput"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={currentModeInfo.placeholder}
            className="w-full border border-[#22365c] rounded-[9px] px-3 py-2 text-xs text-[#e8eefc] bg-[#131f36] placeholder:text-[#7c8fb3] focus:outline-none focus:border-[#34d399]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="bg-[#34d399] hover:bg-[#6ee7b7] disabled:opacity-50 text-[#06281f] font-bold text-xs rounded-[8px] px-3.5 py-2 cursor-pointer inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {loading ? 'Menyusun dengan Gemini…' : 'Proses dengan Gemini AI'}
          </button>
          <span className="text-[11px] text-[#9fb0d0]">
            Aktif untuk seluruh {user.Tier} (156 Karyawan FTE &amp; Freelancer terverifikasi).
          </span>
        </div>
      </form>

      {error && (
        <div
          role="alert"
          className="rounded-[8px] bg-[#2b1414] border border-[#5b2c2c] px-3 py-2 text-xs text-[#fca5a5]"
        >
          {error}
        </div>
      )}

      {result && (
        <div className="bg-[#131f36] border border-[#175c49] rounded-[10px] p-3.5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#22365c] pb-2">
            <div className="text-[11px] font-bold text-[#6ee7b7]">
              Hasil Gemini AI ({result.model}) · {result.timestamp}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-md bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] text-[#e8eefc] text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Salin
              </button>
              {onSendToWorkspace && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      onSendToWorkspace(
                        'gmail',
                        `${currentModeInfo.label} — Holding Investasi`,
                        result.text
                      )
                    }
                    className="px-2.5 py-1 rounded-md bg-[#182845] border border-[#38bdf8]/60 hover:border-[#38bdf8] text-[#e8eefc] text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3 text-[#38bdf8]" />
                    Kirim via Gmail
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onSendToWorkspace(
                        'drive',
                        `${currentModeInfo.label} (${result.timestamp})`,
                        result.text
                      )
                    }
                    className="px-2.5 py-1 rounded-md bg-[#182845] border border-[#34d399]/60 hover:border-[#34d399] text-[#e8eefc] text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3 text-[#34d399]" />
                    Simpan ke Google Docs
                  </button>
                </>
              )}
              {canSaveDoc && (
                <button
                  type="button"
                  disabled={savingDoc}
                  onClick={handleSaveToDokumen}
                  className="px-2.5 py-1 rounded-md bg-[#38bdf8] hover:bg-[#7dd3fc] disabled:opacity-50 text-[#06222f] text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
                >
                  <FilePlus2 className="w-3 h-3" />
                  {savingDoc ? 'Menyimpan…' : 'Simpan ke Arsip Dokumen'}
                </button>
              )}
            </div>
          </div>
          <div className="text-xs text-[#e8eefc] whitespace-pre-wrap leading-relaxed">
            {result.text}
          </div>
        </div>
      )}
    </div>
  );
};
