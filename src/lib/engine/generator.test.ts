import { describe, expect, it } from "vitest";
import { generateLevel } from "@/lib/engine/generator";
import { countSolutions } from "@/lib/engine/solver";
import { isSolved } from "@/lib/engine/rules";

describe("generateLevel", () => {
  it.each([5, 6, 7])(
    "produit une grille %i×%i à solution unique et valide",
    (size) => {
      const level = generateLevel(size);
      expect(level.grid.size).toBe(size);
      expect(countSolutions(level.grid, 2)).toHaveLength(1);
      expect(isSolved(level.grid, level.solution)).toBe(true);
    },
  );

  it("est appelable en boucle sans exception", () => {
    for (let i = 0; i < 5; i++) {
      expect(() => generateLevel(6)).not.toThrow();
    }
  });
});
