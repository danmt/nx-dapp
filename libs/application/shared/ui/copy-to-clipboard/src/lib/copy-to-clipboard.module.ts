import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CopyToClipboardComponent } from './copy-to-clipboard.component';

@NgModule({
  imports: [
    CommonModule,
    ClipboardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  declarations: [CopyToClipboardComponent],
  exports: [CopyToClipboardComponent],
})
export class CopyToClipboardModule {}
