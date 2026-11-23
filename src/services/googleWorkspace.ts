import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/tasks',
] as const;

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
for (const scope of WORKSPACE_SCOPES) {
  provider.addScope(scope);
}
provider.setCustomParameters({
  prompt: 'consent select_account',
});

// Strict in-memory OAuth access token cache only (never localStorage/sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

export class WorkspaceAuthError extends Error {
  constructor(message = 'Sesi Google Workspace belum aktif atau kedaluwarsa. Silakan masuk ulang.') {
    super(message);
    this.name = 'WorkspaceAuthError';
  }
}

export const initWorkspaceAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user && cachedAccessToken) {
      onAuthSuccess?.(user, cachedAccessToken);
    } else if (!isSigningIn) {
      cachedAccessToken = null;
      onAuthFailure?.(user);
    }
  });
};

export const googleWorkspaceSignIn = async (): Promise<{
  user: User;
  accessToken: string;
}> => {
  isSigningIn = true;
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal memperoleh token akses Google Workspace.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getWorkspaceAccessToken = (): string | null => cachedAccessToken;

export const getCurrentWorkspaceUser = (): User | null => auth.currentUser;

export const workspaceSignOut = async (): Promise<void> => {
  cachedAccessToken = null;
  await auth.signOut();
};

async function wsFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const token = cachedAccessToken;
  if (!token) {
    throw new WorkspaceAuthError();
  }
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...((init.headers as Record<string, string>) || {}),
  };
  if (init.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, { ...init, headers });
  if (res.status === 401) {
    cachedAccessToken = null;
    throw new WorkspaceAuthError('Token akses Google telah kedaluwarsa. Silakan hubungkan ulang akun Google Anda.');
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const msg =
      data?.error?.message ||
      data?.error_description ||
      `Permintaan ke Google Workspace gagal (${res.status}).`;
    throw new Error(msg);
  }
  return data as T;
}

// ---------- Google Meet ----------
export interface GoogleMeetSpace {
  name: string;
  meetingUri: string;
  meetingCode: string;
}

export async function createGoogleMeetSpace(): Promise<GoogleMeetSpace> {
  return wsFetch<GoogleMeetSpace>('https://meet.googleapis.com/v2/spaces', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

// ---------- Google Calendar ----------
export interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  htmlLink?: string;
  hangoutLink?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  attendees?: Array<{ email: string; responseStatus?: string }>;
}

export async function listCalendarEvents(maxResults = 10): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: String(maxResults),
  });
  const data = await wsFetch<{ items?: GoogleCalendarEvent[] }>(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`
  );
  return data.items || [];
}

export async function createCalendarEventWithMeet(input: {
  summary: string;
  description?: string;
  startIso: string;
  endIso: string;
  attendeeEmails?: string[];
}): Promise<GoogleCalendarEvent> {
  const attendees = (input.attendeeEmails || [])
    .map((e) => e.trim())
    .filter(Boolean)
    .map((email) => ({ email }));

  const requestId = `hi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return wsFetch<GoogleCalendarEvent>(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
    {
      method: 'POST',
      body: JSON.stringify({
        summary: input.summary,
        description: input.description || '',
        start: { dateTime: input.startIso, timeZone: 'Asia/Jakarta' },
        end: { dateTime: input.endIso, timeZone: 'Asia/Jakarta' },
        ...(attendees.length > 0 ? { attendees } : {}),
        conferenceData: {
          createRequest: {
            requestId,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      }),
    }
  );
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  await wsFetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
    { method: 'DELETE' }
  );
}

// ---------- Gmail ----------
export interface GmailMessageSummary {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

function encodeBase64UrlUtf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function encodeRfc2047Subject(subject: string): string {
  const bytes = new TextEncoder().encode(subject);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `=?UTF-8?B?${btoa(binary)}?=`;
}

export async function listGmailMessages(maxResults = 8): Promise<GmailMessageSummary[]> {
  const list = await wsFetch<{ messages?: Array<{ id: string; threadId: string }> }>(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`
  );
  const items = list.messages || [];
  if (items.length === 0) return [];

  const details = await Promise.all(
    items.map((m) =>
      wsFetch<{
        id: string;
        threadId: string;
        snippet?: string;
        payload?: { headers?: Array<{ name: string; value: string }> };
      }>(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(m.id)}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`
      )
    )
  );

  return details.map((d) => {
    const hdrs = d.payload?.headers || [];
    const getH = (name: string) =>
      hdrs.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
    return {
      id: d.id,
      threadId: d.threadId,
      subject: getH('Subject') || '(Tanpa Subjek)',
      from: getH('From') || 'Tidak diketahui',
      date: getH('Date') || '',
      snippet: d.snippet || '',
    };
  });
}

export async function sendGmailMessage(input: {
  to: string;
  subject: string;
  body: string;
}): Promise<{ id: string; threadId: string }> {
  const mime = [
    `To: ${input.to.trim()}`,
    `Subject: ${encodeRfc2047Subject(input.subject.trim())}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    input.body,
  ].join('\r\n');

  const raw = encodeBase64UrlUtf8(mime);
  return wsFetch<{ id: string; threadId: string }>(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      body: JSON.stringify({ raw }),
    }
  );
}

// ---------- Google Drive / Docs / Sheets ----------
export interface GoogleDriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  modifiedTime?: string;
}

export async function listAppDriveFiles(): Promise<GoogleDriveFileItem[]> {
  const params = new URLSearchParams({
    q: 'trashed = false',
    orderBy: 'modifiedTime desc',
    pageSize: '15',
    fields: 'files(id,name,mimeType,webViewLink,modifiedTime)',
  });
  const data = await wsFetch<{ files?: GoogleDriveFileItem[] }>(
    `https://www.googleapis.com/drive/v3/files?${params.toString()}`
  );
  return data.files || [];
}

export async function createGoogleDocFile(input: {
  title: string;
  content: string;
}): Promise<{ documentId: string; title: string; webViewLink: string }> {
  const created = await wsFetch<{ documentId: string; title: string }>(
    'https://docs.googleapis.com/v1/documents',
    {
      method: 'POST',
      body: JSON.stringify({ title: input.title.trim() }),
    }
  );

  if (input.content.trim()) {
    await wsFetch(
      `https://docs.googleapis.com/v1/documents/${encodeURIComponent(created.documentId)}:batchUpdate`,
      {
        method: 'POST',
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: input.content,
              },
            },
          ],
        }),
      }
    );
  }

  return {
    documentId: created.documentId,
    title: created.title,
    webViewLink: `https://docs.google.com/document/d/${created.documentId}/edit`,
  };
}

export async function exportGoogleSheetFile(input: {
  title: string;
  sheetTitle: string;
  rows: Array<Array<string | number>>;
}): Promise<{ spreadsheetId: string; title: string; spreadsheetUrl: string }> {
  const created = await wsFetch<{
    spreadsheetId: string;
    spreadsheetUrl: string;
    properties?: { title?: string };
    sheets?: Array<{ properties?: { title?: string } }>;
  }>('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    body: JSON.stringify({
      properties: { title: input.title.trim() },
      sheets: [{ properties: { title: input.sheetTitle.trim() || 'Ringkasan' } }],
    }),
  });

  const actualSheetName =
    created.sheets?.[0]?.properties?.title || input.sheetTitle.trim() || 'Ringkasan';
  if (input.rows.length > 0) {
    const range = encodeURIComponent(`${actualSheetName}!A1`);
    await wsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        created.spreadsheetId
      )}/values/${range}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        body: JSON.stringify({ values: input.rows }),
      }
    );
  }

  return {
    spreadsheetId: created.spreadsheetId,
    title: created.properties?.title || input.title,
    spreadsheetUrl:
      created.spreadsheetUrl ||
      `https://docs.google.com/spreadsheets/d/${created.spreadsheetId}/edit`,
  };
}

export async function trashDriveFile(fileId: string): Promise<void> {
  await wsFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ trashed: true }),
  });
}

// ---------- Google Tasks ----------
export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
}

export async function listGoogleTasks(): Promise<GoogleTaskItem[]> {
  const data = await wsFetch<{ items?: GoogleTaskItem[] }>(
    'https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?showCompleted=true&maxResults=25'
  );
  return data.items || [];
}

export async function createGoogleTask(input: {
  title: string;
  notes?: string;
}): Promise<GoogleTaskItem> {
  return wsFetch<GoogleTaskItem>('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
    method: 'POST',
    body: JSON.stringify({
      title: input.title.trim(),
      notes: input.notes?.trim() || undefined,
    }),
  });
}

export async function toggleGoogleTaskStatus(
  taskId: string,
  completed: boolean
): Promise<GoogleTaskItem> {
  return wsFetch<GoogleTaskItem>(
    `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${encodeURIComponent(taskId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        id: taskId,
        status: completed ? 'completed' : 'needsAction',
      }),
    }
  );
}

export async function deleteGoogleTask(taskId: string): Promise<void> {
  await wsFetch(
    `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${encodeURIComponent(taskId)}`,
    { method: 'DELETE' }
  );
}
