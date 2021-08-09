import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { NotificationsService } from '..';

@NgModule({
  imports: [CommonModule, MatSnackBarModule],
  providers: [NotificationsService],
})
export class NotificationsModule {}
