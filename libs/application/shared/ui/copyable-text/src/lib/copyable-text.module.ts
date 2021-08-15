import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CopyToClipboardModule } from '@nx-dapp/application/shared/ui/copy-to-clipboard';

import { CopyableTextComponent } from './copyable-text.component';

@NgModule({
  imports: [CommonModule, CopyToClipboardModule],
  declarations: [CopyableTextComponent],
  exports: [CopyableTextComponent],
})
export class CopyableTextModule {}
