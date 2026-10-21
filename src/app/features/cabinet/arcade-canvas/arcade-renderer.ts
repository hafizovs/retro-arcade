import {
  BREAKOUT_BRICK_COLORS,
  BREAKOUT_HEIGHT,
  BREAKOUT_WIDTH,
} from '../../../core/constants/breakout.constants';
import { TETRIS_COLORS } from '../../../core/constants/tetris.constants';
import {
  BreakoutState,
  GameId,
  SnakeState,
  TetrisState,
  TetrominoType,
} from '../../../core/models/arcade.types';
import { getShapeMatrix } from '../../../domain/tetris/tetromino-shapes';
import {
  getBrickLayout,
  getBrickRect,
} from '../../../domain/breakout/breakout.bricks';

const BG = '#080a12';
const GRID = 'rgba(0, 240, 255, 0.08)';
const TEXT = '#e8f0ff';

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, width, height);
}

export function drawIdleOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  label: string,
): void {
  ctx.fillStyle = 'rgba(5, 6, 12, 0.45)';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = TEXT;
  ctx.font = '700 28px Orbitron, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
  ctx.shadowBlur = 12;
  ctx.fillText(label, width / 2, height / 2);
  ctx.shadowBlur = 0;
}

export function drawPausedOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  label: string,
): void {
  ctx.fillStyle = 'rgba(5, 6, 12, 0.4)';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#ff00aa';
  ctx.font = '700 32px Orbitron, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, width / 2, height / 2);
}

export function drawTetris(
  ctx: CanvasRenderingContext2D,
  state: TetrisState,
  width: number,
  height: number,
): void {
  const cell = Math.min(
    Math.floor(width / state.cols),
    Math.floor(height / state.rows),
  );
  const boardW = cell * state.cols;
  const boardH = cell * state.rows;
  const ox = Math.floor((width - boardW) / 2);
  const oy = Math.floor((height - boardH) / 2);

  ctx.fillStyle = '#0a0c16';
  ctx.fillRect(ox, oy, boardW, boardH);

  ctx.strokeStyle = GRID;
  ctx.lineWidth = 1;
  for (let c = 0; c <= state.cols; c += 1) {
    ctx.beginPath();
    ctx.moveTo(ox + c * cell, oy);
    ctx.lineTo(ox + c * cell, oy + boardH);
    ctx.stroke();
  }
  for (let r = 0; r <= state.rows; r += 1) {
    ctx.beginPath();
    ctx.moveTo(ox, oy + r * cell);
    ctx.lineTo(ox + boardW, oy + r * cell);
    ctx.stroke();
  }

  for (let r = 0; r < state.rows; r += 1) {
    for (let c = 0; c < state.cols; c += 1) {
      const cellData = state.board[r][c];
      if (!cellData.filled || !cellData.type) {
        continue;
      }
      drawCell(ctx, ox + c * cell, oy + r * cell, cell, cellData.type, false);
    }
  }

  if (state.activePiece) {
    const matrix = getShapeMatrix(
      state.activePiece.type,
      state.activePiece.rotationIndex,
    );
    for (let sr = 0; sr < matrix.length; sr += 1) {
      for (let sc = 0; sc < matrix[sr].length; sc += 1) {
        if (matrix[sr][sc] !== 1) {
          continue;
        }
        const br = state.activePiece.row + sr;
        const bc = state.activePiece.col + sc;
        if (br < 0) {
          continue;
        }
        drawCell(
          ctx,
          ox + bc * cell,
          oy + br * cell,
          cell,
          state.activePiece.type,
          true,
        );
      }
    }
  }

  drawNextPreview(ctx, state.nextPieceType, width, 12);

  if (state.gameOver) {
    ctx.fillStyle = 'rgba(255, 51, 85, 0.2)';
    ctx.fillRect(ox, oy, boardW, boardH);
  }
}

export function drawSnake(
  ctx: CanvasRenderingContext2D,
  state: SnakeState,
  width: number,
  height: number,
): void {
  const cell = Math.min(
    Math.floor(width / state.cols),
    Math.floor(height / state.rows),
  );
  const boardW = cell * state.cols;
  const boardH = cell * state.rows;
  const ox = Math.floor((width - boardW) / 2);
  const oy = Math.floor((height - boardH) / 2);

  ctx.fillStyle = '#0a0c16';
  ctx.fillRect(ox, oy, boardW, boardH);

  ctx.strokeStyle = GRID;
  for (let c = 0; c <= state.cols; c += 1) {
    ctx.beginPath();
    ctx.moveTo(ox + c * cell, oy);
    ctx.lineTo(ox + c * cell, oy + boardH);
    ctx.stroke();
  }
  for (let r = 0; r <= state.rows; r += 1) {
    ctx.beginPath();
    ctx.moveTo(ox, oy + r * cell);
    ctx.lineTo(ox + boardW, oy + r * cell);
    ctx.stroke();
  }

  const appleX = ox + state.apple.x * cell + cell / 2;
  const appleY = oy + state.apple.y * cell + cell / 2;
  ctx.fillStyle = '#ff3355';
  ctx.shadowColor = 'rgba(255, 51, 85, 0.7)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(appleX, appleY, cell * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  state.snake.forEach((segment, index) => {
    const x = ox + segment.x * cell + 1;
    const y = oy + segment.y * cell + 1;
    const size = cell - 2;
    ctx.fillStyle = index === 0 ? '#39ff88' : '#1a8844';
    if (index === 0) {
      ctx.shadowColor = 'rgba(57, 255, 136, 0.55)';
      ctx.shadowBlur = 8;
    }
    roundRect(ctx, x, y, size, size, 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  if (state.gameOver) {
    ctx.fillStyle = 'rgba(255, 51, 85, 0.2)';
    ctx.fillRect(ox, oy, boardW, boardH);
  }
}

export function drawBreakout(
  ctx: CanvasRenderingContext2D,
  state: BreakoutState,
  width: number,
  height: number,
): void {
  const scale = Math.min(width / BREAKOUT_WIDTH, height / BREAKOUT_HEIGHT);
  const offsetX = (width - BREAKOUT_WIDTH * scale) / 2;
  const offsetY = (height - BREAKOUT_HEIGHT * scale) / 2;

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  ctx.fillStyle = '#0a0c16';
  ctx.fillRect(0, 0, BREAKOUT_WIDTH, BREAKOUT_HEIGHT);

  const layout = getBrickLayout(
    state.width,
    state.height,
    state.brickRows,
    state.brickCols,
  );

  for (let r = 0; r < state.bricks.length; r += 1) {
    for (let c = 0; c < state.bricks[r].length; c += 1) {
      const brick = state.bricks[r][c];
      if (!brick.alive) {
        continue;
      }
      const rect = getBrickRect(r, c, layout);
      const color = BREAKOUT_BRICK_COLORS[brick.colorIndex % 3];
      const alpha = 0.45 + (brick.durability / brick.maxDurability) * 0.55;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 3);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  ctx.fillStyle = '#00f0ff';
  ctx.shadowColor = 'rgba(0, 240, 255, 0.7)';
  ctx.shadowBlur = 12;
  roundRect(
    ctx,
    state.paddle.x,
    state.paddle.y,
    state.paddle.width,
    state.paddle.height,
    4,
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  for (let i = 0; i < state.lives; i += 1) {
    ctx.fillStyle = '#ff00aa';
    ctx.beginPath();
    ctx.arc(16 + i * 18, 16, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function mapPointerToBreakoutX(
  clientX: number,
  canvasRect: DOMRect,
  canvasCssWidth: number,
  canvasCssHeight: number,
  paddleWidth: number,
): number {
  const localX =
    ((clientX - canvasRect.left) * canvasCssWidth) / canvasRect.width;
  const scale = Math.min(
    canvasCssWidth / BREAKOUT_WIDTH,
    canvasCssHeight / BREAKOUT_HEIGHT,
  );
  const offsetX = (canvasCssWidth - BREAKOUT_WIDTH * scale) / 2;
  const logicalX = (localX - offsetX) / scale;
  return logicalX - paddleWidth / 2;
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: TetrominoType,
  glow: boolean,
): void {
  const color = TETRIS_COLORS[type];
  ctx.fillStyle = color;
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
  }
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(x + 2, y + 2, Math.max(1, size - 6), Math.max(1, size / 4));
}

function drawNextPreview(
  ctx: CanvasRenderingContext2D,
  type: TetrominoType,
  canvasWidth: number,
  margin: number,
): void {
  const matrix = getShapeMatrix(type, 0);
  const cell = 12;
  const ox = canvasWidth - margin - 4 * cell - 8;
  const oy = margin;
  ctx.fillStyle = 'rgba(20, 24, 40, 0.85)';
  ctx.fillRect(ox - 6, oy - 6, 4 * cell + 12, 4 * cell + 12);
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
  ctx.strokeRect(ox - 6, oy - 6, 4 * cell + 12, 4 * cell + 12);
  for (let r = 0; r < matrix.length; r += 1) {
    for (let c = 0; c < matrix[r].length; c += 1) {
      if (matrix[r][c] === 1) {
        drawCell(ctx, ox + c * cell, oy + r * cell, cell, type, false);
      }
    }
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function gameTitleKey(gameId: GameId): string {
  return gameId;
}
