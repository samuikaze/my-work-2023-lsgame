import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { News, NewsList, NewsType } from '../news/news';
import { HttpErrorResponse } from '@angular/common/http';
import { Carousel, GetCarouselListResponse, HomeStatus } from './home';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AppEnvironmentService } from 'src/app/services/app-environment-service/app-environment.service';
import { ApiServiceTypes } from 'src/app/enums/api-service-types';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class HomeComponent implements OnInit {
  public fssUrl?: string = '';
  public newsList: Array<News> = [];
  public newsTypes: Array<NewsType> = [];
  public carouselList: Array<Carousel> = [];
  public statuses: HomeStatus = {
    news: false,
    carousel: false,
  };
  constructor(
    private commonService: CommonService,
    private requestService: RequestService,
    private breadcrumbService: BreadcrumbService,
    private appEnvironmentService: AppEnvironmentService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.commonService.setTitle('');
    this.breadcrumbService.setBreadcrumb();
    await this.getRequiredData();
  }

  /**
   * 取得必要的資料
   */
  private async getRequiredData(): Promise<void> {
    this.fssUrl = await this.appEnvironmentService.getConfig(ApiServiceTypes.FileStorageService);

    const promises = [
      this.getNewsTypes(),
      this.getNews(),
      this.getCarousel(),
    ];

    Promise.allSettled(promises)
      .catch(error => {
        console.error(error);
      })
      .finally(() => this.statuses.news = true);
  }

  /**
   * 取得圖片輪播
   */
  private getCarousel(): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      this.statuses.carousel = true;
      this.carouselList = [];

      const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.Common);
      const uri = `${baseUri}/carousel`;
      const params = { page: 1, rowPerPage: 1000 };
      this.requestService.get<GetCarouselListResponse>(uri, params)
        .subscribe({
          next: response => {
            this.carouselList = response.carouselList;
            this.statuses.carousel = false;
            resolve(true);
          },
          error: (errors: HttpErrorResponse) => {
            this.requestService.requestFailedHandler(errors);
            this.statuses.carousel = false;
            reject(errors);
          },
        });
    });
  }

  /**
   * 取得消息一覽
   */
  private getNews(): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      this.statuses.news = true;
      this.newsList = [];

      const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.Common);
      const uri = `${baseUri}/news`;
      const params = { page: 1 };
      this.requestService.get<NewsList>(uri, params)
        .subscribe({
          next: (response) => {
            this.newsList = response.newsList;
            this.statuses.news = false;
            resolve(true);
          },
          error: (errors: HttpErrorResponse) => {
            this.requestService.requestFailedHandler(errors);
            this.statuses.news = false;
            reject(errors.message);
          },
        });
      });
  }

  /**
   * 取的所有消息種類
   */
  private getNewsTypes(): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.Common);
      const uri = `${baseUri}/news/types`;
      this.requestService.get<Array<NewsType>>(uri)
        .subscribe({
          next: (response) => {
            this.newsTypes = response;
            resolve(true);
          },
          error: (errors: HttpErrorResponse) => {
            this.requestService.requestFailedHandler(errors);
            reject(errors.message);
          },
        });
      });
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

  /**
   * 跳轉頁面到指定路徑
   * @param path 跳轉路徑
   */
  public navigate(...path: Array<string>): void {
    this.router.navigate(path);
  }

  /**
   * 以最新消息 PK 取得最新消息頁面路徑
   * @param newsId 最新消息 PK
   * @returns 最新消息頁面路徑
   */
  public getNewsLink(newsId: number): string {
    return `/news/${newsId}`;
  }

  /**
   * 組合完整圖片網址
   * @param path 圖片輪播路徑
   * @returns 圖片完整網址
   */
  public composeCarouselImageUrl(path: string): string {
    return `${this.fssUrl}/api/v1/file/${path}`;
  }

  /**
   * 檢查圖片輪播標題是否存在
   * @param title 圖片輪播標題
   * @returns 圖片輪播標題是否存在
   */
  public isCarouselTitleExists(title?: string): boolean {
    return title != null && title.length > 0;
  }

  /**
   * 檢查圖片輪播連結是否存在
   * @param title 圖片輪播連結
   * @returns 圖片輪播連結是否存在
   */
  public isCarouselLinkExists(link?: string): boolean {
    return link != null && link.length > 0;
  }

  /**
   * 確認是否顯示輪播
   * @returns 是否顯示輪播
   */
  public showCarousel(): boolean {
    return this.carouselList.length > 0;
  }
}
