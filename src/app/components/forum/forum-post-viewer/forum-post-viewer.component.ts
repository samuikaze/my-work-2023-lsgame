import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Breadcrumb } from 'src/app/abstracts/common';
import { Post, Reply, ReplyList } from 'src/app/components/forum/forums';
import { BaseResponse } from 'src/app/abstracts/http-client';
import { TokenUser } from 'src/app/abstracts/single-sign-on';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { ForumBoardListComponent } from '../forum-board-list/forum-board-list.component';
import { ForumPostListComponent } from '../forum-post-list/forum-post-list.component';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ForumPostViewerStatus, Modals } from './forum-post-viewer';
import { Modal } from 'bootstrap';
import { AppEnvironmentService } from 'src/app/services/app-environment-service/app-environment.service';
import { ApiServiceTypes } from 'src/app/enums/api-service-types';

@Component({
    selector: 'app-forum-post-viewer',
    templateUrl: './forum-post-viewer.component.html',
    styleUrls: ['./forum-post-viewer.component.sass'],
    providers: [ForumBoardListComponent, ForumPostListComponent],
    standalone: true,
    imports: [NgIf, RouterLink, NgFor, DatePipe]
})
export class ForumPostViewerComponent implements OnInit {

  public statuses: ForumPostViewerStatus = {
    deleting: false,
  };
  private modals: Modals = {};
  public boardId: number;
  public postId: number;
  public post?: Post;
  public replies: Reply[] = [];
  public postLoaded: boolean = false;
  public repliesLoaded: boolean = false;
  public page = 1;
  public totalPages = 0;
  public breadcrumb: Breadcrumb;
  public userInfo?: TokenUser = undefined;
  private selectedReplyId: number | undefined = 0;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private requestService: RequestService,
    private breadcrumbService: BreadcrumbService,
    private appEnvironmentService: AppEnvironmentService,
    private router: Router,
    @Inject(ForumBoardListComponent) private forumBoardListComponent: ForumBoardListComponent,
    @Inject(ForumPostListComponent) private forumPostListComponent: ForumPostListComponent
  ) {
    this.boardId = Number(this.route.snapshot.paramMap.get("fid"));
    this.postId = Number(this.route.snapshot.paramMap.get("pid"));
    this.breadcrumb = { title: "文章內文一覽", uri: `/forums/${this.boardId}/post/${this.postId}` };
  }

  ngOnInit(): void {
    this.commonService.setTitle("討論專區");
    this.preprocessBreadcrumb();
    this.checkAuthenticateState();
    this.getPost();
    this.getReplies();
    this.initialModals();
  }

  private initialModals(): void {
    this.modals = {
      confirmDeletePostModal: new Modal('#confirmDeletePostModal'),
      confirmDeleteReplyModal: new Modal('#confirmDeleteReplyModal'),
    };
  }

  /**
   * 處理麵包屑
   */
  private preprocessBreadcrumb() {
    this.breadcrumbService.setBreadcrumb(this.forumBoardListComponent.breadcrumb);
    this.breadcrumbService.addBreadcrumb(this.forumPostListComponent.breadcrumb);
    this.breadcrumbService.addBreadcrumb(this.breadcrumb);
  }

  /**
   * 確認是否已完成載入
   * @returns 是否完成載入
   */
  public getLoaded() {
    return this.postLoaded && this.repliesLoaded;
  }

  /**
   * 翻頁
   * @param newPage 新頁碼
   */
   public setPage(newPage: number): void {
    if (newPage !== this.page && newPage > 0 && newPage <= this.totalPages) {
      this.page = newPage;
      this.getReplies();
    }
  }

  /**
   * 組合文章編輯網址
   * @returns 文章編輯網址
   */
  public composePostEditUrl() {
    return `/forums/${this.boardId}/post/${this.postId}/edit`;
  }

  /**
   * 組合回覆文章網址
   * @returns 回覆文章網址
   */
   public composeReplyUrl() {
    return `/forums/${this.boardId}/post/${this.postId}/reply`;
  }

  /**
   * 計算回覆為第幾篇
   * @param index 回應索引值
   * @returns 該回覆為第幾篇
   */
  public composeReplyId(index: number) {
    // 10 為系統變數
    return ((this.page - 1) * 10) + (index + 1);
  }

  /**
   * 組合回覆文章網址
   * @returns 回覆文章網址
   */
   public composeReplyEditUrl(id: number) {
    return `/forums/${this.boardId}/post/${this.postId}/reply/${id}/edit`;
  }


  /**
   * 取得文章本體
   */
  private async getPost() {
    this.postLoaded = false;
    this.post = undefined;

    const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.Forum);
    const uri = `${baseUri}/forums/boards/${this.boardId}/posts/${this.postId}`;
    this.requestService.get<BaseResponse<Post>>(uri)
      .subscribe({
        next: response => {
          this.post = response.data;
          this.postLoaded = true;
        },
        error: (errors: HttpErrorResponse) => {
          this.requestService.requestFailedHandler(errors);
          this.postLoaded = true;
        }
      });
  }

  /**
   * 取得文章底下的回應
   */
  private async getReplies() {
    this.repliesLoaded = false;
    this.replies = [];

    const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.Forum);
    const uri = `${baseUri}/forums/boards/${this.boardId}/posts/${this.postId}/replies`;
    const params = {
      page: this.page
    };
    this.requestService.get<BaseResponse<ReplyList>>(uri, params)
      .subscribe({
        next: response => {
          this.replies = response.data.replies;
          this.totalPages = response.data.totalPages;
          this.repliesLoaded = true;
        },
        error: (errors: HttpErrorResponse) => {
          this.requestService.requestFailedHandler(errors);
          this.repliesLoaded = true;
        }
      });
  }

  /**
   * 確認登入狀態
   * @returns 確認登入狀態
   */
  public checkAuthenticateState(): boolean {
    if (this.userInfo !== undefined) {
      return true;
    }

    this.userInfo = this.commonService.getUserData();

    return this.commonService.checkAuthenticateStateOffline();
  }

  /**
   * 可否編輯文章
   * @returns 可否編輯文章
   */
  public isEditable(postUserId: number) {
    if (this.userInfo === undefined) {
      return false;
    }

    return postUserId === this.userInfo.userId;
  }

  /**
   * 檢查回應標題是否存在
   * @param title 回應標題
   * @returns 回應標題是否存在
   */
  public isReplyTitleExists(title: string | undefined) {
    return title != null && title.length > 0;
  }

  /**
   * 刪除文章
   */
  public async fireDeletePost(): Promise<void> {
    this.statuses.deleting = true;

    const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.Forum);
    const uri = `${baseUri}/forums/boards/${this.boardId}/post/${this.postId}`;
    this.requestService.delete<BaseResponse<null>>(uri)
      .subscribe({
        next: () => {
          this.statuses.deleting = false;
          this.operationModal('confirmDeletePostModal', 'close');
          alert('刪除成功，頁面將跳轉回文章一覽');
          this.router.navigate(['forums', this.boardId]);
        },
        error: (errors: HttpErrorResponse) => {
          this.requestService.requestFailedHandler(errors);
          this.statuses.deleting = false;
        }
      })
  }

  /**
   * 刪除回應
   */
  public async fireDeleteReply(): Promise<void> {
    if (this.selectedReplyId == undefined) {
      return;
    }

    this.statuses.deleting = true;

    const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.Forum);
    const uri = `${baseUri}/forums/boards/${this.boardId}/post/${this.postId}/reply/${this.selectedReplyId}`;
    this.requestService.delete<BaseResponse<null>>(uri)
      .subscribe({
        next: () => {
          this.replies = this.replies.filter(reply => reply.id !== this.selectedReplyId);
          this.selectedReplyId = undefined;
          alert('刪除成功');
          this.statuses.deleting = false;
          this.operationModal('confirmDeleteReplyModal', 'close');
        },
        error: (errors: HttpErrorResponse) => {
          this.requestService.requestFailedHandler(errors);
          this.statuses.deleting = false;
        }
      })
  }

  public setSelectedReplyId(replyId: number): void {
    this.selectedReplyId = replyId;
  }

  /**
   * 操作指定 Modal
   * @param modal 目標 Modal 名稱
   * @param action 操作
   */
  public operationModal(modal: string, action: 'open' | 'close'): void {
    if (this.modals[modal] !== undefined) {
      switch (action) {
        case 'open':
          this.modals[modal].show();
          break;
        case 'close':
          this.modals[modal].hide();
          break;
      }
    }
  }
}
