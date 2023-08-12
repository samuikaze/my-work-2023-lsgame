import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Breadcrumb } from 'src/app/abstracts/common';
import { Post } from 'src/app/abstracts/forums';
import { BaseResponse } from 'src/app/abstracts/http-client';
import { UserInformation } from 'src/app/abstracts/single-sign-on';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { environment } from 'src/environments/environment';
import { ForumBoardListComponent } from '../forum-board-list/forum-board-list.component';
import { NgIf, NgFor, DatePipe } from '@angular/common';

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
  public page: number = 1;
  public totalPages: number = 1;
  public loaded: boolean = false;
  public breadcrumb: Breadcrumb;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
    private requestService: RequestService,
    private breadcrumbService: BreadcrumbService,
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
  public getBoardPosts() {
    this.loaded = false;
    this.posts = [];

    const URL = `${environment.backendUri}/forums/boards/${this.boardId}`;
    this.requestService.get<BaseResponse<Post[]>>(URL).subscribe({
      next: (data) => {
        this.posts = data.data;
        const userId = data.data.map((post) => post.post_user_id);
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

  public checkAuthenticateState() {
    return this.commonService.getUserData() !== undefined;
  }

  public getUserNameByIds(id: Array<number>) {
    this.requestService
      .post<BaseResponse<Array<UserInformation>>>(
        `${environment.ssoApiUri}/api/v1/users`,
        { id }
      )
      .subscribe({
        next: (response) => {
          this.posts.map((post) => {
            post.post_user = response.data.filter(
              (user) => user.id == post.post_user_id
            )[0].name;
            return post;
          });
          this.loaded = true;
        },
        error: (errors: HttpErrorResponse) => {
          alert('查詢張貼者失敗，請再試一次');
          this.loaded = true;
        },
      });
  }
}
