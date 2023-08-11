import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from 'src/app/abstracts/common';
import { Cart, Good } from 'src/app/abstracts/goods';
import { BaseResponse } from 'src/app/abstracts/http-client';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CartService } from 'src/app/services/cart-service/cart.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { environment } from 'src/environments/environment';
import { GoodsListComponent } from '../goods-list/goods-list.component';

@Component({
  selector: 'app-goods-content',
  templateUrl: './goods-content.component.html',
  styleUrls: ['./goods-content.component.sass'],
  providers: [ GoodsListComponent ]
})
export class GoodsContentComponent implements OnInit {

  private apiPath = "";
  public goodId: number = Number(this.route.snapshot.paramMap.get("id"));
  public good?: Good;
  public cartPrice: number = 0;
  public cartQuantity: number = 0;
  public breadcrumb: Breadcrumb = { title: "周邊商品詳細資料", uri: `/goods/${this.goodId}` };
  public loaded = false;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private requestService: RequestService,
    private cartService: CartService,
    private breadcrumbService: BreadcrumbService,
    @Inject(GoodsListComponent) private goodListComponent: GoodsListComponent
  ) { }

  ngOnInit(): void {
    this.composeApiPath();
    this.preprocessBreadcrumb();
    this.getCart();
    this.getGood();
  }

  /**
   * 處理麵包屑
   */
  public preprocessBreadcrumb() {
    this.breadcrumbService.setBreadcrumb(this.goodListComponent.breadcrumb);
    this.breadcrumbService.addBreadcrumb(this.breadcrumb);
  }

  /**
   * 取得購物車資料
   */
   public getCart() {
    this.cartQuantity = this.cartService.getCart().length;
    this.cartPrice = this.cartService.getTotalPrices();
  }

  public addableToCart() {
    return this.good === undefined;
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
   * 打開燈箱
   * @param event 事件
   */
  public openLightbox(event: Event): void {
    const imgElement = <HTMLImageElement> (event.target);
    const iAlbum = this.commonService.generateIAlbumObject(imgElement);
    this.commonService.openLightbox([iAlbum], 0);
  }

  /**
   * 處理 API 路徑
   */
   private composeApiPath(): void {
    if (this.goodId === null) {
      throw new Error("消息 ID 不符合系統規定");
    }

    this.apiPath = `goods/${this.goodId}`;
  }

  /**
   * 組合圖片路徑
   * @param filename 檔名
   * @returns 圖片路徑
   */
  public composeGoodImagePath(filename: string): string {
    return `/assets/images/goods/${filename}`;
  }

  /**
   * 取得商品資料
   */
  public getGood() {
    this.loaded = false;
    this.good = undefined;

    const URL = `${environment.backendUri}/${this.apiPath}`;
    this.requestService.get<BaseResponse<Good>>(URL)
      .subscribe({
        next: data => {
          this.good = data.data
          this.loaded = true;
        },
        error: (error: HttpErrorResponse) => {
          this.good = undefined;
          this.loaded = true;
        }
      });
  }
}
