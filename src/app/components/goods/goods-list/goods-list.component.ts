import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/abstracts/common';
import { Cart, Good } from 'src/app/abstracts/goods';
import { BaseResponse } from 'src/app/abstracts/http-client';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CartService } from 'src/app/services/cart-service/cart.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-goods-list',
  templateUrl: './goods-list.component.html',
  styleUrls: ['./goods-list.component.sass']
})
export class GoodsListComponent implements OnInit {

  public goods: Good[] = [];
  public cartPrice: number = 0;
  public cartQuantity: number = 0;
  public loaded = false;
  public breadcrumb: Breadcrumb = { title: "周邊商品一覽", uri: "/goods" };
  private goodsApiPath = "goods";
  constructor(
    private commonService: CommonService,
    private requestService: RequestService,
    private cartService: CartService,
    private breadcrumbService: BreadcrumbService
  ) { }

  ngOnInit(): void {
    this.commonService.setTitle("周邊商品");
    this.breadcrumbService.setBreadcrumb(this.breadcrumb);
    this.getCart();
    this.getGoods();
  }

  /**
   * 取得商品清單
   */
  public getGoods() {
    this.loaded = false;
    this.goods = [];

    const URL = `${environment.backendUri}/${this.goodsApiPath}`;
    this.requestService.get<BaseResponse<Good[]>>(URL)
      .subscribe(data => {
        this.goods = data.data;
        this.loaded = true;
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
      id: newGood.id,
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
    return `/assets/images/goods/${image}`;
  }
}
