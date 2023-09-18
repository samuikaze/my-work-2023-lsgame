import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/abstracts/common';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CommonService } from 'src/app/services/common-service/common.service';

@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.sass'],
    standalone: true
})
export class ContactComponent implements OnInit {

  public breadcrumb: Breadcrumb = { title: "聯絡我們", uri: "/contact" };
  constructor(
    private commonService: CommonService,
    private breadcrumbService: BreadcrumbService
  ) { }

  ngOnInit(): void {
    this.commonService.setTitle("聯絡我們");
    this.breadcrumbService.setBreadcrumb(this.breadcrumb);
  }

}
