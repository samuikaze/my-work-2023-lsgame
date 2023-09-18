import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/abstracts/common';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CommonService } from 'src/app/services/common-service/common.service';

@Component({
    selector: 'app-recruit',
    templateUrl: './recruit.component.html',
    styleUrls: ['./recruit.component.sass'],
    standalone: true
})
export class RecruitComponent implements OnInit {

  public breadcrumb: Breadcrumb = { title: "加入我們", uri: "/recruit" };
  constructor(
    private commonService: CommonService,
    private breadcrumbService: BreadcrumbService
  ) { }

  ngOnInit(): void {
    this.commonService.setTitle("加入我們");
    this.breadcrumbService.setBreadcrumb(this.breadcrumb);
  }

}
