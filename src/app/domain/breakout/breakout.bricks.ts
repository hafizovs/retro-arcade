import {
  BREAKOUT_BRICK_COLS,
  BREAKOUT_BRICK_DURABILITY_BY_ROW,
  BREAKOUT_BRICK_PADDING,
  BREAKOUT_BRICK_ROWS,
  BREAKOUT_BRICK_TOP_OFFSET,
  BREAKOUT_HEIGHT,
  BREAKOUT_WIDTH,
} from '../../core/constants/breakout.constants';
import { BrickCell } from '../../core/models/arcade.types';

export interface BrickLayout {
  brickWidth: number;
  brickHeight: number;
  offsetX: number;
  offsetY: number;
}

export function getBrickLayout(
  width: number = BREAKOUT_WIDTH,
  height: number = BREAKOUT_HEIGHT,
  rows: number = BREAKOUT_BRICK_ROWS,
  cols: number = BREAKOUT_BRICK_COLS,
): BrickLayout {
  const padding = BREAKOUT_BRICK_PADDING;
  const offsetY = BREAKOUT_BRICK_TOP_OFFSET;
  const totalPaddingX = padding * (cols + 1);
  const brickWidth = (width - totalPaddingX) / cols;
  const availableHeight = height * 0.35;
  const brickHeight = (availableHeight - padding * (rows + 1)) / rows;
  return {
    brickWidth,
    brickHeight: Math.max(12, brickHeight),
    offsetX: padding,
    offsetY,
  };
}

export function createBrickGrid(
  rows: number = BREAKOUT_BRICK_ROWS,
  cols: number = BREAKOUT_BRICK_COLS,
): BrickCell[][] {
  const grid: BrickCell[][] = [];
  for (let r = 0; r < rows; r += 1) {
    const durability =
      BREAKOUT_BRICK_DURABILITY_BY_ROW[r] ??
      BREAKOUT_BRICK_DURABILITY_BY_ROW[
        BREAKOUT_BRICK_DURABILITY_BY_ROW.length - 1
      ];
    const row: BrickCell[] = [];
    for (let c = 0; c < cols; c += 1) {
      row.push({
        alive: true,
        durability,
        maxDurability: durability,
        colorIndex: r % 3,
      });
    }
    grid.push(row);
  }
  return grid;
}

export function countAliveBricks(bricks: BrickCell[][]): number {
  let count = 0;
  for (const row of bricks) {
    for (const brick of row) {
      if (brick.alive) {
        count += 1;
      }
    }
  }
  return count;
}

export function getBrickRect(
  row: number,
  col: number,
  layout: BrickLayout,
): { x: number; y: number; width: number; height: number } {
  const padding = BREAKOUT_BRICK_PADDING;
  return {
    x: layout.offsetX + col * (layout.brickWidth + padding),
    y: layout.offsetY + row * (layout.brickHeight + padding),
    width: layout.brickWidth,
    height: layout.brickHeight,
  };
}
