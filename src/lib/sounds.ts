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

  private context() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = DEFAULT_VOLUME;
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

// Musique d'ambiance : <audio loop> natif plutôt que Web Audio API — un seul
// flux long-format joué en continu, pas besoin de superposition ni de
// décodage en mémoire (ponytail: rung 4, fonctionnalité native suffit).
const AMBIENT_VOLUME = 0.5;
const ambient = new Audio("/sounds/ambient.mp3");
ambient.loop = true;
ambient.volume = AMBIENT_VOLUME;

// À appeler depuis le même geste utilisateur que `sounds.unlock()` — un
// <audio>.play() hors geste est bloqué par la même politique navigateur.
export const playAmbient = () => {
  void ambient.play().catch(() => {
    // fichier pas encore ajouté, ou lecture bloquée : silencieux
  });
};
