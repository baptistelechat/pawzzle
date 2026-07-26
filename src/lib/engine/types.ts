export type GridShape = "square" | "circle";

export interface Position {
  row: number;
  col: number;
}

export interface Grid {
  size: number;
  regions: number[][];
  active: boolean[][];
}

export interface Level {
  grid: Grid;
  solution: Position[];
}
