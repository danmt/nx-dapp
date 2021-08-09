import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { PositionListItemComponent } from './position-list-item.component';

@NgModule({
  imports: [CommonModule, MatCardModule],
  declarations: [PositionListItemComponent],
  exports: [PositionListItemComponent],
})
export class PositionListItemModule {}
