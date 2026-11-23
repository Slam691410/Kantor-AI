import React, { useCallback, useEffect, useState } from 'react';
import type { User } from '@firebase/auth';
import {
  Calendar,
  CheckSquare,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  LogOut,
  Mail,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  Video,
} from 'lucide-react';
import { api } from '../api';
import {
  createCalendarEventWithMeet,
  createGoogleDocFile,
  createGoogleMeetSpace,
  createGoogleTask,
  deleteCalendarEvent,
  deleteGoogleTask,
  exportGoogleSheetFile,
  getCurrentWorkspaceUser,
  getWorkspaceAccessToken,
  googleWorkspaceSignIn,
  initWorkspaceAuth,
  listAppDriveFiles,
  listCalendarEvents,
  listGmailMessages,
  listGoogleTasks,
  sendGmailMessage,
  toggleGoogleTaskStatus,
  trashDriveFile,
  WorkspaceAuthError,
  workspaceSignOut,
  type GmailMessageSummary,
  type GoogleCalendarEvent,
  type GoogleDriveFileItem,
  type GoogleMeetSpace,
  type GoogleTaskItem,
} from '../services/googleWorkspace';
import { callGas, isAppsScriptRuntime } from '../utils/gasBridge';
import type { UserPublic } from '../types';
import { GoogleSignInButton } from './GoogleSignInButton';
import {
  WorkspaceConfirmModal,
  type WorkspacePendingAction,
} from './WorkspaceConfirmModal';

export type WorkspaceSubTab = 'meet' | 'gmail' | 'drive' | 'tasks';

export interface WorkspacePrefillDraft {
  targetTab: WorkspaceSubTab;
  title?: string;
  body?: string;
  nonce: number;
}

interface GoogleWorkspacePanelProps {
  portalToken: string;
  portalUser: UserPublic;
  prefill?: WorkspacePrefillDraft | null;
  onNotify: (msg: string, isError?: boolean) => void;
  onLog?: (aksi: string, modul: string) => void;
}

function defaultDateTimeLocal(offsetHours: number): string {
  const d = new Date(Date.now() + offsetHours * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export const GoogleWorkspacePanel: React.FC<GoogleWorkspacePanelProps> = ({
  portalToken,
  portalUser,
  prefill,
  onNotify,
  onLog,
}) => {
  const gasNative = isAppsScriptRuntime();
  const [needsAuth, setNeedsAuth] = useState<boolean>(() =>
    gasNative ? false : !getWorkspaceAccessToken()
  );
  const [googleUser, setGoogleUser] = useState<User | null>(() =>
    gasNative ? null : getCurrentWorkspaceUser()
  );
  const [signingIn, setSigningIn] = useState(false);

  const [subTab, setSubTab] = useState<WorkspaceSubTab>('meet');
  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Meet & Calendar state
  const [instantMeet, setInstantMeet] = useState<GoogleMeetSpace | null>(null);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [calTitle, setCalTitle] = useState('Rapat Komite Investasi Holding');
  const [calStart, setCalStart] = useState(() => defaultDateTimeLocal(1));
  const [calEnd, setCalEnd] = useState(() => defaultDateTimeLocal(2));
  const [calAttendees, setCalAttendees] = useState('');
  const [calDesc, setCalDesc] = useState('');

  // Gmail state
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [mailTo, setMailTo] = useState('');
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');

  // Drive / Docs / Sheets state
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFileItem[]>([]);
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [lastCreatedLink, setLastCreatedLink] = useState<{ label: string; url: string } | null>(
    null
  );

  // Tasks state
  const [googleTasks, setGoogleTasks] = useState<GoogleTaskItem[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskNotes, setTaskNotes] = useState('');

  // Mandatory confirmation dialog state
  const [pendingAction, setPendingAction] = useState<WorkspacePendingAction | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    if (gasNative) {
      setNeedsAuth(false);
      return;
    }
    const unsub = initWorkspaceAuth(
      (u) => {
        setGoogleUser(u);
        setNeedsAuth(false);
      },
      (u) => {
        setGoogleUser(u);
        setNeedsAuth(true);
      }
    );
    return () => unsub();
  }, [gasNative]);

  useEffect(() => {
    if (!prefill) return;
    setSubTab(prefill.targetTab);
    if (prefill.targetTab === 'gmail') {
      if (prefill.title) setMailSubject(prefill.title);
      if (prefill.body) setMailBody(prefill.body);
    } else if (prefill.targetTab === 'drive') {
      if (prefill.title) setDocTitle(prefill.title);
      if (prefill.body) setDocContent(prefill.body);
    }
  }, [prefill]);

  const handleApiError = useCallback(
    (err: unknown) => {
      if (err instanceof WorkspaceAuthError) {
        setNeedsAuth(true);
        setErrorMsg(err.message);
        return;
      }
      const msg = err instanceof Error ? err.message : 'Gagal mengakses layanan Google Workspace.';
      setErrorMsg(msg);
      onNotify(msg, true);
    },
    [onNotify]
  );

  const loadActiveTabData = useCallback(
    async (targetTab: WorkspaceSubTab) => {
      if (!gasNative && !getWorkspaceAccessToken()) {
        setNeedsAuth(true);
        return;
      }
      setLoadingData(true);
      setErrorMsg('');
      try {
        if (targetTab === 'meet') {
          const evs = gasNative
            ? await callGas<GoogleCalendarEvent[]>('gasWorkspaceDispatch', 'calendar.list', portalToken, { maxResults: 10 })
            : await listCalendarEvents(10);
          setEvents(evs);
        } else if (targetTab === 'gmail') {
          const msgs = gasNative
            ? await callGas<GmailMessageSummary[]>('gasWorkspaceDispatch', 'gmail.list', portalToken, { maxResults: 8 })
            : await listGmailMessages(8);
          setMessages(msgs);
        } else if (targetTab === 'drive') {
          const files = gasNative
            ? await callGas<GoogleDriveFileItem[]>('gasWorkspaceDispatch', 'drive.list', portalToken, {})
            : await listAppDriveFiles();
          setDriveFiles(files);
        } else if (targetTab === 'tasks') {
          const tks = gasNative
            ? await callGas<GoogleTaskItem[]>('gasWorkspaceDispatch', 'tasks.list', portalToken, {})
            : await listGoogleTasks();
          setGoogleTasks(tks);
        }
      } catch (err) {
        handleApiError(err);
      } finally {
        setLoadingData(false);
      }
    },
    [gasNative, portalToken, handleApiError]
  );

  useEffect(() => {
    if (!needsAuth) {
      void loadActiveTabData(subTab);
    }
  }, [needsAuth, subTab, loadActiveTabData]);

  const handleGoogleLogin = async () => {
    setSigningIn(true);
    setErrorMsg('');
    try {
      const res = await googleWorkspaceSignIn();
      setGoogleUser(res.user);
      setNeedsAuth(false);
      onLog?.(`Terhubung ke Google Workspace (${res.user.email || 'Akun Google'})`, 'Google Workspace');
      onNotify(`Terhubung ke Google Workspace (${res.user.email || res.user.displayName}).`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal masuk dengan Google.';
      setErrorMsg(msg);
      onNotify(msg, true);
    } finally {
      setSigningIn(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    await workspaceSignOut();
    setGoogleUser(null);
    setNeedsAuth(true);
    setEvents([]);
    setMessages([]);
    setDriveFiles([]);
    setGoogleTasks([]);
    onNotify('Koneksi Google Workspace diputuskan.');
  };

  const runConfirmedAction = async () => {
    if (!pendingAction) return;
    setActionBusy(true);
    try {
      await pendingAction.execute();
      setPendingAction(null);
    } catch (err) {
      setPendingAction(null);
      handleApiError(err);
    } finally {
      setActionBusy(false);
    }
  };

  // --- Confirmed Action Builders ---
  const askCreateMeetSpace = () => {
    setPendingAction({
      title: 'Buat Ruang Rapat Google Meet Baru?',
      service: 'Google Meet',
      description: 'Sistem akan membuat ruang rapat Google Meet baru pada akun Google Anda.',
      details: [
        `Penyelenggara: ${googleUser?.email || portalUser.Email}`,
        'Tautan pertemuan Google Meet akan langsung tersedia untuk dibagikan.',
      ],
      confirmLabel: 'Buat Ruang Meet',
      execute: async () => {
        const space = gasNative
          ? await callGas<GoogleMeetSpace>('gasWorkspaceDispatch', 'meet.create', portalToken, {})
          : await createGoogleMeetSpace();
        setInstantMeet(space);
        onLog?.(`Buat ruang Google Meet (${space.meetingCode})`, 'Google Meet');
        onNotify(`Ruang Google Meet siap: ${space.meetingCode}`);
      },
    });
  };

  const askCreateCalendarMeet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calTitle.trim() || !calStart || !calEnd) {
      onNotify('Judul, waktu mulai, dan waktu selesai rapat wajib diisi.', true);
      return;
    }
    const startIso = new Date(calStart).toISOString();
    const endIso = new Date(calEnd).toISOString();
    const attendees = calAttendees
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setPendingAction({
      title: `Jadwalkan "${calTitle.trim()}" ke Google Calendar?`,
      service: 'Google Calendar + Meet',
      description:
        'Acara akan ditambahkan ke Google Calendar utama Anda beserta tautan konferensi Google Meet.',
      details: [
        `Judul: ${calTitle.trim()}`,
        `Waktu: ${calStart.replace('T', ' ')} s.d. ${calEnd.replace('T', ' ')} WIB`,
        attendees.length > 0 ? `Undangan Email: ${attendees.join(', ')}` : 'Tanpa tamu undangan eksternal',
      ],
      confirmLabel: 'Jadwalkan Acara',
      execute: async () => {
        const payload = {
          summary: calTitle.trim(),
          description: calDesc.trim(),
          startIso,
          endIso,
          attendeeEmails: attendees,
        };
        const created = gasNative
          ? await callGas<GoogleCalendarEvent>('gasWorkspaceDispatch', 'calendar.create', portalToken, payload)
          : await createCalendarEventWithMeet(payload);
        setEvents((prev) => [created, ...prev]);
        onLog?.(`Jadwalkan Google Calendar: ${calTitle.trim()}`, 'Google Calendar');
        onNotify('Acara Google Calendar + Google Meet berhasil dibuat.');
      },
    });
  };

  const askDeleteCalendarEvent = (ev: GoogleCalendarEvent) => {
    setPendingAction({
      title: `Hapus Acara "${ev.summary || '(Tanpa Judul)'}"?`,
      service: 'Google Calendar',
      description: 'Acara ini akan dihapus permanen dari Google Calendar Anda.',
      details: [`ID Acara: ${ev.id}`],
      destructive: true,
      confirmLabel: 'Hapus Acara',
      execute: async () => {
        if (gasNative) {
          await callGas('gasWorkspaceDispatch', 'calendar.delete', portalToken, { id: ev.id });
        } else {
          await deleteCalendarEvent(ev.id);
        }
        setEvents((prev) => prev.filter((x) => x.id !== ev.id));
        onLog?.(`Hapus acara Calendar: ${ev.summary || ev.id}`, 'Google Calendar');
        onNotify('Acara dihapus dari Google Calendar.');
      },
    });
  };

  const askSendGmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailTo.trim() || !mailSubject.trim() || !mailBody.trim()) {
      onNotify('Alamat tujuan, subjek, dan isi email wajib diisi.', true);
      return;
    }
    setPendingAction({
      title: `Kirim Email via Gmail ke ${mailTo.trim()}?`,
      service: 'Gmail',
      description: 'Email akan dikirim langsung menggunakan akun Gmail Anda yang terhubung.',
      details: [
        `Kepada: ${mailTo.trim()}`,
        `Subjek: ${mailSubject.trim()}`,
        `Cuplikan: ${mailBody.trim().slice(0, 140)}${mailBody.trim().length > 140 ? '…' : ''}`,
      ],
      confirmLabel: 'Kirim Email',
      execute: async () => {
        const payload = {
          to: mailTo.trim(),
          subject: mailSubject.trim(),
          body: mailBody,
        };
        if (gasNative) {
          await callGas('gasWorkspaceDispatch', 'gmail.send', portalToken, payload);
        } else {
          await sendGmailMessage(payload);
        }
        setMailTo('');
        setMailSubject('');
        setMailBody('');
        onLog?.(`Kirim email Gmail ke ${mailTo.trim()}`, 'Gmail');
        onNotify('Email berhasil dikirim melalui Gmail.');
        const msgs = gasNative
          ? await callGas<GmailMessageSummary[]>('gasWorkspaceDispatch', 'gmail.list', portalToken, { maxResults: 8 })
          : await listGmailMessages(8);
        setMessages(msgs);
      },
    });
  };

  const askCreateGoogleDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) {
      onNotify('Judul dan isi Google Docs wajib diisi.', true);
      return;
    }
    setPendingAction({
      title: `Simpan Dokumen "${docTitle.trim()}" ke Google Docs & Drive?`,
      service: 'Google Docs & Drive',
      description: 'Dokumen baru akan dibuat di Google Drive milik Anda dan diisi sesuai teks di bawah.',
      details: [
        `Nama File: ${docTitle.trim()}`,
        `Panjang Isi: ${docContent.length} karakter`,
      ],
      confirmLabel: 'Buat Google Docs',
      execute: async () => {
        const payload = { title: docTitle.trim(), content: docContent };
        const res = gasNative
          ? await callGas<{ documentId: string; title: string; webViewLink: string }>('gasWorkspaceDispatch', 'docs.create', portalToken, payload)
          : await createGoogleDocFile(payload);
        setLastCreatedLink({ label: `Google Docs: ${res.title}`, url: res.webViewLink });
        setDocTitle('');
        setDocContent('');
        onLog?.(`Buat Google Docs: ${res.title}`, 'Google Drive');
        onNotify('Google Docs berhasil disimpan ke Google Drive.');
        const files = gasNative
          ? await callGas<GoogleDriveFileItem[]>('gasWorkspaceDispatch', 'drive.list', portalToken, {})
          : await listAppDriveFiles();
        setDriveFiles(files);
      },
    });
  };

  const askExportSheet = () => {
    const allowedFinance =
      portalUser.Tier === 'Pemilik' ||
      portalUser.Tier === 'Manajemen' ||
      portalUser.Tier === 'Staf' ||
      portalUser.Tier === 'Auditor';

    setPendingAction({
      title: 'Ekspor Laporan Kas & Pengajuan RAPID ke Google Sheets?',
      service: 'Google Sheets & Drive',
      description:
        'Portal akan membuat file Google Sheets baru di Drive Anda berisi catatan Kas dan antrean RAPID Holding Investasi.',
      details: [
        'Nama Spreadsheet: Laporan Holding Investasi (Kas & RAPID)',
        allowedFinance
          ? 'Sumber data: Transaksi Kas + Pengajuan RAPID server aktif'
          : 'Sumber data: Pengajuan RAPID server aktif',
      ],
      confirmLabel: 'Ekspor ke Google Sheets',
      execute: async () => {
        const [intakes, keuangan] = await Promise.all([
          api.listIntake(portalToken).catch(() => []),
          allowedFinance ? api.listKeuangan(portalToken).catch(() => []) : Promise.resolve([]),
        ]);
        const rows: Array<Array<string | number>> = [
          ['BAGIAN', 'ID', 'TANGGAL', 'KATEGORI / JENIS', 'DESKRIPSI / JUDUL', 'NOMINAL (IDR)', 'STATUS', 'PENGAJU / OLEH'],
        ];
        for (const k of keuangan) {
          rows.push(['KAS', k.ID, k.Tanggal, `${k.Jenis} - ${k.Kategori}`, k.Keterangan, k.Nominal, `${k.Status} (${k.Rekonsiliasi})`, k.Oleh]);
        }
        for (const i of intakes) {
          rows.push(['RAPID', i.ID, i.TanggalBuat, `${i.Kategori} (${i.Unit})`, i.Judul, i.Nilai, i.Status, i.Pengaju]);
        }
        const sheetPayload = {
          title: `Laporan Holding Investasi (${new Date().toISOString().slice(0, 10)})`,
          sheetTitle: 'Kas & RAPID',
          rows,
        };
        const sheet = gasNative
          ? await callGas<{ spreadsheetId: string; title: string; spreadsheetUrl: string }>('gasWorkspaceDispatch', 'sheets.create', portalToken, sheetPayload)
          : await exportGoogleSheetFile(sheetPayload);
        setLastCreatedLink({ label: `Google Sheets: ${sheet.title}`, url: sheet.spreadsheetUrl });
        onLog?.(`Ekspor Google Sheets (${rows.length - 1} baris)`, 'Google Sheets');
        onNotify('Google Sheets berhasil diekspor ke Google Drive.');
        const files = gasNative
          ? await callGas<GoogleDriveFileItem[]>('gasWorkspaceDispatch', 'drive.list', portalToken, {})
          : await listAppDriveFiles();
        setDriveFiles(files);
      },
    });
  };

  const askTrashDriveFile = (file: GoogleDriveFileItem) => {
    setPendingAction({
      title: `Pindahkan "${file.name}" ke Sampah Google Drive?`,
      service: 'Google Drive',
      description: 'File akan dipindahkan ke folder Sampah (Trash) pada Google Drive Anda.',
      details: [`Nama File: ${file.name}`, `ID: ${file.id}`],
      destructive: true,
      confirmLabel: 'Pindahkan ke Sampah',
      execute: async () => {
        if (gasNative) {
          await callGas('gasWorkspaceDispatch', 'drive.trash', portalToken, { id: file.id });
        } else {
          await trashDriveFile(file.id);
        }
        setDriveFiles((prev) => prev.filter((x) => x.id !== file.id));
        onLog?.(`Buang file Drive ke sampah: ${file.name}`, 'Google Drive');
        onNotify(`"${file.name}" dipindahkan ke Sampah Drive.`);
      },
    });
  };

  const askCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      onNotify('Judul tugas wajib diisi.', true);
      return;
    }
    setPendingAction({
      title: `Tambahkan Tugas "${taskTitle.trim()}" ke Google Tasks?`,
      service: 'Google Tasks',
      description: 'Tugas baru akan ditambahkan ke daftar Google Tasks utama Anda.',
      details: [`Judul Tugas: ${taskTitle.trim()}`],
      confirmLabel: 'Tambah Tugas',
      execute: async () => {
        const payload = { title: taskTitle.trim(), notes: taskNotes.trim() };
        const t = gasNative
          ? await callGas<GoogleTaskItem>('gasWorkspaceDispatch', 'tasks.create', portalToken, payload)
          : await createGoogleTask(payload);
        setGoogleTasks((prev) => [t, ...prev]);
        setTaskTitle('');
        setTaskNotes('');
        onLog?.(`Tambah Google Task: ${t.title}`, 'Google Tasks');
        onNotify('Tugas ditambahkan ke Google Tasks.');
      },
    });
  };

  const askSyncPortalTasks = () => {
    setPendingAction({
      title: 'Sinkronkan Tugas Operasional Portal ke Google Tasks?',
      service: 'Google Tasks',
      description: 'Tugas operasional yang belum selesai di portal akan disalin ke Google Tasks Anda.',
      details: ['Maksimal 5 tugas aktif dari modul Tugas Operasional Holding.'],
      confirmLabel: 'Sinkronkan Tugas',
      execute: async () => {
        const portalTasks = await api.listTugas(portalToken);
        const pending = portalTasks.filter((t) => t.Status !== 'Selesai').slice(0, 5);
        for (const pt of pending) {
          const payload = {
            title: `[${pt.ID}] ${pt.Tugas}`,
            notes: `Kategori: ${pt.Kategori} · Eksekutor: ${pt.Eksekutor} (${pt.Pengerja})`,
          };
          if (gasNative) {
            await callGas('gasWorkspaceDispatch', 'tasks.create', portalToken, payload);
          } else {
            await createGoogleTask(payload);
          }
        }
        const refreshed = gasNative
          ? await callGas<GoogleTaskItem[]>('gasWorkspaceDispatch', 'tasks.list', portalToken, {})
          : await listGoogleTasks();
        setGoogleTasks(refreshed);
        onLog?.(`Sinkron ${pending.length} tugas portal ke Google Tasks`, 'Google Tasks');
        onNotify(`${pending.length} tugas disinkronkan ke Google Tasks.`);
      },
    });
  };

  const askToggleTask = (t: GoogleTaskItem) => {
    const nextDone = t.status !== 'completed';
    setPendingAction({
      title: `${nextDone ? 'Tandai Selesai' : 'Buka Kembali'} Tugas "${t.title}"?`,
      service: 'Google Tasks',
      description: 'Status tugas pada Google Tasks Anda akan diperbarui.',
      details: [`Status baru: ${nextDone ? 'Selesai' : 'Aktif'}`],
      confirmLabel: 'Perbarui Tugas',
      execute: async () => {
        const updated = gasNative
          ? await callGas<GoogleTaskItem>('gasWorkspaceDispatch', 'tasks.toggle', portalToken, { id: t.id, completed: nextDone })
          : await toggleGoogleTaskStatus(t.id, nextDone);
        setGoogleTasks((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
        onLog?.(`Update Google Task: ${t.title} -> ${updated.status}`, 'Google Tasks');
      },
    });
  };

  const askDeleteTask = (t: GoogleTaskItem) => {
    setPendingAction({
      title: `Hapus Tugas "${t.title}" dari Google Tasks?`,
      service: 'Google Tasks',
      description: 'Tugas ini akan dihapus permanen dari daftar Google Tasks Anda.',
      details: [`ID Tugas: ${t.id}`],
      destructive: true,
      confirmLabel: 'Hapus Tugas',
      execute: async () => {
        if (gasNative) {
          await callGas('gasWorkspaceDispatch', 'tasks.delete', portalToken, { id: t.id });
        } else {
          await deleteGoogleTask(t.id);
        }
        setGoogleTasks((prev) => prev.filter((x) => x.id !== t.id));
        onLog?.(`Hapus Google Task: ${t.title}`, 'Google Tasks');
        onNotify('Tugas dihapus dari Google Tasks.');
      },
    });
  };

  return (
    <div className="bg-[#0f1a2c] border border-[#22365c] rounded-[11px] p-4 space-y-4">
      {/* Header & Auth Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#22365c]">
        <div>
          <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#38bdf8]">
            Ekosistem Google Workspace Terintegrasi
          </div>
          <h4 className="text-sm font-bold text-[#e8eefc] mt-0.5">
            Google Meet · Google Calendar · Gmail · Google Drive (Docs/Sheets) · Google Tasks
          </h4>
          <p className="text-[11.5px] text-[#9fb0d0]">
            Semua aksi penulisan data (jadwal rapat, kirim email, simpan file, dan perubahan tugas)
            meminta konfirmasi Anda terlebih dahulu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {needsAuth ? (
            <GoogleSignInButton
              onClick={handleGoogleLogin}
              disabled={signingIn}
              label={signingIn ? 'Menghubungkan…' : 'Sign in with Google'}
            />
          ) : (
            <>
              <div className="px-3 py-1.5 rounded-lg bg-[#0e2b23] border border-[#175c49] text-xs text-[#a7f3d0]">
                {gasNative ? (
                  <span>
                    Mode <b className="text-white">Apps Script Native</b> (Spreadsheet &amp; Workspace)
                  </span>
                ) : (
                  <span>
                    Terhubung: <b className="text-white">{googleUser?.email || 'Akun Google'}</b>
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={loadingData}
                onClick={() => void loadActiveTabData(subTab)}
                className="px-2.5 py-1.5 rounded-lg bg-[#182845] border border-[#22365c] hover:border-[#38bdf8] text-[#e8eefc] text-xs font-semibold cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                Segarkan
              </button>
              {!gasNative && (
                <button
                  type="button"
                  onClick={() => void handleGoogleDisconnect()}
                  className="px-2.5 py-1.5 rounded-lg bg-[#2b1414] border border-[#5b2c2c] hover:border-[#f87171] text-[#fca5a5] text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Putuskan
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="rounded-[8px] bg-[#2b1414] border border-[#5b2c2c] px-3 py-2 text-xs text-[#fca5a5]"
        >
          {errorMsg}
        </div>
      )}

      {needsAuth ? (
        <div className="bg-[#131f36] border border-[#22365c] rounded-[10px] p-5 text-center space-y-3">
          <div className="text-sm font-bold text-[#e8eefc]">
            Hubungkan Akun Google Anda untuk Mengakses Layanan Workspace
          </div>
          <p className="text-xs text-[#9fb0d0] max-w-xl mx-auto">
            Klik tombol di bawah untuk masuk menggunakan akun Google Workspace Anda agar dapat
            membuat ruang Google Meet, menjadwalkan Google Calendar, membaca &amp; mengirim Gmail,
            menyimpan laporan ke Google Drive/Docs/Sheets, serta menyinkronkan Google Tasks.
          </p>
          <div className="flex justify-center">
            <GoogleSignInButton
              onClick={handleGoogleLogin}
              disabled={signingIn}
              label={signingIn ? 'Menghubungkan…' : 'Sign in with Google'}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Sub-Tab Selector */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSubTab('meet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer inline-flex items-center gap-1.5 ${
                subTab === 'meet'
                  ? 'bg-[#38bdf8] border-[#38bdf8] text-[#06222f]'
                  : 'bg-[#182845] border-[#22365c] text-[#cfe0ff] hover:border-[#38bdf8]'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              Google Meet &amp; Calendar
            </button>
            <button
              type="button"
              onClick={() => setSubTab('gmail')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer inline-flex items-center gap-1.5 ${
                subTab === 'gmail'
                  ? 'bg-[#38bdf8] border-[#38bdf8] text-[#06222f]'
                  : 'bg-[#182845] border-[#22365c] text-[#cfe0ff] hover:border-[#38bdf8]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Gmail
            </button>
            <button
              type="button"
              onClick={() => setSubTab('drive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer inline-flex items-center gap-1.5 ${
                subTab === 'drive'
                  ? 'bg-[#38bdf8] border-[#38bdf8] text-[#06222f]'
                  : 'bg-[#182845] border-[#22365c] text-[#cfe0ff] hover:border-[#38bdf8]'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Google Drive · Docs · Sheets
            </button>
            <button
              type="button"
              onClick={() => setSubTab('tasks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer inline-flex items-center gap-1.5 ${
                subTab === 'tasks'
                  ? 'bg-[#38bdf8] border-[#38bdf8] text-[#06222f]'
                  : 'bg-[#182845] border-[#22365c] text-[#cfe0ff] hover:border-[#38bdf8]'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Google Tasks
            </button>
          </div>

          {/* 1. Google Meet & Calendar */}
          {subTab === 'meet' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="bg-[#131f36] border border-[#22365c] rounded-[10px] p-3.5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <b className="text-xs text-[#e8eefc]">Rapat Video Google Meet &amp; Jadwal</b>
                  <button
                    type="button"
                    onClick={askCreateMeetSpace}
                    className="px-3 py-1.5 rounded-[8px] bg-[#34d399] hover:bg-[#6ee7b7] text-[#06281f] text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Buat Meet Instan
                  </button>
                </div>

                {instantMeet && (
                  <div className="bg-[#0e2b23] border border-[#175c49] rounded-[9px] p-3 space-y-1 text-xs">
                    <div className="font-bold text-[#6ee7b7]">
                      Ruang Google Meet Aktif (Kode: {instantMeet.meetingCode})
                    </div>
                    <a
                      href={instantMeet.meetingUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#38bdf8] hover:underline font-mono break-all"
                    >
                      {instantMeet.meetingUri}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}

                <form onSubmit={askCreateCalendarMeet} className="space-y-2 pt-1 border-t border-[#22365c]">
                  <div className="text-[11.5px] font-bold text-[#9fb0d0]">
                    Jadwalkan Rapat Google Calendar (+ Tautan Google Meet)
                  </div>
                  <input
                    type="text"
                    value={calTitle}
                    onChange={(e) => setCalTitle(e.target.value)}
                    placeholder="Judul rapat"
                    required
                    className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#0f1a2c]"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-[#9fb0d0] mb-0.5">Mulai</label>
                      <input
                        type="datetime-local"
                        value={calStart}
                        onChange={(e) => setCalStart(e.target.value)}
                        required
                        className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#0f1a2c]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#9fb0d0] mb-0.5">Selesai</label>
                      <input
                        type="datetime-local"
                        value={calEnd}
                        onChange={(e) => setCalEnd(e.target.value)}
                        required
                        className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#0f1a2c]"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={calAttendees}
                    onChange={(e) => setCalAttendees(e.target.value)}
                    placeholder="Email peserta (pisahkan koma, opsional)"
                    className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#0f1a2c]"
                  />
                  <textarea
                    rows={2}
                    value={calDesc}
                    onChange={(e) => setCalDesc(e.target.value)}
                    placeholder="Agenda / catatan rapat (opsional)"
                    className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#0f1a2c]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-[8px] bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#06222f] text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Jadwalkan ke Calendar (+ Meet)
                  </button>
                </form>
              </div>

              <div className="bg-[#131f36] border border-[#22365c] rounded-[10px] p-3.5 space-y-2">
                <b className="text-xs text-[#e8eefc] block">Agenda Google Calendar Mendatang</b>
                {loadingData ? (
                  <div className="text-xs text-[#9fb0d0]">Memuat jadwal Google Calendar…</div>
                ) : events.length === 0 ? (
                  <div className="text-xs text-[#9fb0d0]">Belum ada jadwal mendatang di kalender utama.</div>
                ) : (
                  <div className="divide-y divide-dashed divide-[#22365c] max-h-[320px] overflow-y-auto pr-1">
                    {events.map((ev) => (
                      <div key={ev.id} className="py-2 flex items-start justify-between gap-2 text-xs">
                        <div className="min-w-0">
                          <div className="font-bold text-[#e8eefc] truncate">
                            {ev.summary || '(Tanpa Judul)'}
                          </div>
                          <div className="text-[11px] font-mono text-[#9fb0d0]">
                            {ev.start?.dateTime
                              ? new Date(ev.start.dateTime).toLocaleString('id-ID')
                              : ev.start?.date || '—'}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {ev.hangoutLink && (
                              <a
                                href={ev.hangoutLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#34d399] hover:underline"
                              >
                                Gabung Google Meet <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {ev.htmlLink && (
                              <a
                                href={ev.htmlLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-[#38bdf8] hover:underline"
                              >
                                Calendar <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => askDeleteCalendarEvent(ev)}
                          aria-label={`Hapus ${ev.summary || 'acara'}`}
                          className="p-1.5 rounded bg-[#2b1414] border border-[#5b2c2c] text-[#fca5a5] hover:border-[#f87171] cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Gmail */}
          {subTab === 'gmail' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <form
                onSubmit={askSendGmail}
                className="bg-[#131f36] border border-[#22365c] rounded-[10px] p-3.5 space-y-2.5"
              >
                <b className="text-xs text-[#e8eefc] block">Kirim Surat / Disposisi via Gmail</b>
                <input
                  type="email"
                  value={mailTo}
                  onChange={(e) => setMailTo(e.target.value)}
                  placeholder="Email penerima (mis. mitra@eksternal.id)"
                  required
                  className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#0f1a2c]"
                />
                <input
                  type="text"
                  value={mailSubject}
                  onChange={(e) => setMailSubject(e.target.value)}
                  placeholder="Subjek email"
                  required
                  className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#0f1a2c]"
                />
                <textarea
                  rows={6}
                  value={mailBody}
                  onChange={(e) => setMailBody(e.target.value)}
                  placeholder="Isi pesan email…"
                  required
                  className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-xs text-[#e8eefc] bg-[#0f1a2c]"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-[8px] bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#06222f] text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Kirim via Gmail
                </button>
              </form>

              <div className="bg-[#131f36] border border-[#22365c] rounded-[10px] p-3.5 space-y-2">
                <b className="text-xs text-[#e8eefc] block">Kotak Masuk Gmail Terbaru</b>
                {loadingData ? (
                  <div className="text-xs text-[#9fb0d0]">Memuat Gmail…</div>
                ) : messages.length === 0 ? (
                  <div className="text-xs text-[#9fb0d0]">Tidak ada pesan ditemukan.</div>
                ) : (
                  <div className="divide-y divide-dashed divide-[#22365c] max-h-[320px] overflow-y-auto pr-1">
                    {messages.map((m) => (
                      <div key={m.id} className="py-2 text-xs space-y-0.5">
                        <div className="font-bold text-[#e8eefc] truncate">{m.subject}</div>
                        <div className="text-[10.5px] text-[#7dd3fc] truncate">{m.from}</div>
                        <div className="text-[11px] text-[#9fb0d0] line-clamp-2">{m.snippet}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Google Drive / Docs / Sheets */}
          {subTab === 'drive' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="bg-[#131f36] border border-[#22365c] rounded-[10px] p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <b className="text-xs text-[#e8eefc]">Buat Google Docs &amp; Ekspor Google Sheets</b>
                  <button
                    type="button"
                    onClick={askExportSheet}
                    className="px-3 py-1.5 rounded-[8px] bg-[#34d399] hover:bg-[#6ee7b7] text-[#06281f] text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Ekspor Kas &amp; RAPID ke Sheets
                  </button>
                </div>

                {lastCreatedLink && (
                  <div className="bg-[#0e2b23] border border-[#175c49] rounded-[9px] p-2.5 text-xs flex items-center justify-between gap-2">
                    <span className="text-[#a7f3d0] truncate">{lastCreatedLink.label}</span>
                    <a
                      href={lastCreatedLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#38bdf8] font-bold hover:underline inline-flex items-center gap-1 shrink-0"
                    >
                      Buka <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                <form onSubmit={askCreateGoogleDoc} className="space-y-2 pt-1 border-t border-[#22365c]">
                  <div className="text-[11.5px] font-bold text-[#9fb0d0]">
                    Simpan Risalah / Memo ke Google Docs &amp; Drive
                  </div>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Judul dokumen Google Docs"
                    required
                    className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#0f1a2c]"
                  />
                  <textarea
                    rows={5}
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    placeholder="Isi risalah, memo investasi, atau hasil Gemini AI…"
                    required
                    className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-2 text-xs text-[#e8eefc] bg-[#0f1a2c]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-[8px] bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#06222f] text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Simpan ke Google Docs
                  </button>
                </form>
              </div>

              <div className="bg-[#131f36] border border-[#22365c] rounded-[10px] p-3.5 space-y-2">
                <b className="text-xs text-[#e8eefc] block">
                  File Google Drive Terkait Portal (drive.file)
                </b>
                {loadingData ? (
                  <div className="text-xs text-[#9fb0d0]">Memuat file Google Drive…</div>
                ) : driveFiles.length === 0 ? (
                  <div className="text-xs text-[#9fb0d0]">
                    Belum ada dokumen atau spreadsheet yang dibuat lewat portal.
                  </div>
                ) : (
                  <div className="divide-y divide-dashed divide-[#22365c] max-h-[320px] overflow-y-auto pr-1">
                    {driveFiles.map((f) => (
                      <div key={f.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                        <div className="min-w-0">
                          <div className="font-bold text-[#e8eefc] truncate">{f.name}</div>
                          <div className="text-[10.5px] font-mono text-[#9fb0d0]">
                            {f.modifiedTime
                              ? new Date(f.modifiedTime).toLocaleString('id-ID')
                              : 'Drive File'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {f.webViewLink && (
                            <a
                              href={f.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded bg-[#182845] border border-[#22365c] text-[#38bdf8] text-[11px] font-semibold hover:border-[#38bdf8] inline-flex items-center gap-1"
                            >
                              Buka <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => askTrashDriveFile(f)}
                            aria-label={`Pindahkan ${f.name} ke sampah`}
                            className="p-1.5 rounded bg-[#2b1414] border border-[#5b2c2c] text-[#fca5a5] hover:border-[#f87171] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Google Tasks */}
          {subTab === 'tasks' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="bg-[#131f36] border border-[#22365c] rounded-[10px] p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <b className="text-xs text-[#e8eefc]">Tambah &amp; Sinkron Google Tasks</b>
                  <button
                    type="button"
                    onClick={askSyncPortalTasks}
                    className="px-3 py-1.5 rounded-[8px] bg-[#34d399] hover:bg-[#6ee7b7] text-[#06281f] text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Sinkron Tugas Operasional
                  </button>
                </div>

                <form onSubmit={askCreateTask} className="space-y-2 pt-1 border-t border-[#22365c]">
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Judul tugas baru di Google Tasks"
                    required
                    className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#0f1a2c]"
                  />
                  <textarea
                    rows={3}
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                    placeholder="Catatan tugas (opsional)"
                    className="w-full border border-[#22365c] rounded-[8px] px-2.5 py-1.5 text-xs text-[#e8eefc] bg-[#0f1a2c]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-[8px] bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#06222f] text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambahkan ke Google Tasks
                  </button>
                </form>
              </div>

              <div className="bg-[#131f36] border border-[#22365c] rounded-[10px] p-3.5 space-y-2">
                <b className="text-xs text-[#e8eefc] block">Daftar Google Tasks Anda</b>
                {loadingData ? (
                  <div className="text-xs text-[#9fb0d0]">Memuat Google Tasks…</div>
                ) : googleTasks.length === 0 ? (
                  <div className="text-xs text-[#9fb0d0]">Belum ada tugas di daftar utama.</div>
                ) : (
                  <div className="divide-y divide-dashed divide-[#22365c] max-h-[320px] overflow-y-auto pr-1">
                    {googleTasks.map((t) => {
                      const done = t.status === 'completed';
                      return (
                        <div key={t.id} className="py-2 flex items-start justify-between gap-2 text-xs">
                          <label className="flex items-start gap-2 cursor-pointer min-w-0">
                            <input
                              type="checkbox"
                              checked={done}
                              onChange={() => askToggleTask(t)}
                              className="mt-0.5 cursor-pointer"
                            />
                            <div className="min-w-0">
                              <div
                                className={`font-semibold ${
                                  done ? 'line-through text-[#7c8fb3]' : 'text-[#e8eefc]'
                                }`}
                              >
                                {t.title}
                              </div>
                              {t.notes && (
                                <div className="text-[10.5px] text-[#9fb0d0] line-clamp-2">
                                  {t.notes}
                                </div>
                              )}
                            </div>
                          </label>
                          <button
                            type="button"
                            onClick={() => askDeleteTask(t)}
                            aria-label={`Hapus tugas ${t.title}`}
                            className="p-1.5 rounded bg-[#2b1414] border border-[#5b2c2c] text-[#fca5a5] hover:border-[#f87171] cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <WorkspaceConfirmModal
        action={pendingAction}
        busy={actionBusy}
        onCancel={() => !actionBusy && setPendingAction(null)}
        onConfirm={() => void runConfirmedAction()}
      />
    </div>
  );
};
