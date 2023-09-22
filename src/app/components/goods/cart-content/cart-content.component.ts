import { Component, Inject, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/abstracts/common';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CartService } from 'src/app/services/cart-service/cart.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { GoodsListComponent } from '../goods-list/goods-list.component';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { Good } from '../good';
import { Cart } from 'src/app/services/cart-service/cart-service';
import { AppEnvironmentService } from 'src/app/services/app-environment-service/app-environment.service';
import { ApiServiceTypes } from 'src/app/enums/api-service-types';

@Component({
    selector: 'app-cart-content',
    templateUrl: './cart-content.component.html',
    styleUrls: ['./cart-content.component.sass'],
    providers: [GoodsListComponent],
    standalone: true,
    imports: [NgIf, NgFor, RouterLink, FormsModule]
})
export class CartContentComponent implements OnInit {

  public fssUrl?: string = '';
  public goods: Array<Cart> = [];
  public loaded: boolean = false;
  public breadcrumb: Breadcrumb = { title: "購物車", uri: "/goods/cart" };
  constructor(
    private commonService: CommonService,
    private requestService: RequestService,
    private cartService: CartService,
    private breadcrumbService: BreadcrumbService,
    private appEnvironmentService: AppEnvironmentService,
    @Inject(GoodsListComponent) private goodListComponent: GoodsListComponent
  ) { }

  async ngOnInit(): Promise<void> {
    this.fssUrl = await this.appEnvironmentService.getConfig(ApiServiceTypes.FileStorageService);
    this.getCartGoodDetails();
    this.preprocessBreadcrumb();
  }

  /**
   * 處理麵包屑
   */
  private preprocessBreadcrumb() {
    this.breadcrumbService.setBreadcrumb();
    this.breadcrumbService.addBreadcrumb(this.goodListComponent.breadcrumb);
    this.breadcrumbService.addBreadcrumb(this.breadcrumb);
  }

  /**
   * 變更購物車中指定商品的數量
   * @param id 商品 ID
   */
  public changeQuantity(id: number): void {
    const target = this.goods.filter(good => good.id == id);
    if (target.length > 0) {
      this.cartService.updateCart(target[0]);
    }

    this.getCartGoodDetails();
  }

  /**
   * 從購物車中移除指定商品
   * @param id 商品 ID
   */
  public removeGoodFromCart(id: number): void {
    this.cartService.removeFromCart(id);
    this.getCartGoodDetails();
  }

  /**
   * 取得購物車詳細資訊
   */
  public async getCartGoodDetails(): Promise<void> {
    const cartGoods = this.cartService.getCart();
    const body = { goods: cartGoods.map(good => good.id) };

    const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.Shop);
    const uri = `${baseUri}/shop/goods`;
    this.requestService.post<Array<Good>>(uri, body)
      .subscribe(response => {
        this.goods = this.processGoodsFormat(response, cartGoods);
        this.loaded = true;
      });
  }

  /**
   * 取得總計
   * @returns 總計
   */
  public getTotalPrices(): number {
    return this.cartService.getTotalPrices();
  }

  /**
   * 重置購物車
   */
  public resetCart(): void {
    this.cartService.resetCart();

    this.getCartGoodDetails();
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
   * 結帳與重置購物車按鈕是否顯示為停用
   * @returns 結帳與重置購物車按鈕是否顯示為停用
   */
  public checkoutBtnDisabled() {
    return this.goods.length == 0;
  }

  /**
   * 組合完整圖片網址
   * @param image 圖檔名稱
   * @returns 完整圖片網址
   */
  public composeImagePath(image?: string): string {
    if (image !== undefined) {
      return `${this.fssUrl}/api/v1/file/${image}`;
    }

    return '';
  }

  /**
   * 組合完整商品網址
   * @param id 商品 ID
   * @returns 完整商品網址
   */
  public composeGoodDetailUrl(id: number): string {
    return `/shop/goods/${id}`;
  }

  /**
   * 處理購物車中商品的格式
   * @param goods 商品
   * @param cart_goods 購物車中的商品
   * @returns 經處理後的購物車商品
   */
  private processGoodsFormat(goods: Good[], cart_goods: Cart[]): Cart[] {
    let carts: Cart[] = [];

    goods.forEach(good => {
      const GOOD_CART = cart_goods.filter(cgood => cgood.id == good.goodId);

      if (GOOD_CART.length > 0) {
        let cart: Cart = {
          id: good.goodId,
          name: good.name,
          image: good.previewImagee,
          description: good.description,
          prices: GOOD_CART[0].prices,
          quantity: GOOD_CART[0].quantity,
        };

        carts.push(cart);
      }
    })

    return carts;
  }

  /**
   * 檢查登入狀態
   * @returns 是否登入
   */
  public checkAuthenticateState() {
    return this.commonService.checkAuthenticateStateOffline();
  }
}
