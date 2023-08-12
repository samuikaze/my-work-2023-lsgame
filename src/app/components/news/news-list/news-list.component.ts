import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/abstracts/common';
import { BaseResponse } from 'src/app/abstracts/http-client';
import { News } from 'src/app/abstracts/news';
import { NewsList } from 'src/app/abstracts/news';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { environment } from 'src/environments/environment';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, DatePipe } from '@angular/common';

@Component({
    selector: 'app-news-list',
    templateUrl: './news-list.component.html',
    styleUrls: ['./news-list.component.sass'],
    standalone: true,
    imports: [NgIf, NgFor, RouterLink, DatePipe]
})
export class NewsListComponent implements OnInit {

  private newsUri = "news";
  public newsList: News[] = [];
  public page: number = 1;
  public totalPages: number = 0;
  public loaded: boolean = false;
  public breadcrumb: Breadcrumb = { title: "最新消息", uri: "/news" };
  constructor(
    private commonService: CommonService,
    private breadcrumbService: BreadcrumbService,
    private requestService: RequestService
  ) { }

  ngOnInit(): void {
    this.commonService.setTitle("最新消息");
    this.breadcrumbService.setBreadcrumb(this.breadcrumb);
    this.getNews();
  }

  /**
   * 取得消息一覽
   */
  private getNews(): void {
    this.loaded = false;
    this.newsList = [];

    const URL = `${environment.backendUri}/${this.newsUri}`
    const PARAMS = {page: this.page};
    this.requestService.get<BaseResponse<NewsList>>(URL, PARAMS)
      .subscribe(data => {
        this.newsList = data.data.newsList;
        this.totalPages = data.data.totalPages;
        this.loaded = true;
      });
  }

  /**
   * 翻頁
   * @param newPage 新頁碼
   */
  public setPage(newPage: number): void {
    if (newPage !== this.page && newPage > 0 && newPage <= this.totalPages) {
      this.page = newPage;
      this.getNews();
    }
  }

  /**
   * 組合消息詳細網址
   * @param id 消息 ID
   * @returns 消息詳細網址
   */
  public composeNewsDetailUrl(id: number): string {
    return `/news/${id}`;
  }
}
