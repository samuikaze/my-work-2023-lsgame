import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumPostListComponent } from './forum-post-list.component';

describe('ForumPostListComponent', () => {
  let component: ForumPostListComponent;
  let fixture: ComponentFixture<ForumPostListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForumPostListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumPostListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
