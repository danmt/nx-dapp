import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';

import { ConnectionsEffects } from './connections/connections.effects';

@NgModule({
  imports: [CommonModule, EffectsModule.forFeature([ConnectionsEffects])],
})
export class ConnectionsModule {}
