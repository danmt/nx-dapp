import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';

import { NetworksRadioGroupComponent } from './networks-radio-group.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, MatRadioModule],
  declarations: [NetworksRadioGroupComponent],
  exports: [NetworksRadioGroupComponent],
})
export class NetworksRadioGroupModule {}
