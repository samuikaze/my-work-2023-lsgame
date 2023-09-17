import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/abstracts/common';
import { Platform, Product, ProductList, ProductType } from 'src/app/components/product/product';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AppEnvironmentService } from 'src/app/services/app-environment-service/app-environment.service';
import { ApiServiceTypes } from 'src/app/enums/api-service-types';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.sass'],
    standalone: true,
    imports: [NgIf, NgFor, DatePipe]
})
export class ProductListComponent implements OnInit {

  public productsList: Array<Product> = [];
  public productTypeList: Array<ProductType> = [];
  public platformList: Array<Platform> = [];
  public page: number = 1;
  public totalPages: number = 0;
  public loaded: boolean = false;
  public breadcrumb: Breadcrumb = { title: "作品一覽", uri: "/products" };
  constructor(
    private commonService: CommonService,
    private requestService: RequestService,
    private breadcrumbService: BreadcrumbService,
    private appEnvironmentService: AppEnvironmentService
  ) { }

  ngOnInit(): void {
    this.commonService.setTitle("作品一覽");
    this.breadcrumbService.setBreadcrumb(this.breadcrumb);
    this.getRequireData();
  }

  /**
   * 取得頁面所需的資料
   */
  private getRequireData(): void {
    const promises = [
      this.getProductTypeList(),
      this.getProductPlatformList(),
      this.getProductList(),
    ];

    Promise.all(promises)
      .catch(error => console.log(error))
      .finally(() => this.loaded = true);
  }

  /**
   * 打開燈箱
   * @param event 事件
   */
  public openLightbox(event: Event): void {
    const imgElement = <HTMLImageElement> (event.target);
    const iAlbum = this.commonService.generateIAlbumObject(imgElement);
    this.commonService.openLightbox([iAlbum], 0);
  }

  /**
   * 取得作品清單
   */
  private getProductList(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      this.productsList = [];
      const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.Common);
      const uri = `${baseUri}/product`;
      const params = {page: this.page};
      this.requestService.get<ProductList>(uri, params)
        .subscribe({
          next: response => {
            this.productsList = response.productList;
            this.totalPages = response.totalPages;
            resolve(true);
          },
          error: (errors: HttpErrorResponse) => {
            this.requestService.requestFailedHandler(errors);
            reject(errors.message);
          }
        });
    });
  }

  /**
   * 取得作品分類清單
   */
  private getProductTypeList(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      this.productTypeList = [];
      const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.Common);
      const uri = `${baseUri}/product/types`;
      this.requestService.get<Array<ProductType>>(uri)
        .subscribe({
          next: response => {
            this.productTypeList = response;
            resolve(true);
          },
          error: (errors: HttpErrorResponse) => {
            this.requestService.requestFailedHandler(errors);
            reject(errors.message);
          }
        });
    });
  }

  /**
   * 取得作品平台清單
   */
  private getProductPlatformList(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      this.platformList = [];
      const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.Common);
      const uri = `${baseUri}/product/platforms`;
      this.requestService.get<Array<Platform>>(uri)
        .subscribe({
          next: response => {
            this.platformList = response;
            resolve(true);
          },
          error: (errors: HttpErrorResponse) => {
            this.requestService.requestFailedHandler(errors);
            reject(errors.message);
          }
        })
    });
  }

  /**
   * 以作品種類 PK 取得作品種類名稱
   * @param id 作品種類 PK
   * @returns 作品種類名稱
   */
  public getProductTypeNameById(id: number): string {
    const productType = this.productTypeList.filter(type => type.productTypeId === id);
    if (productType.length === 0) {
      return '(未知的類型)';
    }

    return productType[0].productTypeName;
  }

  /**
   * 以平台 PKs 取得平台名稱
   * @param ids 平台 PKs
   * @returns 平台名稱
   */
  public getProductPlatformsByIds(ids: Array<number>): string {
    const platforms = this.platformList.filter(platform => ids.includes(platform.productPlatformId));
    if (platforms.length === 0) {
      return "";
    }

    return platforms.map(platform => platform.productPlatformName).join('、');
  }
}
