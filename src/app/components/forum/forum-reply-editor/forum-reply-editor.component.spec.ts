import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumReplyEditorComponent } from './forum-reply-editor.component';

describe('ForumReplyEditorComponent', () => {
  let component: ForumReplyEditorComponent;
  let fixture: ComponentFixture<ForumReplyEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForumReplyEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumReplyEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
