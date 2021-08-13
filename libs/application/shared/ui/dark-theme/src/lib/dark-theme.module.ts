import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SetDarkThemeDirective } from './set-dark-theme.directive';
import { ThemeService } from './theme-service.service';

@NgModule({
  declarations: [SetDarkThemeDirective],
  imports: [CommonModule],
  providers: [ThemeService],
  exports: [SetDarkThemeDirective],
})
export class DarkThemeModule {}