import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';

export function offlineShellPlugin(): Plugin {
  return {
    name: 'smart-inventory-offline-shell',
    apply: 'build',
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const hash = createHash('sha256');
        const assets = ['/favicon.svg', '/icons.svg'];
        for (const name of assets) {
          hash.update(readFileSync(new URL(`./public${name}`, import.meta.url)));
        }
        for (const name of Object.keys(bundle).sort()) {
          if (name !== 'index.html' && !name.startsWith('assets/')) continue;
          const entry = bundle[name];
          assets.push(`/${name}`);
          hash.update(name).update(entry.type === 'chunk' ? entry.code : entry.source);
        }
        if (!assets.includes('/index.html')) this.error('Offline shell requires a built index.html');
        const worker = readFileSync(new URL('./offlineShellWorker.js', import.meta.url), 'utf8');
        hash.update(worker);
        this.emitFile({
          type: 'asset',
          fileName: 'offline-shell.js',
          source: `const CACHE = "smart-inventory-shell-${hash.digest('hex').slice(0, 20)}";\nconst ASSETS = ${JSON.stringify(assets)};\n${worker}`,
        });
      },
    },
  };
}
