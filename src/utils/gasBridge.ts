export interface GasWindow {
  google?: {
    script?: {
      run?: {
        withSuccessHandler: (cb: (res: unknown) => void) => {
          withFailureHandler: (errCb: (err: Error) => void) => Record<
            string,
            (...args: unknown[]) => void
          >;
        };
      };
    };
  };
  __GAS_MAPS_KEY__?: string;
}

export function isAppsScriptRuntime(): boolean {
  if (typeof window === 'undefined') return false;
  const g = (window as unknown as GasWindow).google;
  return Boolean(g?.script?.run);
}

export function getGasMapsKey(): string {
  if (typeof window === 'undefined') return '';
  return (window as unknown as GasWindow).__GAS_MAPS_KEY__ || '';
}

export function callGas<T>(fnName: string, ...args: unknown[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const runner = (window as unknown as GasWindow).google?.script?.run;
    if (!runner) {
      reject(new Error('Google Apps Script runtime tidak ditemukan.'));
      return;
    }
    const handler = runner
      .withSuccessHandler((res) => resolve(res as T))
      .withFailureHandler((err) => {
        const msg = err?.message || String(err || 'Gagal memanggil server Apps Script.');
        reject(new Error(msg));
      });
    const fn = handler[fnName];
    if (typeof fn !== 'function') {
      reject(new Error(`Fungsi Apps Script "${fnName}" tidak ditemukan di Code.gs.`));
      return;
    }
    fn(...args);
  });
}
