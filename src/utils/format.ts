import type { UserTier } from '../types';

export function formatRupiah(nominal: number | string | undefined | null): string {
  const n = Number(nominal) || 0;
  const abs = Math.abs(n).toLocaleString('id-ID');
  return n < 0 ? `-Rp${abs}` : `Rp${abs}`;
}

export function getRapidRequirement(nilai: number): {
  label: string;
  rank: number;
  ringkas: string;
} {
  const n = Number(nilai) || 0;
  if (n > 5_000_000_000) {
    return {
      label: 'Direksi / Komisaris',
      rank: 3,
      ringkas: '> Rp5 Miliar · Wajib Direksi / Pemilik',
    };
  }
  if (n > 500_000_000) {
    return {
      label: 'CIO / Manajemen',
      rank: 2,
      ringkas: '> Rp500 Juta · Wajib CIO / Manajemen',
    };
  }
  return {
    label: 'Desk Head / Staf',
    rank: 1,
    ringkas: '≤ Rp500 Juta · Desk Head / Staf',
  };
}

export function canAccessSection(tier: UserTier, section: string): boolean {
  switch (section) {
    case 'dashboard':
    case 'intake':
      return true;
    case 'keuangan':
      return ['Pemilik', 'Manajemen', 'Staf', 'Auditor'].includes(tier);
    case 'tugas':
      return ['Pemilik', 'Manajemen', 'Staf', 'Freelancer'].includes(tier);
    case 'absen':
      return ['Pemilik', 'Manajemen', 'Staf'].includes(tier);
    case 'dokumen':
      return ['Pemilik', 'Manajemen', 'Staf', 'Auditor', 'Freelancer'].includes(tier);
    case 'audit':
      return ['Pemilik', 'Manajemen', 'Auditor'].includes(tier);
    case 'pengguna':
      return tier === 'Pemilik';
    default:
      return false;
  }
}

export function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>): void {
  const escapeCell = (val: string | number): string => {
    const str = String(val ?? '');
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csv = [headers.map(escapeCell).join(','), ...rows.map((r) => r.map(escapeCell).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
