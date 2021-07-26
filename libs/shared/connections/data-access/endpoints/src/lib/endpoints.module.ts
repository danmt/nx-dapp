import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import * as fromEndpoints from './endpoints/endpoints.reducer';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature(
      fromEndpoints.ENDPOINTS_FEATURE_KEY,
      fromEndpoints.reducer
    ),
  ],
})
export class EndpointsModule {}
