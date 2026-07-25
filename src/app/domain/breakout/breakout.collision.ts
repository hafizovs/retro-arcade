import { circleRectOverlap } from '../math/aabb';

export function ballPaddleHit(
  ballX: number,
  ballY: number,
  radius: number,
  paddle: { x: number; y: number; width: number; height: number },
): boolean {
  return circleRectOverlap(ballX, ballY, radius, paddle);
}

export function ballBrickHit(
  ballX: number,
  ballY: number,
  radius: number,
  brick: { x: number; y: number; width: number; height: number },
): boolean {
  return circleRectOverlap(ballX, ballY, radius, brick);
}
