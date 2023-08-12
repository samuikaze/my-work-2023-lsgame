import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from 'src/app/abstracts/common';
import { Category, Post, PostEdit } from 'src/app/abstracts/forums';
import { BaseResponse } from 'src/app/abstracts/http-client';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { environment } from 'src/environments/environment';
import { ForumBoardListComponent } from '../forum-board-list/forum-board-list.component';
import { ForumPostListComponent } from '../forum-post-list/forum-post-list.component';
import { ForumPostViewerComponent } from '../forum-post-viewer/forum-post-viewer.component';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { CKEditorModule } from 'ckeditor4-angular';

@Component({
  selector: 'app-forum-post-editor',
  templateUrl: './forum-post-editor.component.html',
  styleUrls: ['./forum-post-editor.component.sass'],
  providers: [
    ForumBoardListComponent,
    ForumPostListComponent,
    ForumPostViewerComponent,
  ],
  standalone: true,
  imports: [NgIf, FormsModule, NgFor, CKEditorModule],
})
export class ForumPostEditorComponent implements OnInit {
  @Input() public postModel: PostEdit = {
    title: '',
    category: undefined,
    content: '',
  };
  public categories: Category[] = [];
  public boardId?: number;
  public postId?: number;
  public categoriesLoaded = false;
  public postLoaded = false;
  public newPost: boolean = true;
  public fireSubmitPost: boolean = false;
  public breadcrumb: Breadcrumb = { title: '', uri: '' };
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
    private requestService: RequestService,
    private breadcrumbService: BreadcrumbService,
    @Inject(ForumBoardListComponent)
    private forumBoardListComponent: ForumBoardListComponent,
    @Inject(ForumPostListComponent)
    private forumPostListComponent: ForumPostListComponent,
    @Inject(ForumPostViewerComponent)
    private forumPostViewerComponent: ForumPostViewerComponent
  ) {}

  ngOnInit(): void {
    this.commonService.setTitle('討論專區');
    this.preprocessBreadcrumb();
    this.getPostTypes();
  }

  /**
   * 處理麵包屑
   */
  private preprocessBreadcrumb(): void {
    this.getBoardId();
    this.getPostId();
    if (this.postId !== undefined) {
      this.breadcrumb = {
        title: '編輯文章',
        uri: `/forums/${this.boardId}/post/${this.postId}/edit`,
      };
    } else {
      this.breadcrumb = {
        title: '張貼文章',
        uri: `/forums/${this.boardId}/post`,
      };
    }

    this.breadcrumbService.setBreadcrumb(
      this.forumBoardListComponent.breadcrumb
    );
    this.breadcrumbService.addBreadcrumb(
      this.forumPostListComponent.breadcrumb
    );

    if (this.postId !== undefined) {
      this.breadcrumbService.addBreadcrumb(
        this.forumPostViewerComponent.breadcrumb
      );
    }

    this.breadcrumbService.addBreadcrumb(this.breadcrumb);
  }

  /**
   * 確認必要資料是否皆已載入完成
   * @returns 是否完全載入完成
   */
  public getLoaded() {
    return this.categoriesLoaded && this.postLoaded;
  }

  /**
   * 從 URL 取得討論板 ID
   */
  private getBoardId() {
    const BOARD_ID = this.route.snapshot.paramMap.get('fid');
    if (BOARD_ID == null) {
      throw new Error('討論板 ID 不符合系統規定');
    }

    this.boardId = Number(BOARD_ID);
  }

  /**
   * 從 URL 取得文章 ID，若有則會進一步取得文章內容
   */
  private getPostId() {
    const POST_ID = this.route.snapshot.paramMap.get('pid');
    if (POST_ID == null) {
      this.postId = undefined;
      this.newPost = true;
      this.postLoaded = true;
    } else {
      this.postId = Number(POST_ID);
      this.newPost = false;
      this.getPost();
    }
  }

  /**
   * 取得文章分類清單
   */
  private getPostTypes() {
    this.categoriesLoaded = false;
    this.categories = [];

    const URL = `${environment.backendUri}/forums/commons/post/types`;
    this.requestService.get<BaseResponse<Category[]>>(URL).subscribe((data) => {
      this.categories = data.data;
      this.categoriesLoaded = true;
    });
  }

  /**
   * 取得文章資料
   */
  private getPost() {
    this.postLoaded = false;
    this.postModel = {
      title: '',
      category: undefined,
      content: '',
    };

    const URL = `${environment.backendUri}/forums/boards/${this.boardId}/posts/${this.postId}`;
    this.requestService.get<BaseResponse<Post>>(URL).subscribe((data) => {
      this.postModel.title = data.data.title;
      this.postModel.category = data.data.category_id;
      this.postModel.content = data.data.content;
      this.postLoaded = true;
    });
  }

  /**
   * 發布文章或更新文章
   */
  public submitPost() {
    if (!this.isPostSubmitable()) {
      alert('請確認所有欄位是否都有填完');
      throw new Error('請確認所有欄位是否都有填完');
    }

    this.fireSubmitPost = true;
    const POST = this.postModel;

    let url = '';
    let client = undefined;
    if (this.postId !== undefined) {
      url = `${environment.backendUri}/forums/boards/${this.boardId}/post/${this.postId}`;
      client = this.requestService.patch<BaseResponse<null>>(url, POST);
    } else {
      url = `${environment.backendUri}/forums/boards/${this.boardId}/posts`;
      client = this.requestService.post<BaseResponse<null>>(url, POST);
    }

    client.subscribe({
      next: () => {
        this.fireSubmitPost = false;
        this.backToBoard();
      },
      error: (errors: HttpErrorResponse) => {
        console.log(errors);

        if (errors.status >= 500) {
          alert('系統發生不可預期的錯誤，請再試一次');
        }

        alert(errors.error.message);
        this.fireSubmitPost = false;
      },
    });
  }

  /**
   * 返回討論板
   */
  public backToBoard() {
    let path = this.router.url;
    if (this.newPost) {
      path = path.replace('/post', '');
    } else {
      path = path.replace('/edit', '');
    }
    this.router.navigate([path]);
  }

  /**
   * 是否可張貼文章
   * @returns 是否可張貼文章
   */
  public isPostSubmitable() {
    return (
      this.postModel.title.length > 0 &&
      this.postModel.category !== undefined &&
      this.postModel.content.length > 0 &&
      !this.fireSubmitPost
    );
  }
}
