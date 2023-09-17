import { HttpErrorResponse } from '@angular/common/http';
import { Component, Host, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Breadcrumb } from 'src/app/abstracts/common';
import { News, NewsType } from 'src/app/components/news/news';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { NewsListComponent } from '../news-list/news-list.component';
import { NgIf, DatePipe } from '@angular/common';
import { AppEnvironmentService } from 'src/app/services/app-environment-service/app-environment.service';
import { ApiServiceTypes } from 'src/app/enums/api-service-types';

@Component({
    selector: 'app-news-content',
    templateUrl: './news-content.component.html',
    styleUrls: ['./news-content.component.sass'],
    providers: [NewsListComponent],
    standalone: true,
    imports: [NgIf, RouterLink, DatePipe]
})
export class NewsContentComponent implements OnInit {

  public newsId?: number;
  public newsTypes: Array<NewsType> = [];
  public apiPath: string = "";
  public news?: News;
  public loaded: boolean = false;
  public breadcrumb: Breadcrumb = { title: "消息內文", uri: `/news/${this.newsId}` };
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private requestService: RequestService,
    private breadcrumbService: BreadcrumbService,
    private appEnvironmentService: AppEnvironmentService,
    @Inject(NewsListComponent) private newsListComponent: NewsListComponent
  ) { }

  ngOnInit(): void {
    this.commonService.setTitle("最新消息");
    this.getNewsId();
    this.getNewsTypes();
    this.preprocessBreadcrumb();
    this.composeApiPath();
    this.getNews();
  }

  /**
   * 取得消息 PK
   */
  private getNewsId(): void {
    this.newsId = Number(
      this.route.snapshot.paramMap.get("id")
    );
  }

  /**
   * 取得所有消息種類
   */
  private async getNewsTypes(): Promise<void> {
    const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.Common);
    const uri = `${baseUri}/news/types`;
    this.requestService.get<Array<NewsType>>(uri)
      .subscribe({
        next: response => {
          this.newsTypes = response;
        },
        error: (errors: HttpErrorResponse) => {},
      })
  }

  /**
   * 處理麵包屑
   */
  private preprocessBreadcrumb() {
    this.breadcrumbService.setBreadcrumb();
    this.breadcrumbService.addBreadcrumb(this.newsListComponent.breadcrumb);
    this.breadcrumbService.addBreadcrumb({ title: "消息內文", uri: `/news/${this.newsId}` });
  }

  /**
   * 處理 API 路徑
   */
  private composeApiPath(): void {
    if (this.newsId === null) {
      throw new Error("消息 ID 不符合系統規定");
    }

    this.apiPath = `news/${this.newsId}`;
  }

  /**
   * 取得指定消息
   */
  private async getNews(): Promise<void> {
    this.loaded = false;
    this.news = undefined;

    try {
      if (this.apiPath.length === 0) {
        this.composeApiPath();
      }

      const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.Common);
      const uri = `${baseUri}/${this.apiPath}`;
      this.requestService.get<News>(uri)
        .subscribe({
          next: response => {
            this.news = response;
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

  /**
   * 以消息種類 PK 取得消息種類名稱
   */
  public getNewsTypeById(id: number): string {
    const newsType = this.newsTypes.filter(type => type.newsTypeId === id);
    if (newsType.length === 0) {
      return "";
    }

    return newsType[0].name;
  }
}
