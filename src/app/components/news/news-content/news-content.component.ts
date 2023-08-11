import { HttpErrorResponse } from '@angular/common/http';
import { Component, Host, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from 'src/app/abstracts/common';
import { BaseResponse } from 'src/app/abstracts/http-client';
import { News } from 'src/app/abstracts/news';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { environment } from 'src/environments/environment';
import { NewsListComponent } from '../news-list/news-list.component';

@Component({
  selector: 'app-news-content',
  templateUrl: './news-content.component.html',
  styleUrls: ['./news-content.component.sass'],
  providers: [ NewsListComponent ]
})
export class NewsContentComponent implements OnInit {

  public ID = Number(this.route.snapshot.paramMap.get("id"));
  public apiPath: string = "";
  public news?: News;
  public loaded: boolean = false;
  public breadcrumb: Breadcrumb = { title: "消息內文", uri: `/news/${this.ID}` };
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private requestService: RequestService,
    private breadcrumbService: BreadcrumbService,
    @Inject(NewsListComponent) private newsListComponent: NewsListComponent
  ) { }

  ngOnInit(): void {
    this.commonService.setTitle("最新消息");
    this.preprocessBreadcrumb();
    this.composeApiPath();
    this.getNews();
  }

  /**
   * 處理麵包屑
   */
  private preprocessBreadcrumb() {
    this.breadcrumbService.setBreadcrumb();
    this.breadcrumbService.addBreadcrumb(this.newsListComponent.breadcrumb);
    this.breadcrumbService.addBreadcrumb({ title: "消息內文", uri: `/news/${this.ID}` });
  }

  /**
   * 處理 API 路徑
   */
  private composeApiPath(): void {
    if (this.ID === null) {
      throw new Error("消息 ID 不符合系統規定");
    }

    this.apiPath = `news/${this.ID}`;
  }

  /**
   * 取得指定消息
   */
  private getNews(): void {
    this.loaded = false;
    this.news = undefined;

    try {
      if (this.apiPath.length === 0) {
        this.composeApiPath();
      }

      const URL = `${environment.backendUri}/${this.apiPath}`;
      this.requestService.get<BaseResponse<News>>(URL)
        .subscribe({
          next: (data: BaseResponse<News>) => {
            this.news = data.data;
            this.loaded = true;
          },
          error: (error: HttpErrorResponse) => {
            this.news = undefined;
            this.loaded = true;
          }
        });
    } catch (e) {
      this.news = undefined;
    }
  }
}
