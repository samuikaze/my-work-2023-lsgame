import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodsContentComponent } from './goods-content.component';

describe('GoodsContentComponent', () => {
  let component: GoodsContentComponent;
  let fixture: ComponentFixture<GoodsContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoodsContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoodsContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
