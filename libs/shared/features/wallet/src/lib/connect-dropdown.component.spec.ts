import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectDropdownComponent } from './connect-dropdown.component';

describe('ConnectDropdownComponent', () => {
  let component: ConnectDropdownComponent;
  let fixture: ComponentFixture<ConnectDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectDropdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
