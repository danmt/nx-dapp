import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetDarkThemeDirective } from './set-dark-theme.directive';

@NgModule({
  declarations: [
    SetDarkThemeDirective
  ],
  imports: [CommonModule],
  exports: [
    SetDarkThemeDirective
  ]
})
export class DarkThemeModule {}
