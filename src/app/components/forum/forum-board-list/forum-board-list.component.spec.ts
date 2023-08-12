import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumBoardListComponent } from './forum-board-list.component';

describe('ForumBoardListComponent', () => {
  let component: ForumBoardListComponent;
  let fixture: ComponentFixture<ForumBoardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ForumBoardListComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumBoardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
