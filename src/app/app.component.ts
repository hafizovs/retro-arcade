import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CabinetRootComponent } from './core/layout/cabinet-root/cabinet-root.component';

@Component({
  selector: 'rae-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CabinetRootComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
