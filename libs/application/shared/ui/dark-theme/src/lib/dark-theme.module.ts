import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DarkThemeDirective } from './dark-theme.directive';
import { DarkThemeService } from './dark-theme.service';

@NgModule({
  declarations: [DarkThemeDirective],
  imports: [CommonModule],
  providers: [DarkThemeService],
  exports: [DarkThemeDirective],
})
export class DarkThemeModule {}
