import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Route, RouterModule } from '@angular/router';

import { ConnectionsDropdownComponent } from './connections-dropdown.component';

export const connectionRoutes: Route[] = [];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  declarations: [ConnectionsDropdownComponent],
  exports: [ConnectionsDropdownComponent],
})
export class ConnectionModule {}
