import ffmpegPath from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { readdir, rename, unlink } from "node:fs/promises";
import path from "node:path";

const SOUNDS_DIR = path.resolve(import.meta.dirname, "../public/sounds");
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

const files = await readdir(SOUNDS_DIR);

for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  const base = path.basename(file, ext);
  const input = path.join(SOUNDS_DIR, file);

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
