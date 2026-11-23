import React, { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import { AlurKerjaView } from './components/AlurKerjaView';
import { DetailDrawer, type DrawerSelection } from './components/DetailDrawer';
import { KantorAiView } from './components/KantorAiView';
import { KatalogView } from './components/KatalogView';
import { OrganisasiView } from './components/OrganisasiView';
import { PembagianTugasView } from './components/PembagianTugasView';
import { RingkasanView } from './components/RingkasanView';
import { StrukturInvestasiView } from './components/StrukturInvestasiView';
import type { UserPublic } from './types';

type PortalTab =
  | 'kantor'
  | 'ringkas'
  | 'org'
  | 'tugas'
  | 'inv'
  | 'aset'
  | 'alur';

const PORTAL_TABS: Array<{ id: PortalTab; label: string }> = [
  { id: 'kantor', label: 'Kantor AI & Sistem Kerja' },
  { id: 'ringkas', label: 'Ringkasan' },
  { id: 'org', label: 'Organisasi' },
  { id: 'tugas', label: 'Pembagian Tugas' },
  { id: 'inv', label: 'Struktur Investasi' },
  { id: 'aset', label: 'Katalog 160 Aset' },
  { id: 'alur', label: 'Alur Kerja' },
];

function getWibClockText(): string {
  const now = new Date();
  const wib = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 7 * 3600000);
  const hh = String(wib.getHours()).padStart(2, '0');
  const mm = String(wib.getMinutes()).padStart(2, '0');
  const ss = String(wib.getSeconds()).padStart(2, '0');
  return `${hh}.${mm}.${ss} WIB`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<PortalTab>('kantor');
  const [drawerSel, setDrawerSel] = useState<DrawerSelection>(null);
  const [wibClock, setWibClock] = useState<string>(getWibClockText);

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserPublic | null>(null);
  const [prefillMemberId, setPrefillMemberId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; isError: boolean } | null>(null);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  useEffect(() => {
    const onQuota = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setWibClock(getWibClockText());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const notify = useCallback((msg: string, isError = false) => {
    setToast({ msg, isError });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleLoginSuccess = useCallback(
    (newToken: string, loggedUser: UserPublic) => {
      setToken(newToken);
      setUser(loggedUser);
      setPrefillMemberId(null);
      notify(`Selamat datang, ${loggedUser.Nama}.`);
    },
    [notify]
  );

  const handleSessionExpired = useCallback(() => {
    setToken(null);
    setUser(null);
    notify('Sesi berakhir. Silakan verifikasi ulang (Wajah, Maps & OTP Email).', true);
  }, [notify]);

  const handleLogout = useCallback(async () => {
    if (token) {
      await api.logout(token).catch(() => undefined);
    }
    setToken(null);
    setUser(null);
    notify('Anda telah keluar dari Papan & Sistem Kerja.');
  }, [token, notify]);

  return (
    <div className="min-h-screen flex flex-col">
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <header className="bg-gradient-to-br from-[#131f36] to-[#1b2b4d] border-b border-[#22365c] px-5 pt-5 pb-4">
        <div className="max-w-[1240px] mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-[20px] sm:text-[22px] font-bold tracking-[-0.01em] text-[#e8eefc]">
                Holding Investasi —{' '}
                <span className="text-[#c4b5fd]">Portal Terpadu Kantor AI &amp; Sistem Kerja</span>
              </h1>
              <p className="mt-1 text-[13px] text-[#9fb0d0] max-w-[820px]">
                Bukan pialang; berinvestasi dengan modal sendiri di 160 jenis aset. Menyatukan
                papan kerja 3 lantai Kantor AI dan Sistem Kerja operasional dalam 1 akses (Wajah,
                Google Maps &amp; OTP Email).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="px-3 py-1.5 rounded-lg bg-[#0f1a2c] border border-[#22365c] text-xs font-mono tabular-nums text-[#38bdf8] flex items-center gap-2">
                <span className="text-[#34d399] font-bold">DARING</span>
                <span>·</span>
                <span>{wibClock}</span>
              </div>
              {user ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('kantor')}
                  className="px-3 py-1.5 rounded-lg bg-[#0e2b23] border border-[#175c49] hover:border-[#34d399] text-xs font-semibold text-[#6ee7b7] cursor-pointer whitespace-nowrap"
                >
                  {user.ID} · {user.Nama} ({user.Tier})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('kantor')}
                  className="px-3 py-1.5 rounded-lg bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#06222f] text-xs font-bold cursor-pointer whitespace-nowrap"
                >
                  Masuk (Wajah · Maps · OTP)
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-[#9fb0d0] tabular-nums">
            <span>
              <b className="text-[#e8eefc]">160</b> Jenis aset
            </span>
            <span>
              <b className="text-[#e8eefc]">24</b> Unit kerja
            </span>
            <span>
              <b className="text-[#e8eefc]">80</b> Jabatan manusia
            </span>
            <span>
              <b className="text-[#e8eefc]">18</b> Agent AI
            </span>
            <span>
              <b className="text-[#e8eefc]">6</b> Badan hukum
            </span>
            <span>
              <b className="text-[#e8eefc]">26 / 71 / 156</b> FTE per fase
            </span>
          </div>
        </div>
      </header>

      <nav
        className="sticky top-0 z-30 bg-[#0b1220] border-b border-[#22365c] px-5 py-2.5"
        aria-label="Navigasi utama portal"
      >
        <div className="max-w-[1240px] mx-auto flex flex-wrap gap-1.5">
          {PORTAL_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#38bdf8] border-[#38bdf8] text-[#06222f] font-semibold'
                    : 'bg-[#182845] border-[#22365c] text-[#cfe0ff] hover:border-[#38bdf8]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1240px] mx-auto px-5 py-5 pb-16">
        {activeTab === 'kantor' && (
          <KantorAiView
            token={token}
            user={user}
            prefillMemberId={prefillMemberId}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            onSessionExpired={handleSessionExpired}
            onOpenDrawer={setDrawerSel}
            onNotify={notify}
          />
        )}
        {activeTab === 'ringkas' && <RingkasanView />}
        {activeTab === 'org' && <OrganisasiView onSelect={setDrawerSel} />}
        {activeTab === 'tugas' && <PembagianTugasView />}
        {activeTab === 'inv' && <StrukturInvestasiView onSelect={setDrawerSel} />}
        {activeTab === 'aset' && <KatalogView />}
        {activeTab === 'alur' && <AlurKerjaView />}
      </main>

      <footer className="border-t border-[#22365c] bg-[#0b1220] px-5 py-3.5 text-center text-xs text-[#9fb0d0]">
        Holding Investasi · Bukan pialang; modal sendiri · 160 jenis aset · 24 unit · 18 agent AI ·
        Kantor AI &amp; Sistem Kerja terpadu (Verifikasi Wajah, Google Maps &amp; OTP Email)
      </footer>

      <DetailDrawer selection={drawerSel} onClose={() => setDrawerSel(null)} />

      {toast && (
        <div
          role="status"
          className={`fixed right-4 bottom-4 px-4 py-2.5 rounded-[10px] border text-xs font-medium max-w-[88vw] z-50 shadow-lg ${
            toast.isError
              ? 'bg-[#2b1414] border-[#5b2c2c] text-[#fca5a5]'
              : 'bg-[#131f36] border-[#38bdf8] text-[#e8eefc]'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
