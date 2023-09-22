import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/abstracts/common';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CartService } from 'src/app/services/cart-service/cart.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { Good } from '../good';
import { Cart } from 'src/app/services/cart-service/cart-service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppEnvironmentService } from 'src/app/services/app-environment-service/app-environment.service';
import { ApiServiceTypes } from 'src/app/enums/api-service-types';

@Component({
    selector: 'app-goods-list',
    templateUrl: './goods-list.component.html',
    styleUrls: ['./goods-list.component.sass'],
    standalone: true,
    imports: [NgIf, RouterLink, NgFor]
})
export class GoodsListComponent implements OnInit {

  public fssUrl?: string = '';
  public goods: Array<Good> = [];
  public cartPrice: number = 0;
  public cartQuantity: number = 0;
  public loaded = false;
  public breadcrumb: Breadcrumb = { title: "周邊商品一覽", uri: "/goods" };
  constructor(
    private commonService: CommonService,
    private requestService: RequestService,
    private cartService: CartService,
    private breadcrumbService: BreadcrumbService,
    private appEnvironmentService: AppEnvironmentService
  ) { }

  async ngOnInit(): Promise<void> {
    this.commonService.setTitle("周邊商品");
    this.breadcrumbService.setBreadcrumb(this.breadcrumb);
    this.fssUrl = await this.appEnvironmentService.getConfig(ApiServiceTypes.FileStorageService);
    this.getCart();
    this.getGoods();
  }

  /**
   * 取得商品清單
   */
  public async getGoods() {
    this.loaded = false;
    this.goods = [];

    const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.Shop);
    const uri = `${baseUri}/shop/goods`;
    this.requestService.get<Array<Good>>(uri)
      .subscribe({
        next: response => {
          this.goods = response;
          this.loaded = true;
        },
        error: (errors: HttpErrorResponse) => {
          alert(errors.message);
        }
      });
  }

  /**
   * 取得購物車資料
   */
  public getCart() {
    this.cartQuantity = this.cartService.getCart().length;
    this.cartPrice = this.cartService.getTotalPrices();
  }

  /**
   * 將商品加入購物車
   * @param newGood 商品
   */
  public addToCart(newGood: Good, quantity: number) {
    const CART: Cart = {
      id: newGood.goodId,
      name: newGood.name,
      prices: newGood.price,
      quantity: quantity
    };

    this.cartService.addToCart(CART);

    this.getCart();
  }

  /**
   * 組合商品詳細頁面網址
   * @param id 商品 ID
   * @returns 商品詳細頁面 URL
   */
  public composeDetailUrl(id: number): string {
    return `/goods/${id}`;
  }

  /**
   * 組合商品預覽圖網址
   * @param image 圖片檔名
   * @returns 商品預覽圖網址
   */
  public composePreviewImageUrl(image: string): string {
    return `${this.fssUrl}/api/v1/file/${image}`;
  }
}
