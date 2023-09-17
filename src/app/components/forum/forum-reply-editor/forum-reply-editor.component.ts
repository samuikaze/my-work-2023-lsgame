import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from 'src/app/abstracts/common';
import { ReplyEdit } from 'src/app/components/forum/forums';
import { BaseResponse } from 'src/app/abstracts/http-client';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { ForumBoardListComponent } from '../forum-board-list/forum-board-list.component';
import { ForumPostListComponent } from '../forum-post-list/forum-post-list.component';
import { ForumPostViewerComponent } from '../forum-post-viewer/forum-post-viewer.component';
import { CKEditorModule } from 'ckeditor4-angular';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AppEnvironmentService } from 'src/app/services/app-environment-service/app-environment.service';
import { ApiServiceTypes } from 'src/app/enums/api-service-types';

@Component({
    selector: 'app-forum-reply-editor',
    templateUrl: './forum-reply-editor.component.html',
    styleUrls: ['./forum-reply-editor.component.sass'],
    providers: [ForumBoardListComponent, ForumPostListComponent, ForumPostViewerComponent],
    standalone: true,
    imports: [NgIf, FormsModule, CKEditorModule]
})
export class ForumReplyEditorComponent implements OnInit {

  @Input() public replyModel: ReplyEdit = {
    title: "",
    content: ""
  };
  private boardId?: number;
  private postId?: number;
  private replyId?: number;
  public replyLoaded = false;
  public categoriesLoaded = false;
  public newReply = true;
  public breadcrumb: Breadcrumb = { title: "", uri: "" };
  public submitting = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
    private requestService: RequestService,
    private breadcrumbService: BreadcrumbService,
    private appEnvironmentService: AppEnvironmentService,
    @Inject(ForumBoardListComponent) private forumBoardListComponent: ForumBoardListComponent,
    @Inject(ForumPostListComponent) private forumPostListComponent: ForumPostListComponent,
    @Inject(ForumPostViewerComponent) private forumPostViewerComponent: ForumPostViewerComponent
  ) { }

  ngOnInit(): void {
    this.commonService.setTitle("討論專區");
    this.preprocessBreadcrumb();
  }

  /**
   * 處理麵包屑
   */
   private preprocessBreadcrumb(): void {
    this.getBoardId();
    this.getPostId();
    this.getReplyId();
    if (this.replyId !== undefined) {
      this.breadcrumb = { title: "編輯回應", uri: `/forums/${this.boardId}/post/${this.postId}/reply/${this.replyId}/edit` };
    } else {
      this.breadcrumb = { title: "張貼回應", uri: `/forums/${this.boardId}/post/${this.postId}/reply` };
    }

    this.breadcrumbService.setBreadcrumb(this.forumBoardListComponent.breadcrumb);
    this.breadcrumbService.addBreadcrumb(this.forumPostListComponent.breadcrumb);

    if (this.postId !== undefined) {
      this.breadcrumbService.addBreadcrumb(this.forumPostViewerComponent.breadcrumb);
    }

    this.breadcrumbService.addBreadcrumb(this.breadcrumb);
  }

  public getLoaded() {
    return this.replyLoaded;
  }

  public async submitReply() {
    if (!this.isReplySubmitable()) {
      alert("請確認所有欄位是否都有填完");
      throw new Error("請確認所有欄位是否都有填完");
    }

    this.submitting = true;
    let url = "";
    let client = undefined;
    const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.Forum);
    if (this.replyId !== undefined) {
      url = `${baseUri}/forums/boards/${this.boardId}/post/${this.postId}/reply/${this.replyId}`;
      client = this.requestService.patch<BaseResponse<null>>(url, this.replyModel);
    } else {
      url = `${baseUri}/forums/boards/${this.boardId}/post/${this.postId}/replies`;
      client = this.requestService.post<BaseResponse<null>>(url, this.replyModel);
    }

    client.subscribe({
        next: () => {
          this.backToPost();
          this.submitting = false;
        },
        error: (errors: HttpErrorResponse) => {
          console.log(errors);

          if (errors.status >= 500) {
            alert("系統發生不可預期的錯誤，請再試一次");
          }

          alert(errors.error.message);
          this.submitting = false;
        },
      });
  }

  public backToPost() {
    let path = this.router.url;

    if (this.newReply) {
      path = path.replace("/reply", "");
    } else {
      path = path.replace(`/reply/${this.replyId}/edit`, "");
    }
    this.router.navigate([path]);
  }

  /**
   * 從 URL 取得討論板 ID
   */
  private getBoardId() {
    const BOARD_ID = this.route.snapshot.paramMap.get("fid");
    if (BOARD_ID == null) {
      throw new Error("討論板 ID 不符合系統規定");
    }

    this.boardId = Number(BOARD_ID);
  }

  /**
   * 從 URL 取得文章 ID
   */
  private getPostId() {
    const POST_ID = this.route.snapshot.paramMap.get("pid")
    if (POST_ID == null) {
      throw new Error("文章 ID 不符合系統規定");
    }

    this.postId = Number(POST_ID);
  }

  /**
   * 從 URL 取得回應 ID，若有則會進一步取得回應內容
   */
  private getReplyId() {
    const REPLY_ID = this.route.snapshot.paramMap.get("rid");
    if (REPLY_ID == null) {
      this.replyId = undefined;
      this.newReply = true;
      this.replyLoaded = true;
    } else {
      this.replyId = Number(REPLY_ID);
      this.newReply = false;
      this.getReply();
    }
  }

  /**
   * 取得文章資料
   */
  private async getReply() {
    this.replyLoaded = false;
    this.replyModel.title = "";
    this.replyModel.content = "";

    const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.Forum);
    const uri = `${baseUri}/forums/boards/${this.boardId}/posts/${this.postId}/replies/${this.replyId}`;
    this.requestService.get<BaseResponse<ReplyEdit>>(uri)
      .subscribe(data => {
        this.replyModel.title = data.data.title;
        this.replyModel.content = data.data.content;
        this.replyLoaded = true;
      })
  }

  /**
   * 是否可以送出回應
   * @returns 是否可以送出回應
   */
  public isReplySubmitable() {
    return (
      this.replyModel.content.length > 0 &&
      !this.submitting
    );
  }
}
