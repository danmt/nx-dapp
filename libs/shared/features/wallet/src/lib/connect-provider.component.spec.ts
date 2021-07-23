import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectProviderComponent } from './connect-provider.component';

describe('ConnectProviderComponent', () => {
  let component: ConnectProviderComponent;
  let fixture: ComponentFixture<ConnectProviderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectProviderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
