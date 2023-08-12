import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/abstracts/common';
import { BaseResponse } from 'src/app/abstracts/http-client';
import { Products } from 'src/app/abstracts/products';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { environment } from 'src/environments/environment';
import { NgIf, NgFor, DatePipe } from '@angular/common';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.sass'],
    standalone: true,
    imports: [NgIf, NgFor, DatePipe]
})
export class ProductListComponent implements OnInit {

  private apiPath = "products";
  public productsList: Products[] = [];
  public page: number = 1;
  public totalPages: number = 0;
  public loaded: boolean = false;
  public breadcrumb: Breadcrumb = { title: "作品一覽", uri: "/products" };
  constructor(
    private commonService: CommonService,
    private requestService: RequestService,
    private breadcrumbService: BreadcrumbService
  ) { }

  ngOnInit(): void {
    this.commonService.setTitle("作品一覽");
    this.breadcrumbService.setBreadcrumb(this.breadcrumb);
    this.getProductList();
  }

  /**
   * 打開燈箱
   * @param event 事件
   */
  openLightbox(event: Event): void {
    const imgElement = <HTMLImageElement> (event.target);
    const iAlbum = this.commonService.generateIAlbumObject(imgElement);
    this.commonService.openLightbox([iAlbum], 0);
  }

  public getProductList(): void {
    this.loaded = false;
    this.productsList = [];

    const URL = `${environment.backendUri}/${this.apiPath}`;
    const PARAMS = {page: this.page};
    this.requestService.get<BaseResponse<Products[]>>(URL, PARAMS)
      .subscribe(data => {
        this.productsList = data.data;
        this.loaded = true;
      });
  }
}
