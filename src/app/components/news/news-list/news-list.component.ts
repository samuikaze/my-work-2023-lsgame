import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/abstracts/common';
import { BaseResponse } from 'src/app/abstracts/http-client';
import { News, NewsType } from 'src/app/components/news/news';
import { NewsList } from 'src/app/components/news/news';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { environment } from 'src/environments/environment';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-news-list',
    templateUrl: './news-list.component.html',
    styleUrls: ['./news-list.component.sass'],
    standalone: true,
    imports: [NgIf, NgFor, RouterLink, DatePipe]
})
export class NewsListComponent implements OnInit {

  public newsTypes: Array<NewsType> = [];
  public newsList: Array<News> = [];
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
    this.getNewsTypes();
    this.getNews();
  }

  /**
   * 取的所有消息種類
   */
  private getNewsTypes(): void {
    const uri = `${environment.commonUri}/news/types`;
    this.requestService.get<Array<NewsType>>(uri)
      .subscribe({
        next: response => {
          this.newsTypes = response;
        },
        error: (errors: HttpErrorResponse) => {},
      })
  }

  /**
   * 取得消息一覽
   */
  private getNews(): void {
    this.loaded = false;
    this.newsList = [];

    const uri = `${environment.commonUri}/news`
    const params = {page: this.page};
    this.requestService.get<NewsList>(uri, params)
      .subscribe(response => {
        this.newsList = response.newsList;
        this.totalPages = response.totalPages;
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
