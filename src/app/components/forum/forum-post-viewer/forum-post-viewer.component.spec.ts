import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumPostViewerComponent } from './forum-post-viewer.component';

describe('ForumPostViewerComponent', () => {
  let component: ForumPostViewerComponent;
  let fixture: ComponentFixture<ForumPostViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ForumPostViewerComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumPostViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
