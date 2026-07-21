export interface Position {
  row: number;
  col: number;
}

export interface Grid {
  size: number;
  regions: number[][];
}

export interface Level {
  grid: Grid;
  solution: Position[];
}
