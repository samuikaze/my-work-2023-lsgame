import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Breadcrumb } from 'src/app/abstracts/common';
import { Post, Reply, ReplyList } from 'src/app/abstracts/forums';
import { BaseResponse } from 'src/app/abstracts/http-client';
import { User } from 'src/app/abstracts/single-sign-on';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { environment } from 'src/environments/environment';
import { ForumBoardListComponent } from '../forum-board-list/forum-board-list.component';
import { ForumPostListComponent } from '../forum-post-list/forum-post-list.component';
import { NgIf, NgFor, DatePipe } from '@angular/common';

@Component({
    selector: 'app-forum-post-viewer',
    templateUrl: './forum-post-viewer.component.html',
    styleUrls: ['./forum-post-viewer.component.sass'],
    providers: [ForumBoardListComponent, ForumPostListComponent],
    standalone: true,
    imports: [NgIf, RouterLink, NgFor, DatePipe]
})
export class ForumPostViewerComponent implements OnInit {

  public boardId: number;
  public postId: number;
  public post?: Post;
  public replies: Reply[] = [];
  public postLoaded: boolean = false;
  public repliesLoaded: boolean = false;
  public page = 1;
  public totalPages = 0;
  public breadcrumb: Breadcrumb;
  public userInfo?: User = undefined;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private requestService: RequestService,
    private breadcrumbService: BreadcrumbService,
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
  private getPost() {
    this.postLoaded = false;
    this.post = undefined;

    const URL = `${environment.backendUri}/forums/boards/${this.boardId}/posts/${this.postId}`;
    this.requestService.get<BaseResponse<Post>>(URL)
      .subscribe(data => {
        this.post = data.data;
        this.postLoaded = true;
      });
  }

  /**
   * 取得文章底下的回應
   */
  private getReplies() {
    this.repliesLoaded = false;
    this.replies = [];

    const URL = `${environment.backendUri}/forums/boards/${this.boardId}/posts/${this.postId}/replies`;
    const PARAMS = {
      page: this.page
    };
    this.requestService.get<BaseResponse<ReplyList>>(URL, PARAMS)
      .subscribe(data => {
        this.replies = data.data.replies;
        this.totalPages = data.data.totalPages;
        this.repliesLoaded = true;
      });
  }

  /**
   * 確認登入狀態
   * @returns 確認登入狀態
   */
  public checkAuthenticateState() {
    if (this.userInfo !== undefined) {
      return true;
    }

    this.userInfo = this.commonService.getUserData();

    return this.userInfo !== undefined;
  }

  /**
   * 可否編輯文章
   * @returns 可否編輯文章
   */
  public isEditable(postUserId: number) {
    if (this.userInfo === undefined) {
      return false;
    }

    return postUserId === this.userInfo.id;
  }
}
