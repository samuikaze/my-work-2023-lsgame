import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/abstracts/common';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CommonService } from 'src/app/services/common-service/common.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.sass']
})
export class AboutComponent implements OnInit {

  public breadcrumb: Breadcrumb = { title: "關於團隊", uri: "/about" };
  constructor(
    private commonService: CommonService,
    private breadcrumbService: BreadcrumbService
  ) { }

  ngOnInit(): void {
    this.commonService.setTitle("關於團隊");
    this.breadcrumbService.setBreadcrumb(this.breadcrumb);
  }

}
