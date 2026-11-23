import React, { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import type {
  AbsenItem,
  AuditItem,
  DashboardData,
  DokumenItem,
  IntakeItem,
  KeuanganItem,
  PenggunaAdminItem,
  SystemHealth,
  TugasItem,
  UserPublic,
} from '../types';
import { canAccessSection } from '../utils/format';
import { AbsenView } from './AbsenView';
import { AuditView } from './AuditView';
import { DashboardView } from './DashboardView';
import { DokumenView } from './DokumenView';
import { IntakeView } from './IntakeView';
import { KeuanganView } from './KeuanganView';
import { PenggunaView } from './PenggunaView';
import { TugasView } from './TugasView';

export type SistemSubSection =
  | 'dashboard'
  | 'intake'
  | 'keuangan'
  | 'tugas'
  | 'absen'
  | 'dokumen'
  | 'audit'
  | 'pengguna';

export const SISTEM_SUB_TABS: Array<{ id: SistemSubSection; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'intake', label: 'Intake & RAPID' },
  { id: 'keuangan', label: 'Keuangan' },
  { id: 'tugas', label: 'Tugas Operasional' },
  { id: 'absen', label: 'Absensi Wajah & Maps' },
  { id: 'dokumen', label: 'Dokumen' },
  { id: 'audit', label: 'Audit Log Server' },
  { id: 'pengguna', label: 'Pengguna & Email OTP' },
];

interface SistemKerjaPanelProps {
  token: string;
  user: UserPublic;
  section: SistemSubSection;
  refreshSignal: number;
  onNavigate: (section: SistemSubSection) => void;
  onAbsenRecorded?: (item: AbsenItem) => void;
  onSessionExpired: () => void;
  onNotify: (msg: string, isError?: boolean) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export const SistemKerjaPanel: React.FC<SistemKerjaPanelProps> = ({
  token,
  user,
  section,
  refreshSignal,
  onNavigate,
  onAbsenRecorded,
  onSessionExpired,
  onNotify,
  onLoadingChange,
}) => {
  const [loading, setLoading] = useState(false);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [intake, setIntake] = useState<IntakeItem[]>([]);
  const [keuangan, setKeuangan] = useState<KeuanganItem[]>([]);
  const [tugas, setTugas] = useState<TugasItem[]>([]);
  const [absen, setAbsen] = useState<AbsenItem[]>([]);
  const [dokumen, setDokumen] = useState<DokumenItem[]>([]);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const [pengguna, setPengguna] = useState<PenggunaAdminItem[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);

  const loadSectionData = useCallback(
    async (target: SistemSubSection, activeToken: string, activeUser: UserPublic) => {
      if (!canAccessSection(activeUser.Tier, target)) return;
      setLoading(true);
      onLoadingChange?.(true);
      try {
        switch (target) {
          case 'dashboard': {
            setDashboard(await api.getDashboard(activeToken));
            break;
          }
          case 'intake': {
            setIntake(await api.listIntake(activeToken));
            break;
          }
          case 'keuangan': {
            setKeuangan(await api.listKeuangan(activeToken));
            break;
          }
          case 'tugas': {
            setTugas(await api.listTugas(activeToken));
            break;
          }
          case 'absen': {
            setAbsen(await api.listAbsen(activeToken));
            break;
          }
          case 'dokumen': {
            setDokumen(await api.listDokumen(activeToken));
            break;
          }
          case 'audit': {
            setAudit(await api.listAudit(activeToken));
            break;
          }
          case 'pengguna': {
            const [users, health] = await Promise.all([
              api.listPengguna(activeToken),
              api.getSystemHealth(activeToken),
            ]);
            setPengguna(users);
            setSystemHealth(health);
            break;
          }
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          onSessionExpired();
        } else {
          onNotify(err instanceof Error ? err.message : 'Gagal memuat data.', true);
        }
      } finally {
        setLoading(false);
        onLoadingChange?.(false);
      }
    },
    [onSessionExpired, onNotify, onLoadingChange]
  );

  useEffect(() => {
    loadSectionData(section, token, user);
  }, [section, refreshSignal, token, user, loadSectionData]);

  return (
    <div>
      {section === 'dashboard' && (
        <DashboardView
          user={user}
          data={dashboard}
          loading={loading}
          onNavigate={onNavigate}
        />
      )}
      {section === 'intake' && (
        <IntakeView
          token={token}
          user={user}
          items={intake}
          loading={loading}
          onRefresh={() => loadSectionData('intake', token, user)}
          onNotify={onNotify}
        />
      )}
      {section === 'keuangan' && (
        <KeuanganView
          token={token}
          user={user}
          items={keuangan}
          loading={loading}
          onRefresh={() => loadSectionData('keuangan', token, user)}
          onNotify={onNotify}
        />
      )}
      {section === 'tugas' && (
        <TugasView
          token={token}
          user={user}
          items={tugas}
          loading={loading}
          onRefresh={() => loadSectionData('tugas', token, user)}
          onNotify={onNotify}
        />
      )}
      {section === 'absen' && (
        <AbsenView
          token={token}
          user={user}
          items={absen}
          loading={loading}
          onAbsenRecorded={onAbsenRecorded}
          onRefresh={() => loadSectionData('absen', token, user)}
          onNotify={onNotify}
        />
      )}
      {section === 'dokumen' && (
        <DokumenView
          token={token}
          user={user}
          items={dokumen}
          loading={loading}
          onRefresh={() => loadSectionData('dokumen', token, user)}
          onNotify={onNotify}
        />
      )}
      {section === 'audit' && <AuditView items={audit} loading={loading} />}
      {section === 'pengguna' && (
        <PenggunaView
          token={token}
          currentUser={user}
          users={pengguna}
          systemHealth={systemHealth}
          loading={loading}
          onRefresh={() => loadSectionData('pengguna', token, user)}
          onNotify={onNotify}
        />
      )}
    </div>
  );
};
