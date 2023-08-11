import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForumRoutingModule } from './forum-routing.module';

import { ForumBoardListComponent } from './forum-board-list/forum-board-list.component';
import { ForumPostListComponent } from './forum-post-list/forum-post-list.component';
import { ForumPostViewerComponent } from './forum-post-viewer/forum-post-viewer.component';
import { ForumPostEditorComponent } from './forum-post-editor/forum-post-editor.component';
import { ForumReplyEditorComponent } from './forum-reply-editor/forum-reply-editor.component';
import { CKEditorModule } from 'ckeditor4-angular';
import { AuthenticateGuard } from 'src/app/guards/authenticate.guard';


@NgModule({
  declarations: [
    ForumBoardListComponent,
    ForumPostListComponent,
    ForumPostViewerComponent,
    ForumPostEditorComponent,
    ForumReplyEditorComponent
  ],
  imports: [
    CommonModule,
    ForumRoutingModule,
    FormsModule,
    CKEditorModule
  ],
  providers: [AuthenticateGuard]
})
export class ForumModule { }
