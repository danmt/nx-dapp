import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CopyableTextModule } from '@nx-dapp/application/shared/ui/copyable-text';

import { PositionListItemComponent } from './position-list-item.component';

@NgModule({
  imports: [CommonModule, MatButtonModule, MatCardModule, CopyableTextModule],
  declarations: [PositionListItemComponent],
  exports: [PositionListItemComponent],
})
export class PositionListItemModule {}
