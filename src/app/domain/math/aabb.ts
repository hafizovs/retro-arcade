import { clamp } from './clamp';

export interface Aabb {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function circleRectOverlap(
  cx: number,
  cy: number,
  radius: number,
  rect: Aabb,
): boolean {
  const closestX = clamp(cx, rect.x, rect.x + rect.width);
  const closestY = clamp(cy, rect.y, rect.y + rect.height);
  const distX = cx - closestX;
  const distY = cy - closestY;
  return distX * distX + distY * distY <= radius * radius;
}
