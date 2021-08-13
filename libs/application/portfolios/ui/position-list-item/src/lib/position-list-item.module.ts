import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CopyToClipboardModule } from '@nx-dapp/application/shared/ui/copy-to-clipboard';

import { PositionListItemComponent } from './position-list-item.component';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    CopyToClipboardModule,
  ],
  declarations: [PositionListItemComponent],
  exports: [PositionListItemComponent],
})
export class PositionListItemModule {}
