import ffmpegPath from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { readdir, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const SOUNDS_DIR = path.resolve(import.meta.dirname, "../public/sounds");
const AMBIENT_DIR = path.join(SOUNDS_DIR, "ambient");
// mono, 44.1kHz, VBR ~165kbps — cf. docs/SOUND_DESIGN.md
const FFMPEG_ARGS = [
  "-ac",
  "1",
  "-ar",
  "44100",
  "-codec:a",
  "libmp3lame",
  "-q:a",
  "4",
];

const convert = (input, output) => {
  execFileSync(ffmpegPath, ["-y", "-i", input, ...FFMPEG_ARGS, output], {
    stdio: "inherit",
  });
};

// recursive: true pour couvrir public/sounds/ambient/ (pistes d'ambiance,
// séparées des SFX) en plus du dossier racine.
const entries = await readdir(SOUNDS_DIR, {
  recursive: true,
  withFileTypes: true,
});

for (const entry of entries) {
  if (!entry.isFile()) continue;
  const file = path.join(entry.parentPath ?? entry.path, entry.name);
  const relative = path.relative(SOUNDS_DIR, file);
  const ext = path.extname(file).toLowerCase();
  const base = relative.slice(0, -ext.length);
  const input = file;

  if (ext === ".mp3") {
    const tmp = path.join(SOUNDS_DIR, `${base}.normalized.mp3`);
    convert(input, tmp);
    await unlink(input);
    await rename(tmp, input);
    console.log(`normalized: ${file}`);
  } else if ([".ogg", ".wav", ".flac", ".m4a", ".aiff"].includes(ext)) {
    const output = path.join(SOUNDS_DIR, `${base}.mp3`);
    convert(input, output);
    console.log(`converted: ${file} -> ${base}.mp3`);
  }
}

// Manifest listant les pistes ambient disponibles, généré plutôt que codé en
// dur côté client — la liste évolue à chaque ajout/retrait de piste, ce
// fichier suit sans repasser dans sounds.ts.
const ambientFiles = await readdir(AMBIENT_DIR);
const ambientTracks = ambientFiles
  .filter((f) => f.endsWith(".mp3"))
  .map((f) => f.slice(0, -".mp3".length));
await writeFile(
  path.join(AMBIENT_DIR, "manifest.json"),
  JSON.stringify(ambientTracks),
);
console.log(`manifest: ${ambientTracks.length} piste(s) ambient`);
