#!/usr/bin/env node
/**
 * copy_sound_assets.mjs -- copy the extracted world/character WAVs into
 * public/sounds/ (servable by Next.js) and emit a sound manifest that maps
 * each numeric bank id -> its public URL. The runtime character-sound map
 * (src/.../shared/characterSounds.js) keys off bank ids (from
 * associate_sounds.py's CHARACTERS table), so it needs the id->file map.
 *
 * Idempotent: overwrites destinations; safe to re-run.
 * Usage: node resources/model_pipeline/copy_sound_assets.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const SRC = path.join(ROOT, 'resources', 'model_files', 'extracted', 'sounds');
const OUT = path.join(ROOT, 'public', 'sounds');
const MANIFEST = path.join(
  ROOT,
  'src/Components/MainMenuStack/StartStack/MainGameStack/shared/soundManifest.generated.json',
);

fs.mkdirSync(OUT, { recursive: true });
const wavs = fs.readdirSync(SRC).filter((f) => /^snd\d+.*\.wav$/i.test(f));
const manifest = {};
let copied = 0;
for (const file of wavs) {
  fs.copyFileSync(path.join(SRC, file), path.join(OUT, file));
  const id = parseInt(file.match(/^snd(\d+)/i)[1], 10);
  manifest[id] = `/sounds/${file}`;
  copied += 1;
}
fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Copied ${copied} WAVs to public/sounds/`);
console.log(`Wrote id->url manifest (${Object.keys(manifest).length} ids) to ${path.relative(ROOT, MANIFEST)}`);
