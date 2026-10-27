import type { PostHog } from "posthog-js";

// Catalogue fermé des events : une faute de frappe devient une erreur de type
// plutôt qu'un event fantôme dans PostHog.
export type AnalyticsEvent =
  | "app_opened"
  | "welcome_dismissed"
  | "mode_selected"
  | "level_started"
  | "level_ended"
  | "run_ended"
  | "run_abandoned"
  | "run_recap_viewed"
  | "run_replayed"
  | "marking_help_toggled"
  | "setting_changed"
  | "rules_opened"
  | "settings_opened"
  | "ambient_track_skipped"
  | "ambient_playback_toggled"
  | "credits_link_clicked"
  | "pwa_install_clicked"
  | "pwa_install_prompt_result"
  | "pwa_installed";

type Props = Record<string, string | number | boolean | null | undefined>;

const VISITS_KEY = "pawzzle:visits";

// Localhost + IP locale (test mobile sur le LAN) exclus en plus du guard PROD :
// `pnpm preview` sert un build PROD sur localhost (GLRN-153).
const isLocalHost =
  window.location.hostname === "localhost" ||
  /^\d{1,3}(\.\d{1,3}){3}$/.test(window.location.hostname);

const key = import.meta.env.VITE_POSTHOG_KEY ?? "";
const enabled =
  !!key &&
  !isLocalHost &&
  (import.meta.env.PROD || import.meta.env.VITE_POSTHOG_DEBUG === "true");

let client: PostHog | null = null;
// Events émis avant la fin du chargement différé du SDK : rejoués après
// `register`, pour qu'ils portent eux aussi les super-propriétés.
const queue: [AnalyticsEvent, Props | undefined][] = [];

export const track = (event: AnalyticsEvent, props?: Props) => {
  if (!enabled) return;
  if (client) client.capture(event, props);
  else queue.push([event, props]);
};

interface VisitStats {
  firstSeen: number;
  visits: number;
  levels: number;
}

const readVisits = (): VisitStats | null => {
  try {
    return JSON.parse(localStorage.getItem(VISITS_KEY) ?? "null");
  } catch {
    return null;
  }
};

let stats: VisitStats | null = null;

// `persistence: "memory"` (pas de cookie ni d'identifiant stocké, convention
// des apps du projet PostHog partagé) = chaque visite est un nouvel anonyme.
// Ces compteurs locaux, sans identifiant, permettent quand même de mesurer
// l'adoption : nouveaux vs revenants, ancienneté, niveaux joués à vie.
// ponytail: compteurs par appareil/navigateur, pas par personne — un compte
// Supabase (Phase 4.2) donnera une identité cross-device si besoin.
export const countLevelPlayed = () => {
  if (!stats) return undefined;
  stats.levels += 1;
  localStorage.setItem(VISITS_KEY, JSON.stringify(stats));
  return stats.levels;
};

export const initAnalytics = () => {
  if (!enabled) return;
  const now = Date.now();
  const stored = readVisits();
  stats = {
    firstSeen: stored?.firstSeen ?? now,
    visits: (stored?.visits ?? 0) + 1,
    levels: stored?.levels ?? 0,
  };
  localStorage.setItem(VISITS_KEY, JSON.stringify(stats));

  const displayMode = window.matchMedia("(display-mode: standalone)").matches
    ? "pwa"
    : "browser";

  // Chargé à part : ~100 kB gzip qui ne bloquent pas le premier affichage.
  void import("posthog-js").then(({ default: posthog }) => {
    posthog.init(key, {
      api_host: import.meta.env.VITE_POSTHOG_HOST ?? "https://eu.i.posthog.com",
      persistence: "memory",
      autocapture: false,
      capture_pageview: true,
      capture_pageleave: true,
      capture_exceptions: true,
      // Session Replay actif côté projet (partagé) : désactivé ici, quota
      // gratuit partagé entre apps + RGPD.
      disable_session_recording: true,
    });
    // Projet PostHog partagé entre plusieurs apps : `app` est le filtre commun
    // (même convention que faistonplein/ifecho).
    posthog.register({
      app: "pawzzle",
      app_version: __APP_VERSION__,
      display_mode: displayMode,
      visit_number: stats?.visits,
      days_since_first_visit: Math.floor(
        (now - (stats?.firstSeen ?? now)) / 86_400_000,
      ),
    });
    client = posthog;
    queue.splice(0).forEach(([event, props]) => posthog.capture(event, props));
  });

  track("app_opened", { is_first_visit: stats.visits === 1 });
  window.addEventListener("appinstalled", () => track("pwa_installed"));
};
