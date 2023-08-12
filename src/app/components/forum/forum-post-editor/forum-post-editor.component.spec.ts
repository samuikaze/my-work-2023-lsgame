import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumPostEditorComponent } from './forum-post-editor.component';

describe('ForumPostEditorComponent', () => {
  let component: ForumPostEditorComponent;
  let fixture: ComponentFixture<ForumPostEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ForumPostEditorComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumPostEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
