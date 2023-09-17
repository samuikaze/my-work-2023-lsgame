import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authenticateGuard } from 'src/app/guards/authenticate.guard';

import { ForumBoardListComponent } from './forum-board-list/forum-board-list.component';
import { ForumPostEditorComponent } from './forum-post-editor/forum-post-editor.component';
import { ForumPostListComponent } from './forum-post-list/forum-post-list.component';
import { ForumPostViewerComponent } from './forum-post-viewer/forum-post-viewer.component';
import { ForumReplyEditorComponent } from './forum-reply-editor/forum-reply-editor.component';


const routes: Routes = [
  { path: "", component: ForumBoardListComponent },
  { path: ":fid", component: ForumPostListComponent },
  { path: ":fid/post/:pid", component: ForumPostViewerComponent },
  { path: ":fid/post", component: ForumPostEditorComponent, canActivate: [authenticateGuard] },
  { path: ":fid/post/:pid/edit", component: ForumPostEditorComponent, canActivate: [authenticateGuard] },
  { path: ":fid/post/:pid/reply", component: ForumReplyEditorComponent, canActivate: [authenticateGuard] },
  { path: ":fid/post/:pid/reply/:rid/edit", component: ForumReplyEditorComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForumRoutingModule { }
