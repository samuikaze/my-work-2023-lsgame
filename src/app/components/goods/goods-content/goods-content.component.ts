import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Breadcrumb } from 'src/app/abstracts/common';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CartService } from 'src/app/services/cart-service/cart.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { GoodsListComponent } from '../goods-list/goods-list.component';
import { NgIf } from '@angular/common';
import { Good } from '../good';
import { Cart } from 'src/app/services/cart-service/cart-service';
import { AppEnvironmentService } from 'src/app/services/app-environment-service/app-environment.service';
import { ApiServiceTypes } from 'src/app/enums/api-service-types';

@Component({
    selector: 'app-goods-content',
    templateUrl: './goods-content.component.html',
    styleUrls: ['./goods-content.component.sass'],
    providers: [GoodsListComponent],
    standalone: true,
    imports: [NgIf, RouterLink]
})
export class GoodsContentComponent implements OnInit {

  public fssUrl?: string = '';
  private apiPath = "";
  public goodId?: number;
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
    private appEnvironmentService: AppEnvironmentService,
    @Inject(GoodsListComponent) private goodListComponent: GoodsListComponent
  ) { }

  async ngOnInit(): Promise<void> {
    this.getGoodId();
    await this.composeApiPath();
    this.preprocessBreadcrumb();
    this.getCart();
    this.getGood();
  }

  /**
   * 取得商品 PK
   */
  private getGoodId(): void {
    this.goodId = Number(this.route.snapshot.paramMap.get("id"));
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
      id: newGood.goodId,
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
   private async composeApiPath(): Promise<void> {
    if (this.goodId === null) {
      throw new Error("消息 ID 不符合系統規定");
    }

    this.apiPath = `shop/goods/${this.goodId}`;
    this.fssUrl = await this.appEnvironmentService.getConfig(ApiServiceTypes.FileStorageService);
  }

  /**
   * 組合圖片路徑
   * @param filename 檔名
   * @returns 圖片路徑
   */
  public composeGoodImagePath(filename: string): string {
    return `${this.fssUrl}/api/v1/file/${filename}`;
  }

  /**
   * 取得商品資料
   */
  public async getGood() {
    this.loaded = false;
    this.good = undefined;

    const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.Shop);
    const uri = `${baseUri}/${this.apiPath}`;
    this.requestService.get<Good>(uri)
      .subscribe({
        next: response => {
          this.good = response
          this.loaded = true;
        },
        error: (error: HttpErrorResponse) => {
          this.good = undefined;
          this.loaded = true;
        }
      });
  }
}
