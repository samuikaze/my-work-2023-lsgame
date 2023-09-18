import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/abstracts/common';
import { ApiServiceTypes } from 'src/app/enums/api-service-types';
import { AppEnvironmentService } from 'src/app/services/app-environment-service/app-environment.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { Faq, FaqStatuses, GetFaqListResponse } from './faq';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.sass'],
    standalone: true,
    imports: [CommonModule]
})
export class FaqComponent implements OnInit {

  public faqs: Array<Faq> = [];
  public totalPage = 1;
  public statuses: FaqStatuses = {
    gettingFaq: false,
  };
  public breadcrumb: Breadcrumb = { title: "常見問題", uri: "/faq" };
  constructor(
    private commonService: CommonService,
    private breadcrumbService: BreadcrumbService,
    private appEnvironmentService: AppEnvironmentService,
    private requestService: RequestService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.commonService.setTitle("常見問題");
    this.breadcrumbService.setBreadcrumb(this.breadcrumb);
    this.getFaqList();
  }

  /**
   * 取得常見問題清單
   */
  private async getFaqList(): Promise<void> {
    this.statuses.gettingFaq = true;
    this.faqs = [];
    this.totalPage = 1;
    const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.Common);
    const uri = `${baseUri}/faq`;

    this.requestService.get<GetFaqListResponse>(uri)
      .subscribe({
        next: response => {
          this.faqs = response.faqList;
          this.totalPage = response.totalPages;
          this.statuses.gettingFaq = false;
        },
        error: (errors: HttpErrorResponse) => {
          this.requestService.requestFailedHandler(errors);
          this.statuses.gettingFaq = false;
        }
      });
  }

  /**
   * 跳轉到聯絡我們
   */
  public navigateToContact(): void {
    this.router.navigate(['contact']);
  }
}
