import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConnectivityPage } from './connectivity.page';

describe('ConnectivityPage', () => {
  let component: ConnectivityPage;
  let fixture: ComponentFixture<ConnectivityPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectivityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
