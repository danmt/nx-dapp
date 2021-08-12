import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalHeaderDirective } from './modal-header.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [ModalHeaderDirective],
  exports: [ModalHeaderDirective],
})
export class ModalHeaderModule {}
