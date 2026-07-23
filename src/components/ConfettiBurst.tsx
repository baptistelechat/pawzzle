import { useState } from "react";
import { PawPrint } from "lucide-react";
import { m, useReducedMotion } from "motion/react";

const PARTICLE_COUNT = 56;
// Teintes vives (chroma/luminosité plus marquées que REGION_COLORS, pensé
// pour des fonds de case pastel) — dérivées des mêmes teintes que la grille.
const CONFETTI_HUES = [30, 90, 150, 210, 270, 330, 10];

interface Particle {
  left: number;
  fallDistance: number;
  drift: number;
  rotate: number;
  duration: number;
  delay: number;
  color: string;
  size: number;
}

const generateParticles = (): Particle[] => {
  // Pluie de haut en bas sur toute la largeur/hauteur de l'écran (plutôt
  // qu'une explosion depuis le centre) : traverse tout l'écran, pas de vide.
  const viewportHeight = window.innerHeight;
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    left: Math.random() * 100,
    fallDistance: viewportHeight + 80,
    drift: Math.random() * 160 - 80,
    rotate: Math.random() * 720 - 360,
    duration: 1.8 + Math.random() * 1.2,
    delay: Math.random() * 0.6,
    color: `oklch(0.7 0.18 ${CONFETTI_HUES[i % CONFETTI_HUES.length]})`,
    size: 26 + Math.random() * 22,
  }));
};

export function ConfettiBurst() {
  const reduceMotion = useReducedMotion();
  // Initialisation paresseuse (exception documentée à la règle de pureté du
  // rendu) : le tirage aléatoire ne s'exécute qu'une fois, au montage —
  // le composant est de toute façon remonté à chaque victoire (key={levelId}).
  const [particles] = useState<Particle[]>(() =>
    reduceMotion ? [] : generateParticles(),
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p, i) => (
        <m.span
          key={i}
          className="absolute top-0"
          style={{ left: `${p.left}%`, color: p.color }}
          initial={{ y: -40, x: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: p.fallDistance,
            x: p.drift,
            opacity: [1, 1, 0],
            rotate: p.rotate,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.4, 0, 0.7, 1],
            opacity: {
              duration: p.duration,
              delay: p.delay,
              times: [0, 0.8, 1],
            },
          }}
        >
          <PawPrint
            style={{ width: p.size, height: p.size }}
            fill="currentColor"
          />
        </m.span>
      ))}
    </div>
  );
}
