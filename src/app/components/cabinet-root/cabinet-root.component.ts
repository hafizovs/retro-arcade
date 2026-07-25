import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { DEFAULT_PLAYER_NAME } from '../../core/constants/arcade.constants';
import { countAliveBricks } from '../../domain/breakout/breakout.bricks';
import { KeyboardCaptureDirective } from '../../directives/keyboard-capture.directive';
import {
  DifficultyId,
  GameId,
  GameInputAction,
} from '../../models/arcade.types';
import { ArcadeTimerService } from '../../services/arcade-timer.service';
import { BreakoutEngineService } from '../../services/breakout-engine.service';
import { HotkeyCommand, HotkeysService } from '../../services/hotkeys.service';
import { LeaderboardService } from '../../services/leaderboard.service';
import { SnakeEngineService } from '../../services/snake-engine.service';
import { TetrisEngineService } from '../../services/tetris-engine.service';
import { ArcadeStore } from '../../state/arcade.store';
import { UiStore } from '../../state/ui.store';
import { ArcadeCanvasComponent } from '../arcade-canvas/arcade-canvas.component';
import { GameControlsComponent } from '../game-controls/game-controls.component';
import { GameOverOverlayComponent } from '../game-over-overlay/game-over-overlay.component';
import { GameSelectorComponent } from '../game-selector/game-selector.component';
import { HelpOverlayComponent } from '../help-overlay/help-overlay.component';
import { LeaderboardComponent } from '../leaderboard/leaderboard.component';
import { PauseOverlayComponent } from '../pause-overlay/pause-overlay.component';
import { StatusBarComponent } from '../status-bar/status-bar.component';
import { TelemetryPanelComponent } from '../telemetry-panel/telemetry-panel.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';

@Component({
  selector: 'rae-cabinet-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    KeyboardCaptureDirective,
    ToolbarComponent,
    GameSelectorComponent,
    LeaderboardComponent,
    ArcadeCanvasComponent,
    GameControlsComponent,
    TelemetryPanelComponent,
    StatusBarComponent,
    PauseOverlayComponent,
    GameOverOverlayComponent,
    HelpOverlayComponent,
  ],
  templateUrl: './cabinet-root.component.html',
  styleUrl: './cabinet-root.component.scss',
})
export class CabinetRootComponent implements OnInit {
  readonly arcade = inject(ArcadeStore);
  readonly ui = inject(UiStore);
  private readonly timer = inject(ArcadeTimerService);
  private readonly tetris = inject(TetrisEngineService);
  private readonly snake = inject(SnakeEngineService);
  private readonly breakout = inject(BreakoutEngineService);
  private readonly leaderboard = inject(LeaderboardService);
  private readonly hotkeys = inject(HotkeysService);

  readonly activeEngine = computed(() => {
    switch (this.arcade.activeGameId()) {
      case 'tetris':
        return this.tetris;
      case 'snake':
        return this.snake;
      case 'breakout':
        return this.breakout;
    }
  });

  ngOnInit(): void {
    this.tetris.init();
    this.snake.init();
    this.breakout.init();
    this.syncTelemetry();
    this.hotkeys.start((command) => this.onHotkey(command));
  }

  onGameSelected(id: GameId): void {
    this.selectGame(id);
  }

  onGameInput(action: GameInputAction): void {
    if (this.arcade.phase() !== 'running') {
      return;
    }
    this.activeEngine().handleInput(action);
    this.syncTelemetry();
  }

  onDifficultyChange(id: DifficultyId): void {
    this.arcade.setDifficulty(id);
    this.tetris.setDifficulty(id);
    this.snake.setDifficulty(id);
    this.breakout.setDifficulty(id);
    const engine = this.activeEngine();
    const interval = engine.getTickIntervalMs(id);
    this.timer.setTickIntervalMs(interval);
    this.arcade.updateTelemetry({ tickIntervalMs: interval });
  }

  startGame(): void {
    const phase = this.arcade.phase();
    if (phase === 'running' || phase === 'gameover') {
      return;
    }

    const difficulty = this.arcade.difficultyId();
    this.tetris.setDifficulty(difficulty);
    this.snake.setDifficulty(difficulty);
    this.breakout.setDifficulty(difficulty);

    const engine = this.activeEngine();
    let interval = engine.getTickIntervalMs(difficulty);
    this.timer.setTickIntervalMs(interval);
    this.arcade.setPhase('running');
    this.ui.setPauseOverlayOpen(false);
    this.ui.setGameOverOverlayOpen(false);
    this.arcade.beginSessionClock();
    this.syncTelemetry();

    this.timer.start(() => {
      engine.tick(interval);
      const nextInterval = engine.getTickIntervalMs(difficulty);
      if (nextInterval !== this.timer.getTickIntervalMs()) {
        this.timer.setTickIntervalMs(nextInterval);
        interval = nextInterval;
      }
      this.syncTelemetry();
      if (engine.isGameOver() || engine.isWin()) {
        this.onGameEnd();
      }
    });
  }

  pauseGame(): void {
    if (this.arcade.phase() !== 'running') {
      return;
    }
    this.timer.pause();
    this.arcade.pauseSessionClock();
    this.arcade.setPhase('paused');
    this.ui.setPauseOverlayOpen(true);
  }

  resumeGame(): void {
    if (this.arcade.phase() !== 'paused') {
      return;
    }
    this.ui.setPauseOverlayOpen(false);
    this.startGame();
  }

  resetGame(): void {
    this.timer.stop();
    this.arcade.resetSessionClock();
    this.activeEngine().reset();
    this.arcade.setPhase('idle');
    this.arcade.lastGameOverReason.set(null);
    this.arcade.resetTelemetryForNewGame();
    this.ui.setPauseOverlayOpen(false);
    this.ui.setGameOverOverlayOpen(false);
    this.ui.setPlayerNameDraft(DEFAULT_PLAYER_NAME);
    this.syncTelemetry();
  }

  saveScore(playerName: string): void {
    const score = this.arcade.telemetry().currentScore;
    this.leaderboard.addEntry({
      gameId: this.arcade.activeGameId(),
      playerName,
      score,
      achievedAtIso: new Date().toISOString(),
      difficulty: this.arcade.difficultyId(),
    });
    this.arcade.syncStoredHighScore();
  }

  playAgain(): void {
    this.resetGame();
    this.startGame();
  }

  backToMenu(): void {
    this.resetGame();
  }

  closeHelp(): void {
    this.ui.closeHelp();
  }

  private selectGame(id: GameId): void {
    if (this.arcade.activeGameId() === id) {
      return;
    }
    if (this.arcade.phase() === 'running') {
      this.timer.pause();
      this.arcade.pauseSessionClock();
    }
    this.timer.stop();
    this.arcade.selectGame(id);
    this.tetris.reset();
    this.snake.reset();
    this.breakout.reset();
    this.ui.setPauseOverlayOpen(false);
    this.ui.setGameOverOverlayOpen(false);
    this.syncTelemetry();
  }

  private onGameEnd(): void {
    this.timer.pause();
    this.arcade.pauseSessionClock();
    const engine = this.activeEngine();
    const reason = engine.isWin() ? 'win' : 'lose';
    this.arcade.setGameOverReason(reason);
    this.arcade.setPhase('gameover');
    this.ui.setGameOverOverlayOpen(true);
    this.ui.setPauseOverlayOpen(false);
    this.syncTelemetry();
  }

  private syncTelemetry(): void {
    const engine = this.activeEngine();
    const difficulty = this.arcade.difficultyId();
    const tickIntervalMs = engine.getTickIntervalMs(difficulty);
    const gameId = this.arcade.activeGameId();

    const partial: {
      currentScore: number;
      level: number;
      tickIntervalMs: number;
      linesCleared?: number;
      snakeLength?: number;
      bricksRemaining?: number;
    } = {
      currentScore: engine.score(),
      level: engine.level(),
      tickIntervalMs,
    };

    if (gameId === 'tetris') {
      partial.linesCleared = this.tetris.state().lines;
    }
    if (gameId === 'snake') {
      partial.snakeLength = this.snake.state().snake.length;
    }
    if (gameId === 'breakout') {
      partial.bricksRemaining = countAliveBricks(this.breakout.state().bricks);
    }

    this.arcade.updateTelemetry(partial);
    this.arcade.syncStoredHighScore(gameId);
  }

  private onHotkey(command: HotkeyCommand): void {
    switch (command) {
      case 'start':
        if (this.arcade.phase() === 'paused') {
          this.resumeGame();
        } else {
          this.startGame();
        }
        break;
      case 'pause':
        if (this.arcade.phase() === 'running') {
          this.pauseGame();
        } else if (this.arcade.phase() === 'paused') {
          this.resumeGame();
        }
        break;
      case 'reset':
        this.resetGame();
        break;
      case 'selectTetris':
        this.selectGame('tetris');
        break;
      case 'selectSnake':
        this.selectGame('snake');
        break;
      case 'selectBreakout':
        this.selectGame('breakout');
        break;
      case 'escape':
        if (this.ui.helpOpen()) {
          this.ui.closeHelp();
          return;
        }
        if (this.arcade.phase() === 'paused') {
          this.resumeGame();
        }
        break;
      default:
        break;
    }
  }
}
