import {
  ShapeMatrix,
  TetrominoDefinition,
  TetrominoType,
} from '../../models/arcade.types';

const I_R0: ShapeMatrix = [
  [0, 0, 0, 0],
  [1, 1, 1, 1],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

const I_R1: ShapeMatrix = [
  [0, 0, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 1, 0],
];

const O_ALL: ShapeMatrix = [
  [0, 1, 1, 0],
  [0, 1, 1, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

const T_R0: ShapeMatrix = [
  [0, 1, 0, 0],
  [1, 1, 1, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

const T_R1: ShapeMatrix = [
  [0, 1, 0, 0],
  [0, 1, 1, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 0],
];

const T_R2: ShapeMatrix = [
  [0, 0, 0, 0],
  [1, 1, 1, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 0],
];

const T_R3: ShapeMatrix = [
  [0, 1, 0, 0],
  [1, 1, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 0],
];

const S_R0: ShapeMatrix = [
  [0, 1, 1, 0],
  [1, 1, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

const S_R1: ShapeMatrix = [
  [0, 1, 0, 0],
  [0, 1, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 0],
];

const S_R2: ShapeMatrix = [
  [0, 0, 0, 0],
  [0, 1, 1, 0],
  [1, 1, 0, 0],
  [0, 0, 0, 0],
];

const S_R3: ShapeMatrix = [
  [1, 0, 0, 0],
  [1, 1, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 0],
];

const Z_R0: ShapeMatrix = [
  [1, 1, 0, 0],
  [0, 1, 1, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

const Z_R1: ShapeMatrix = [
  [0, 0, 1, 0],
  [0, 1, 1, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 0],
];

const Z_R2: ShapeMatrix = [
  [0, 0, 0, 0],
  [1, 1, 0, 0],
  [0, 1, 1, 0],
  [0, 0, 0, 0],
];

const Z_R3: ShapeMatrix = [
  [0, 1, 0, 0],
  [1, 1, 0, 0],
  [1, 0, 0, 0],
  [0, 0, 0, 0],
];

const J_R0: ShapeMatrix = [
  [1, 0, 0, 0],
  [1, 1, 1, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

const J_R1: ShapeMatrix = [
  [0, 1, 1, 0],
  [0, 1, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 0],
];

const J_R2: ShapeMatrix = [
  [0, 0, 0, 0],
  [1, 1, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 0],
];

const J_R3: ShapeMatrix = [
  [0, 1, 0, 0],
  [0, 1, 0, 0],
  [1, 1, 0, 0],
  [0, 0, 0, 0],
];

const L_R0: ShapeMatrix = [
  [0, 0, 1, 0],
  [1, 1, 1, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

const L_R1: ShapeMatrix = [
  [0, 1, 0, 0],
  [0, 1, 0, 0],
  [0, 1, 1, 0],
  [0, 0, 0, 0],
];

const L_R2: ShapeMatrix = [
  [0, 0, 0, 0],
  [1, 1, 1, 0],
  [1, 0, 0, 0],
  [0, 0, 0, 0],
];

const L_R3: ShapeMatrix = [
  [1, 1, 0, 0],
  [0, 1, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 0],
];

export const TETROMINO_DEFINITIONS: Record<TetrominoType, TetrominoDefinition> =
  {
    I: {
      type: 'I',
      rotations: [I_R0, I_R1, I_R0, I_R1],
      colorVar: '--rae-tetris-i',
    },
    O: {
      type: 'O',
      rotations: [O_ALL, O_ALL, O_ALL, O_ALL],
      colorVar: '--rae-tetris-o',
    },
    T: {
      type: 'T',
      rotations: [T_R0, T_R1, T_R2, T_R3],
      colorVar: '--rae-tetris-t',
    },
    S: {
      type: 'S',
      rotations: [S_R0, S_R1, S_R2, S_R3],
      colorVar: '--rae-neon-lime',
    },
    Z: {
      type: 'Z',
      rotations: [Z_R0, Z_R1, Z_R2, Z_R3],
      colorVar: '--rae-danger',
    },
    J: {
      type: 'J',
      rotations: [J_R0, J_R1, J_R2, J_R3],
      colorVar: '--rae-neon-cyan',
    },
    L: {
      type: 'L',
      rotations: [L_R0, L_R1, L_R2, L_R3],
      colorVar: '--rae-neon-amber',
    },
  };

export function getShapeMatrix(
  type: TetrominoType,
  rotationIndex: number,
): ShapeMatrix {
  const rotations = TETROMINO_DEFINITIONS[type].rotations;
  const index = ((rotationIndex % 4) + 4) % 4;
  return rotations[index];
}
