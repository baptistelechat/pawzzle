// Génère les 6 slides HTML du carrousel Instagram "Comment on s'installe
// dans le village" (docs/social-content-publication-tracking.md, Round 1).
// Sans skill externe : rendu statique, screenshot via agent-browser.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../instagram/comment-on-sinstalle");
mkdirSync(OUT_DIR, { recursive: true });

// Mêmes valeurs que src/lib/regionColors.ts (6 premières teintes de base)
const REGION_COLORS = [
  "oklch(0.85 0.1 30)",
  "oklch(0.85 0.1 90)",
  "oklch(0.85 0.1 150)",
  "oklch(0.85 0.1 210)",
  "oklch(0.85 0.1 270)",
  "oklch(0.85 0.1 330)",
];

const SIZE = 6;
// Régions dessinées à la main (6 blocs à peu près organiques)
const REGIONS = [
  [0, 0, 0, 1, 1, 1],
  [0, 0, 2, 2, 1, 1],
  [3, 0, 2, 2, 4, 1],
  [3, 3, 2, 4, 4, 4],
  [3, 3, 5, 5, 4, 4],
  [3, 5, 5, 5, 5, 4],
];

function pawSvg() {
  return `<svg class="paw" viewBox="0 0 100 100">
    <ellipse cx="50" cy="62" rx="26" ry="20"/>
    <ellipse cx="20" cy="32" rx="12" ry="15" transform="rotate(-18 20 32)"/>
    <ellipse cx="44" cy="16" rx="12" ry="15"/>
    <ellipse cx="68" cy="16" rx="12" ry="15"/>
    <ellipse cx="88" cy="34" rx="12" ry="15" transform="rotate(18 88 34)"/>
  </svg>`;
}

function buildGrid({
  paws = [],
  glowCells = [],
  rowHighlight,
  colHighlight,
  regionHighlight,
}) {
  const has = (list, r, c) => list.some(([pr, pc]) => pr === r && pc === c);
  const cells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const region = REGIONS[r][c];
      const classes = ["cell"];
      if (has(glowCells, r, c)) classes.push("glow");
      if (regionHighlight !== undefined && region === regionHighlight)
        classes.push("region-ring");
      cells.push(
        `<div class="${classes.join(" ")}" style="background-color:${REGION_COLORS[region]};grid-row:${r + 1};grid-column:${c + 1};">${has(paws, r, c) ? pawSvg() : ""}</div>`,
      );
    }
  }
  const overlays = [];
  if (rowHighlight !== undefined)
    overlays.push(
      `<div class="band" style="grid-row:${rowHighlight + 1};grid-column:1/-1;"></div>`,
    );
  if (colHighlight !== undefined)
    overlays.push(
      `<div class="band" style="grid-column:${colHighlight + 1};grid-row:1/-1;"></div>`,
    );
  return `<div class="grid">${overlays.join("")}${cells.join("")}</div>`;
}

function page({ grid, caption, logo, topPadding = 220 }) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500&display=swap"
  rel="stylesheet"
/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .canvas {
    width: 1080px;
    height: 1350px;
    background: #fff8f0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: ${topPadding}px;
    position: relative;
    font-family: "IBM Plex Sans", sans-serif;
  }
  .grid {
    position: relative;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(6, 1fr);
    width: 900px;
    height: 900px;
    gap: 10px;
  }
  .cell {
    position: relative;
    z-index: 1;
    border-radius: 28%;
    corner-shape: squircle;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cell.glow {
    box-shadow: 0 0 0 8px rgba(255, 138, 101, 0.35), 0 0 32px 12px rgba(255, 138, 101, 0.55);
  }
  .cell.region-ring {
    outline: 6px solid rgba(74, 55, 40, 0.55);
    outline-offset: -6px;
  }
  .band {
    position: relative;
    z-index: 0;
    background: rgba(127, 184, 148, 0.28);
    border-radius: 32px;
  }
  .paw { width: 56%; height: 56%; fill: #4a3728; }
  .caption {
    margin-top: 56px;
    font-family: "Fredoka", sans-serif;
    font-weight: 600;
    font-size: 58px;
    color: #4a3728;
    text-align: center;
    max-width: 900px;
    line-height: 1.3;
  }
  .logo {
    margin-top: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .logo .mark {
    width: 100px;
    height: 100px;
    border-radius: 22%;
    background: linear-gradient(180deg, #ff9c7c, #ff8a65);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .logo .mark svg { width: 56px; height: 56px; stroke: #fff; }
  .logo .brand { font-family: "Fredoka", sans-serif; font-weight: 700; font-size: 60px; color: #4a3728; }
  .logo .cta { font-family: "IBM Plex Sans", sans-serif; font-size: 32px; color: #7a6553; }
</style>
</head>
<body>
  <div class="canvas">
    ${grid}
    ${caption ? `<div class="caption">${caption}</div>` : ""}
    ${
      logo
        ? `<div class="logo">
      <div class="mark"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z"/></svg></div>
      <div class="brand">Pawzzle</div>
      <div class="cta">${logo}</div>
    </div>`
        : ""
    }
  </div>
</body>
</html>`;
}

const slides = [
  // 1 — hook : zéro texte, une case ambiguë qui glow parmi des cases déjà posées
  {
    name: "slide-1",
    grid: buildGrid({
      paws: [
        [0, 4],
        [1, 1],
        [2, 3],
      ],
      glowCells: [[3, 0]],
    }),
  },
  // 2 — révélation + règle ligne
  {
    name: "slide-2",
    grid: buildGrid({
      paws: [
        [0, 4],
        [1, 1],
        [2, 3],
        [3, 0],
      ],
      rowHighlight: 3,
    }),
    caption: "Un chat par ligne.",
  },
  // 3 — règle colonne
  {
    name: "slide-3",
    grid: buildGrid({
      paws: [
        [0, 4],
        [1, 1],
        [2, 3],
        [3, 0],
      ],
      colHighlight: 3,
    }),
    caption: "Un chat par colonne.",
  },
  // 4 — règle quartier (région)
  {
    name: "slide-4",
    grid: buildGrid({
      paws: [
        [0, 4],
        [1, 1],
        [2, 3],
        [3, 0],
        [4, 2],
      ],
      regionHighlight: 5,
    }),
    caption: "Un chat par quartier.",
  },
  // 5 — règle adjacence : deux cases voisines interdites, en glow
  {
    name: "slide-5",
    grid: buildGrid({
      paws: [
        [0, 4],
        [1, 1],
        [2, 3],
        [3, 0],
        [4, 2],
      ],
      glowCells: [
        [5, 3],
        [5, 4],
      ],
    }),
    caption: "Zéro voisin trop collé, même du bout de la patte.",
  },
  // 6 — grille complète + CTA
  {
    name: "slide-6",
    grid: buildGrid({
      paws: [
        [0, 4],
        [1, 1],
        [2, 3],
        [3, 0],
        [4, 2],
        [5, 5],
      ],
    }),
    logo: "Trouve la rue de chacun → lien en bio",
    topPadding: 150,
  },
];

for (const slide of slides) {
  const html = page(slide);
  const filePath = path.join(OUT_DIR, `${slide.name}.html`);
  writeFileSync(filePath, html, "utf-8");
  console.log("écrit :", filePath);
}
