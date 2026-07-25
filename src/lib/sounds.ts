export type SoundId =
  | "marker_add"
  | "marker_remove"
  | "paw_correct"
  | "paw_incorrect"
  | "drag_paint_tick"
  | "victory"
  | "game_over"
  | "new_game"
  | "ui_click"
  | "ui_toggle"
  | "menu_open"
  | "menu_close";

const SOUND_IDS: SoundId[] = [
  "marker_add",
  "marker_remove",
  "paw_correct",
  "paw_incorrect",
  "drag_paint_tick",
  "victory",
  "game_over",
  "new_game",
  "ui_click",
  "ui_toggle",
  "menu_open",
  "menu_close",
];

// ponytail: gain global fixe (pas de normalisation de loudness côté Web Audio
// API, contrairement à un lecteur média classique) — curseur de réglage à
// prévoir plus tard, cf. docs/ROADMAP.md.
const DEFAULT_VOLUME = 0.5;

// Multiplicateur de gain par son (1 = niveau du gain global, sans effet) —
// réglable individuellement ici plutôt que de retoucher les fichiers.
const GAIN_OVERRIDES: Record<SoundId, number> = {
  marker_add: 1,
  marker_remove: 1,
  paw_correct: 1,
  paw_incorrect: 2,
  drag_paint_tick: 1,
  victory: 1,
  game_over: 1,
  new_game: 1,
  ui_click: 2,
  ui_toggle: 1,
  menu_open: 2,
  menu_close: 2,
};

// Web Audio API plutôt que <audio> : lecture superposée (drag_paint_tick qui se
// répète pendant le tracé) et seule voie fiable pour iOS Safari (cf.
// docs/sound-design/SOUND_DESIGN.md). Un fichier pas encore déposé dans
// public/sounds/ est simplement ignoré (silence), pour tester au fur et à
// mesure des ajouts.
class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private buffers = new Map<SoundId, AudioBuffer>();
  private volume = DEFAULT_VOLUME;
  private muted = false;

  private applyGain() {
    if (this.masterGain)
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
  }

  setVolume(volume: number) {
    this.volume = volume;
    this.applyGain();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.applyGain();
  }

  private context() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
      // Sans ça, un GAIN_OVERRIDES élevé écrête brutalement à ±1.0 (distortion,
      // pas de gain perçu en plus) dès que la source approche déjà du maximum —
      // le compresseur resserre la dynamique au lieu de tronquer, ce qui rend
      // un gain élevé (2, 3...) réellement audible. Réglages par défaut du spec
      // Web Audio (-24dB/knee 30/ratio 12), déjà pensés pour ce cas d'usage.
      const compressor = this.ctx.createDynamicsCompressor();
      this.masterGain.connect(compressor).connect(this.ctx.destination);
    }
    return this.ctx;
  }

  async preload() {
    const ctx = this.context();
    await Promise.all(
      SOUND_IDS.map(async (id) => {
        try {
          const res = await fetch(`/sounds/${id}.mp3`);
          if (!res.ok) return; // ponytail: son pas encore ajouté, silencieux
          const buffer = await ctx.decodeAudioData(await res.arrayBuffer());
          this.buffers.set(id, buffer);
        } catch {
          // fichier manquant ou invalide : pas de son, pas d'erreur
        }
      }),
    );
  }

  unlock() {
    const ctx = this.context();
    if (ctx.state === "suspended") void ctx.resume();
  }

  play(id: SoundId) {
    const buffer = this.buffers.get(id);
    if (!buffer) return;
    const ctx = this.context();
    const start = () => {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.value = GAIN_OVERRIDES[id] ?? 1;
      source.connect(gain).connect(this.masterGain!);
      source.start(0);
    };
    // ponytail: un AudioContext reste "suspended" tant qu'aucun geste
    // utilisateur n'a eu lieu sur la page (politique navigateur, pas un bug) —
    // start() sur un contexte suspendu se perd ou rejoue au hasard du 1er
    // geste. On attend la reprise avant de démarrer la source.
    if (ctx.state === "suspended") {
      void ctx.resume().then(start);
      return;
    }
    start();
  }
}

export const sounds = new SoundManager();

// Musique d'ambiance : <audio> natif plutôt que Web Audio API — un seul flux
// long-format à la fois, pas besoin de superposition ni de décodage en
// mémoire (ponytail: rung 4, fonctionnalité native suffit). Plusieurs pistes
// dans public/sounds/ambient/, tirées au hasard (sans répéter la précédente).
// Liste chargée depuis manifest.json (généré par `pnpm sounds:normalize`)
// plutôt que codée en dur, pour suivre les ajouts/retraits de piste sans
// repasser ici. Historique navigable (précédent/suivant) façon lecteur radio.
let ambientVolume = 0.5;
const FADE_MS = 600;

const ambient = new Audio();
ambient.volume = 0;

let ambientTracks: string[] | null = null;
let ambientHistory: string[] = [];
let ambientIndex = -1;
let fadeRAF: number | null = null;
let fadingOut = false;
let lastReportedSecond = -1;

// Les pistes Pixabay sont préfixées `alex-morgan-<titre>-<id>` ; l'ancienne
// piste `ambient` d'origine n'a pas d'auteur connu.
const parseTrackMeta = (track: string) => {
  const artist = track.startsWith("alex-morgan-") ? "Alex Morgan" : null;
  const title = track
    .replace(/^alex-morgan-/, "")
    .replace(/-\d+$/, "")
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
  return { title, artist };
};

export interface AmbientState {
  title: string;
  artist: string | null;
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
}

const ambientListeners = new Set<() => void>();
let ambientState: AmbientState = {
  title: "",
  artist: null,
  isPlaying: false,
  isMuted: false,
  currentTime: 0,
  duration: 0,
};
const setAmbientState = (partial: Partial<AmbientState>) => {
  ambientState = { ...ambientState, ...partial };
  ambientListeners.forEach((listener) => listener());
};
export const subscribeAmbient = (listener: () => void) => {
  ambientListeners.add(listener);
  return () => ambientListeners.delete(listener);
};
export const getAmbientState = () => ambientState;

export const setAmbientVolume = (volume: number) => {
  ambientVolume = volume;
  if (!ambient.muted && !fadingOut) ambient.volume = volume;
};

export const setAmbientMuted = (muted: boolean) => {
  ambient.muted = muted;
};

ambient.addEventListener("play", () => setAmbientState({ isPlaying: true }));
ambient.addEventListener("pause", () => setAmbientState({ isPlaying: false }));
ambient.addEventListener("volumechange", () =>
  setAmbientState({ isMuted: ambient.muted }),
);

const fadeVolumeTo = (target: number, duration: number) => {
  if (fadeRAF !== null) cancelAnimationFrame(fadeRAF);
  const start = ambient.volume;
  const startTime = performance.now();
  const step = (now: number) => {
    const progress = Math.min((now - startTime) / duration, 1);
    ambient.volume = start + (target - start) * progress;
    fadeRAF = progress < 1 ? requestAnimationFrame(step) : null;
  };
  fadeRAF = requestAnimationFrame(step);
};

// Fondu sortant amorcé juste avant la fin naturelle d'une piste — un seul
// <audio>, donc pas de vrai chevauchement, mais évite la coupure sèche.
// Sert aussi à publier la progression (throttlée à la seconde, `timeupdate`
// se déclenche bien plus souvent que ça n'a d'utilité pour un affichage).
ambient.addEventListener("timeupdate", () => {
  if (!fadingOut && ambient.duration) {
    if (ambient.duration - ambient.currentTime <= FADE_MS / 1000) {
      fadingOut = true;
      fadeVolumeTo(0, FADE_MS);
    }
  }
  const second = Math.floor(ambient.currentTime);
  if (second !== lastReportedSecond) {
    lastReportedSecond = second;
    setAmbientState({
      currentTime: ambient.currentTime,
      duration: ambient.duration || 0,
    });
  }
});
ambient.addEventListener("ended", () => void goToAmbientTrack("next"));

const loadAmbientTracks = async () => {
  const tracks: string[] = await fetch("/sounds/ambient/manifest.json")
    .then((res) => (res.ok ? res.json() : []))
    .catch(() => []);
  return tracks.length > 0 ? tracks : ["ambient"];
};

const pickRandomTrack = () => {
  const last = ambientHistory[ambientIndex] ?? null;
  const pool =
    ambientTracks!.length > 1
      ? ambientTracks!.filter((track) => track !== last)
      : ambientTracks!;
  return pool[Math.floor(Math.random() * pool.length)];
};

const loadAmbientTrack = (track: string) => {
  fadingOut = false;
  lastReportedSecond = -1;
  ambient.src = `/sounds/ambient/${track}.mp3`;
  ambient.volume = 0;
  const { title, artist } = parseTrackMeta(track);
  setAmbientState({ title, artist, currentTime: 0, duration: 0 });
  // Le fade doit attendre la résolution de play() : lancé juste après un
  // changement de `src` (fin naturelle d'une piste, paused=true), la boucle
  // requestAnimationFrame du fondu ne se déclenche jamais tant que la
  // lecture n'a pas réellement démarré — la piste avance en silence.
  void ambient
    .play()
    .then(() => fadeVolumeTo(ambientVolume, FADE_MS))
    .catch(() => {
      // fichier pas encore ajouté, ou lecture bloquée : silencieux
    });
};

async function goToAmbientTrack(direction: "next" | "prev") {
  ambientTracks ??= await loadAmbientTracks();
  if (direction === "prev" && ambientIndex > 0) {
    ambientIndex -= 1;
  } else if (direction === "next" && ambientIndex < ambientHistory.length - 1) {
    ambientIndex += 1;
  } else {
    const track = pickRandomTrack();
    ambientHistory = [...ambientHistory.slice(0, ambientIndex + 1), track];
    ambientIndex = ambientHistory.length - 1;
  }
  // ponytail: pas de fondu sortant + `setTimeout` avant le swap ici — un
  // `.play()` différé par un timer sort du contexte synchrone du geste
  // utilisateur (tap sur suivant/précédent) et iOS Safari ne le joue plus
  // (isPlaying passe bien à true, mais le son reste inaudible, cf. LRN-018 /
  // GLRN-222). Le changement de `src` coupe de toute façon la piste en cours
  // instantanément ; seule la fin naturelle d'une piste bénéficie déjà d'un
  // vrai fondu sortant via le `timeupdate` ci-dessus.
  loadAmbientTrack(ambientHistory[ambientIndex]);
}

export const nextAmbientTrack = () => void goToAmbientTrack("next");
export const previousAmbientTrack = () => void goToAmbientTrack("prev");

export const toggleAmbientPlayback = () => {
  if (ambient.paused) {
    void ambient.play().catch(() => {
      // lecture bloquée : silencieux
    });
  } else {
    ambient.pause();
  }
};

export const toggleAmbientMute = () => {
  ambient.muted = !ambient.muted;
};

// À appeler depuis le même geste utilisateur que `sounds.unlock()` — un
// <audio>.play() hors geste est bloqué par la même politique navigateur.
export const playAmbient = () => {
  if (!ambient.src) {
    void goToAmbientTrack("next");
    return;
  }
  void ambient.play().catch(() => {
    // lecture bloquée : silencieux
  });
};
