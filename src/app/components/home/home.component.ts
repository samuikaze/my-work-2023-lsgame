import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { News, NewsList, NewsType } from '../news/news';
import { environment } from 'src/environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { HomeStatus } from './home';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
  standalone: true,
  imports: [CommonModule]
})
export class HomeComponent implements OnInit {
  public newsList: Array<News> = [];
  public newsTypes: Array<NewsType> = [];
  public statuses: HomeStatus = {
    news: false,
  };
  constructor(
    private commonService: CommonService,
    private requestService: RequestService,
    private breadcrumbService: BreadcrumbService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.commonService.setTitle('');
    this.breadcrumbService.setBreadcrumb();
    this.getRequiredData();
  }

  private getRequiredData(): void {
    this.statuses.news = false;

    const promises = [
      this.getNewsTypes(),
      this.getNews()
    ];

    Promise.allSettled(promises)
      .catch(error => {
        console.error(error);
      })
      .finally(() => this.statuses.news = true);
  }

  /**
   * 取得消息一覽
   */
  private getNews(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.newsList = [];

      const uri = `${environment.commonUri}/news`;
      const params = { page: 1 };
      this.requestService.get<NewsList>(uri, params)
        .subscribe({
          next: (response) => {
            this.newsList = response.newsList;
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
   * 取的所有消息種類
   */
  private getNewsTypes(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const uri = `${environment.commonUri}/news/types`;
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

  public navigate(...path: Array<string>): void {
    this.router.navigate(path);
  }
}
