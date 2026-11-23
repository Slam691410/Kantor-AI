import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PORTAL_DATA } from '../data/portalData';
import type { AbsenItem, UserPublic } from '../types';
import { canAccessSection } from '../utils/format';
import type { DrawerSelection } from './DetailDrawer';
import {
  KANTOR_MODS,
  KantorModulesPane,
  type KantorAttRecord,
  type KantorAttRow,
  type KantorLogEntry,
  type KantorMember,
  type KantorModKey,
} from './KantorModulesPane';
import { GeminiAssistPanel } from './GeminiAssistPanel';
import {
  GoogleWorkspacePanel,
  type WorkspacePrefillDraft,
  type WorkspaceSubTab,
} from './GoogleWorkspacePanel';
import { LoginView } from './LoginView';
import {
  SISTEM_SUB_TABS,
  SistemKerjaPanel,
  type SistemSubSection,
} from './SistemKerjaView';

interface KantorAiViewProps {
  token: string | null;
  user: UserPublic | null;
  prefillMemberId: string | null;
  onLoginSuccess: (token: string, user: UserPublic) => void;
  onLogout: () => void;
  onSessionExpired: () => void;
  onOpenDrawer: (sel: DrawerSelection) => void;
  onNotify: (msg: string, isError?: boolean) => void;
}

type FurnTuple = readonly [number, number, number, number, number, string];
type RoomDef = { k: string; n: string; x: number; y: number; w: number; d: number; f: string; type: string };
type SeatCoord = { x: number; y: number; i?: number };

interface SceneChar {
  id: string;
  nama: string;
  warna: string;
  floor: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  home: SeatCoord;
  path: Array<{ x: number; y: number }> | null;
  phase: number;
  sit: boolean;
  sitTarget: boolean;
  away: boolean;
  staff?: boolean;
  cap?: boolean;
  route?: ReadonlyArray<readonly [number, number]>;
  cycle?: number;
  wp?: number;
  nextAt?: number;
  skin: string;
  hair: string;
}

interface SceneAI {
  id: string;
  nama: string;
  floor: number;
  x: number;
  y: number;
  phase: number;
}

type DetailCard =
  | { kind: 'hint'; text: string }
  | { kind: 'person'; id: string }
  | { kind: 'tasks'; id: string }
  | { kind: 'ai'; id: string }
  | { kind: 'staff'; id: string }
  | { kind: 'room'; roomKey: string; roomName: string; floorName: string };

const TW = 64;
const TH = 32;
const SPEED = 3.4;
const GRID_W = 26;
const GRID_H = 20;
const HI_LOG_STORAGE_KEY = 'hi_log_v1';
const SKIN = ['#e8b98f', '#d9a273', '#c88b5e', '#f2cba6', '#b97a4e'];
const HAIR = ['#2b2b33', '#3d2c22', '#51402f', '#1d1f27', '#5b4636'];
const FLOOR_PALETTE: Record<string, [string, string]> = {
  wood: ['#f2e6d2', '#ece0ca'],
  carpet: ['#dde6f3', '#d6e0ee'],
  tile: ['#eef2f7', '#e8eef6'],
  server: ['#dfe5ee', '#d8dfea'],
};

const STAFF_INFO: Record<string, [string, string]> = {
  ST1: [
    'Satpam',
    'Sekuriti 24 jam, 3 shift x 8 jam — pekerjaan alih daya (sheet B13). Pos: lobi, koridor, gudang.',
  ],
  ST2: [
    'Resepsionis',
    'Front office 07:00-16:00 — in-house. Menerima tamu, menerima surat & paket, mengarahkan vendor.',
  ],
  ST3: [
    'Kurir',
    'Antar-jemput dokumen 08:00-17:00 — alih daya. Rute: kantor, notaris, bank, PPAT/BPN.',
  ],
  ST4: [
    'OB / Cleaning',
    'Kebersihan & kenyamanan 05:00-14:00 — alih daya. Menyapu, mengepel, membuang sampah, menyiapkan ruang rapat.',
  ],
};

const REPLIES: Record<string, string[]> = {
  umum: [
    'Noted. Saya teruskan ke tim terkait.',
    'Baik, besok pagi saya bawa ke apel.',
    'Sudah saya cek, tidak ada benturan jadwal.',
  ],
  investasi: [
    'Order tercatat di blotter, konfirmasi kustodian menyusul.',
    'Sudah saya masukkan ke agenda rapat investasi.',
    'Data yield-nya saya kirim lewat surat internal ya.',
  ],
  'ga-fasilitas': [
    'Teknisi saya jadwalkan besok 08:00.',
    'Stok sudah saya pesan, datang Kamis.',
    'Kurir sudah berangkat, ETA 45 menit.',
  ],
  kepatuhan: [
    'Saya siapkan draf jawabannya, mohon dicek sebelum dikirim.',
    'Dokumen pendukung saya unggah ke arsip kepatuhan.',
    'Perlu persetujuan Direktur untuk poin 3.',
  ],
  'vendor-eksternal': [
    'Terima kasih, penawaran kami tetap berlaku 14 hari.',
    'Kami bisa mulai 1 Desember, tim 2 orang shift malam.',
  ],
};

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

function shadeHex(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round(((n >> 16) & 255) * factor));
  const g = Math.min(255, Math.round(((n >> 8) & 255) * factor));
  const b = Math.min(255, Math.round((n & 255) * factor));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function drawRoundedRect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  c.beginPath();
  if (typeof c.roundRect === 'function') {
    c.roundRect(x, y, w, h, r);
    return;
  }
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function seedAttendance(): Record<string, KantorAttRecord> {
  const O = PORTAL_DATA.office;
  const ppl = O.layout.people;
  const absenSeed = O.absen as Record<string, readonly [number | null, number | null]>;
  const map: Record<string, KantorAttRecord> = {};
  ppl.forEach((p, i) => {
    if ('guest' in p && p.guest) {
      map[p.id] = { in: 555, out: 615, guest: true, seed: true };
      return;
    }
    const a = absenSeed[p.id];
    if (a) {
      map[p.id] = { in: a[0], out: a[1], seed: true };
    } else {
      map[p.id] = { in: 460 + ((i * 7) % 24), out: null, seed: true };
    }
  });
  if (map.M4) {
    map.M4 = { ...map.M4, izin: true };
  }
  [10, 19].forEach((idx) => {
    const p = ppl[idx];
    if (p && !('guest' in p && p.guest) && map[p.id] && map[p.id].out == null) {
      map[p.id] = { in: null, out: null, izin: true };
    }
  });
  return map;
}

function deriveKantorMember(user: UserPublic | null): KantorMember | null {
  if (!user) return null;
  const members = PORTAL_DATA.office.members;
  const exact = members.find((m) => m.id === user.ID);
  if (exact) {
    return exact as unknown as KantorMember;
  }
  // Map Pemilik/OWN1 to M1 access or fallback by tier
  if (user.Tier === 'Pemilik') {
    const m1 = members[0];
    return {
      ...(m1 as unknown as KantorMember),
      id: user.ID,
      nama: user.Nama,
      jabatan: user.Jabatan,
      unit: user.Unit,
      tier: user.Tier,
    };
  }
  const tierAccess: Record<string, string[]> = {
    Manajemen: ['absen', 'kom', 'surat', 'laporan', 'proyek', 'rapat', 'log', 'cuti', 'kalender', 'arsip', 'polling', 'tugas', 'tiket', 'ttd', 'pengumuman'],
    Staf: ['absen', 'kom', 'surat', 'proyek', 'rapat', 'cuti', 'kalender', 'tugas', 'pengumuman', 'polling'],
    Auditor: ['laporan', 'surat', 'log', 'arsip'],
    Tamu: ['kom', 'surat'],
    Freelancer: ['tugas', 'kom', 'proyek', 'kalender', 'arsip'],
  };
  return {
    id: user.ID,
    tier: user.Tier,
    nama: user.Nama,
    jabatan: user.Jabatan,
    unit: user.Unit,
    warna: '#38bdf8',
    ruang: 'proyek',
    akses: tierAccess[user.Tier] || ['kom', 'tugas'],
    tugas: members[2]?.tugas || [],
  };
}

export const KantorAiView: React.FC<KantorAiViewProps> = ({
  token,
  user,
  prefillMemberId,
  onLoginSuccess,
  onLogout,
  onSessionExpired,
  onOpenDrawer,
  onNotify,
}) => {
  const O = PORTAL_DATA.office;
  const floors = O.layout.floors;
  const people = O.layout.people;
  const LABEL = O.label as Record<string, string>;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [floorIdx, setFloorIdx] = useState(0);
  const [simRunning, setSimRunning] = useState(false);
  const [simMin, setSimMin] = useState(475);
  const [nowTick, setNowTick] = useState(0);

  const officeMember = useMemo(() => deriveKantorMember(user), [user]);
  const [workspaceMode, setWorkspaceMode] = useState<'sistem' | 'kantor' | 'gemini' | 'workspace'>('sistem');
  const [serverSection, setServerSection] = useState<SistemSubSection>('dashboard');
  const [selectedAiAgentId, setSelectedAiAgentId] = useState<string | null>('AG-01');
  const [workspacePrefill, setWorkspacePrefill] = useState<WorkspacePrefillDraft | null>(null);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [serverLoading, setServerLoading] = useState(false);

  const [activeMod, setActiveMod] = useState<KantorModKey>('kom');
  const [activeChan, setActiveChan] = useState<string>('umum');
  const [localPrefillId, setLocalPrefillId] = useState<string | null>(prefillMemberId);
  const [att, setAtt] = useState<Record<string, KantorAttRecord>>(seedAttendance);
  const [chats, setChats] = useState<Record<string, Array<[string, string, number]>>>(() => {
    const out: Record<string, Array<[string, string, number]>> = {};
    const src = O.chats as Record<string, ReadonlyArray<readonly [string, string, number]>>;
    Object.keys(src).forEach((k) => {
      out[k] = src[k].map((row) => [row[0], row[1], row[2]]);
    });
    return out;
  });
  const [logs, setLogs] = useState<KantorLogEntry[]>(() => {
    try {
      const raw = localStorage.getItem(HI_LOG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.slice(0, 300);
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });
  const [detailCard, setDetailCard] = useState<DetailCard>({
    kind: 'hint',
    text: 'Pilih ruangan, karyawan, staf, atau agent AI pada denah atau daftar kehadiran untuk melihat detail.',
  });

  // Lookup room names per floor
  const roomNamesMap = useMemo(() => {
    const m: Record<string, string> = {};
    floors.forEach((f, fi) => {
      f.rooms.forEach((r) => {
        m[`${fi}|${r.k}`] = r.n;
      });
    });
    return m;
  }, [floors]);

  const getRoomName = useCallback(
    (p: { unit: string; floor: number }) => {
      const k = (p.unit.split(' · ')[0] || '').trim();
      return roomNamesMap[`${p.floor || 0}|${k}`] || floors[p.floor || 0]?.nama || '—';
    },
    [roomNamesMap, floors]
  );

  // Refs synced with reactive state for 60fps canvas animation
  const floorIdxRef = useRef(0);
  const meIdRef = useRef<string | null>(null);
  const simMinRef = useRef(475);
  const simRunningRef = useRef(false);
  const attRef = useRef<Record<string, KantorAttRecord>>(att);
  const briefedRef = useRef(false);
  const seqRef = useRef(0);
  const paneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    floorIdxRef.current = floorIdx;
  }, [floorIdx]);

  useEffect(() => {
    setLocalPrefillId(prefillMemberId);
  }, [prefillMemberId]);

  useEffect(() => {
    meIdRef.current = user?.ID || null;
  }, [user]);

  useEffect(() => {
    simMinRef.current = simMin;
  }, [simMin]);

  useEffect(() => {
    simRunningRef.current = simRunning;
  }, [simRunning]);

  useEffect(() => {
    attRef.current = att;
  }, [att]);

  // 1-second clock tick + optional 1-day preview simulation
  useEffect(() => {
    const id = setInterval(() => {
      setNowTick((x) => x + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!simRunning) return;
    const id = setInterval(() => {
      setSimMin((prev) => {
        const next = prev + 1.6;
        if (next >= 480 && !briefedRef.current) {
          briefedRef.current = true;
          onNotify('08:00 — Apel pagi dimulai di ruang rapat.');
        }
        if (next >= 1080) {
          setSimRunning(false);
          onNotify('Pratinjau selesai: 18:00, kantor kosong.');
          return 1080;
        }
        return next;
      });
    }, 120);
    return () => clearInterval(id);
  }, [simRunning, onNotify]);

  const currentMin = useMemo(() => {
    if (simRunning) return simMin;
    const d = getWibDate();
    return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
  }, [simRunning, simMin, nowTick]);

  // Auto-checkout past 17:00 WIB for non-logged-in seeded staff
  useEffect(() => {
    if (currentMin < 1020) return;
    setAtt((prev) => {
      let changed = false;
      const next = { ...prev };
      people.forEach((p, idx) => {
        if (officeMember && p.id === officeMember.id) return;
        const r = next[p.id];
        if (!r || r.in == null || r.out != null || r.izin || ('guest' in p && p.guest)) return;
        next[p.id] = { ...r, out: 1020 + ((idx * 3) % 30) };
        changed = true;
      });
      return changed ? next : prev;
    });
  }, [currentMin, officeMember, people]);

  const appendLog = useCallback(
    (aksi: string, modul: string, actorName?: string) => {
      const entry: KantorLogEntry = {
        t: hhmm(simRunningRef.current ? simMinRef.current : getWibDate().getHours() * 60 + getWibDate().getMinutes()),
        who: actorName || user?.Nama || 'Tamu',
        aksi,
        modul: modul || '—',
      };
      setLogs((prev) => {
        const next = [entry, ...prev].slice(0, 300);
        try {
          localStorage.setItem(HI_LOG_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore storage quota errors
        }
        return next;
      });
    },
    [user]
  );

  const stateOf = useCallback(
    (p: { id: string; unit: string }, mm: number) => {
      const r = att[p.id];
      if (!r || r.in == null) {
        return { k: null as string | null, a: r && r.izin ? 'Izin' : 'Belum absen' };
      }
      if (r.out != null && mm >= r.out) {
        return { k: null as string | null, a: 'Sudah pulang' };
      }
      const mt = O.meets.find(
        (x) => mm >= x[2] && mm < x[3] && (x[5] as readonly string[]).includes(p.id)
      );
      if (mt) return { k: mt[4] as string, a: 'Rapat' };
      if (mm >= 720 && mm < 780) return { k: 'pantry', a: 'Istirahat' };
      return { k: (p.unit.split(' · ')[0] || '').trim(), a: 'Kerja' };
    },
    [att, O.meets]
  );

  const getAttRow = useCallback(
    (p: { id: string; unit: string; floor: number; guest?: boolean }, _idx: number, mm: number): KantorAttRow => {
      const r = att[p.id] || { in: null, out: null };
      const jamKerja = !(mm < 435 || mm > 1050);
      let st = 'Hadir';
      let cls: 'k' | 'm' | 'r' = 'k';
      if (r.izin) {
        st = 'Izin';
        cls = 'm';
      } else if (r.in == null) {
        st = jamKerja ? 'Belum absen' : 'Di luar jam';
        cls = jamKerja ? 'm' : 'r';
      } else if (r.out != null && mm >= r.out) {
        st = 'Sudah pulang';
        cls = 'r';
      } else if (r.in > 495) {
        st = 'Hadir (terlambat)';
        cls = 'm';
      }
      const st2 = stateOf(p, mm);
      const koor = st2.k
        ? st2.k === 'rapat'
          ? 'Ruang rapat'
          : st2.k === 'pantry'
            ? 'Pantry'
            : getRoomName(p)
        : '—';
      return { a: r, st, cls, koor, jamKerja };
    },
    [att, stateOf, getRoomName]
  );

  const scrollToWorkspace = () => {
    setTimeout(() => {
      paneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleSelectServerSection = (sec: SistemSubSection) => {
    if (!user || !canAccessSection(user.Tier, sec)) {
      onNotify(`Akses ditolak untuk peran ${user?.Tier || 'Tamu'}.`, true);
      return;
    }
    setWorkspaceMode('sistem');
    setServerSection(sec);
    appendLog(`Membuka modul ${sec}`, 'Sistem Kerja');
  };

  const handleSelectKantorMod = (mod: KantorModKey) => {
    if (!officeMember) return;
    if (mod === 'absen') {
      if (user && canAccessSection(user.Tier, 'absen')) {
        handleSelectServerSection('absen');
      } else {
        onNotify('Modul absensi tidak aktif untuk peran ini.', true);
      }
      return;
    }
    if (!officeMember.akses.includes(mod)) {
      const label = LABEL[mod] || mod;
      onNotify(`Akses ditolak: modul ${label} bukan wewenang ${officeMember.jabatan}.`, true);
      appendLog(`AKSES DITOLAK — ${label}`, 'Keamanan');
      return;
    }
    setWorkspaceMode('kantor');
    setActiveMod(mod);
    appendLog(`Membuka ${LABEL[mod] || mod}`, LABEL[mod] || mod);
  };

  const handleOpenChat = (targetId: string) => {
    if (!user || !officeMember) {
      setLocalPrefillId(targetId.startsWith('M') || targetId.startsWith('FL-') || targetId === 'OWN1' ? targetId : null);
      onNotify('Foto Wajah, Maps & OTP Email di bawah dulu untuk memberi instruksi.', true);
      scrollToWorkspace();
      return;
    }
    if (targetId.startsWith('AG-')) {
      setSelectedAiAgentId(targetId);
      setWorkspaceMode('gemini');
      appendLog(`Membuka Asisten Gemini untuk ${targetId}`, 'Asisten AI');
      scrollToWorkspace();
      return;
    }
    if (!officeMember.akses.includes('kom')) {
      onNotify('Akses ditolak: jabatan Anda tidak memegang modul komunikasi.', true);
      appendLog('AKSES DITOLAK — Komunikasi', 'Keamanan');
      return;
    }
    const key = `dm_${targetId}`;
    setChats((prev) => (prev[key] ? prev : { ...prev, [key]: [] }));
    setActiveChan(key);
    setWorkspaceMode('kantor');
    setActiveMod('kom');
    appendLog(`Membuka percakapan dengan ${targetId}`, 'Komunikasi');
    scrollToWorkspace();
  };

  const handleAbsenRecorded = useCallback(
    (item: AbsenItem) => {
      const t = currentMin;
      setAtt((prev) => ({
        ...prev,
        [item.UserID]:
          item.Jenis === 'out'
            ? { ...(prev[item.UserID] || { in: t }), out: t }
            : { in: t, out: null },
      }));
      appendLog(`Absen ${item.Jenis} Wajah + Maps (${item.Lokasi})`, 'Absensi');
    },
    [currentMin, appendLog]
  );

  const handleSendMessage = (chan: string, text: string) => {
    if (!officeMember) return;
    const sentAt = currentMin;
    setChats((prev) => ({
      ...prev,
      [chan]: [...(prev[chan] || []), [officeMember.id, text, sentAt]],
    }));
    appendLog(`Mengirim pesan di ${chan}`, 'Komunikasi');

    const pool = REPLIES[chan] || REPLIES.umum;
    let replySenderId = 'M1';
    if (chan.startsWith('dm_')) {
      replySenderId = chan.slice(3);
    } else {
      const eligible = O.members.filter(
        (m) =>
          m.id !== officeMember.id &&
          m.tier !== 'Tamu' &&
          (m.akses as readonly string[]).includes('kom')
      );
      const picked = eligible[seqRef.current % eligible.length] || O.members[0];
      replySenderId = picked.id;
    }
    const replyText = pool[seqRef.current % pool.length];
    seqRef.current += 1;

    setTimeout(() => {
      setChats((prev) => ({
        ...prev,
        [chan]: [
          ...(prev[chan] || []),
          [replySenderId, replyText, simRunningRef.current ? simMinRef.current : getWibDate().getHours() * 60 + getWibDate().getMinutes()],
        ],
      }));
    }, 1200);
  };

  const clockLabel = useMemo(() => {
    if (simRunning) return `${hhmm(simMin)} WIB`;
    const d = getWibDate();
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  }, [simRunning, simMin, nowTick]);

  const dateLabel = useMemo(() => {
    const d = getWibDate();
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }, [nowTick]);

  const shiftLabel = useMemo(() => {
    if (currentMin < 435) return 'Di luar jam kerja';
    if (currentMin < 480) return 'Datang';
    if (currentMin < 720) return 'Sesi kerja 1';
    if (currentMin < 780) return 'Istirahat';
    if (currentMin < 1020) return 'Sesi kerja 2';
    return 'Serah terima';
  }, [currentMin]);

  // Isometric scene engine
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const chars: SceneChar[] = [
      ...O.layout.people.map((p, i) => ({
        id: p.id,
        nama: p.nama,
        warna: p.warna,
        floor: p.floor || 0,
        x: p.seat.x,
        y: p.seat.y,
        tx: p.seat.x,
        ty: p.seat.y,
        home: p.seat,
        path: null,
        phase: i * 1.7,
        sit: true,
        sitTarget: true,
        away: false,
        skin: SKIN[i % SKIN.length],
        hair: HAIR[i % HAIR.length],
      })),
      ...O.layout.staff.map((s, i) => {
        const start = s.route[0];
        return {
          id: s.id,
          nama: s.nama,
          warna: s.warna,
          staff: true,
          cap: 'cap' in s ? Boolean(s.cap) : false,
          floor: s.floor,
          x: start[0],
          y: start[1],
          tx: start[0],
          ty: start[1],
          home: { x: start[0], y: start[1] },
          route: s.route,
          cycle: s.cycle,
          wp: 0,
          path: null,
          phase: i * 2.1,
          sit: false,
          sitTarget: false,
          away: false,
          skin: SKIN[(i + 2) % SKIN.length],
          hair: HAIR[(i + 1) % HAIR.length],
        };
      }),
    ];

    const aiChars: SceneAI[] = O.layout.agents.map((a, i) => ({
      id: a.id,
      nama: a.nama,
      floor: a.floor,
      x: a.seat.x,
      y: a.seat.y,
      phase: i * 1.3,
    }));

    let dpr = 1;
    let scale = 1;
    let ox = 0;
    let oy = 0;
    let cw = 900;
    let ch = 480;
    let k = 1;
    let hoverId: string | null = null;
    let t0 = 0;
    let rafId = 0;
    let lastLoadedFloor = -1;

    let rooms: readonly RoomDef[] = [];
    let furn: readonly FurnTuple[] = [];
    let meetSeats: readonly SeatCoord[] = [];
    let pantrySeats: readonly SeatCoord[] = [];
    let blocked: number[][] = [];

    const loadFloor = (fi: number) => {
      const f = O.layout.floors[fi];
      if (!f) return;
      lastLoadedFloor = fi;
      rooms = f.rooms as readonly RoomDef[];
      furn = f.furn as readonly FurnTuple[];
      meetSeats = ('meet' in f ? f.meet : []) as readonly SeatCoord[];
      pantrySeats = ('pantry' in f ? f.pantry : []) as readonly SeatCoord[];
      blocked = Array.from({ length: GRID_H }, () => new Array(GRID_W).fill(0));
      furn.forEach((q) => {
        const x0 = Math.floor(q[0]);
        const y0 = Math.floor(q[1]);
        for (let x = x0; x < Math.ceil(q[0] + q[2]); x++) {
          for (let y = y0; y < Math.ceil(q[1] + q[3]); y++) {
            if (blocked[y] && blocked[y][x] !== undefined) blocked[y][x] = 1;
          }
        }
      });
      chars.forEach((c) => {
        c.path = null;
      });
    };

    const isFree = (x: number, y: number) =>
      x >= 0 && y >= 0 && x < GRID_W && y < GRID_H && !blocked[Math.floor(y)][Math.floor(x)];

    const nearestFree = (g: { x: number; y: number }) => {
      if (isFree(g.x, g.y)) return { x: Math.floor(g.x), y: Math.floor(g.y) };
      const bx = Math.floor(g.x);
      const by = Math.floor(g.y);
      for (let r = 1; r <= 3; r++) {
        for (let dx = -r; dx <= r; dx++) {
          for (let dy = -r; dy <= r; dy++) {
            if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
            if (isFree(bx + dx, by + dy)) return { x: bx + dx, y: by + dy };
          }
        }
      }
      return null;
    };

    const bfs = (from: { x: number; y: number }, goal: { x: number; y: number }) => {
      const s = nearestFree(from);
      const g = nearestFree(goal);
      if (!s || !g) return null;
      const key = (x: number, y: number) => y * GRID_W + x;
      const seen: Record<number, number> = { [key(s.x, s.y)]: 1 };
      const prev: Record<number, { x: number; y: number }> = {};
      const q = [s];
      let head = 0;
      const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      while (head < q.length) {
        const n = q[head++];
        if (n.x === g.x && n.y === g.y) break;
        for (const [dx, dy] of dirs) {
          const nx = n.x + dx;
          const ny = n.y + dy;
          const kk = key(nx, ny);
          if (!seen[kk] && isFree(nx, ny)) {
            seen[kk] = 1;
            prev[kk] = { x: n.x, y: n.y };
            q.push({ x: nx, y: ny });
          }
        }
      }
      if (!seen[key(g.x, g.y)]) return null;
      const path: Array<{ x: number; y: number }> = [];
      let cx = g.x;
      let cy = g.y;
      while (!(cx === s.x && cy === s.y)) {
        path.unshift({ x: cx, y: cy });
        const p = prev[key(cx, cy)];
        if (!p) break;
        cx = p.x;
        cy = p.y;
      }
      return path;
    };

    const proj = (gx: number, gy: number) => ({
      x: ((gx - gy) * TW) / 2 + ox,
      y: ((gx + gy) * TH) / 2 + oy,
    });

    const resize = () => {
      const rect = cv.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cw = Math.max(320, rect.width || 880);
      ch = Math.max(300, rect.height || 460);
      cv.width = Math.round(cw * dpr);
      cv.height = Math.round(ch * dpr);
      const worldW = ((GRID_W + GRID_H) * TW) / 2;
      const worldH = ((GRID_W + GRID_H) * TH) / 2;
      scale = Math.min(cw / (worldW + 56), ch / (worldH + 104));
      k = Math.max(0.78, Math.min(1.8, 1 / scale));
      ox = (cw / scale - worldW) / 2 + (GRID_H * TW) / 2;
      oy = (ch / scale - worldH) / 2 + 26;
    };

    const drawBox = (x: number, y: number, w: number, d: number, h: number, col: string) => {
      const A = proj(x, y);
      const B = proj(x + w, y);
      const C = proj(x + w, y + d);
      const D = proj(x, y + d);
      ctx.beginPath();
      ctx.moveTo(D.x, D.y);
      ctx.lineTo(C.x, C.y);
      ctx.lineTo(C.x, C.y - h);
      ctx.lineTo(D.x, D.y - h);
      ctx.closePath();
      ctx.fillStyle = shadeHex(col, 0.8);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(C.x, C.y);
      ctx.lineTo(B.x, B.y);
      ctx.lineTo(B.x, B.y - h);
      ctx.lineTo(C.x, C.y - h);
      ctx.closePath();
      ctx.fillStyle = shadeHex(col, 0.66);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(A.x, A.y - h);
      ctx.lineTo(B.x, B.y - h);
      ctx.lineTo(C.x, C.y - h);
      ctx.lineTo(D.x, D.y - h);
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();
      ctx.strokeStyle = 'rgba(80,95,120,0.16)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
    };

    const drawFloorTiles = () => {
      for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
          const c = proj(x + 0.5, y + 0.5);
          const z = rooms.find((zz) => x >= zz.x && x < zz.x + zz.w && y >= zz.y && y < zz.y + zz.d);
          const pal = FLOOR_PALETTE[z ? z.f : 'wood'] || FLOOR_PALETTE.wood;
          ctx.beginPath();
          ctx.moveTo(c.x, c.y - TH / 2);
          ctx.lineTo(c.x + TW / 2, c.y);
          ctx.lineTo(c.x, c.y + TH / 2);
          ctx.lineTo(c.x - TW / 2, c.y);
          ctx.closePath();
          ctx.fillStyle = z ? pal[(x + y) % 2] : '#fbfcfe';
          ctx.fill();
          ctx.strokeStyle = 'rgba(186,200,220,0.26)';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
      const c1 = proj(0, 0);
      const c2 = proj(GRID_W, 0);
      const c3 = proj(GRID_W, GRID_H);
      const c4 = proj(0, GRID_H);
      ctx.strokeStyle = '#c9d5e6';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(c1.x, c1.y);
      ctx.lineTo(c2.x, c2.y);
      ctx.lineTo(c3.x, c3.y);
      ctx.lineTo(c4.x, c4.y);
      ctx.closePath();
      ctx.stroke();
    };

    const drawFurnItem = (q: FurnTuple) => {
      const [x, y, w, d, heightMult, t] = q;
      const hh = heightMult * TH;
      const c = proj(x + w / 2, y + d / 2);
      ctx.beginPath();
      ctx.ellipse(c.x, c.y + 1, (w + d) * 8, (w + d) * 3.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(28,42,66,0.09)';
      ctx.fill();

      if (t === 'desk' || t === 'aidesk') {
        drawBox(x, y, w, d, hh, t === 'aidesk' ? '#dfe9f2' : '#e8d9be');
        const mc = proj(x + w * 0.58, y + d * 0.5);
        ctx.save();
        ctx.translate(mc.x, mc.y - hh);
        ctx.fillStyle = t === 'aidesk' ? 'rgba(62,199,179,0.5)' : '#3a465c';
        drawRoundedRect(ctx, -8, -15, 16, 11, 1.6);
        ctx.fill();
        ctx.fillStyle = t === 'aidesk' ? 'rgba(160,250,238,0.9)' : 'rgba(122,198,255,0.82)';
        drawRoundedRect(ctx, -6.4, -13.4, 12.8, 8, 1);
        ctx.fill();
        ctx.fillStyle = '#8e9cb3';
        ctx.fillRect(-1.6, -4, 3.2, 4);
        ctx.restore();
      } else if (t === 'table') {
        drawBox(x, y, w, d, hh, '#ddcaa9');
      } else if (t === 'counter') {
        drawBox(x, y, w, d, hh, '#eef2f8');
      } else if (t === 'sofa') {
        drawBox(x, y, w, d, hh, '#7c8fae');
      } else if (t === 'ctable') {
        drawBox(x, y, w, d, hh, '#cdb996');
      } else if (t === 'rack') {
        drawBox(x, y, w, d, hh, '#2f3a4d');
        const p = proj(x + w * 0.5, y + d * 0.5);
        for (let i = 0; i < 5; i++) {
          const on = Math.sin(Date.now() / 420 + i * 1.3) > 0;
          ctx.fillStyle = on ? '#4dffd0' : '#5f7f8a';
          ctx.fillRect(p.x - 7, p.y - hh + 6 + i * 9, 14, 1.8);
        }
      } else if (t === 'shelf' || t === 'box') {
        drawBox(x, y, w, d, hh, '#cbb89a');
      } else if (t === 'plant') {
        const p = proj(x + w / 2, y + d / 2);
        ctx.fillStyle = '#a86a4a';
        drawRoundedRect(ctx, p.x - 5, p.y - 9, 10, 8, 1.8);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(p.x, p.y - 19, 9, 10, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#3f7d4f';
        ctx.fill();
      } else if (t === 'board') {
        const a = proj(x, y + d / 2);
        const b = proj(x + w, y + d / 2);
        const top = hh + 12;
        ctx.strokeStyle = '#9aa8bd';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y - 2);
        ctx.lineTo(a.x, a.y - top);
        ctx.moveTo(b.x, b.y - 2);
        ctx.lineTo(b.x, b.y - top);
        ctx.stroke();
        ctx.fillStyle = '#fdfdfe';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y - top + 4);
        ctx.lineTo(b.x, b.y - top + 4);
        ctx.lineTo(b.x, b.y - top - 6);
        ctx.lineTo(a.x, a.y - top - 6);
        ctx.closePath();
        ctx.fill();
      }
    };

    const drawWalls = () => {
      const GH = 24;
      rooms.forEach((z) => {
        const segs = [
          [z.x, z.y, z.x, z.y + z.d],
          [z.x, z.y, z.x + z.w, z.y],
        ];
        segs.forEach(([x1, y1, x2, y2]) => {
          const a = proj(x1, y1);
          const b = proj(x2, y2);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.lineTo(b.x, b.y - GH);
          ctx.lineTo(a.x, a.y - GH);
          ctx.closePath();
          ctx.fillStyle = 'rgba(205,226,244,0.48)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(130,158,190,0.7)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      });
    };

    const drawLabels = () => {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      rooms.forEach((z) => {
        const p = proj(z.x, z.y);
        ctx.font = `600 ${(8.5 * k).toFixed(1)}px sans-serif`;
        const t = z.n.toUpperCase();
        const w = ctx.measureText(t).width + 9 * k;
        ctx.fillStyle = 'rgba(255,255,255,0.88)';
        drawRoundedRect(ctx, p.x + 2 * k, p.y - 9 * k, w, 12.2 * k, 4 * k);
        ctx.fill();
        ctx.strokeStyle = 'rgba(180,195,215,0.7)';
        ctx.lineWidth = 0.7;
        ctx.stroke();
        ctx.fillStyle = '#4a5a72';
        ctx.fillText(t, p.x + 6.5 * k, p.y - 2.6 * k);
      });
    };

    const drawChar = (c: SceneChar, t: number) => {
      if (c.away) return;
      const p = proj(c.x, c.y);
      const walking = Boolean(c.path && c.path.length);
      const bob = walking ? Math.abs(Math.sin(t * 8 + c.phase)) * 1.6 : Math.sin(t * 1.5 + c.phase) * 0.5;
      const seated = c.sit && !walking;
      const baseY = p.y - bob - (seated ? 4 : 0);

      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 1.5, 8, 3.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(25,38,60,0.15)';
      ctx.fill();

      if (seated) {
        ctx.fillStyle = '#4d6285';
        drawRoundedRect(ctx, p.x - 5.4, p.y - 19, 10.8, 8, 2);
        ctx.fill();
        ctx.fillStyle = '#3d5170';
        drawRoundedRect(ctx, p.x - 5.4, p.y - 25, 10.8, 6.5, 2);
        ctx.fill();
      }

      const sw = walking ? Math.sin(t * 9 + c.phase) * 3.2 : 0;
      ctx.strokeStyle = shadeHex(c.warna, 0.5);
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      if (seated) {
        ctx.beginPath();
        ctx.moveTo(p.x - 2.4, baseY - 12);
        ctx.lineTo(p.x - 3.6, baseY - 5);
        ctx.moveTo(p.x + 2.4, baseY - 12);
        ctx.lineTo(p.x + 3.6, baseY - 5);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(p.x - 2.2, baseY - 12);
        ctx.lineTo(p.x - 2.6 + sw, baseY);
        ctx.moveTo(p.x + 2.2, baseY - 12);
        ctx.lineTo(p.x + 2.6 - sw, baseY);
        ctx.stroke();
      }

      ctx.fillStyle = c.warna;
      drawRoundedRect(ctx, p.x - 5.6, baseY - 25, 11.2, 14, 3.2);
      ctx.fill();

      const hy = baseY - 29.5;
      ctx.beginPath();
      ctx.arc(p.x, hy, 4.7, 0, Math.PI * 2);
      ctx.fillStyle = c.skin;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, hy - 1.2, 4.8, Math.PI * 1.03, Math.PI * 2.01);
      ctx.fillStyle = c.hair;
      ctx.fill();

      if (c.cap) {
        ctx.fillStyle = '#1d2c42';
        drawRoundedRect(ctx, p.x - 5.4, hy - 4.6, 10.8, 3.6, 1.4);
        ctx.fill();
      }

      if (c.id === meIdRef.current) {
        ctx.strokeStyle = '#f5b942';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(p.x, baseY - 1, 9, 3.8, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.font = `700 ${((hoverId === c.id || c.id === meIdRef.current ? 8.2 : 7.4) * k).toFixed(1)}px sans-serif`;
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = 'rgba(255,255,255,0.92)';
      const nm = (c.nama.split(' ')[0] || '').slice(0, 10);
      ctx.strokeText(nm, p.x, hy - 9);
      ctx.fillStyle = c.id === meIdRef.current ? '#8a5c00' : '#2b3b52';
      ctx.fillText(nm, p.x, hy - 9);
    };

    const drawAIChar = (c: SceneAI, t: number) => {
      const p = proj(c.x, c.y);
      const fl = Math.sin(t * 1.3 + c.phase) * 2;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 1, 9, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(62,199,179,0.20)';
      ctx.fill();

      ctx.fillStyle = '#288c80';
      drawRoundedRect(ctx, p.x - 5, p.y - 23 + fl, 10, 15, 3.2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y - 27 + fl, 4.1, 0, Math.PI * 2);
      ctx.fillStyle = '#9bf5e4';
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.font = `700 ${(6.6 * k).toFixed(1)}px sans-serif`;
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      const label = hoverId === c.id ? `${c.id} · ${c.nama}` : c.nama.split(' ').slice(0, 2).join(' ');
      ctx.strokeText(label, p.x, p.y - 32 * k);
      ctx.fillStyle = '#0f7a5a';
      ctx.fillText(label, p.x, p.y - 32 * k);
    };

    const syncTargets = (mm: number) => {
      const currentAtt = attRef.current;
      chars.forEach((c, idx) => {
        if (c.staff) {
          c.away = false;
          return;
        }
        const pDef = people.find((x) => x.id === c.id);
        if (pDef && 'guest' in pDef && pDef.guest) {
          c.away = !((mm >= 555 && mm < 615) || (mm >= 840 && mm < 900));
          return;
        }
        const rec = currentAtt[c.id];
        if (!rec || rec.in == null || rec.izin || (rec.out != null && mm >= rec.out)) {
          c.away = true;
          c.path = null;
          return;
        }
        const offHours = mm < 445 || mm > 1050;
        if (offHours && !simRunningRef.current && (!meIdRef.current || c.id !== meIdRef.current)) {
          // outside nominal office hours show who is still clocked in vs not
        }
        c.away = false;
        if (c.floor !== floorIdxRef.current) return;

        let tgt: SeatCoord = c.home;
        const mt = O.meets.find((x) => mm >= x[2] && mm < x[3] && (x[5] as readonly string[]).includes(c.id));
        if (mt && meetSeats.length) {
          const seatIdx = Math.max(0, (mt[5] as readonly string[]).indexOf(c.id));
          tgt = meetSeats[seatIdx % meetSeats.length];
        } else if (mm >= 720 && mm < 780 && pantrySeats.length) {
          tgt = pantrySeats[idx % pantrySeats.length];
        }

        c.sitTarget = true;
        if (Math.abs(tgt.x - c.tx) > 0.05 || Math.abs(tgt.y - c.ty) > 0.05) {
          const path = bfs({ x: c.x, y: c.y }, tgt);
          c.tx = tgt.x;
          c.ty = tgt.y;
          if (path && path.length) {
            c.path = path;
            c.sit = false;
          }
        }
      });
    };

    const frame = (ts: number) => {
      const fi = floorIdxRef.current;
      if (fi !== lastLoadedFloor) {
        loadFloor(fi);
      }

      const t = (ts || 0) / 1000;
      const dt = t0 ? Math.min(0.05, t - t0) : 0;
      t0 = t;

      const mmNow = simRunningRef.current
        ? simMinRef.current
        : (() => {
            const d = getWibDate();
            return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
          })();
      syncTargets(mmNow);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      const bg = ctx.createLinearGradient(0, 0, 0, ch);
      bg.addColorStop(0, '#f6f9fe');
      bg.addColorStop(1, '#e9eff8');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, cw, ch);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);

      drawFloorTiles();
      drawWalls();
      drawLabels();

      const items: Array<{ d: number; f?: FurnTuple; c?: SceneChar; ai?: SceneAI }> = [];
      furn.forEach((q) => items.push({ d: q[0] + q[2] / 2 + q[1] + q[3] / 2, f: q }));
      chars
        .filter((c) => c.floor === fi)
        .forEach((c) => items.push({ d: c.x + c.y + 0.03, c }));
      aiChars
        .filter((a) => a.floor === fi)
        .forEach((ai) => items.push({ d: ai.x + ai.y + 0.05, ai }));

      items.sort((a, b) => a.d - b.d);
      items.forEach((it) => {
        if (it.f) drawFurnItem(it.f);
        else if (it.ai) drawAIChar(it.ai, t);
        else if (it.c) drawChar(it.c, t);
      });

      const h = mmNow / 60;
      let tintAlpha = 0;
      if (h < 7) tintAlpha = 0.1;
      else if (h < 9) tintAlpha = 0.05;
      else if (h >= 16 && h < 18) tintAlpha = 0.045;
      else if (h >= 18) tintAlpha = 0.1;
      if (tintAlpha > 0) {
        ctx.fillStyle = `rgba(255,206,150,${tintAlpha})`;
        ctx.fillRect(-3000, -3000, 6000, 6000);
      }

      chars.forEach((c) => {
        if (c.floor !== fi) return;
        if (c.staff && (!c.path || !c.path.length) && (!c.nextAt || t >= c.nextAt)) {
          if (c.route && c.route.length >= 2) {
            c.wp = ((c.wp || 0) + 1) % c.route.length;
            const tgt = c.route[c.wp];
            const p = bfs({ x: c.x, y: c.y }, { x: tgt[0], y: tgt[1] });
            if (p && p.length) c.path = p;
            c.nextAt = t + (c.cycle || 16);
          }
        }
        if (!c.path || !c.path.length) {
          c.sit = c.sitTarget;
          return;
        }
        const n = c.path[0];
        const dx = n.x - c.x;
        const dy = n.y - c.y;
        const dist = Math.hypot(dx, dy);
        const step = SPEED * dt;
        if (dist <= step || dist < 1e-4) {
          c.x = n.x;
          c.y = n.y;
          c.path.shift();
        } else {
          c.x += (dx / dist) * step;
          c.y += (dy / dist) * step;
        }
      });

      rafId = requestAnimationFrame(frame);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const r = cv.getBoundingClientRect();
      const wx = (e.clientX - r.left) / scale;
      const wy = (e.clientY - r.top) / scale;
      let best: string | null = null;
      let bd = 15;
      const fi = floorIdxRef.current;
      chars.forEach((c) => {
        if (c.away || c.floor !== fi) return;
        const p = proj(c.x, c.y);
        const d = Math.hypot(p.x - wx, p.y - 15 - wy);
        if (d < bd) {
          bd = d;
          best = c.id;
        }
      });
      aiChars.forEach((a) => {
        if (a.floor !== fi) return;
        const p = proj(a.x, a.y);
        const d = Math.hypot(p.x - wx, p.y - 16 - wy);
        if (d < bd) {
          bd = d;
          best = a.id;
        }
      });
      hoverId = best;
      cv.style.cursor = best ? 'pointer' : 'default';
    };

    const handleClick = (e: MouseEvent) => {
      const r = cv.getBoundingClientRect();
      const wx = (e.clientX - r.left) / scale;
      const wy = (e.clientY - r.top) / scale;
      const fi = floorIdxRef.current;

      let bestChar: SceneChar | null = null;
      let bestAI: SceneAI | null = null;
      let bd = 15;

      chars.forEach((c) => {
        if (c.away || c.floor !== fi) return;
        const p = proj(c.x, c.y);
        const d = Math.hypot(p.x - wx, p.y - 15 - wy);
        if (d < bd) {
          bd = d;
          bestChar = c;
          bestAI = null;
        }
      });

      aiChars.forEach((a) => {
        if (a.floor !== fi) return;
        const p = proj(a.x, a.y);
        const d = Math.hypot(p.x - wx, p.y - 16 - wy);
        if (d < bd) {
          bd = d;
          bestAI = a;
          bestChar = null;
        }
      });

      if (bestAI) {
        const ai = bestAI as SceneAI;
        setDetailCard({ kind: 'ai', id: ai.id });
        appendLog(`Melihat agent ${ai.id}`, 'Denah');
        return;
      }

      if (bestChar) {
        const ch = bestChar as SceneChar;
        if (ch.staff) {
          setDetailCard({ kind: 'staff', id: ch.id });
          appendLog(`Melihat profil staf ${ch.nama}`, 'Denah');
        } else {
          setDetailCard({ kind: 'person', id: ch.id });
          appendLog(`Melihat profil ${ch.nama}`, 'Denah');
        }
        return;
      }

      const gx = (wx - ox) / (TW / 2);
      const gy = (wy - oy) / (TH / 2);
      const tx = (gx + gy) / 2;
      const ty = (gy - gx) / 2;
      const z = rooms.find((zz) => tx >= zz.x && tx < zz.x + zz.w && ty >= zz.y && ty < zz.y + zz.d);
      if (z) {
        setDetailCard({
          kind: 'room',
          roomKey: z.k,
          roomName: z.n,
          floorName: O.layout.floors[fi]?.nama || '',
        });
      }
    };

    loadFloor(floorIdxRef.current);
    resize();
    window.addEventListener('resize', resize);
    cv.addEventListener('mousemove', handleMouseMove);
    cv.addEventListener('click', handleClick);
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      cv.removeEventListener('mousemove', handleMouseMove);
      cv.removeEventListener('click', handleClick);
    };
  }, [O, people, appendLog]);

  const floorPeople = people.map((p, idx) => ({ p, idx })).filter((x) => x.p.floor === floorIdx);

  const agentRooms = useMemo(() => {
    const map: Record<string, typeof PORTAL_DATA.agents[number][]> = {};
    for (const a of PORTAL_DATA.agents) {
      if (!map[a.ruang]) map[a.ruang] = [];
      map[a.ruang].push(a);
    }
    return Object.entries(map);
  }, []);

  const renderDetailCard = () => {
    if (detailCard.kind === 'hint') {
      return <div className="text-xs text-[#9fb0d0]">{detailCard.text}</div>;
    }

    if (detailCard.kind === 'ai') {
      const a = PORTAL_DATA.agents.find((x) => x.id === detailCard.id);
      if (!a) return null;
      return (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-md bg-[#115e59] border border-[#34d399] flex items-center justify-center text-[11px] font-bold text-[#6ee7b7] shrink-0">
              AI
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#e8eefc]">
                {a.id} · {a.nama}
              </div>
              <div className="text-[11px] text-[#34d399]">
                Agent AI · tanpa jam kerja, aktif 24 jam
              </div>
              <div className="text-[11px] text-[#9fb0d0] mt-0.5">
                Misi: {a.misi} · Pemilik: <b className="text-[#cfe0ff]">{a.owner}</b>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenChat(a.id)}
              className="px-2.5 py-1.5 rounded-lg bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#06222f] text-[11px] font-bold cursor-pointer whitespace-nowrap"
            >
              Beri instruksi
            </button>
            <button
              type="button"
              onClick={() => onOpenDrawer({ type: 'agent', id: a.id })}
              className="px-2.5 py-1.5 rounded-lg bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] text-[#e8eefc] text-[11px] font-semibold cursor-pointer whitespace-nowrap"
            >
              Detail lengkap
            </button>
          </div>
        </div>
      );
    }

    if (detailCard.kind === 'staff') {
      const info = STAFF_INFO[detailCard.id] || ['Staf', 'Staf operasional kantor.'];
      return (
        <div className="text-xs text-[#cfe0ff]">
          <b className="text-[#e8eefc]">{info[0]}</b> — {info[1]}
        </div>
      );
    }

    if (detailCard.kind === 'room') {
      const inside = people.filter(
        (p) => p.floor === floorIdx && p.unit.split(' · ')[0].trim() === detailCard.roomKey
      );
      const hadirCount = inside.filter((p) => {
        const r = att[p.id];
        return r && r.in != null && !(r.out != null && currentMin >= r.out);
      }).length;
      return (
        <div className="space-y-1.5 text-xs">
          <div className="text-[#cfe0ff]">
            <b className="text-[#e8eefc]">{detailCard.roomName}</b> — {detailCard.floorName} ·{' '}
            {inside.length} meja, {hadirCount} orang hadir
          </div>
          <div className="flex flex-wrap gap-1.5">
            {inside.length === 0 ? (
              <span className="text-[11px] text-[#9fb0d0]">Ruangan umum / bersama</span>
            ) : (
              inside.slice(0, 12).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setDetailCard({ kind: 'person', id: p.id })}
                  className="px-2 py-0.5 rounded bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] text-[11px] text-[#e8eefc] cursor-pointer"
                >
                  {p.nama.split(' ')[0]}
                </button>
              ))
            )}
          </div>
        </div>
      );
    }

    if (detailCard.kind === 'tasks') {
      const m = O.members.find((x) => x.id === detailCard.id);
      const p = people.find((x) => x.id === detailCard.id);
      const nama = m?.nama || p?.nama || detailCard.id;
      const tugas = m?.tugas || [];
      return (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <b className="text-[#e8eefc]">Pekerjaan {nama}</b>
            <button
              type="button"
              onClick={() => handleOpenChat(detailCard.id)}
              className="px-2.5 py-1 rounded bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] text-[11px] text-[#e8eefc] font-semibold cursor-pointer"
            >
              Kirim pesan
            </button>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-[#cfe0ff]">
            {tugas.map((t, i) => (
              <li key={i}>
                {t[0]}{' '}
                <span className="text-[#9fb0d0]">
                  · {t[1]} · {t[2]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // kind === 'person'
    const p = people.find((x) => x.id === detailCard.id);
    const m = O.members.find((x) => x.id === detailCard.id);
    const nama = p?.nama || m?.nama || detailCard.id;
    const jab = p?.jabatan || m?.jabatan || '—';
    const unit = p?.unit || m?.unit || '—';
    const warna = p?.warna || m?.warna || '#38bdf8';
    const idx = people.findIndex((x) => x.id === detailCard.id);
    const r = getAttRow(
      {
        id: detailCard.id,
        unit,
        floor: p?.floor || 0,
        guest: p && 'guest' in p ? Boolean(p.guest) : false,
      },
      idx >= 0 ? idx : 0,
      currentMin
    );
    const stNow = stateOf({ id: detailCard.id, unit }, currentMin);

    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: warna }}
          >
            {initials(nama)}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#e8eefc]">{nama}</div>
            <div className="text-[11px] text-[#9fb0d0]">
              {jab} · {unit}
            </div>
            <div className="text-[11px] text-[#cfe0ff] mt-0.5">
              Status: <b className="text-[#34d399]">{r.st}</b>
              {r.a.in != null ? ` · masuk ${hhmm(r.a.in)}` : ''} · sekarang:{' '}
              <b className="text-[#38bdf8]">{stNow.a}</b>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleOpenChat(detailCard.id)}
            className="px-2.5 py-1.5 rounded-lg bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#06222f] text-[11px] font-bold cursor-pointer whitespace-nowrap"
          >
            Kirim pesan
          </button>
          {m && m.tugas.length > 0 && (
            <button
              type="button"
              onClick={() => setDetailCard({ kind: 'tasks', id: m.id })}
              className="px-2.5 py-1.5 rounded-lg bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] text-[#e8eefc] text-[11px] font-semibold cursor-pointer whitespace-nowrap"
            >
              Pekerjaannya
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[17px] font-semibold text-[#e8eefc]">
          1 · Kantor AI &amp; Sistem Kerja Terpadu
        </h2>
        <p className="text-[12.5px] text-[#9fb0d0]">
          Denah isometrik 3 lantai (26 FTE + 18 agent AI) dan ruang kerja operasional menyatu dalam 1
          gerbang masuk berbasis Verifikasi Wajah, Lokasi Google Maps &amp; OTP Email.
        </p>
      </div>

      {/* Bar atas Kantor AI & Sistem Kerja */}
      <div className="bg-gradient-to-r from-[#131f36] to-[#0b1220] border border-[#22365c] rounded-[12px] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-3">
          <b className="text-[20px] font-mono tabular-nums text-[#e8eefc]">{clockLabel}</b>
          <span className="text-[11.5px] text-[#9fb0d0]">{dateLabel} · WIB</span>
          <span className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#34d399]">
            {simRunning ? 'Pratinjau 1 hari' : 'Langsung'}
          </span>
          <span className="text-[11.5px] text-[#9fb0d0]">· {shiftLabel}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (simRunning) {
                setSimRunning(false);
              } else {
                briefedRef.current = false;
                setSimMin(445);
                setSimRunning(true);
                appendLog('Menjalankan pratinjau satu hari kerja', 'Denah');
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
              simRunning
                ? 'bg-[#34d399] text-[#06281f]'
                : 'bg-[#182845] border border-[#22365c] text-[#e8eefc] hover:border-[#38bdf8]'
            }`}
          >
            {simRunning ? '■ Hentikan pratinjau' : '▶ Pratinjau 1 hari'}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-[#22365c]">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold text-white shrink-0"
              style={{ backgroundColor: officeMember?.warna || '#3b4d6b' }}
            >
              {user ? initials(user.Nama) : '?'}
            </div>
            <div className="text-[11px] leading-tight">
              <div className="font-bold text-[#e8eefc]">
                {user ? user.Nama : 'Belum masuk'}
              </div>
              <div className="text-[#9fb0d0]">
                {user ? `${user.ID} · ${user.Tier}` : 'Tamu (perlu Wajah + Maps + OTP)'}
              </div>
            </div>
          </div>

          {user ? (
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-[#2b1414] border border-[#5b2c2c] hover:border-[#f87171] text-[#fca5a5] text-xs font-bold cursor-pointer whitespace-nowrap"
            >
              Keluar
            </button>
          ) : (
            <button
              type="button"
              onClick={scrollToWorkspace}
              className="px-3 py-1.5 rounded-lg bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#06222f] text-xs font-bold cursor-pointer whitespace-nowrap"
            >
              Masuk (Wajah · Maps · OTP) ↓
            </button>
          )}
        </div>
      </div>

      {/* Denah + Sidebar Kehadiran */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-3">
        <div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {floors.map((f, i) => {
              const org = people.filter((p) => p.floor === i && !('guest' in p && p.guest)).length;
              const gu = people.filter((p) => p.floor === i && 'guest' in p && p.guest).length;
              const ag = O.layout.agents.filter((a) => a.floor === i).length;
              const parts: string[] = [];
              if (org) parts.push(`${org} karyawan`);
              if (gu) parts.push(`${gu} tamu`);
              if (ag) parts.push(`${ag} AI`);
              const active = floorIdx === i;
              return (
                <button
                  key={f.nama}
                  type="button"
                  onClick={() => {
                    setFloorIdx(i);
                    appendLog(`Berpindah ke ${f.nama}`, 'Denah');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    active
                      ? 'bg-[#38bdf8] border-[#38bdf8] text-[#06222f]'
                      : 'bg-[#182845] border-[#22365c] text-[#cfe0ff] hover:border-[#38bdf8]'
                  }`}
                >
                  <span>{f.nama}</span>
                  <span className="text-[10px] opacity-80 font-mono">{parts.join(' · ')}</span>
                </button>
              );
            })}
          </div>

          <div className="border border-[#22365c] rounded-[12px] overflow-hidden bg-[#0d1727]">
            <canvas
              ref={canvasRef}
              className="block w-full h-[340px] sm:h-[460px]"
              style={{ filter: 'invert(1) hue-rotate(180deg) saturate(1.05) brightness(0.95)' }}
            />
          </div>

          {/* Legenda warna figur pada denah */}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#9fb0d0] px-1">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-[#b8860b]" />
              Karyawan — 26 orang sesuai FTE model
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-[#2f4661]" />
              Satpam ·
              <span className="w-2.5 h-2.5 rounded-[3px] bg-[#2f8f7d]" />
              OB ·
              <span className="w-2.5 h-2.5 rounded-[3px] bg-[#c9772b]" />
              Kurir ·
              <span className="w-2.5 h-2.5 rounded-[3px] bg-[#5f6f86]" />
              Resepsionis
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-[#34d399]" />
              Agent AI bekerja
            </span>
            <span className="text-[#7c8fb3]">Klik orang atau ruangan untuk detail</span>
          </div>

          <div className="mt-2 bg-[#131f36] border border-[#22365c] rounded-[10px] px-3.5 py-2.5">
            {renderDetailCard()}
          </div>
        </div>

        <aside className="space-y-3">
          <div>
            <div className="text-[10px] font-bold tracking-[0.07em] uppercase text-[#9fb0d0] mb-1.5">
              Anggota &amp; kehadiran ({floorPeople.length})
            </div>
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
              {floorPeople.length === 0 ? (
                <div className="bg-[#182845] border border-[#22365c] rounded-[9px] p-2.5 text-xs text-[#9fb0d0]">
                  Lantai 3 ditempati penuh oleh 18 Agent AI (aktif 24 jam).
                </div>
              ) : (
                floorPeople.map(({ p, idx }) => {
                  const r = getAttRow(
                    {
                      id: p.id,
                      unit: p.unit,
                      floor: p.floor,
                      guest: 'guest' in p ? Boolean(p.guest) : false,
                    },
                    idx,
                    currentMin
                  );
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setDetailCard({ kind: 'person', id: p.id });
                        appendLog(`Melihat profil ${p.nama}`, 'Denah');
                      }}
                      className="w-full flex items-center gap-2 bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] rounded-[9px] px-2.5 py-1.5 text-left cursor-pointer"
                    >
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: p.warna }}
                      >
                        {initials(p.nama)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11.5px] font-bold text-[#e8eefc] truncate">
                          {p.nama.split(' ').slice(0, 2).join(' ')}
                        </div>
                        <div className="text-[10px] font-mono tabular-nums text-[#9fb0d0] truncate">
                          {r.a.in != null ? `masuk ${hhmm(r.a.in)}` : '—'} · {r.koor}
                        </div>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9.5px] font-semibold border shrink-0 ${
                          r.cls === 'k'
                            ? 'bg-[#0e2b23] border-[#175c49] text-[#6ee7b7]'
                            : r.cls === 'm'
                              ? 'bg-[#2a220e] border-[#5c4814] text-[#fbbf24]'
                              : 'bg-[#2b1414] border-[#5b2c2c] text-[#fca5a5]'
                        }`}
                      >
                        {r.st}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold tracking-[0.07em] uppercase text-[#9fb0d0] mb-1.5">
              Agenda hari ini
            </div>
            <div className="space-y-1.5">
              {O.meets.map((m) => {
                const active = currentMin >= m[2] && currentMin < m[3];
                return (
                  <div
                    key={m[0]}
                    className={`rounded-[9px] border px-2.5 py-2 text-[11px] ${
                      active ? 'bg-[#0e2b23] border-[#34d399]' : 'bg-[#182845] border-[#22365c]'
                    }`}
                  >
                    <div className="font-bold text-[#e8eefc]">
                      {m[1]}
                      {active ? ' · sedang berlangsung' : ''}
                    </div>
                    <div className="text-[10px] text-[#9fb0d0] font-mono tabular-nums">
                      {hhmm(m[2])}–{hhmm(m[3])} · {m[4]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Ruang Kerja Tunggal: Sistem Kerja + Papan Anggota Kantor AI */}
      <div ref={paneRef}>
        {token && user && officeMember ? (
          <div className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-4 space-y-4">
            {/* Header Sesi Terpadu */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#22365c]">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: officeMember.warna }}
                >
                  {initials(user.Nama)}
                </div>
                <div>
                  <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#34d399]">
                    Papan Kerja &amp; Sistem Kerja Terpadu · {user.ID} · {user.Tier}
                  </div>
                  <div className="text-[14px] font-bold text-[#e8eefc]">
                    {user.Nama}{' '}
                    <span className="font-normal text-xs text-[#9fb0d0]">
                      — {user.Jabatan} ({user.Unit}) · {user.Email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {workspaceMode === 'sistem' && (
                  <button
                    type="button"
                    disabled={serverLoading}
                    onClick={() => setRefreshSignal((x) => x + 1)}
                    className="bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] text-[#e8eefc] font-semibold text-xs rounded-[8px] px-3 py-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    {serverLoading ? 'Memuat…' : 'Muat ulang'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onLogout}
                  className="bg-[#2b1414] border border-[#5b2c2c] hover:border-[#f87171] text-[#fca5a5] font-bold text-xs rounded-[8px] px-3 py-1.5 cursor-pointer whitespace-nowrap"
                >
                  Keluar Sesi
                </button>
              </div>
            </div>

            {/* Navigasi Modul Terpadu */}
            <div className="space-y-2.5">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9fb0d0] mb-1.5">
                  Operasional Server (RAPID, Keuangan, Tugas, Absensi Wajah &amp; Maps, Audit)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SISTEM_SUB_TABS.filter((tab) => canAccessSection(user.Tier, tab.id)).map((tab) => {
                    const active = workspaceMode === 'sistem' && serverSection === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleSelectServerSection(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                          active
                            ? 'bg-[#38bdf8] border-[#38bdf8] text-[#06222f]'
                            : 'bg-[#182845] border-[#22365c] text-[#cfe0ff] hover:border-[#38bdf8]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9fb0d0] mb-1.5">
                  Papan Harian Kantor AI &amp; Ekosistem AI Google
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setWorkspaceMode('gemini');
                      appendLog('Membuka Asisten AI Google (Gemini)', 'Asisten AI');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[11.5px] font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                      workspaceMode === 'gemini'
                        ? 'bg-[#34d399] border-[#34d399] text-[#06281f]'
                        : 'bg-[#0e2b23] border-[#175c49] text-[#6ee7b7] hover:border-[#34d399]'
                    }`}
                  >
                    ✨ Asisten Gemini AI (18 Agen)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWorkspaceMode('workspace');
                      appendLog('Membuka Ekosistem Google Workspace', 'Google Workspace');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[11.5px] font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                      workspaceMode === 'workspace'
                        ? 'bg-[#38bdf8] border-[#38bdf8] text-[#06222f]'
                        : 'bg-[#10253f] border-[#264b7a] text-[#7dd3fc] hover:border-[#38bdf8]'
                    }`}
                  >
                    🌐 Google Workspace (Meet · Calendar · Gmail · Drive · Tasks)
                  </button>
                  {KANTOR_MODS.filter(([k]) => k !== 'absen').map(([k, label]) => {
                    const allowed = officeMember.akses.includes(k);
                    const active = workspaceMode === 'kantor' && activeMod === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleSelectKantorMod(k)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                          active
                            ? 'bg-[#34d399] border-[#34d399] text-[#06281f]'
                            : allowed
                              ? 'bg-[#182845] border-[#22365c] text-[#cfe0ff] hover:border-[#34d399]'
                              : 'bg-[#0f1a2c] border-[#1c2b4a] text-[#64748b] opacity-65 hover:border-[#5b2c2c]'
                        }`}
                        title={allowed ? label : `${label} (Terkunci untuk ${officeMember.jabatan})`}
                      >
                        {!allowed ? '🔒 ' : ''}
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Konten Modul Aktif */}
            {workspaceMode === 'sistem' ? (
              <SistemKerjaPanel
                token={token}
                user={user}
                section={serverSection}
                refreshSignal={refreshSignal}
                onNavigate={handleSelectServerSection}
                onAbsenRecorded={handleAbsenRecorded}
                onSessionExpired={onSessionExpired}
                onNotify={onNotify}
                onLoadingChange={setServerLoading}
              />
            ) : workspaceMode === 'gemini' ? (
              <GeminiAssistPanel
                token={token}
                user={user}
                selectedAgentId={selectedAiAgentId}
                onSessionExpired={onSessionExpired}
                onNotify={onNotify}
                onLog={(aksi, modul) => appendLog(aksi, modul)}
                onSendToWorkspace={(targetTab: WorkspaceSubTab, title: string, body: string) => {
                  setWorkspacePrefill({ targetTab, title, body, nonce: Date.now() });
                  setWorkspaceMode('workspace');
                }}
              />
            ) : workspaceMode === 'workspace' ? (
              <GoogleWorkspacePanel
                portalToken={token}
                portalUser={user}
                prefill={workspacePrefill}
                onNotify={onNotify}
                onLog={(aksi, modul) => appendLog(aksi, modul)}
              />
            ) : (
              <div className="space-y-2.5">
                {(['rapat', 'kalender', 'surat', 'laporan', 'arsip', 'tugas'] as const).includes(
                  activeMod as 'rapat' | 'kalender' | 'surat' | 'laporan' | 'arsip' | 'tugas'
                ) && (
                  <div className="bg-[#10253f] border border-[#264b7a] rounded-[9px] px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[#cfe0ff]">
                      Modul ini terhubung langsung dengan{' '}
                      <b className="text-[#7dd3fc]">Ekosistem Google Workspace</b> (Meet, Calendar,
                      Gmail, Drive/Docs/Sheets &amp; Tasks).
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const mapTab: Record<string, WorkspaceSubTab> = {
                          rapat: 'meet',
                          kalender: 'meet',
                          surat: 'gmail',
                          laporan: 'drive',
                          arsip: 'drive',
                          tugas: 'tasks',
                        };
                        setWorkspacePrefill({
                          targetTab: mapTab[activeMod] || 'meet',
                          nonce: Date.now(),
                        });
                        setWorkspaceMode('workspace');
                      }}
                      className="px-2.5 py-1 rounded-md bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#06222f] font-bold text-[11px] cursor-pointer whitespace-nowrap"
                    >
                      Buka di Google Workspace →
                    </button>
                  </div>
                )}
                <KantorModulesPane
                  embeddedUnified={true}
                  member={officeMember}
                  activeMod={activeMod}
                  onSelectMod={handleSelectKantorMod}
                  activeChan={activeChan}
                  onSelectChan={setActiveChan}
                  floorIdx={floorIdx}
                  nowMin={currentMin}
                  isSim={simRunning}
                  att={att}
                  getAttRow={getAttRow}
                  onClockIn={() => {
                    handleSelectServerSection('absen');
                    onNotify('Lakukan Absen Masuk menggunakan kamera wajah & Google Maps.');
                  }}
                  onClockOut={() => {
                    handleSelectServerSection('absen');
                    onNotify('Lakukan Absen Keluar menggunakan kamera wajah & Google Maps.');
                  }}
                  logs={logs}
                  onLog={(aksi, modul) => appendLog(aksi, modul)}
                  onToast={onNotify}
                  chats={chats}
                  onSendMessage={handleSendMessage}
                />
              </div>
            )}
          </div>
        ) : (
          <LoginView
            prefillId={localPrefillId}
            onSuccess={(newToken, newUser) => {
              setWorkspaceMode('sistem');
              setServerSection('dashboard');
              onLoginSuccess(newToken, newUser);
              appendLog('Masuk terverifikasi (Wajah + Maps + OTP)', 'Autentikasi', newUser.Nama);
            }}
          />
        )}
      </div>

      {/* 18 Agent AI */}
      <div className="space-y-2">
        <div>
          <h3 className="text-sm font-semibold text-[#e8eefc]">
            Agent AI yang bekerja di kantor ini
          </h3>
          <p className="text-xs text-[#9fb0d0]">
            18 agent di 6 ruang. Klik untuk melihat misi, SLA, guardrail, dan pemilik manusianya —
            agent bekerja 24 jam, manusia tetap yang menandatangani.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {agentRooms.map(([roomName, agents]) => (
            <div key={roomName} className="bg-[#131f36] border border-[#22365c] rounded-[12px] p-3">
              <h4 className="text-xs font-bold text-[#e8eefc] mb-2">{roomName}</h4>
              <div className="divide-y divide-dashed divide-[#22365c]">
                {agents.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onOpenDrawer({ type: 'agent', id: a.id })}
                    className="w-full py-1.5 flex items-start justify-between gap-2 text-left hover:text-[#34d399] cursor-pointer"
                  >
                    <span className="text-[11.5px] text-[#cfe0ff]">
                      <b>{a.id}</b> {a.nama}
                      <span className="block text-[10px] text-[#9fb0d0]">pemilik: {a.owner}</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#34d399] font-mono shrink-0">
                      {a.ot.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
