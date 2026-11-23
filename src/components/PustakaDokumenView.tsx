import React, { useMemo, useState } from 'react';
import { DOCUMENT_PHASES, DOCUMENT_TEMPLATES } from '../data/documentTemplates';
import { isAppsScriptRuntime } from '../utils/gasBridge';

export const PustakaDokumenView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<string>('Semua fase');
  const [selectedCode, setSelectedCode] = useState(DOCUMENT_TEMPLATES[0]?.code ?? '');
  const [copied, setCopied] = useState(false);

  const templates = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('id-ID');
    return DOCUMENT_TEMPLATES.filter((template) => {
      const inPhase = phase === 'Semua fase' || template.phase === phase;
      const text = `${template.code} ${template.phase} ${template.category} ${template.title} ${template.summary}`
        .toLocaleLowerCase('id-ID');
      return inPhase && (!term || text.includes(term));
    });
  }, [phase, query]);
  const selected = DOCUMENT_TEMPLATES.find((template) => template.code === selectedCode);

  const copyDraft = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.draft);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-[#2b4370] bg-gradient-to-br from-[#152848] via-[#111f37] to-[#10192c] p-5 sm:p-7">
        <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-[#38bdf8]/10 blur-3xl" />
        <div className="relative max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#34d399]/30 bg-[#0e2b23]/60 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#6ee7b7]">
            PUSTAKA PUBLIK · TEMPLATE KERJA
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#f1f5ff] sm:text-3xl">Dokumen & Arsip Holding</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#b8c7e2]">
            Dari rencana sebelum pendirian, tata kelola, investasi modal sendiri pada 160-an kategori aset,
            hubungan dengan tim dan mitra, surat instansi, laporan berkala, hingga arsip pasca-operasi.
            Pilih contoh untuk membaca atau menyalin draftnya.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-lg border border-[#2b4370] bg-[#0b1220]/60 px-3 py-2 text-[#cfe0ff]">{DOCUMENT_TEMPLATES.length} template draft</span>
            <span className="rounded-lg border border-[#2b4370] bg-[#0b1220]/60 px-3 py-2 text-[#cfe0ff]">Pra-pendirian → arsip jangka panjang</span>
            <span className="rounded-lg border border-[#2b4370] bg-[#0b1220]/60 px-3 py-2 text-[#cfe0ff]">Tanpa login untuk pustaka contoh</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.55fr)]">
        <div className="rounded-xl border border-[#22365c] bg-[#131f36] p-4">
          <h3 className="text-sm font-bold text-[#e8eefc]">Jelajahi template</h3>
          <label className="mt-3 block">
            <span className="sr-only">Cari template</span>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari surat, laporan, investasi, SDM…" className="w-full rounded-lg border border-[#2b4370] bg-[#0b1220] px-3 py-2.5 text-sm text-[#e8eefc] placeholder:text-[#7183a3] focus:border-[#38bdf8] focus:outline-none" />
          </label>
          <label className="mt-2 block">
            <span className="sr-only">Filter fase</span>
            <select value={phase} onChange={(e) => setPhase(e.target.value)} className="w-full rounded-lg border border-[#2b4370] bg-[#0b1220] px-3 py-2.5 text-sm text-[#e8eefc] focus:border-[#38bdf8] focus:outline-none">
              {DOCUMENT_PHASES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <div className="mt-3 max-h-[540px] space-y-1.5 overflow-y-auto pr-1">
            {templates.length === 0 ? (
              <p className="rounded-lg border border-dashed border-[#2b4370] p-4 text-xs text-[#9fb0d0]">Tidak ada template yang cocok.</p>
            ) : templates.map((template) => (
              <button key={template.code} type="button" onClick={() => setSelectedCode(template.code)} className={`w-full rounded-lg border p-3 text-left transition ${selectedCode === template.code ? 'border-[#38bdf8] bg-[#182845]' : 'border-[#22365c] bg-[#0f1a2c] hover:border-[#45618f]'}`}>
                <span className="text-[10px] font-mono text-[#34d399]">{template.code} · {template.phase}</span>
                <span className="mt-0.5 block text-xs font-semibold text-[#e8eefc]">{template.title}</span>
                <span className="mt-1 block text-[10px] text-[#9fb0d0]">{template.category}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-[#22365c] bg-[#131f36] p-4 sm:p-5">
          {selected ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-mono text-[#34d399]">{selected.code} · {selected.phase}</div>
                  <h3 className="mt-1 text-lg font-bold text-[#f1f5ff]">{selected.title}</h3>
                  <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#9fb0d0]">{selected.summary}</p>
                </div>
                <span className="rounded-md border border-[#2b4370] bg-[#0b1220] px-2.5 py-1.5 text-[10px] text-[#cfe0ff]">{selected.kind}</span>
              </div>
              <div className="mt-4 rounded-lg border border-[#22365c] bg-[#0b1220] p-3 sm:p-4">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#8398bc]">Contoh draft · lengkapi semua [placeholder]</div>
                <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-[#d4e2fb]">{selected.draft}</pre>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={copyDraft} className="rounded-lg bg-[#38bdf8] px-3.5 py-2.5 text-xs font-bold text-[#06222f] hover:bg-[#7dd3fc]">
                  {copied ? 'Draft tersalin ✓' : 'Salin draft'}
                </button>
                {!isAppsScriptRuntime() && (
                  <>
                    <a href={`/docs/PAKET_DRAFT_DOKUMEN_HOLDING.md#${selected.guideAnchor}`} target="_blank" rel="noreferrer" className="rounded-lg border border-[#2b4370] bg-[#182845] px-3.5 py-2.5 text-xs font-semibold text-[#cfe0ff] hover:border-[#38bdf8]">
                      Buka paket lengkap
                    </a>
                    <a href="/docs/ARSITEKTUR_DOKUMEN_DAN_ARSIP.md" target="_blank" rel="noreferrer" className="rounded-lg border border-[#2b4370] px-3.5 py-2.5 text-xs font-semibold text-[#9fb0d0] hover:text-[#e8eefc]">
                      Arsitektur & retensi arsip
                    </a>
                  </>
                )}
              </div>
              <div className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-[11px] leading-relaxed text-amber-100/90">
                Ini pustaka contoh yang bisa dilihat publik. Draft bukan dokumen final, bukan opini hukum, dan tidak memuat data transaksi/pengguna. Verifikasi fakta, badan hukum, kewenangan, izin, privasi dan masa retensi; minta review profesional sebelum dikirim atau ditandatangani. Dokumen operasional tersimpan tetap memerlukan login.
              </div>
            </>
          ) : <p className="text-sm text-[#9fb0d0]">Pilih template untuk melihat isinya.</p>}
        </div>
      </section>

      <section className="rounded-xl border border-[#22365c] bg-[#0f1a2c] p-4 text-xs leading-relaxed text-[#9fb0d0]">
        <b className="text-[#e8eefc]">Siklus yang dicakup:</b> pra-pendirian → pembentukan badan → perizinan dan kesiapan → sourcing dan due diligence → keputusan & eksekusi aset → monitoring → pelaporan/relasi → exit/sengketa → arsip jangka panjang/penutupan. Masa retensi harus ditetapkan per jenis berkas dan diverifikasi; jangan menghapus berkas hanya karena tanggal kalender.
      </section>
    </div>
  );
};
