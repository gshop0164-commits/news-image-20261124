// News Image entry for Tuesday 24 November 2026 (Node 22, standard library only).
//
// The picture itself lives in this repository as entry.png: a newspaper-style
// infographic drawn from render.html and screenshotted at exactly 1024x1024.
// This program does one small, deterministic job — it checks the image is the
// size the bounty asks for, then copies it to the output folder. Because the
// image is a fixed file, every run writes the exact same bytes.
//
// Run it locally like this:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (Without MAKEFUN_OUTPUT_DIR it writes to /output, as the grader expects.)

import { copyFileSync, existsSync, readFileSync, statSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, 'entry.png');
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const target = join(outDir, 'entry.png');

// The gate only accepts a whole PNG of at most 1 MiB and 1024 by 1024 pixels,
// so refuse early instead of handing in something the gate would throw out.
if (!existsSync(source)) {
  throw new Error(`entry.png is missing next to main.ts (${source})`);
}
const bytes = statSync(source).size;
if (bytes > 1024 * 1024) {
  throw new Error(`entry.png is ${bytes} bytes, over the 1 MiB limit`);
}
const header = readFileSync(source, { flag: 'r' });
// A PNG starts with its 8-byte signature, then the IHDR chunk; the width and
// height sit at bytes 16..23 of the file, big-endian, four bytes each.
const isPng = header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
if (!isPng || header.readUInt32BE(16) !== 1024 || header.readUInt32BE(20) !== 1024) {
  throw new Error('entry.png must be a 1024x1024 PNG');
}

mkdirSync(outDir, { recursive: true });
copyFileSync(source, target);
console.log(`wrote ${target} (${bytes} bytes, 1024x1024 PNG)`);
