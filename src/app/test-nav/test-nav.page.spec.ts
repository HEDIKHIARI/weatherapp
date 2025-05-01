import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestNavPage } from './test-nav.page';

describe('TestNavPage', () => {
  let component: TestNavPage;
  let fixture: ComponentFixture<TestNavPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestNavPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
