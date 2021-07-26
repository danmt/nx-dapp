import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromTokens from './tokens/tokens.reducer';
import { TokensEffects } from './tokens/tokens.effects';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature(fromTokens.TOKENS_FEATURE_KEY, fromTokens.reducer),
    EffectsModule.forFeature([TokensEffects]),
  ],
})
export class DataAccessModule {}
