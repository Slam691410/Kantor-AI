import React, { useMemo, useState } from 'react';
import { PORTAL_DATA } from '../data/portalData';

export type KantorModKey =
  | 'tugas'
  | 'absen'
  | 'kom'
  | 'surat'
  | 'laporan'
  | 'proyek'
  | 'rapat'
  | 'cuti'
  | 'tiket'
  | 'tamu'
  | 'pengumuman'
  | 'kalender'
  | 'arsip'
  | 'polling'
  | 'shift'
  | 'ttd'
  | 'log';

export interface KantorMember {
  id: string;
  tier: string;
  nama: string;
  jabatan: string;
  unit: string;
  warna: string;
  ruang: string;
  akses: readonly string[];
  tugas: ReadonlyArray<readonly [string, string, string, string]>;
}

export interface KantorAttRecord {
  in: number | null;
  out: number | null;
  izin?: boolean;
  guest?: boolean;
  seed?: boolean;
}

export interface KantorAttRow {
  a: KantorAttRecord;
  st: string;
  cls: 'k' | 'm' | 'r';
  koor: string;
  jamKerja: boolean;
}

export interface KantorLogEntry {
  t: string;
  who: string;
  aksi: string;
  modul: string;
}

interface KantorModulesPaneProps {
  member: KantorMember;
  activeMod: KantorModKey;
  onSelectMod: (mod: KantorModKey) => void;
  activeChan: string;
  onSelectChan: (chan: string) => void;
  floorIdx: number;
  nowMin: number;
  isSim: boolean;
  att: Record<string, KantorAttRecord>;
  getAttRow: (p: { id: string; unit: string; floor: number; guest?: boolean }, idx: number, mm: number) => KantorAttRow;
  onClockIn: () => void;
  onClockOut: () => void;
  logs: KantorLogEntry[];
  onLog: (aksi: string, modul: string) => void;
  onToast: (msg: string, isError?: boolean) => void;
  chats: Record<string, Array<[string, string, number]>>;
  onSendMessage: (chan: string, text: string) => void;
  onOpenSistemKerja?: (memberId?: string) => void;
  onChangeMember?: () => void;
  embeddedUnified?: boolean;
}

export const KANTOR_MODS: ReadonlyArray<readonly [KantorModKey, string]> = [
  ['tugas', 'Papan Tugas'],
  ['absen', 'Absensi'],
  ['kom', 'Komunikasi'],
  ['surat', 'Surat-menyurat'],
  ['laporan', 'Laporan'],
  ['proyek', 'Proyek'],
  ['rapat', 'Rapat'],
  ['cuti', 'Cuti & Izin'],
  ['tiket', 'Helpdesk'],
  ['tamu', 'Buku Tamu'],
  ['pengumuman', 'Pengumuman'],
  ['kalender', 'Kalender'],
  ['arsip', 'Arsip Dokumen'],
  ['polling', 'Polling'],
  ['shift', 'Shift & Lembur'],
  ['ttd', 'Tanda Tangan'],
  ['log', 'Log audit'],
];
const MODS = KANTOR_MODS;

const ROOM_LABELS: Record<string, string> = {
  direksi: 'Ruang Direksi',
  keuangan: 'Keuangan & Pajak',
  kepatuhan: 'Kepatuhan & Hukum',
  dealing: 'Dealing Room',
  rapat: 'Ruang Rapat Utama',
  aicore: 'Ruang Agent AI',
  tamu: 'Ruang Tamu',
  proyek: 'Proyek & Analisis',
  pantry: 'Pantry',
  ga: 'Umum & Fasilitas',
};

const STAGES: ReadonlyArray<readonly [string, string]> = [
  ['rencana', 'Rencana'],
  ['berjalan', 'Berjalan'],
  ['review', 'Review'],
  ['selesai', 'Selesai'],
];

function pad2(n: number): string {
  return String(Math.floor(n)).padStart(2, '0');
}

function hhmm(min: number): string {
  const m = ((min % 1440) + 1440) % 1440;
  return `${pad2(m / 60)}:${pad2(m % 60)}`;
}

function getWibDate(): Date {
  const n = new Date();
  return new Date(n.getTime() + n.getTimezoneOffset() * 60000 + 7 * 3600000);
}

function initials(name: string): string {
  return name
    .replace(/[^A-Za-z ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export const KantorModulesPane: React.FC<KantorModulesPaneProps> = ({
  member,
  activeMod,
  onSelectMod,
  activeChan,
  onSelectChan,
  floorIdx,
  nowMin,
  isSim,
  att,
  getAttRow,
  onClockIn,
  onClockOut,
  logs,
  onLog,
  onToast,
  chats,
  onSendMessage,
  onOpenSistemKerja,
  onChangeMember,
  embeddedUnified = false,
}) => {
  const O = PORTAL_DATA.office;
  const LABEL = O.label as Record<string, string>;

  // Module interactive local states (session simulation inside Kantor AI)
  const [doneTasks, setDoneTasks] = useState<Record<string, boolean>>({});
  const [letters, setLetters] = useState<string[][]>(() => O.letters.map((x) => [...x]));
  const [projects, setProjects] = useState<string[][]>(() => O.projects.map((x) => [...x]));
  const [cuti, setCuti] = useState<string[][]>(() => O.cuti.map((x) => [...x]));
  const [tiket, setTiket] = useState<string[][]>(() => O.tiket.map((x) => [...x]));
  const [tamu, setTamu] = useState<string[][]>(() => O.tamu.map((x) => [...x]));
  const [peng, setPeng] = useState<string[][]>(() => O.peng.map((x) => [...x]));
  const [ttd, setTtd] = useState<string[][]>(() => O.ttd.map((x) => [...x]));
  const [joinedMeets, setJoinedMeets] = useState<Record<string, boolean>>({});
  const [risalahId, setRisalahId] = useState<Record<string, string>>({});
  const [pollOptions, setPollOptions] = useState<Array<[string, number]>>(() =>
    O.poll.opsi.map((o) => [String(o[0]), Number(o[1])])
  );
  const [pollVoted, setPollVoted] = useState(false);
  const [reportText, setReportText] = useState<string>('Pilih jenis laporan di atas.');
  const [arsipQuery, setArsipQuery] = useState('');

  // Form states
  const [chatInput, setChatInput] = useState('');
  const [suratJenis, setSuratJenis] = useState('Masuk');
  const [suratPengirim, setSuratPengirim] = useState('');
  const [suratPerihal, setSuratPerihal] = useState('');
  const [suratDisposisi, setSuratDisposisi] = useState('S2 · Kepatuhan');
  const [projName, setProjName] = useState('');
  const [projDate, setProjDate] = useState('2026-12-31');
  const [cutiJenis, setCutiJenis] = useState('Cuti tahunan');
  const [cutiDari, setCutiDari] = useState(() => new Date().toISOString().slice(0, 10));
  const [cutiSampai, setCutiSampai] = useState(() => new Date().toISOString().slice(0, 10));
  const [cutiAlasan, setCutiAlasan] = useState('');
  const [tiketKat, setTiketKat] = useState('AC');
  const [tiketKeluhan, setTiketKeluhan] = useState('');
  const [tiketLokasi, setTiketLokasi] = useState('');
  const [tiketPrioritas, setTiketPrioritas] = useState('Sedang');
  const [tamuNama, setTamuNama] = useState('');
  const [tamuInstansi, setTamuInstansi] = useState('');
  const [tamuTujuan, setTamuTujuan] = useState('');
  const [pengJudul, setPengJudul] = useState('');
  const [pengIsi, setPengIsi] = useState('');
  const [pengUrg, setPengUrg] = useState('Biasa');

  const handleModClick = (key: KantorModKey) => {
    if (!member.akses.includes(key)) {
      const label = LABEL[key] || key;
      onToast(`Akses ditolak: modul ${label} bukan wewenang ${member.jabatan}.`, true);
      onLog(`AKSES DITOLAK — ${label}`, 'Keamanan');
      return;
    }
    onSelectMod(key);
    onLog(`Membuka ${LABEL[key] || key}`, LABEL[key] || key);
  };

  const todayDisplay = useMemo(() => {
    return getWibDate().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  const inputCls =
    'bg-[#0f1a2c] border border-[#22365c] rounded-lg px-2.5 py-1.5 text-xs text-[#e8eefc] placeholder-[#7c8fb3] focus:outline-none focus:border-[#38bdf8]';
  const btnPrimaryCls =
    'px-3 py-1.5 rounded-lg bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#06222f] text-xs font-bold cursor-pointer whitespace-nowrap disabled:opacity-40';
  const btnGhostCls =
    'px-3 py-1.5 rounded-lg bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] text-[#e8eefc] text-xs font-semibold cursor-pointer whitespace-nowrap disabled:opacity-40';

  const makeReport = (kind: 'harian' | 'investasi' | 'ga' | 'kepatuhan'): string => {
    const T = PORTAL_DATA.tasks;
    const n = T.length;
    const c: Record<string, number> = { AI: 0, Remote: 0, 'On-site': 0, Vendor: 0 };
    T.forEach((t) => {
      c[t[2]] = (c[t[2]] || 0) + 1;
    });
    const mRows = O.members.map((m, i) => ({
      m,
      ...getAttRow({ id: m.id, unit: m.unit, floor: 0 }, i, nowMin),
    }));
    const hadir = mRows.filter((r) => r.st.startsWith('Hadir')).length;
    const title =
      kind === 'investasi'
        ? 'LAPORAN BULANAN INVESTASI'
        : kind === 'ga'
          ? 'LAPORAN GA & FASILITAS'
          : kind === 'kepatuhan'
            ? 'LAPORAN KEPATUHAN'
            : 'LAPORAN HARIAN KANTOR';
    const head = `HOLDING INVESTASI — ${title}
Tanggal   : ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
Waktu     : ${hhmm(nowMin)} WIB${isSim ? ' (pratinjau)' : ''}
Disusun   : ${member.nama} — ${member.jabatan}, ${member.unit}
${'='.repeat(72)}`;

    if (kind === 'harian') {
      return `${head}

1. KEHADIRAN
   Hadir ${hadir} dari ${O.members.length} anggota aktif.
${mRows
  .map(
    (r) =>
      `   - ${r.m.nama.padEnd(24).slice(0, 24)} ${r.st.padEnd(18).slice(0, 18)} ${
        r.a.in != null ? hhmm(r.a.in) : '--:--'
      } -> ${r.a.out != null ? hhmm(r.a.out) : '--:--'}`
  )
  .join('\n')}

2. SURAT & DOKUMEN
   Surat tercatat: ${letters.length} (masuk ${letters.filter((l) => l[2] === 'Masuk').length}, keluar ${
        letters.filter((l) => l[2] === 'Keluar').length
      }).
   Perlu tindak lanjut: ${letters.filter((l) => l[6] === 'Perlu jawaban').length} surat.

3. PROYEK
${projects.map((p) => `   - [${p[2].toUpperCase()}] ${p[0]} — PIC ${p[1]}, tenggat ${p[3]}`).join('\n')}

4. RAPAT
${O.meets
  .map((m) => `   - ${hhmm(m[2])}–${hhmm(m[3])} ${m[1]} (${ROOM_LABELS[m[4]] || m[4]})`)
  .join('\n')}

5. CATATAN
   ${
     letters.some((l) => l[6] === 'Perlu jawaban')
       ? 'Terdapat surat OJK yang wajib dijawab dalam 5 hari kerja.'
       : 'Tidak ada temuan mendesak.'
   }

${'='.repeat(72)}
Dibuat otomatis oleh Kantor AI dan disahkan oleh:
${member.nama}
${member.jabatan}`;
    }

    if (kind === 'investasi') {
      const kelas = PORTAL_DATA.kelas
        .slice(0, 6)
        .map(
          (k) =>
            `   - ${k.nama.padEnd(28).slice(0, 28)} ${String(k.jumlah).padStart(3)} aset · AI ${k.ai}% · remote ${k.rm}% · kantor ${k.of}%`
        )
        .join('\n');
      return `${head}

1. CAKUPAN
   160 jenis aset dalam ${PORTAL_DATA.desks.length} meja investasi + ${PORTAL_DATA.support.length} unit pendukung.

2. DISTRIBUSI PER KELAS ASET
${kelas}

3. EKSEKUSI & OTORISASI
   Order saham/obligasi dieksekusi Dealer (remote), instruksi transfer dan tanda tangan
   perjanjian wajib on-site oleh Direktur. Pemindahan kripto memakai multi-sig 2-dari-3.

4. ALOKASI KERJA
   AI ${c.AI} tugas (${Math.round((c.AI / n) * 100)}%) · remote ${c.Remote} (${Math.round((c.Remote / n) * 100)}%) ·
   on-site ${c['On-site']} (${Math.round((c['On-site'] / n) * 100)}%) · vendor ${c.Vendor} (${Math.round((c.Vendor / n) * 100)}%).

5. RISIKO YANG DIPANTAU
   - Konsentrasi properti: batas 25% NAB.
   - Kustodian kripto: uji pemulihan kunci belum selesai (proyek berjalan).
   - Likuiditas: kas minimum 3 bulan opex (Rp3,8 miliar).

${'='.repeat(72)}
Disusun: ${member.nama} — ${member.jabatan}`;
    }

    if (kind === 'ga') {
      const ga = T.filter((t) =>
        [
          'Fasilitas & Kantor',
          'Kebersihan & Kenyamanan',
          'Keamanan',
          'Teknis & Pemeliharaan',
          'Transportasi & Dokumen',
          'Pengadaan & Vendor',
        ].includes(t[0])
      );
      return `${head}

1. KEADAAN KANTOR
   Occupancy 26 FTE. Ruang rapat 1, ruang direksi 1, dealing room, pantry, ruang tamu.
   Absensi hari ini: hadir ${hadir}/${O.members.length}.

2. PEKERJAAN UMUM & FASILITAS (${ga.length} pekerjaan)
${ga
  .slice(0, 14)
  .map((t) => `   - [${t[2]}] ${t[1].slice(0, 64)} (${t[3]}; ${t[4]})`)
  .join('\n')}

3. LAYANAN ALIH DAYA
${PORTAL_DATA.outsource
  .map(
    (o) =>
      `   - ${o[0].padEnd(24).slice(0, 24)} ${o[2].padEnd(22).slice(0, 22)} ${o[3].slice(0, 42)}`
  )
  .join('\n')}

4. KEBERSIHAN & KEAMANAN
   Cleaning 2 shift, satpam 24/7 (3 shift), pest control triwulan, taman 2x/bulan.

5. TINDAK LANJUT
   - Perpanjangan kontrak kebersihan 2027 (tender G3 pukul 13:30).
   - Servis AC preventif lantai 3 selesai; genset uji beban bulan depan.

${'='.repeat(72)}
Disusun: ${member.nama} — ${member.jabatan}`;
    }

    const ops = T.filter((t) => t[0] === 'Kepatuhan & Korporasi');
    const fin = T.filter((t) => t[0] === 'Keuangan & Pajak');
    return `${head}

1. PERIZINAN & STATUS BADAN HUKUM
   PT berstatus badan hukum, NIB aktif, NPWP terdaftar. Bukan perantara efek — tidak
   memerlukan izin OJK sebagai pialang; kegiatan investasi memakai modal sendiri.

2. KEPATUHAN TRANSAKSI
   ${ops.length} pekerjaan kepatuhan, ${fin.length} pekerjaan keuangan/pajak terdaftar.
   Pemisahan rekening perusahaan dan rekening titipan diperiksa harian.

3. SURAT PENTING
${
  letters
    .filter((l) => l[6] !== 'Selesai')
    .map((l) => `   - ${l[0]} · ${l[3]} · ${l[4]} · status ${l[6]}`)
    .join('\n') || '   - tidak ada'
}

4. TEMUAN BELUM SELESAI
   - Permintaan klarifikasi OJK (surat 006) — jawaban maksimal 5 hari kerja.
   - Uji petik auditor 30 transaksi Oktober.

5. REKOMENDASI
   Menutup temuan OJK sebelum RUPS triwulan; melanjutkan uji pemulihan kunci kripto.

${'='.repeat(72)}
Disusun: ${member.nama} — ${member.jabatan}`;
  };

  // Precomputed views data
  const peopleOnFloor = O.layout.people
    .map((p, idx) => ({ p, idx }))
    .filter((x) => x.p.floor === floorIdx);
  const absenRows = peopleOnFloor.map(({ p, idx }) => ({
    p,
    ...getAttRow(
      { id: p.id, unit: p.unit, floor: p.floor, guest: 'guest' in p ? Boolean(p.guest) : false },
      idx,
      nowMin
    ),
  }));
  const absenHadir = absenRows.filter((r) => r.st.startsWith('Hadir')).length;
  const absenTelat = absenRows.filter((r) => r.st === 'Hadir (terlambat)').length;
  const absenBelum = absenRows.filter((r) => r.st === 'Belum absen').length;
  const myAtt = att[member.id] || { in: null, out: null };

  // Communication channels
  const dmChans = Object.keys(chats)
    .filter((k) => k.startsWith('dm_'))
    .map((k) => {
      const targetId = k.slice(3);
      const found =
        O.layout.people.find((p) => p.id === targetId) ||
        O.members.find((m) => m.id === targetId) ||
        PORTAL_DATA.agents.find((a) => a.id === targetId);
      const labelName = found ? found.nama.split(' ')[0] : targetId;
      return [k, `@${labelName}`] as [string, string];
    });
  const baseChans: Array<[string, string]> =
    member.id === 'M9'
      ? [['vendor-eksternal', '#vendor (eksternal)']]
      : O.kanal.map((k) => [String(k[0]), String(k[1])]);
  const allChans = [...baseChans, ...dmChans];
  const currentChan = allChans.find((c) => c[0] === activeChan) ? activeChan : allChans[0][0];
  const currentMsgs = chats[currentChan] || [];

  // Calendar grid
  const calNow = getWibDate();
  const calY = calNow.getFullYear();
  const calM = calNow.getMonth();
  const calToday = calNow.getDate();
  const firstDow = new Date(calY, calM, 1).getDay();
  const daysInMonth = new Date(calY, calM + 1, 0).getDate();

  return (
    <div className={embeddedUnified ? 'space-y-3' : 'bg-[#131f36] border border-[#22365c] rounded-[12px] p-4 space-y-3'}>
      {!embeddedUnified && (
        <>
          {/* Header status strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#22365c]">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: member.warna }}
              >
                {initials(member.nama)}
              </div>
              <div>
                <div className="text-[13px] font-bold text-[#e8eefc]">
                  Papan Kerja: {member.nama}{' '}
                  <span className="text-[11px] font-mono text-[#38bdf8]">
                    ({member.id} · {member.tier})
                  </span>
                </div>
                <div className="text-[11px] text-[#9fb0d0]">
                  {member.jabatan} · {member.unit} · {member.akses.length} modul terbuka
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {onOpenSistemKerja && (
                <button
                  type="button"
                  onClick={() => onOpenSistemKerja(member.id)}
                  className={btnPrimaryCls}
                >
                  Masuk Sistem Kerja (Server) sebagai {member.id} →
                </button>
              )}
              {onChangeMember && (
                <button type="button" onClick={onChangeMember} className={btnGhostCls}>
                  Ganti pengguna
                </button>
              )}
            </div>
          </div>

          {/* Info banner */}
          <div className="bg-[#0f1a2c] border border-[#22365c] rounded-lg px-3 py-2 text-[11.5px] text-[#9fb0d0]">
            <b className="text-[#fbbf24]">Sesi Kantor Interaktif.</b> Papan ini berjalan langsung dari
            jam &amp; absensi kantor untuk simulasi harian 17 modul.
          </div>

          {/* 17-Module Bar */}
          <div className="flex flex-wrap gap-1.5">
            {MODS.map(([k, label]) => {
              const allowed = member.akses.includes(k);
              const isActive = activeMod === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleModClick(k)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#38bdf8] border-[#38bdf8] text-[#06222f]'
                      : allowed
                        ? 'bg-[#182845] border-[#22365c] text-[#cfe0ff] hover:border-[#38bdf8]'
                        : 'bg-[#0f1a2c] border-[#1c2b4a] text-[#64748b] opacity-65 hover:border-[#5b2c2c]'
                  }`}
                  title={allowed ? label : `${label} (Terkunci untuk ${member.jabatan})`}
                >
                  {!allowed ? '🔒 ' : ''}
                  {label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Active Module Pane */}
      <div className="bg-[#0f1a2c] border border-[#22365c] rounded-[10px] p-4">
        {/* 1. TUGAS */}
        {activeMod === 'tugas' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-[14px] font-semibold text-[#e8eefc]">
                Papan tugas — {member.jabatan}
              </h4>
              <p className="text-xs text-[#9fb0d0]">
                Diambil dari pembagian tugas (tab Pembagian Tugas). Tandai selesai; progres tercatat
                di log audit.
              </p>
            </div>
            {(() => {
              const total = member.tugas.length;
              const doneCount = member.tugas.filter(
                (_, i) => doneTasks[`${member.id}_${i}`]
              ).length;
              const pct = total ? Math.round((doneCount / total) * 100) : 0;
              return (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-[#131f36] border border-[#22365c] rounded-lg p-3">
                      <div className="text-[10.5px] text-[#9fb0d0]">Tugas tetap</div>
                      <div className="text-lg font-bold font-mono tabular-nums text-[#e8eefc]">
                        {total}
                      </div>
                    </div>
                    <div className="bg-[#131f36] border border-[#22365c] rounded-lg p-3">
                      <div className="text-[10.5px] text-[#9fb0d0]">Selesai</div>
                      <div className="text-lg font-bold font-mono tabular-nums text-[#34d399]">
                        {doneCount}
                        <span className="text-xs font-normal text-[#9fb0d0]"> / {total}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 bg-[#182845] rounded overflow-hidden">
                        <div className="h-full bg-[#34d399]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                  {total === 0 ? (
                    <p className="text-xs text-[#9fb0d0]">
                      Jabatan ini tidak punya tugas tetap di kantor.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {member.tugas.map((t, idx) => {
                        const key = `${member.id}_${idx}`;
                        const checked = Boolean(doneTasks[key]);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              const next = !checked;
                              setDoneTasks((prev) => ({ ...prev, [key]: next }));
                              onLog(
                                `${next ? 'Menyelesaikan' : 'Membatalkan'} tugas: ${t[0].slice(0, 40)}`,
                                'Tugas'
                              );
                            }}
                            className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                              checked
                                ? 'bg-[#0e2b23] border-[#175c49]'
                                : 'bg-[#131f36] border-[#22365c] hover:border-[#38bdf8]'
                            }`}
                          >
                            <span
                              className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                checked
                                  ? 'bg-[#34d399] border-[#34d399] text-[#06281f]'
                                  : 'border-[#3b527d] text-transparent'
                              }`}
                            >
                              ✓
                            </span>
                            <span>
                              <span
                                className={`block text-xs font-semibold ${
                                  checked ? 'line-through text-[#6ee7b7]' : 'text-[#e8eefc]'
                                }`}
                              >
                                {t[0]}
                              </span>
                              <span className="block text-[11px] text-[#9fb0d0] mt-0.5">
                                {t[1]} · {t[2]}
                                {t[3] ? ` · kontrol: ${t[3]}` : ''}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* 2. ABSENSI */}
        {activeMod === 'absen' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-[14px] font-semibold text-[#e8eefc]">
                Absensi — {todayDisplay}
              </h4>
              <p className="text-xs text-[#9fb0d0]">
                Jam kantor 07:15–17:30 WIB. Kehadiran Anda memengaruhi posisi &amp; status langsung
                pada denah isometrik lantai.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[#131f36] border border-[#22365c] rounded-lg p-3">
                <div className="text-[10.5px] text-[#9fb0d0]">Hadir (Lantai ini)</div>
                <div className="text-lg font-bold font-mono tabular-nums text-[#34d399]">
                  {absenHadir}
                  <span className="text-xs font-normal text-[#9fb0d0]"> / {absenRows.length}</span>
                </div>
              </div>
              <div className="bg-[#131f36] border border-[#22365c] rounded-lg p-3">
                <div className="text-[10.5px] text-[#9fb0d0]">Terlambat</div>
                <div className="text-lg font-bold font-mono tabular-nums text-[#fbbf24]">
                  {absenTelat}
                </div>
              </div>
              <div className="bg-[#131f36] border border-[#22365c] rounded-lg p-3">
                <div className="text-[10.5px] text-[#9fb0d0]">Belum absen</div>
                <div className="text-lg font-bold font-mono tabular-nums text-[#e8eefc]">
                  {absenBelum}
                </div>
              </div>
              <div className="bg-[#131f36] border border-[#22365c] rounded-lg p-3">
                <div className="text-[10.5px] text-[#9fb0d0]">Jam Anda</div>
                <div className="text-lg font-bold font-mono tabular-nums text-[#38bdf8]">
                  {myAtt.in != null ? hhmm(myAtt.in) : '—'}
                  {myAtt.out != null && (
                    <span className="text-xs font-normal text-[#9fb0d0]"> → {hhmm(myAtt.out)}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={myAtt.in != null}
                onClick={onClockIn}
                className={btnPrimaryCls}
              >
                Absen masuk
              </button>
              <button
                type="button"
                disabled={myAtt.in == null || myAtt.out != null}
                onClick={onClockOut}
                className={btnGhostCls}
              >
                Absen keluar
              </button>
              <span className="text-[11.5px] text-[#9fb0d0] font-mono tabular-nums">
                {myAtt.in != null
                  ? `Masuk ${hhmm(myAtt.in)} · ${
                      myAtt.out != null
                        ? `pulang ${hhmm(myAtt.out)}`
                        : `${((nowMin - myAtt.in) / 60).toFixed(1)} jam berjalan`
                    }`
                  : 'Belum ada catatan hari ini'}
              </span>
            </div>

            <div className="overflow-x-auto border border-[#22365c] rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#131f36] text-[#9fb0d0] border-b border-[#22365c]">
                    <th className="px-3 py-2 font-semibold">Anggota</th>
                    <th className="px-3 py-2 font-semibold">Jabatan</th>
                    <th className="px-3 py-2 font-semibold">Masuk</th>
                    <th className="px-3 py-2 font-semibold">Keluar</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 font-semibold">Lokasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2b4a]">
                  {absenRows.map((r) => (
                    <tr key={r.p.id} className="hover:bg-[#131f36]/60">
                      <td className="px-3 py-2 font-semibold text-[#e8eefc]">{r.p.nama}</td>
                      <td className="px-3 py-2 text-[#9fb0d0]">{r.p.jabatan}</td>
                      <td className="px-3 py-2 font-mono tabular-nums text-[#cfe0ff]">
                        {r.a.in != null ? hhmm(r.a.in) : '—'}
                      </td>
                      <td className="px-3 py-2 font-mono tabular-nums text-[#cfe0ff]">
                        {r.a.out != null ? hhmm(r.a.out) : '—'}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-semibold border ${
                            r.cls === 'k'
                              ? 'bg-[#0e2b23] border-[#175c49] text-[#6ee7b7]'
                              : r.cls === 'm'
                                ? 'bg-[#2a220e] border-[#5c4814] text-[#fbbf24]'
                                : 'bg-[#2b1414] border-[#5b2c2c] text-[#fca5a5]'
                          }`}
                        >
                          {r.st}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[#9fb0d0]">{r.koor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. KOMUNIKASI */}
        {activeMod === 'kom' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-[14px] font-semibold text-[#e8eefc]">Komunikasi</h4>
              <p className="text-xs text-[#9fb0d0]">
                Kanal internal memakai SSO perusahaan; kanal eksternal hanya untuk vendor, notaris,
                dan auditor — seluruh percakapan direkam.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3">
              <div className="bg-[#131f36] border border-[#22365c] rounded-lg p-2 space-y-1 max-h-[300px] overflow-y-auto">
                {allChans.map(([cid, cname]) => (
                  <button
                    key={cid}
                    type="button"
                    onClick={() => {
                      onSelectChan(cid);
                      onLog(`Membuka kanal ${cname}`, 'Komunikasi');
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors ${
                      currentChan === cid
                        ? 'bg-[#38bdf8] text-[#06222f] font-bold'
                        : 'text-[#cfe0ff] hover:bg-[#182845]'
                    }`}
                  >
                    {cname}
                  </button>
                ))}
              </div>
              <div className="bg-[#131f36] border border-[#22365c] rounded-lg p-3 flex flex-col justify-between min-h-[280px]">
                <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
                  {currentMsgs.length === 0 ? (
                    <div className="text-xs text-[#7c8fb3] py-6 text-center">
                      Belum ada pesan di kanal ini. Mulai percakapan di bawah.
                    </div>
                  ) : (
                    currentMsgs.map((msg, idx) => {
                      const sender =
                        O.layout.people.find((p) => p.id === msg[0]) ||
                        O.members.find((m) => m.id === msg[0]) ||
                        PORTAL_DATA.agents.find((a) => a.id === msg[0]);
                      const sName = sender ? sender.nama : msg[0];
                      const sColor =
                        sender && 'warna' in sender ? String(sender.warna) : '#3ec7b3';
                      const isMine = msg[0] === member.id;
                      return (
                        <div
                          key={`${idx}-${msg[2]}`}
                          className={`flex items-start gap-2 ${isMine ? 'flex-row-reverse' : ''}`}
                        >
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: sColor }}
                          >
                            {initials(sName)}
                          </div>
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 text-xs border ${
                              isMine
                                ? 'bg-[#183052] border-[#2d558c] text-[#e8eefc]'
                                : 'bg-[#0f1a2c] border-[#22365c] text-[#cfe0ff]'
                            }`}
                          >
                            <div className="flex items-center gap-2 text-[10.5px] mb-0.5">
                              <b className="text-[#e8eefc]">{sName}</b>
                              <span className="font-mono tabular-nums text-[#7c8fb3]">
                                {hhmm(msg[2])}
                              </span>
                            </div>
                            <div>{msg[1]}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const v = chatInput.trim();
                    if (!v) return;
                    onSendMessage(currentChan, v);
                    setChatInput('');
                  }}
                  className="mt-3 pt-2.5 border-t border-[#22365c] flex gap-2"
                >
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Tulis pesan…"
                    maxLength={240}
                    className={`${inputCls} flex-1`}
                  />
                  <button type="submit" className={btnPrimaryCls}>
                    Kirim
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 4. SURAT-MENYURAT */}
        {activeMod === 'surat' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-[14px] font-semibold text-[#e8eefc]">Surat-menyurat</h4>
              <p className="text-xs text-[#9fb0d0]">
                Agenda surat masuk dan keluar dengan nomor otomatis, disposisi ke unit, dan status
                tindak lanjut.
              </p>
            </div>
            {member.id === 'M8' ? (
              <p className="text-xs text-[#fbbf24]">
                Anda masuk sebagai auditor eksternal: hanya dapat membaca agenda surat.
              </p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!suratPengirim.trim() || !suratPerihal.trim()) {
                    onToast('Pengirim dan perihal wajib diisi.', true);
                    return;
                  }
                  const n = String(letters.length + 1).padStart(3, '0');
                  const tgl = new Date().toISOString().slice(0, 10);
                  setLetters((prev) => [
                    ...prev,
                    [
                      `${n}/HI/XI/2026`,
                      tgl,
                      suratJenis,
                      suratPengirim.trim(),
                      suratPerihal.trim(),
                      suratDisposisi,
                      'Didisposisi',
                    ],
                  ]);
                  setSuratPengirim('');
                  setSuratPerihal('');
                  onLog(`Mencatat surat ${n} (${suratJenis})`, 'Surat');
                  onToast(`Surat tercatat: ${n}/HI/XI/2026`);
                }}
                className="flex flex-wrap gap-2"
              >
                <select
                  value={suratJenis}
                  onChange={(e) => setSuratJenis(e.target.value)}
                  className={inputCls}
                >
                  <option>Masuk</option>
                  <option>Keluar</option>
                </select>
                <input
                  value={suratPengirim}
                  onChange={(e) => setSuratPengirim(e.target.value)}
                  placeholder={member.id === 'M9' ? 'Pengirim (perusahaan Anda)' : 'Pengirim / tujuan'}
                  className={`${inputCls} flex-1 min-w-[160px]`}
                />
                <input
                  value={suratPerihal}
                  onChange={(e) => setSuratPerihal(e.target.value)}
                  placeholder="Perihal surat"
                  className={`${inputCls} flex-[2] min-w-[200px]`}
                />
                <select
                  value={suratDisposisi}
                  onChange={(e) => setSuratDisposisi(e.target.value)}
                  className={inputCls}
                >
                  <option>S2 · Kepatuhan</option>
                  <option>S3 · Keuangan</option>
                  <option>S12 · GA</option>
                  <option>D7 · Properti</option>
                </select>
                <button type="submit" className={btnPrimaryCls}>
                  Catat surat
                </button>
              </form>
            )}

            <div className="overflow-x-auto border border-[#22365c] rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#131f36] text-[#9fb0d0] border-b border-[#22365c]">
                    <th className="px-3 py-2 font-semibold">No. agenda</th>
                    <th className="px-3 py-2 font-semibold">Tanggal</th>
                    <th className="px-3 py-2 font-semibold">Jenis</th>
                    <th className="px-3 py-2 font-semibold">Pengirim / tujuan</th>
                    <th className="px-3 py-2 font-semibold">Perihal</th>
                    <th className="px-3 py-2 font-semibold">Disposisi</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2b4a]">
                  {[...letters].reverse().map((l, revIdx) => {
                    const idx = letters.length - 1 - revIdx;
                    const readOnly = member.id === 'M8';
                    return (
                      <tr key={l[0]} className="hover:bg-[#131f36]/60">
                        <td className="px-3 py-2 font-mono tabular-nums text-[#38bdf8]">{l[0]}</td>
                        <td className="px-3 py-2 font-mono tabular-nums text-[#9fb0d0]">{l[1]}</td>
                        <td className="px-3 py-2">
                          <span className="px-1.5 py-0.5 rounded bg-[#182845] border border-[#22365c] text-[10.5px]">
                            {l[2]}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[#cfe0ff]">{l[3]}</td>
                        <td className="px-3 py-2 text-[#e8eefc]">{l[4]}</td>
                        <td className="px-3 py-2 text-[#9fb0d0]">{l[5]}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            disabled={readOnly}
                            onClick={() => {
                              if (readOnly) return;
                              setLetters((prev) =>
                                prev.map((row, rIdx) => {
                                  if (rIdx !== idx) return row;
                                  const next =
                                    row[6] === 'Didisposisi'
                                      ? 'Selesai'
                                      : row[6] === 'Perlu jawaban'
                                        ? 'Didisposisi'
                                        : 'Selesai';
                                  onLog(`Mengubah status surat ${row[0]} -> ${next}`, 'Surat');
                                  return [...row.slice(0, 6), next];
                                })
                              );
                            }}
                            className={`px-2 py-0.5 rounded text-[10.5px] font-semibold border ${
                              readOnly ? 'cursor-default' : 'cursor-pointer'
                            } ${
                              l[6] === 'Selesai'
                                ? 'bg-[#0e2b23] border-[#175c49] text-[#6ee7b7]'
                                : l[6] === 'Perlu jawaban'
                                  ? 'bg-[#2b1414] border-[#5b2c2c] text-[#fca5a5]'
                                  : 'bg-[#2a220e] border-[#5c4814] text-[#fbbf24]'
                            }`}
                          >
                            {l[6]}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. LAPORAN */}
        {activeMod === 'laporan' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-[14px] font-semibold text-[#e8eefc]">Laporan</h4>
              <p className="text-xs text-[#9fb0d0]">
                Laporan disusun dari data yang sama dengan tab Pembagian Tugas, absensi, surat, dan
                proyek. Tanda tangan mengikuti jabatan Anda.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['harian', 'Laporan harian kantor'],
                  ['investasi', 'Laporan bulanan investasi'],
                  ['ga', 'Laporan GA & fasilitas'],
                  ['kepatuhan', 'Laporan kepatuhan'],
                ] as const
              ).map(([kind, label]) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => {
                    setReportText(makeReport(kind));
                    onLog(`Menyusun laporan ${kind}`, 'Laporan');
                    onToast(`Laporan ${kind} dibuat dan tercatat di log.`);
                  }}
                  className={btnGhostCls}
                >
                  {label}
                </button>
              ))}
            </div>
            <pre className="bg-[#0b1220] border border-[#22365c] rounded-lg p-3.5 text-[11.5px] font-mono text-[#cfe0ff] overflow-x-auto max-h-[380px] whitespace-pre-wrap">
              {reportText}
            </pre>
          </div>
        )}

        {/* 6. PROYEK */}
        {activeMod === 'proyek' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-[14px] font-semibold text-[#e8eefc]">Manajemen Proyek</h4>
              <p className="text-xs text-[#9fb0d0]">
                Klik kartu untuk memindahkan tahap. Setiap perpindahan tercatat di log audit.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!projName.trim()) {
                  onToast('Nama proyek wajib diisi.', true);
                  return;
                }
                setProjects((prev) => [
                  ...prev,
                  [projName.trim(), member.id, 'rencana', projDate || '2026-12-31', 'baru dibuat'],
                ]);
                onLog(`Membuat proyek "${projName.trim()}"`, 'Proyek');
                setProjName('');
              }}
              className="flex flex-wrap gap-2"
            >
              <input
                value={projName}
                onChange={(e) => setProjName(e.target.value)}
                placeholder="Nama proyek baru"
                className={`${inputCls} flex-1 min-w-[200px]`}
              />
              <input
                type="date"
                value={projDate}
                onChange={(e) => setProjDate(e.target.value)}
                className={inputCls}
              />
              <button type="submit" className={btnPrimaryCls}>
                Tambah proyek
              </button>
            </form>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {STAGES.map(([sKey, sLabel]) => {
                const colCards = projects
                  .map((p, idx) => ({ p, idx }))
                  .filter((x) => x.p[2] === sKey);
                const todayIso = new Date().toISOString().slice(0, 10);
                return (
                  <div
                    key={sKey}
                    className="bg-[#131f36] border border-[#22365c] rounded-lg p-2.5 space-y-2"
                  >
                    <div className="text-xs font-bold text-[#e8eefc]">
                      {sLabel} ({colCards.length})
                    </div>
                    {colCards.map(({ p, idx }) => {
                      const owner = O.members.find((m) => m.id === p[1]) || O.members[0];
                      const late = p[3] < todayIso && p[2] !== 'selesai';
                      return (
                        <button
                          key={`${p[0]}-${idx}`}
                          type="button"
                          onClick={() => {
                            const curIdx = STAGES.findIndex((s) => s[0] === p[2]);
                            const nextStage = STAGES[(curIdx + 1) % STAGES.length][0];
                            setProjects((prev) =>
                              prev.map((row, rIdx) =>
                                rIdx === idx ? [row[0], row[1], nextStage, row[3], row[4]] : row
                              )
                            );
                            onLog(`Proyek "${p[0]}" -> ${nextStage}`, 'Proyek');
                            onToast(`"${p[0]}" -> ${nextStage}`);
                          }}
                          className={`w-full text-left p-2.5 rounded-lg border transition-colors cursor-pointer ${
                            late
                              ? 'bg-[#2b1414] border-[#5b2c2c] hover:border-[#f87171]'
                              : 'bg-[#0f1a2c] border-[#22365c] hover:border-[#38bdf8]'
                          }`}
                        >
                          <div className="text-xs font-semibold text-[#e8eefc]">{p[0]}</div>
                          {p[4] && <div className="text-[10.5px] text-[#9fb0d0] mt-0.5">{p[4]}</div>}
                          <div className="mt-2 flex items-center justify-between text-[10.5px]">
                            <span
                              className="px-1.5 py-0.5 rounded font-bold text-white"
                              style={{ backgroundColor: owner.warna }}
                              title={owner.nama}
                            >
                              {initials(owner.nama)}
                            </span>
                            <span className="font-mono tabular-nums text-[#9fb0d0]">{p[3]}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. RAPAT */}
        {activeMod === 'rapat' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-[14px] font-semibold text-[#e8eefc]">Rapat</h4>
              <p className="text-xs text-[#9fb0d0]">
                Jadwal rapat hari ini beserta peserta. Bergabung mencatat kehadiran Anda dan membuka
                risalah.
              </p>
            </div>
            <div className="space-y-2.5">
              {O.meets.map((g) => {
                const live = nowMin >= g[2] && nowMin < g[3];
                const done = nowMin >= g[3];
                const joined = Boolean(joinedMeets[g[0]]);
                const hadirNames = (g[5] as readonly string[])
                  .map((id) => O.members.find((m) => m.id === id)?.nama || id)
                  .join(', ');
                return (
                  <div
                    key={g[0]}
                    className={`rounded-lg border p-3.5 ${
                      live ? 'bg-[#0e2b23] border-[#34d399]' : 'bg-[#131f36] border-[#22365c]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[13px] font-bold text-[#e8eefc]">{g[1]}</div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10.5px] font-semibold border ${
                          live
                            ? 'bg-[#0b3329] border-[#34d399] text-[#6ee7b7]'
                            : done
                              ? 'bg-[#182845] border-[#22365c] text-[#9fb0d0]'
                              : 'bg-[#2a220e] border-[#5c4814] text-[#fbbf24]'
                        }`}
                      >
                        {live ? 'berlangsung' : done ? 'selesai' : 'akan datang'}
                      </span>
                    </div>
                    <div className="text-xs font-mono tabular-nums text-[#9fb0d0] mt-1">
                      {hhmm(g[2])}–{hhmm(g[3])} · {ROOM_LABELS[g[4]] || g[4]}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(g[5] as readonly string[]).map((id) => {
                        const mmb = O.members.find((x) => x.id === id);
                        return (
                          <span
                            key={id}
                            className="px-2 py-0.5 rounded bg-[#0f1a2c] border border-[#22365c] text-[10.5px] text-[#cfe0ff]"
                          >
                            {mmb ? mmb.nama.split(' ')[0] : id}
                          </span>
                        );
                      })}
                    </div>
                    <div className="text-xs text-[#9fb0d0] mt-2">{g[6]}</div>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setJoinedMeets((prev) => ({ ...prev, [g[0]]: true }));
                          onLog(`Bergabung rapat ${g[0]}`, 'Rapat');
                          onToast('Anda bergabung. Kehadiran tercatat.');
                        }}
                        className={joined ? btnPrimaryCls : btnGhostCls}
                      >
                        {joined ? '✓ Sudah bergabung' : 'Gabung rapat'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const txt = `RISALAH RAPAT — ${g[1]}
Tanggal : ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
Waktu   : ${hhmm(g[2])}–${hhmm(g[3])} WIB · ${ROOM_LABELS[g[4]] || g[4]}
Peserta : ${hadirNames}
Notulis : ${member.nama} (${member.jabatan})

AGENDA
- ${g[6]}

PEMBAHASAN
1. Agenda dibuka pukul ${hhmm(g[2])}. Setiap peserta menyampaikan status pekerjaan.
2. Keputusan yang diambil dicatat dan dibagikan ke kanal terkait maksimal 1 jam setelah rapat.
3. Hal yang belum selesai dibawa ke rapat berikutnya.

KEPUTUSAN
- (diisi saat rapat berlangsung)

TINDAK LANJUT
- PIC dan tenggat ditetapkan per butir keputusan.

Risalah ini disusun otomatis oleh Kantor AI dan menunggu pengesahan ${member.jabatan}.`;
                          setRisalahId((prev) => ({ ...prev, [g[0]]: txt }));
                          onLog(`Membuat risalah ${g[1]}`, 'Rapat');
                        }}
                        className={btnGhostCls}
                      >
                        Buat risalah
                      </button>
                    </div>
                    {risalahId[g[0]] && (
                      <pre className="mt-3 bg-[#0b1220] border border-[#22365c] rounded-lg p-3 text-[11px] font-mono text-[#cfe0ff] whitespace-pre-wrap">
                        {risalahId[g[0]]}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 8. CUTI & IZIN */}
        {activeMod === 'cuti' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-[14px] font-semibold text-[#e8eefc]">Cuti &amp; Izin</h4>
              <p className="text-xs text-[#9fb0d0]">
                Pengajuan masuk antrean atasan langsung. Saldo cuti tahunan{' '}
                <b className="text-[#38bdf8]">
                  {(O.saldo as Record<string, number>)[member.id] ?? '—'}
                </b>{' '}
                hari.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const no = `C-2611-${String(cuti.length + 1).padStart(2, '0')}`;
                setCuti((prev) => [
                  ...prev,
                  [no, member.id, cutiJenis, cutiDari, cutiSampai, cutiAlasan.trim() || '—', 'Menunggu'],
                ]);
                setCutiAlasan('');
                onLog(`Mengajukan ${cutiJenis} (${no})`, 'Cuti');
                onToast(`Pengajuan ${no} dikirim ke atasan.`);
              }}
              className="flex flex-wrap gap-2"
            >
              <select
                value={cutiJenis}
                onChange={(e) => setCutiJenis(e.target.value)}
                className={inputCls}
              >
                <option>Cuti tahunan</option>
                <option>Izin</option>
                <option>Sakit</option>
              </select>
              <input
                type="date"
                value={cutiDari}
                onChange={(e) => setCutiDari(e.target.value)}
                className={inputCls}
              />
              <input
                type="date"
                value={cutiSampai}
                onChange={(e) => setCutiSampai(e.target.value)}
                className={inputCls}
              />
              <input
                value={cutiAlasan}
                onChange={(e) => setCutiAlasan(e.target.value)}
                placeholder="Alasan"
                className={`${inputCls} flex-1 min-w-[180px]`}
              />
              <button type="submit" className={btnPrimaryCls}>
                Ajukan
              </button>
            </form>
            <div className="overflow-x-auto border border-[#22365c] rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#131f36] text-[#9fb0d0] border-b border-[#22365c]">
                    <th className="px-3 py-2 font-semibold">No</th>
                    <th className="px-3 py-2 font-semibold">Pemohon</th>
                    <th className="px-3 py-2 font-semibold">Jenis</th>
                    <th className="px-3 py-2 font-semibold">Dari</th>
                    <th className="px-3 py-2 font-semibold">Sampai</th>
                    <th className="px-3 py-2 font-semibold">Alasan</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2b4a]">
                  {cuti.map((c, idx) => {
                    const pemohon = O.members.find((m) => m.id === c[1])?.nama || c[1];
                    const canApprove = member.akses.includes('kelola');
                    return (
                      <tr key={c[0]} className="hover:bg-[#131f36]/60">
                        <td className="px-3 py-2 font-mono tabular-nums text-[#38bdf8]">{c[0]}</td>
                        <td className="px-3 py-2 text-[#e8eefc]">{pemohon}</td>
                        <td className="px-3 py-2 text-[#cfe0ff]">{c[2]}</td>
                        <td className="px-3 py-2 font-mono tabular-nums text-[#9fb0d0]">{c[3]}</td>
                        <td className="px-3 py-2 font-mono tabular-nums text-[#9fb0d0]">{c[4]}</td>
                        <td className="px-3 py-2 text-[#cfe0ff]">{c[5]}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            disabled={!canApprove}
                            onClick={() => {
                              if (!canApprove) return;
                              setCuti((prev) =>
                                prev.map((row, rIdx) => {
                                  if (rIdx !== idx) return row;
                                  const next = row[6] === 'Disetujui' ? 'Ditolak' : 'Disetujui';
                                  onLog(`Memutuskan ${row[0]} -> ${next}`, 'Cuti');
                                  return [...row.slice(0, 6), next];
                                })
                              );
                            }}
                            className={`px-2 py-0.5 rounded text-[10.5px] font-semibold border ${
                              canApprove ? 'cursor-pointer' : 'cursor-default'
                            } ${
                              c[6] === 'Disetujui'
                                ? 'bg-[#0e2b23] border-[#175c49] text-[#6ee7b7]'
                                : c[6] === 'Ditolak'
                                  ? 'bg-[#2b1414] border-[#5b2c2c] text-[#fca5a5]'
                                  : 'bg-[#2a220e] border-[#5c4814] text-[#fbbf24]'
                            }`}
                          >
                            {c[6]}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. HELPDESK */}
        {activeMod === 'tiket' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-[14px] font-semibold text-[#e8eefc]">
                Helpdesk fasilitas &amp; IT
              </h4>
              <p className="text-xs text-[#9fb0d0]">
                Keluhan masuk, ditugaskan ke teknisi internal atau vendor. SLA: Mendesak 4 jam,
                sedang 1 hari, rendah 3 hari.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!tiketKeluhan.trim()) {
                  onToast('Keluhan wajib diisi.', true);
                  return;
                }
                const no = `HD-${String(45 + tiket.length - 4).padStart(3, '0')}`;
                setTiket((prev) => [
                  ...prev,
                  [
                    no,
                    tiketKat,
                    tiketKeluhan.trim(),
                    tiketLokasi.trim() || '—',
                    tiketPrioritas,
                    'Teknisi internal',
                    'Baru',
                  ],
                ]);
                setTiketKeluhan('');
                setTiketLokasi('');
                onLog(`Membuat tiket ${no}`, 'Helpdesk');
              }}
              className="flex flex-wrap gap-2"
            >
              <select
                value={tiketKat}
                onChange={(e) => setTiketKat(e.target.value)}
                className={inputCls}
              >
                <option>AC</option>
                <option>Listrik</option>
                <option>IT</option>
                <option>Kebersihan</option>
                <option>Keamanan</option>
              </select>
              <input
                value={tiketKeluhan}
                onChange={(e) => setTiketKeluhan(e.target.value)}
                placeholder="Keluhan"
                className={`${inputCls} flex-[2] min-w-[200px]`}
              />
              <input
                value={tiketLokasi}
                onChange={(e) => setTiketLokasi(e.target.value)}
                placeholder="Lokasi"
                className={`${inputCls} flex-1 min-w-[120px]`}
              />
              <select
                value={tiketPrioritas}
                onChange={(e) => setTiketPrioritas(e.target.value)}
                className={inputCls}
              >
                <option>Rendah</option>
                <option>Sedang</option>
                <option>Tinggi</option>
              </select>
              <button type="submit" className={btnPrimaryCls}>
                Buat tiket
              </button>
            </form>
            <div className="overflow-x-auto border border-[#22365c] rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#131f36] text-[#9fb0d0] border-b border-[#22365c]">
                    <th className="px-3 py-2 font-semibold">No</th>
                    <th className="px-3 py-2 font-semibold">Kategori</th>
                    <th className="px-3 py-2 font-semibold">Keluhan</th>
                    <th className="px-3 py-2 font-semibold">Lokasi</th>
                    <th className="px-3 py-2 font-semibold">Prioritas</th>
                    <th className="px-3 py-2 font-semibold">Ditugaskan</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2b4a]">
                  {tiket.map((t, idx) => (
                    <tr key={t[0]} className="hover:bg-[#131f36]/60">
                      <td className="px-3 py-2 font-mono tabular-nums text-[#38bdf8]">{t[0]}</td>
                      <td className="px-3 py-2 text-[#cfe0ff]">{t[1]}</td>
                      <td className="px-3 py-2 text-[#e8eefc]">{t[2]}</td>
                      <td className="px-3 py-2 text-[#9fb0d0]">{t[3]}</td>
                      <td className="px-3 py-2 text-[#cfe0ff]">{t[4]}</td>
                      <td className="px-3 py-2 text-[#9fb0d0]">{t[5]}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => {
                            setTiket((prev) =>
                              prev.map((row, rIdx) => {
                                if (rIdx !== idx) return row;
                                const next =
                                  row[6] === 'Baru'
                                    ? 'Proses'
                                    : row[6] === 'Proses'
                                      ? 'Selesai'
                                      : 'Baru';
                                onLog(`Tiket ${row[0]} -> ${next}`, 'Helpdesk');
                                return [...row.slice(0, 6), next];
                              })
                            );
                          }}
                          className={`px-2 py-0.5 rounded text-[10.5px] font-semibold border cursor-pointer ${
                            t[6] === 'Selesai'
                              ? 'bg-[#0e2b23] border-[#175c49] text-[#6ee7b7]'
                              : t[6] === 'Proses'
                                ? 'bg-[#2a220e] border-[#5c4814] text-[#fbbf24]'
                                : 'bg-[#182845] border-[#22365c] text-[#38bdf8]'
                          }`}
                        >
                          {t[6]}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 10. BUKU TAMU */}
        {activeMod === 'tamu' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-[14px] font-semibold text-[#e8eefc]">Buku tamu</h4>
              <p className="text-xs text-[#9fb0d0]">
                Tamu wajib dicatat; yang masih di dalam gedung ditandai. Tamu hanya boleh berada di
                Ruang Tamu.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!tamuNama.trim()) {
                  onToast('Nama tamu wajib diisi.', true);
                  return;
                }
                const no = `T-${String(tamu.length + 1).padStart(3, '0')}`;
                setTamu((prev) => [
                  ...prev,
                  [
                    no,
                    tamuNama.trim(),
                    tamuInstansi.trim() || '—',
                    tamuTujuan.trim() || '—',
                    hhmm(nowMin),
                    '',
                    member.id,
                  ],
                ]);
                onLog(`Mencatat tamu ${tamuNama.trim()}`, 'Buku Tamu');
                onToast(`Tamu ${tamuNama.trim()} dicatat.`);
                setTamuNama('');
                setTamuInstansi('');
                setTamuTujuan('');
              }}
              className="flex flex-wrap gap-2"
            >
              <input
                value={tamuNama}
                onChange={(e) => setTamuNama(e.target.value)}
                placeholder="Nama tamu"
                className={`${inputCls} flex-1 min-w-[140px]`}
              />
              <input
                value={tamuInstansi}
                onChange={(e) => setTamuInstansi(e.target.value)}
                placeholder="Instansi"
                className={`${inputCls} flex-1 min-w-[140px]`}
              />
              <input
                value={tamuTujuan}
                onChange={(e) => setTamuTujuan(e.target.value)}
                placeholder="Tujuan / bertemu siapa"
                className={`${inputCls} flex-[2] min-w-[180px]`}
              />
              <button type="submit" className={btnPrimaryCls}>
                Catat kedatangan
              </button>
            </form>
            <div className="overflow-x-auto border border-[#22365c] rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#131f36] text-[#9fb0d0] border-b border-[#22365c]">
                    <th className="px-3 py-2 font-semibold">No</th>
                    <th className="px-3 py-2 font-semibold">Nama</th>
                    <th className="px-3 py-2 font-semibold">Instansi</th>
                    <th className="px-3 py-2 font-semibold">Tujuan</th>
                    <th className="px-3 py-2 font-semibold">Masuk</th>
                    <th className="px-3 py-2 font-semibold">Keluar</th>
                    <th className="px-3 py-2 font-semibold">Host</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2b4a]">
                  {tamu.map((t, idx) => (
                    <tr key={t[0]} className="hover:bg-[#131f36]/60">
                      <td className="px-3 py-2 font-mono tabular-nums text-[#38bdf8]">{t[0]}</td>
                      <td className="px-3 py-2 font-semibold text-[#e8eefc]">{t[1]}</td>
                      <td className="px-3 py-2 text-[#cfe0ff]">{t[2]}</td>
                      <td className="px-3 py-2 text-[#9fb0d0]">{t[3]}</td>
                      <td className="px-3 py-2 font-mono tabular-nums text-[#cfe0ff]">{t[4]}</td>
                      <td className="px-3 py-2 font-mono tabular-nums text-[#9fb0d0]">
                        {t[5] || '—'}
                      </td>
                      <td className="px-3 py-2 font-mono text-[#9fb0d0]">{t[6]}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => {
                            setTamu((prev) =>
                              prev.map((row, rIdx) => {
                                if (rIdx !== idx) return row;
                                const nextOut = row[5] ? '' : hhmm(nowMin);
                                onLog(
                                  `Tamu ${row[1]}${nextOut ? ' keluar' : ' masuk kembali'}`,
                                  'Buku Tamu'
                                );
                                return [row[0], row[1], row[2], row[3], row[4], nextOut, row[6]];
                              })
                            );
                          }}
                          className={`px-2 py-0.5 rounded text-[10.5px] font-semibold border cursor-pointer ${
                            t[5]
                              ? 'bg-[#182845] border-[#22365c] text-[#9fb0d0]'
                              : 'bg-[#0e2b23] border-[#175c49] text-[#6ee7b7]'
                          }`}
                        >
                          {t[5] ? 'Sudah keluar' : 'Masih di dalam'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 11. PENGUMUMAN */}
        {activeMod === 'pengumuman' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-[14px] font-semibold text-[#e8eefc]">Pengumuman internal</h4>
              <p className="text-xs text-[#9fb0d0]">
                Tampil untuk semua anggota; yang mendesak ditandai merah.
              </p>
            </div>
            {member.akses.includes('kelola') && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!pengJudul.trim()) {
                    onToast('Judul wajib diisi.', true);
                    return;
                  }
                  const no = `P-${String(peng.length + 1).padStart(2, '0')}`;
                  setPeng((prev) => [
                    [
                      no,
                      pengJudul.trim(),
                      pengIsi.trim() || '—',
                      pengUrg,
                      member.id,
                      new Date().toISOString().slice(0, 10),
                    ],
                    ...prev,
                  ]);
                  onLog(`Memasang pengumuman: ${pengJudul.trim()}`, 'Pengumuman');
                  setPengJudul('');
                  setPengIsi('');
                }}
                className="flex flex-wrap gap-2"
              >
                <input
                  value={pengJudul}
                  onChange={(e) => setPengJudul(e.target.value)}
                  placeholder="Judul"
                  className={`${inputCls} flex-1 min-w-[160px]`}
                />
                <input
                  value={pengIsi}
                  onChange={(e) => setPengIsi(e.target.value)}
                  placeholder="Isi pengumuman"
                  className={`${inputCls} flex-[3] min-w-[220px]`}
                />
                <select
                  value={pengUrg}
                  onChange={(e) => setPengUrg(e.target.value)}
                  className={inputCls}
                >
                  <option>Biasa</option>
                  <option>Penting</option>
                  <option>Mendesak</option>
                </select>
                <button type="submit" className={btnPrimaryCls}>
                  Pasang
                </button>
              </form>
            )}
            <div className="space-y-2">
              {peng.map((g) => (
                <div
                  key={g[0]}
                  className={`rounded-lg border p-3 ${
                    g[3] === 'Mendesak'
                      ? 'bg-[#2b1414] border-[#5b2c2c]'
                      : 'bg-[#131f36] border-[#22365c]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <b className="text-[13px] text-[#e8eefc]">{g[1]}</b>
                    <span
                      className={`px-2 py-0.5 rounded text-[10.5px] font-semibold border ${
                        g[3] === 'Mendesak'
                          ? 'bg-[#3b1a1a] border-[#7f1d1d] text-[#fca5a5]'
                          : g[3] === 'Penting'
                            ? 'bg-[#2a220e] border-[#5c4814] text-[#fbbf24]'
                            : 'bg-[#182845] border-[#22365c] text-[#9fb0d0]'
                      }`}
                    >
                      {g[3]}
                    </span>
                  </div>
                  <div className="text-[10.5px] font-mono text-[#9fb0d0] mt-0.5">
                    {g[4]} · {g[5]}
                  </div>
                  <div className="text-xs text-[#cfe0ff] mt-1.5">{g[2]}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 12. KALENDER */}
        {activeMod === 'kalender' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-[14px] font-semibold text-[#e8eefc]">
                Kalender — {calNow.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </h4>
              <p className="text-xs text-[#9fb0d0]">
                Menggabungkan agenda rapat, tenggat proyek, dan hari ini.
              </p>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((d, i) => (
                <div
                  key={i}
                  className="py-1 text-[10.5px] font-bold text-[#9fb0d0] bg-[#131f36] rounded"
                >
                  {d}
                </div>
              ))}
              {Array.from({ length: firstDow }).map((_, i) => (
                <div key={`empty-${i}`} className="h-16 rounded bg-[#0b1220]/50" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dd = idx + 1;
                const tgl = `${calY}-${String(calM + 1).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
                const events: string[] = [];
                if (dd === calToday) events.push('hari ini');
                projects.forEach((p) => {
                  if (p[3] === tgl) events.push(`tenggat: ${p[0].slice(0, 14)}`);
                });
                if (dd % 7 === 3) events.push('rapat investasi');
                return (
                  <div
                    key={dd}
                    className={`min-h-16 rounded border p-1.5 text-left ${
                      dd === calToday
                        ? 'bg-[#122b3e] border-[#38bdf8]'
                        : 'bg-[#131f36] border-[#22365c]'
                    }`}
                  >
                    <div className="text-[11px] font-bold font-mono tabular-nums text-[#e8eefc]">
                      {dd}
                    </div>
                    <div className="space-y-0.5 mt-1">
                      {events.slice(0, 2).map((ev, eIdx) => (
                        <div
                          key={eIdx}
                          className="text-[9.5px] leading-tight px-1 py-0.5 rounded bg-[#182845] text-[#38bdf8] truncate"
                        >
                          {ev}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pt-1 space-y-1.5">
              <div className="text-xs font-bold text-[#e8eefc]">Agenda hari ini</div>
              {O.meets.map((g) => (
                <div
                  key={g[0]}
                  className="bg-[#131f36] border border-[#22365c] rounded-lg px-3 py-2 text-xs"
                >
                  <b className="text-[#e8eefc]">{g[1]}</b>
                  <span className="block text-[11px] font-mono tabular-nums text-[#9fb0d0]">
                    {hhmm(g[2])}–{hhmm(g[3])} · {ROOM_LABELS[g[4]] || g[4]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 13. ARSIP DOKUMEN */}
        {activeMod === 'arsip' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-[14px] font-semibold text-[#e8eefc]">Arsip dokumen</h4>
              <p className="text-xs text-[#9fb0d0]">
                Registrasi dokumen: nomor, jenis, pemilik, tingkat kerahasiaan. Berkas fisik tetap
                di Arsip &amp; Gudang.
              </p>
            </div>
            <input
              value={arsipQuery}
              onChange={(e) => setArsipQuery(e.target.value)}
              placeholder="Cari dokumen…"
              className={`${inputCls} w-full max-w-md`}
            />
            {(() => {
              const q = arsipQuery.toLowerCase().trim();
              const rows = O.arsip.filter(
                (a) => !q || `${a[1]} ${a[2]} ${a[3]}`.toLowerCase().includes(q)
              );
              return (
                <>
                  <div className="overflow-x-auto border border-[#22365c] rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#131f36] text-[#9fb0d0] border-b border-[#22365c]">
                          <th className="px-3 py-2 font-semibold">Kode</th>
                          <th className="px-3 py-2 font-semibold">Dokumen</th>
                          <th className="px-3 py-2 font-semibold">Jenis</th>
                          <th className="px-3 py-2 font-semibold">Unit</th>
                          <th className="px-3 py-2 font-semibold">Tanggal</th>
                          <th className="px-3 py-2 font-semibold">Akses</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1c2b4a]">
                        {rows.map((a) => (
                          <tr key={a[0]} className="hover:bg-[#131f36]/60">
                            <td className="px-3 py-2 font-mono tabular-nums text-[#38bdf8]">
                              {a[0]}
                            </td>
                            <td className="px-3 py-2 text-[#e8eefc]">{a[1]}</td>
                            <td className="px-3 py-2 text-[#cfe0ff]">{a[2]}</td>
                            <td className="px-3 py-2 text-[#9fb0d0]">{a[3]}</td>
                            <td className="px-3 py-2 font-mono tabular-nums text-[#9fb0d0]">
                              {a[4]}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10.5px] font-semibold border ${
                                  a[5] === 'Rahasia'
                                    ? 'bg-[#2b1414] border-[#5b2c2c] text-[#fca5a5]'
                                    : 'bg-[#182845] border-[#22365c] text-[#cfe0ff]'
                                }`}
                              >
                                {a[5]}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-[#9fb0d0]">
                    {rows.length} dari {O.arsip.length} dokumen.
                  </p>
                </>
              );
            })()}
          </div>
        )}

        {/* 14. POLLING */}
        {activeMod === 'polling' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-[14px] font-semibold text-[#e8eefc]">Polling rapat</h4>
              <p className="text-xs text-[#9fb0d0]">{O.poll.tanya}</p>
            </div>
            {(() => {
              const total = pollOptions.reduce((sum, x) => sum + x[1], 0);
              return (
                <div className="space-y-2.5">
                  {pollOptions.map(([optLabel, votes], idx) => {
                    const pct = total ? Math.round((votes / total) * 100) : 0;
                    return (
                      <div
                        key={optLabel}
                        className="bg-[#131f36] border border-[#22365c] rounded-lg p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-medium text-[#e8eefc]">{optLabel}</span>
                          <b className="font-mono tabular-nums text-[#38bdf8]">
                            {votes} suara ({pct}%)
                          </b>
                        </div>
                        <div className="h-2 bg-[#0b1220] rounded overflow-hidden">
                          <div className="h-full bg-[#38bdf8]" style={{ width: `${pct}%` }} />
                        </div>
                        {!pollVoted && (
                          <button
                            type="button"
                            onClick={() => {
                              setPollOptions((prev) =>
                                prev.map((row, rIdx) => (rIdx === idx ? [row[0], row[1] + 1] : row))
                              );
                              setPollVoted(true);
                              onLog(`Memilih opsi polling: ${optLabel}`, 'Polling');
                            }}
                            className={btnGhostCls}
                          >
                            Pilih
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <p className="text-[11px] text-[#9fb0d0]">
                    {pollVoted
                      ? 'Suara Anda tercatat. Suara tidak dapat diubah.'
                      : 'Satu suara per akun, tercatat di log.'}
                  </p>
                </div>
              );
            })()}
          </div>
        )}

        {/* 15. SHIFT & LEMBUR */}
        {activeMod === 'shift' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-[14px] font-semibold text-[#e8eefc]">Shift &amp; lembur</h4>
              <p className="text-xs text-[#9fb0d0]">
                Shift dipakai untuk sekuriti, OB, dan resepsionis. Lembur dihitung dari selisih jam
                absen terhadap 8 jam kerja.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {O.shift.map((s) => (
                <div
                  key={s[0]}
                  className="bg-[#131f36] border border-[#22365c] rounded-lg p-3 text-xs"
                >
                  <div className="font-bold text-[#38bdf8]">Shift {s[0]}</div>
                  <div className="font-semibold text-[#e8eefc] mt-1">{s[1]}</div>
                  <div className="text-[11px] text-[#9fb0d0] mt-0.5">{s[2]}</div>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto border border-[#22365c] rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#131f36] text-[#9fb0d0] border-b border-[#22365c]">
                    <th className="px-3 py-2 font-semibold">Anggota</th>
                    <th className="px-3 py-2 font-semibold">Jabatan</th>
                    <th className="px-3 py-2 font-semibold">Masuk</th>
                    <th className="px-3 py-2 font-semibold">Keluar</th>
                    <th className="px-3 py-2 font-semibold">Jam kerja</th>
                    <th className="px-3 py-2 font-semibold">Lembur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2b4a]">
                  {O.members.map((m) => {
                    const r = att[m.id] || { in: null, out: null };
                    const jam =
                      r.in != null && r.out != null
                        ? ((r.out - r.in) / 60).toFixed(1)
                        : r.in != null
                          ? Math.max(0, (nowMin - r.in) / 60).toFixed(1)
                          : '—';
                    const lb =
                      r.in != null && r.out != null
                        ? Math.max(0, (r.out - r.in) / 60 - 8).toFixed(1)
                        : '0.0';
                    return (
                      <tr key={m.id} className="hover:bg-[#131f36]/60">
                        <td className="px-3 py-2 font-semibold text-[#e8eefc]">{m.nama}</td>
                        <td className="px-3 py-2 text-[#9fb0d0]">{m.jabatan}</td>
                        <td className="px-3 py-2 font-mono tabular-nums text-[#cfe0ff]">
                          {r.in != null ? hhmm(r.in) : '—'}
                        </td>
                        <td className="px-3 py-2 font-mono tabular-nums text-[#cfe0ff]">
                          {r.out != null ? hhmm(r.out) : '—'}
                        </td>
                        <td className="px-3 py-2 font-mono tabular-nums text-[#34d399]">{jam}</td>
                        <td className="px-3 py-2 font-mono tabular-nums text-[#fbbf24]">{lb}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 16. TANDA TANGAN DIGITAL */}
        {activeMod === 'ttd' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-[14px] font-semibold text-[#e8eefc]">Tanda tangan digital</h4>
              <p className="text-xs text-[#9fb0d0]">
                Antrean dokumen yang menunggu tanda tangan pejabat. Setiap tanda tangan menghasilkan
                sidik (hash) dan tercatat di log.
              </p>
            </div>
            {!member.akses.includes('ttd') && (
              <p className="text-xs text-[#fbbf24]">
                Jabatan Anda tidak berwenang menandatangani; hanya dapat melihat antrean.
              </p>
            )}
            <div className="overflow-x-auto border border-[#22365c] rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#131f36] text-[#9fb0d0] border-b border-[#22365c]">
                    <th className="px-3 py-2 font-semibold">No</th>
                    <th className="px-3 py-2 font-semibold">Dokumen</th>
                    <th className="px-3 py-2 font-semibold">Penanda tangan</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 font-semibold">Sidik</th>
                    <th className="px-3 py-2 font-semibold" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2b4a]">
                  {ttd.map((t, idx) => {
                    const boleh = member.akses.includes('ttd');
                    const signed = t[3].includes('Sudah');
                    return (
                      <tr key={t[0]} className="hover:bg-[#131f36]/60">
                        <td className="px-3 py-2 font-mono tabular-nums text-[#38bdf8]">{t[0]}</td>
                        <td className="px-3 py-2 text-[#e8eefc]">{t[1]}</td>
                        <td className="px-3 py-2 text-[#cfe0ff]">{t[2]}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10.5px] font-semibold border ${
                              signed
                                ? 'bg-[#0e2b23] border-[#175c49] text-[#6ee7b7]'
                                : 'bg-[#2a220e] border-[#5c4814] text-[#fbbf24]'
                            }`}
                          >
                            {t[3]}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono tabular-nums text-[#9fb0d0]">
                          {t[4] || '—'}
                        </td>
                        <td className="px-3 py-2">
                          {boleh && !signed && (
                            <button
                              type="button"
                              onClick={() => {
                                const hash = `${Math.random().toString(16).slice(2, 6)}…${Math.random()
                                  .toString(16)
                                  .slice(2, 5)}`;
                                setTtd((prev) =>
                                  prev.map((row, rIdx) =>
                                    rIdx === idx
                                      ? [row[0], row[1], row[2], 'Sudah ditandatangani', hash]
                                      : row
                                  )
                                );
                                onLog(`Menandatangani ${t[0]} oleh ${member.nama}`, 'Tanda Tangan');
                                onToast(`Dokumen ditandatangani. Sidik ${hash} dicatat.`);
                              }}
                              className={btnPrimaryCls}
                            >
                              Tandatangani
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 17. LOG AUDIT */}
        {activeMod === 'log' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-[14px] font-semibold text-[#e8eefc]">Log audit</h4>
              <p className="text-xs text-[#9fb0d0]">
                Semua aksi tercatat: masuk, buka modul, tolak akses, kirim pesan, buat surat,
                laporan, ubah status proyek. Disimpan 10 tahun dan tidak dapat diubah.
              </p>
            </div>
            <div className="bg-[#0b1220] border border-[#22365c] rounded-lg divide-y divide-[#1c2b4a] max-h-[340px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="p-4 text-xs text-[#9fb0d0]">Belum ada catatan.</div>
              ) : (
                logs.map((entry, i) => (
                  <div key={`${entry.t}-${i}`} className="px-3 py-2 text-xs flex flex-wrap gap-2">
                    <span className="font-mono tabular-nums text-[#38bdf8] shrink-0">
                      {entry.t} · {entry.modul}
                    </span>
                    <span className="text-[#cfe0ff]">
                      <b className="text-[#e8eefc]">{entry.who}</b> — {entry.aksi}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
