import React, { useMemo, useState } from 'react';
import { api } from '../api';
import { DOCUMENT_PHASES, DOCUMENT_TEMPLATES } from '../data/documentTemplates';
import { isAppsScriptRuntime } from '../utils/gasBridge';
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
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<string>('Semua fase');
  const [selectedCode, setSelectedCode] = useState<string>(DOCUMENT_TEMPLATES[0]?.code ?? '');

  const canWrite = ['Pemilik', 'Manajemen', 'Staf'].includes(user.Tier);
  const selectedTemplate = DOCUMENT_TEMPLATES.find((template) => template.code === selectedCode);
  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('id-ID');
    return DOCUMENT_TEMPLATES.filter((template) => {
      const matchesPhase = phase === 'Semua fase' || template.phase === phase;
      const haystack = `${template.code} ${template.phase} ${template.category} ${template.title} ${template.summary}`
        .toLocaleLowerCase('id-ID');
      return matchesPhase && (!q || haystack.includes(q));
    });
  }, [phase, query]);

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
      onNotify('Dokumen tersimpan. Pastikan nomor, versi, klasifikasi, persetujuan dan lokasi master tercatat.');
      onRefresh();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Gagal menyimpan.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const useTemplate = () => {
    if (!selectedTemplate) return;
    setJudul(`${selectedTemplate.code} — ${selectedTemplate.title}`);
    setJenis(selectedTemplate.kind);
    setIsi(selectedTemplate.draft);
    document.getElementById('document-draft-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    onNotify(`Draft ${selectedTemplate.code} disalin ke formulir. Lengkapi placeholder dan lakukan review sebelum disahkan.`);
  };

  const copyTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      await navigator.clipboard.writeText(selectedTemplate.draft);
      onNotify(`Teks ${selectedTemplate.code} disalin ke clipboard.`);
    } catch {
      onNotify('Clipboard tidak tersedia. Pilih “Gunakan draft” untuk memuat teks ke formulir.', true);
    }
  };

  return (
    <div className="space-y-3">
      <section className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#e8eefc]">Pustaka dokumen & arsip holding</h3>
            <p className="mt-1 text-xs text-[#9fb0d0] max-w-3xl">
              Draft kerja dari pra-pendirian, tata kelola, investasi 160-an kategori aset, pihak internal/eksternal,
              surat instansi, pelaporan, insiden hingga arsip pasca-operasi. Semua draft perlu penyesuaian dan review.
            </p>
          </div>
          <span className="rounded-md border border-[#2b4370] bg-[#0f1a2c] px-2 py-1 text-[10px] text-[#7dd3fc]">
            {DOCUMENT_TEMPLATES.length} draft awal
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="block">
            <span className="sr-only">Cari draft</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari jenis dokumen, fase, atau kata kunci…"
              className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
            />
          </label>
          <label className="block">
            <span className="sr-only">Pilih fase dokumen</span>
            <select
              value={phase}
              onChange={(event) => setPhase(event.target.value)}
              className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]"
            >
              {DOCUMENT_PHASES.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(230px,0.85fr)_minmax(0,1.5fr)] gap-3">
          <div className="max-h-[420px] overflow-y-auto space-y-1.5 pr-1" aria-label="Daftar draft dokumen">
            {filteredTemplates.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#2b4370] p-4 text-xs text-[#9fb0d0]">
                Tidak ada draft yang cocok. Coba kata kunci atau fase lain.
              </div>
            ) : filteredTemplates.map((template) => (
              <button
                key={template.code}
                type="button"
                onClick={() => setSelectedCode(template.code)}
                className={`w-full rounded-lg border p-2.5 text-left transition-colors ${selectedCode === template.code
                  ? 'border-[#38bdf8] bg-[#182845]'
                  : 'border-[#22365c] bg-[#0f1a2c] hover:border-[#45618f]'}`}
              >
                <span className="text-[10px] font-mono text-[#34d399]">{template.code} · {template.phase}</span>
                <span className="mt-0.5 block text-xs font-semibold text-[#e8eefc]">{template.title}</span>
                <span className="mt-0.5 block text-[10px] text-[#9fb0d0]">{template.category}</span>
              </button>
            ))}
          </div>

          {selectedTemplate ? (
            <div className="min-w-0 rounded-lg border border-[#22365c] bg-[#0f1a2c] p-3 space-y-2.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-mono text-[#34d399]">{selectedTemplate.code} · {selectedTemplate.phase}</div>
                  <h4 className="mt-0.5 text-sm font-bold text-[#e8eefc]">{selectedTemplate.title}</h4>
                  <p className="mt-1 text-[11px] text-[#9fb0d0]">{selectedTemplate.summary}</p>
                </div>
                <span className="rounded border border-[#22365c] px-2 py-1 text-[10px] text-[#cfe0ff]">{selectedTemplate.kind}</span>
              </div>
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[#9fb0d0]">Pratinjau draft — placeholder harus dilengkapi</span>
                <textarea
                  aria-label={`Pratinjau ${selectedTemplate.title}`}
                  readOnly
                  value={selectedTemplate.draft}
                  rows={12}
                  className="w-full resize-y rounded-lg border border-[#22365c] bg-[#080f1d] px-2.5 py-2 font-mono text-[10.5px] leading-relaxed text-[#cfe0ff] focus:outline-none"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {canWrite && (
                  <button type="button" onClick={useTemplate} className="rounded-lg bg-[#38bdf8] px-3 py-2 text-xs font-bold text-[#06222f] hover:bg-[#7dd3fc]">
                    Gunakan draft di formulir
                  </button>
                )}
                <button type="button" onClick={copyTemplate} className="rounded-lg border border-[#2b4370] bg-[#182845] px-3 py-2 text-xs font-semibold text-[#cfe0ff] hover:border-[#38bdf8]">
                  Salin teks draft
                </button>
                {!isAppsScriptRuntime() && (
                  <a href={`/docs/PAKET_DRAFT_DOKUMEN_HOLDING.md#${selectedTemplate.guideAnchor}`} target="_blank" rel="noreferrer" className="rounded-lg border border-[#2b4370] px-3 py-2 text-xs font-semibold text-[#9fb0d0] hover:text-[#e8eefc]">
                    Buka paket lengkap · {selectedTemplate.guideAnchor}
                  </a>
                )}
              </div>
              <p className="text-[10px] leading-relaxed text-amber-200/90">
                Draft bukan dokumen final atau opini hukum. Validasi fakta, entitas, kewenangan, izin dan masa simpan; minta review profesional sebelum dikirim atau ditandatangani.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#2b4370] p-4 text-xs text-[#9fb0d0]">Pilih draft untuk melihat pratinjau.</div>
          )}
        </div>
        <p className="text-[10px] text-[#8497b8]">
          Paket lengkap: <code>docs/ARSITEKTUR_DOKUMEN_DAN_ARSIP.md</code> dan <code>docs/PAKET_DRAFT_DOKUMEN_HOLDING.md</code>.
        </p>
      </section>

      {canWrite && (
        <form id="document-draft-form" onSubmit={handleSubmit} className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4">
          <b className="text-sm text-[#e8eefc]">Simpan dokumen / draft kerja</b>
          <p className="mt-1 text-[11px] text-[#9fb0d0]">Database aplikasi ini menyimpan teks dan metadata sederhana; bukan repositori arsip resmi, penyimpanan file asli, tanda tangan elektronik, atau sistem legal hold.</p>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 mt-2">
            <div className="sm:col-span-8">
              <label htmlFor="dJudul" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">Judul</label>
              <input id="dJudul" type="text" value={judul} onChange={(e) => setJudul(e.target.value)} required maxLength={180} className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]" />
            </div>
            <div className="sm:col-span-4">
              <label htmlFor="dJenis" className="block text-[11px] font-bold text-[#9fb0d0] mb-1">Jenis</label>
              <select id="dJenis" value={jenis} onChange={(e) => setJenis(e.target.value)} className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]">
                {[...new Set(['Memo Investasi', 'Kebijakan', 'Risalah Rapat', 'Surat Resmi', 'Studi kelayakan', 'Checklist', 'Register', 'Form Intake', 'Register Aset', 'Form Onboarding', 'Proposal', 'Kontrak/Scope', 'Laporan Berkala', 'Laporan Insiden', 'Instruksi Kontrol', 'Arsip', ...DOCUMENT_TEMPLATES.map((template) => template.kind)])].map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
          </div>
          <label htmlFor="dIsi" className="block text-[11px] font-bold text-[#9fb0d0] mt-2.5 mb-1">Isi</label>
          <textarea id="dIsi" rows={9} value={isi} onChange={(e) => setIsi(e.target.value)} required maxLength={20000} className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-sm text-[#e8eefc] bg-[#0f1a2c] focus:outline-none focus:border-[#38bdf8]" />
          <div className="mt-1 text-right text-[10px] text-[#8497b8]">{isi.length.toLocaleString('id-ID')} / 20.000</div>
          <button type="submit" disabled={submitting} className="mt-2.5 bg-[#38bdf8] hover:bg-[#7dd3fc] disabled:opacity-60 text-[#06222f] font-bold text-xs rounded-[8px] px-3.5 py-2 cursor-pointer whitespace-nowrap">
            {submitting ? 'Menyimpan…' : 'Simpan'}
          </button>
        </form>
      )}

      <section className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-[#e8eefc]">Dokumen tersimpan di aplikasi</h3>
          <span className="text-[10px] text-[#9fb0d0]">{items.length} rekod</span>
        </div>
        {loading && items.length === 0 ? (
          <div className="text-sm text-[#9fb0d0]">Memuat…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-[#9fb0d0]">Belum ada dokumen.</div>
        ) : (
          items.map((dok) => (
            <article key={dok.ID} className="py-2.5 border-b border-dashed border-[#22365c] last:border-b-0 text-[12.5px]">
              <div className="text-[#cfe0ff]"><b className="text-[#e8eefc]">{dok.Judul}</b> — <span className="text-[#38bdf8]">{dok.Jenis}</span> · {dok.Oleh} · <span className="font-mono text-[#9fb0d0] tabular-nums">{dok.Tanggal}</span></div>
              <div className="mt-1 text-[#cfe0ff] whitespace-pre-line">{dok.Isi}</div>
            </article>
          ))
        )}
      </section>
    </div>
  );
};
