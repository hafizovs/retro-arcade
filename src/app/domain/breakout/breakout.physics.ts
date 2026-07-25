import {
  BREAKOUT_EPS,
  BREAKOUT_MAX_PADDLE_ANGLE_DEG,
} from '../../core/constants/breakout.constants';
import { clamp } from '../math/clamp';
import { ballBrickHit, ballPaddleHit } from './breakout.collision';

export interface BallState {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
}

export function moveBall(ball: BallState): BallState {
  return {
    ...ball,
    x: ball.x + ball.dx,
    y: ball.y + ball.dy,
  };
}

export function reflectWall(
  ball: BallState,
  width: number,
  height: number,
): { ball: BallState; lostLife: boolean } {
  let { x, y, radius, dx, dy } = ball;
  let lostLife = false;

  if (x - radius <= 0) {
    x = radius;
    dx = Math.abs(dx);
  }
  if (x + radius >= width) {
    x = width - radius;
    dx = -Math.abs(dx);
  }
  if (y - radius <= 0) {
    y = radius;
    dy = Math.abs(dy);
  }
  if (y - radius > height) {
    lostLife = true;
  }

  return { ball: { x, y, radius, dx, dy }, lostLife };
}

export function reflectPaddle(
  ball: BallState,
  paddle: { x: number; y: number; width: number; height: number },
): BallState | null {
  if (!ballPaddleHit(ball.x, ball.y, ball.radius, paddle)) {
    return null;
  }
  if (ball.dy < 0) {
    return null;
  }

  let relative = ((ball.x - paddle.x) / paddle.width) * 2 - 1;
  relative = clamp(relative, -1, 1);

  const maxAngle = (BREAKOUT_MAX_PADDLE_ANGLE_DEG * Math.PI) / 180;
  const angle = relative * maxAngle;
  const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);

  let dx = speed * Math.sin(angle);
  let dy = -speed * Math.cos(angle);

  if (Math.abs(dy) < 0.5) {
    dy = -0.5;
  }

  const mag = Math.sqrt(dx * dx + dy * dy);
  if (mag > BREAKOUT_EPS) {
    dx = (dx / mag) * speed;
    dy = (dy / mag) * speed;
  }

  return {
    ...ball,
    x: ball.x,
    y: paddle.y - ball.radius - BREAKOUT_EPS,
    dx,
    dy,
  };
}

export function reflectBrick(
  ball: BallState,
  brick: { x: number; y: number; width: number; height: number },
  prevY: number,
): BallState | null {
  if (!ballBrickHit(ball.x, ball.y, ball.radius, brick)) {
    return null;
  }

  const brickCenterY = brick.y + brick.height / 2;
  const brickCenterX = brick.x + brick.width / 2;
  let { dx, dy, x, y, radius } = ball;

  const overlapLeft = x + radius - brick.x;
  const overlapRight = brick.x + brick.width - (x - radius);
  const overlapTop = y + radius - brick.y;
  const overlapBottom = brick.y + brick.height - (y - radius);
  const minOverlapX = Math.min(overlapLeft, overlapRight);
  const minOverlapY = Math.min(overlapTop, overlapBottom);

  if (minOverlapX < minOverlapY) {
    dx = -dx;
    if (x < brickCenterX) {
      x = brick.x - radius - BREAKOUT_EPS;
    } else {
      x = brick.x + brick.width + radius + BREAKOUT_EPS;
    }
  } else if (prevY + radius <= brickCenterY) {
    dy = -Math.abs(dy);
    y = brick.y - radius - BREAKOUT_EPS;
  } else {
    dy = Math.abs(dy);
    y = brick.y + brick.height + radius + BREAKOUT_EPS;
  }

  return { x, y, radius, dx, dy };
}

export function computeLaunchVelocity(
  speed: number,
  angleRad: number = -Math.PI / 2,
): { dx: number; dy: number } {
  return {
    dx: Math.sin(angleRad) * speed,
    dy: -Math.cos(angleRad) * speed,
  };
}
