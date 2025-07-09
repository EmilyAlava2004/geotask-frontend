import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrerPage } from './registrer.page';

describe('RegistrerPage', () => {
  let component: RegistrerPage;
  let fixture: ComponentFixture<RegistrerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
