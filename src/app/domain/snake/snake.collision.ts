import { GridPoint } from '../../models/arcade.types';

export function hitsWall(
  head: GridPoint,
  cols: number,
  rows: number,
): boolean {
  return head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows;
}

export function hitsSelf(head: GridPoint, snake: GridPoint[]): boolean {
  return snake.some((segment) => segment.x === head.x && segment.y === head.y);
}

export function pointsEqual(a: GridPoint, b: GridPoint): boolean {
  return a.x === b.x && a.y === b.y;
}
