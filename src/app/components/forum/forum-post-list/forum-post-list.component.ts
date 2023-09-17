import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Breadcrumb } from 'src/app/abstracts/common';
import { Post } from 'src/app/components/forum/forums';
import { BaseResponse } from 'src/app/abstracts/http-client';
import { UserInformation } from 'src/app/abstracts/single-sign-on';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { ForumBoardListComponent } from '../forum-board-list/forum-board-list.component';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { AppEnvironmentService } from 'src/app/services/app-environment-service/app-environment.service';
import { ApiServiceTypes } from 'src/app/enums/api-service-types';

@Component({
  selector: 'app-forum-post-list',
  templateUrl: './forum-post-list.component.html',
  styleUrls: ['./forum-post-list.component.sass'],
  providers: [ForumBoardListComponent],
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, DatePipe],
})
export class ForumPostListComponent implements OnInit {
  public boardId?: number;
  public posts: Post[] = [];
  public userInformations: Array<UserInformation> = [];
  public page: number = 1;
  public totalPages: number = 1;
  public loaded: boolean = false;
  public breadcrumb: Breadcrumb;
  public authenticated: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
    private requestService: RequestService,
    private breadcrumbService: BreadcrumbService,
    private appEnvironmentService: AppEnvironmentService,
    @Inject(ForumBoardListComponent)
    private forumBoardListComponent: ForumBoardListComponent
  ) {
    this.boardId = Number(this.route.snapshot.paramMap.get('fid'));
    this.breadcrumb = {
      title: '討論板文章一覽',
      uri: `/forums/${this.boardId}`,
    };
  }

  ngOnInit(): void {
    this.commonService.setTitle('討論專區');
    this.preprocessBreadcrumb();
    this.getBoardPosts();
    this.authenticated = this.checkAuthenticateState();
  }

  /**
   * 處理麵包屑
   */
  public preprocessBreadcrumb() {
    this.breadcrumbService.setBreadcrumb(
      this.forumBoardListComponent.breadcrumb
    );
    this.breadcrumbService.addBreadcrumb(this.breadcrumb);
  }

  /**
   * 取得文章清單
   */
  public async getBoardPosts() {
    this.loaded = false;
    this.posts = [];

    const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.Forum);
    const URL = `${baseUri}/forums/boards/${this.boardId}`;
    this.requestService.get<BaseResponse<Post[]>>(URL).subscribe({
      next: (response) => {
        this.posts = response.data;
        const userId = [
          ...new Set(response.data.map((post) => post.post_user_id)),
        ];
        this.getUserNameByIds(userId);
      },
    });
  }

  /**
   * 組成文章完整網址
   * @param id 文章 ID
   * @returns 文章完整網址
   */
  public composePostUrl(id: number): string {
    return `${this.router.url}/post/${id}`;
  }

  /**
   * 組合發布新文章網址
   * @returns 發布新文章網址
   */
  public composeNewPostUrl() {
    return `/forums/${this.boardId}/post`;
  }

  /**
   * 翻頁
   * @param newPage 新頁碼
   */
  public setPage(newPage: number): void {
    if (newPage !== this.page && newPage > 0 && newPage <= this.totalPages) {
      this.page = newPage;
      this.getBoardPosts();
    }
  }

  /**
   * 檢查登入狀態
   * @returns 是否登入
   */
  public checkAuthenticateState(): boolean {
    return this.commonService.checkAuthenticateStateOffline();
  }

  /**
   * 以使用者帳號 PK 取得帳號資訊
   */
  public async getUserNameByIds(id: Array<number>): Promise<void> {
    const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.SingleSignOn);
    this.requestService
      .post<BaseResponse<Array<UserInformation>>>(
        `${baseUri}/api/v1/users`,
        { id }
      )
      .subscribe({
        next: (response) => {
          this.userInformations = response.data;
          this.loaded = true;
        },
        error: (errors: HttpErrorResponse) => {
          alert('查詢張貼者失敗，請再試一次');
          this.loaded = true;
        },
      });
  }

  /**
   * 以使用者帳號 PK 取得帳號名稱
   */
  public getUserNameById(id: number): string {
    const user = this.userInformations.filter((user) => user.id === id);
    if (user.length === 0) {
      return '(未知使用者)';
    }

    return user[0].username;
  }
}
