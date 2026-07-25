import { Direction, GridPoint } from '../../models/arcade.types';

export const DIRECTION_DELTA: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

export function isOpposite(a: Direction, b: Direction): boolean {
  return (
    (a === 'up' && b === 'down') ||
    (a === 'down' && b === 'up') ||
    (a === 'left' && b === 'right') ||
    (a === 'right' && b === 'left')
  );
}

export function nextHead(head: GridPoint, direction: Direction): GridPoint {
  const delta = DIRECTION_DELTA[direction];
  return { x: head.x + delta.dx, y: head.y + delta.dy };
}

export function moveSnake(
  snake: GridPoint[],
  direction: Direction,
  grow: boolean,
): GridPoint[] {
  const head = snake[0];
  const newHead = nextHead(head, direction);
  if (grow) {
    return [newHead, ...snake];
  }
  return [newHead, ...snake.slice(0, snake.length - 1)];
}
