# Appendix B — Formulas & Algorithms

Справочник формул. Реализации — в `domain/tetris/**`, `domain/snake/**`, `domain/breakout/**` согласно [05-game-engines.md](05-game-engines.md).

---

## B.1 Обозначения

| Symbol | Meaning |
|--------|---------|
| \(r, c\) | row, col on Tetris board (0-based) |
| \(R\) | rotation index 0…3 |
| \(S_R\) | shape matrix at rotation R |
| \(\vec{d}\) | snake direction unit delta |
| \(v_x, v_y\) | ball velocity components |
| \(P_x, P_w\) | paddle x and width |
| \(B_x, B_y, B_r\) | ball center and radius |

---

## B.2 Tetris — collision

For active piece at `(row, col)` with rotation `R`, shape matrix `S`:

```
for each (sr, sc) where S[sr][sc] == 1:
  br = row + sr
  bc = col + sc
  if bc < 0 OR bc >= COLS OR br >= ROWS: collision
  if br >= 0 AND board[br][bc].filled: collision
return no collision
```

---

## B.3 Tetris — lock & merge

On lock, for each solid cell in shape:

```
board[row+sr][col+sc] = { filled: true, type: piece.type }
activePiece = null
```

Then `cleared = clearFullRows(board)` → scoring.

---

## B.4 Tetris — clear full rows

```
fullRows = []
for r in 0..ROWS-1:
  if every board[r][c].filled for c in 0..COLS-1:
    fullRows.push(r)

newBoard = []
for r in 0..ROWS-1:
  if r not in fullRows:
    newBoard.push(board[r])

while len(newBoard) < ROWS:
  newBoard.unshift(emptyRow())

return { board: newBoard, count: len(fullRows) }
```

Score: `score += SCORE_TABLE[count] * level` (Appendix A.5).

---

## B.5 Tetris — hard drop distance

```
distance = 0
while !collides(board, piece, distance+1, 0, R):
  distance += 1
piece.row += distance
score += distance * HARD_DROP_PER_CELL
lockPiece()
```

---

## B.6 Tetris — 7-bag randomizer

```
if bag empty:
  bag = shuffle([I,J,L,O,S,T,Z])
return bag.pop()
```

Fisher-Yates shuffle using `rng.next()`.

---

## B.7 Tetris — level factor

\[
\text{interval} = \max(\text{MIN\_TICK\_MS},\ \lfloor \text{base} \cdot \max(\text{MIN\_LEVEL\_FACTOR},\ 1 - (\text{level}-1)\cdot \text{LEVEL\_SPEED\_STEP}) \rfloor)
\]

If soft drop active:

\[
\text{interval} = \max(\text{MIN\_TICK\_MS},\ \lfloor \text{interval} \cdot \text{SOFT\_DROP\_MULTIPLIER} \rfloor)
\]

---

## B.8 Snake — direction delta

| Direction | dx | dy |
|-----------|----|----|
| up | 0 | -1 |
| down | 0 | 1 |
| left | -1 | 0 |
| right | 1 | 0 |

New head: `{ x: head.x + dx, y: head.y + dy }`.

---

## B.9 Snake — opposite turn ban

```ts
function isOpposite(a: Direction, b: Direction): boolean {
  return (
    (a === 'up' && b === 'down') ||
    (a === 'down' && b === 'up') ||
    (a === 'left' && b === 'right') ||
    (a === 'right' && b === 'left')
  );
}
```

Reject input if `isOpposite(currentDirection, proposedDirection)`.

When processing tick:

```
nextDir = queuedDirection ?? currentDirection
if queuedDirection valid: currentDirection = queuedDirection; queuedDirection = null
```

---

## B.10 Snake — apple spawn

```
candidates = all cells not in snake body
if candidates empty: gameOver = true (win edge case — treat as game over)
index = floor(rng.next() * candidates.length)
apple = candidates[index]
```

---

## B.11 Snake — move & grow

```
newHead = nextHead(head, direction)
if hitsWall(newHead) OR hitsSelf(newHead, snake): gameOver = true

if newHead == apple:
  snake = [newHead, ...snake]
  score += SNAKE_APPLE_SCORE
  apple = spawnApple(snake)
else:
  snake = [newHead, ...snake[0..length-2]]
```

---

## B.12 Breakout — circle vs axis-aligned rect (paddle/brick)

Ball circle center \((B_x, B_y)\), radius \(r\). Rect \((L, T, W, H)\).

```
closestX = clamp(Bx, L, L+W)
closestY = clamp(By, T, T+H)
distX = Bx - closestX
distY = By - closestY
distSq = distX*distX + distY*distY
hit = distSq <= r*r
```

For brick hit, determine side by comparing overlap depths (minimum penetration axis) to pick reflect axis.

**Канон (simplified):** if ball was above brick center before step → reflect `dy = -abs(dy)`; if below → `dy = +abs(dy)`; if from side → reflect `dx = -dx`.

---

## B.13 Breakout — wall reflection

```
if ball.x - r <= 0: ball.x = r; dx = abs(dx)
if ball.x + r >= WIDTH: ball.x = WIDTH - r; dx = -abs(dx)
if ball.y - r <= 0: ball.y = r; dy = abs(dy)
```

Bottom boundary (below paddle zone): trigger life loss, not reflect.

---

## B.14 Breakout — paddle bounce angle

When ball hits paddle from above (`ball.y + r >= paddle.y` and previous y above):

```
relative = ((ball.x - paddle.x) / paddle.width) * 2 - 1   // -1..1
clamp relative to [-1, 1]

MAX_ANGLE = 75 degrees in radians
angle = relative * MAX_ANGLE

speed = sqrt(dx*dx + dy*dy)  // preserve magnitude
dx = speed * sin(angle)
dy = -speed * cos(angle)     // always upward after paddle hit

if abs(dy) < 0.5: dy = -0.5  // minimum upward component
normalize to speed
```

Center hit → nearly vertical; edge hit → steep angle.

---

## B.15 Breakout — brick damage

On hit:

```
brick.durability -= 1
if brick.durability <= 0:
  brick.alive = false
  score += BRICK_SCORE * brick.maxDurability
else:
  score += floor(BRICK_SCORE / 2)   // partial hit bonus optional
```

---

## B.16 Breakout — win / lose

```
if countAliveBricks(bricks) == 0:
  win = true; gameOver = true

if ball.y - r > HEIGHT:
  lives -= 1
  if lives <= 0: gameOver = true
  else: resetBallOnPaddle()
```

---

## B.17 AABB clamp (paddle)

```
paddle.x = clamp(paddle.x, 0, WIDTH - paddle.width)
```

Mouse mapping:

```
canvasX = (clientX - rect.left) * (logicalWidth / rect.width)
logicalX = (canvasX - offsetX) / scale
paddle.x = clamp(logicalX - paddle.width/2, 0, WIDTH - paddle.width)
```

Use same scale/offset as `drawBreakout`.

---

## B.18 Level progression (Tetris)

```
newLevel = floor(lines / LINES_PER_LEVEL) + 1
if newLevel > level:
  level = newLevel
  update timer interval via getTickIntervalMs
```

---

## B.19 Session high score sync

```
sessionHigh = max(sessionHigh, currentScore)
storedHigh = max(storedHigh, leaderboardTopScore(gameId))
```

On game over, if `currentScore` qualifies → persist leaderboard entry.

---

## B.20 Floating point epsilon

Use `1e-6` for geometry comparisons:

```
if Math.abs(dy) < EPS: dy = -EPS
```

Avoid ball sticking in paddle: after paddle hit, set `ball.y = paddle.y - r - EPS`.

---

## B.21 Test vectors — Breakout paddle

Given `paddle.x=200`, `width=80`, `speed=5`, ball descending:

| ball.x | expected relative | dy sign |
|--------|-------------------|---------|
| 240 (center) | 0 | negative, \|dx\| small |
| 200 (left edge) | -1 | negative, dx negative |
| 280 (right edge) | +1 | negative, dx positive |

Assert with `breakout.physics.spec.ts`.

---

## B.22 Test vectors — Snake opposite

Current `right`; inputs `left` → rejected; `up`/`down` → accepted.

Current `up`; input `down` → rejected.
