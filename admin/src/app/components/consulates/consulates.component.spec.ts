import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsulatesComponent } from './consulates.component';

describe('ConsulatesComponent', () => {
  let component: ConsulatesComponent;
  let fixture: ComponentFixture<ConsulatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsulatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsulatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
