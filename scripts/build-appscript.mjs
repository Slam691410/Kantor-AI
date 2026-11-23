import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';

const root = process.cwd();
const outDir = path.resolve(root, 'versi-appscript');
const distAssetsDir = path.resolve(root, 'dist', 'assets');

console.log('1/3 Membangun CSS Tailwind via Vite...');
execSync('npx vite build', { stdio: 'inherit', cwd: root });

const cssFiles = fs.existsSync(distAssetsDir)
  ? fs.readdirSync(distAssetsDir).filter((f) => f.endsWith('.css'))
  : [];

const combinedCss = cssFiles
  .map((f) => fs.readFileSync(path.join(distAssetsDir, f), 'utf8'))
  .join('\n');

console.log('2/3 Membundel React SPA ke single-file IIFE untuk Google Apps Script...');
const aliasPlugin = {
  name: 'alias-root',
  setup(build) {
    build.onResolve({ filter: /^@\// }, (args) => ({
      path: path.resolve(root, args.path.slice(2)),
    }));
  },
};

const result = await esbuild.build({
  entryPoints: [path.resolve(root, 'src', 'main.tsx')],
  bundle: true,
  minify: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  jsx: 'automatic',
  write: false,
  plugins: [aliasPlugin],
  loader: {
    '.css': 'empty',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': '""',
    'import.meta.env.VITE_GOOGLE_MAP_ID': '""',
    'import.meta.env.DEV': 'false',
    'import.meta.env.PROD': 'true',
  },
});

const jsBundle = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const safeCss = combinedCss.replace(/<\/style/gi, '<\\/style');

const html = `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Holding Investasi — Portal &amp; Kantor AI</title>
    <script>
      window.__GAS_MAPS_KEY__ = <?!= JSON.stringify(typeof mapsKey !== 'undefined' ? mapsKey : '') ?>;
    </script>
    <style>${safeCss}</style>
  </head>
  <body>
    <div id="root"></div>
    <script>${jsBundle}</script>
  </body>
</html>
`;

fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'Index.html');
fs.writeFileSync(outFile, html, 'utf8');
const kb = Math.round(Buffer.byteLength(html, 'utf8') / 1024);
console.log(`3/3 Selesai: ${outFile} (${kb} KB) siap diunggah ke Google Apps Script.`);
