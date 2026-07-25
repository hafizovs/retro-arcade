import { GridPoint } from '../../models/arcade.types';
import { Rng } from '../math/rng';
import { pointsEqual } from './snake.collision';

export function spawnApple(
  snake: GridPoint[],
  cols: number,
  rows: number,
  rng: Rng,
): GridPoint | null {
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`));
  const candidates: GridPoint[] = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        candidates.push({ x, y });
      }
    }
  }
  if (candidates.length === 0) {
    return null;
  }
  return candidates[rng.nextInt(candidates.length)];
}

export function isAppleOnSnake(apple: GridPoint, snake: GridPoint[]): boolean {
  return snake.some((segment) => pointsEqual(segment, apple));
}
