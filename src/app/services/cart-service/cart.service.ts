import { Injectable } from '@angular/core';
import { BaseResponse } from 'src/app/abstracts/http-client';
import { environment } from 'src/environments/environment';
import { RequestService } from '../request-service/request.service';
import { BackendCart, Cart } from './cart-service';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cart: Cart[] = [];
  private local_storage_cart_name: string = "lsgames_cart";
  constructor(private requestService: RequestService) {
    this.getCart();
  }

  /**
   * 加入商品至購物車
   * @param newGood 商品
   */
  public addToCart(newGood: Cart) {
    let good: Cart;

    const FIND_EXIST = this.cart.filter(item => item.id == newGood.id);
    if (FIND_EXIST.length > 0) {
      const INDEX = this.cart.findIndex(item => item == FIND_EXIST[0]);
      this.cart[INDEX].quantity += newGood.quantity;
    } else {
      good = {
        id: newGood.id,
        name: newGood.name,
        prices: newGood.prices,
        quantity: newGood.quantity,
      };

      this.cart.push(good);
    }

    this.writeToLocalStorage();
  }

  /**
   * 更新購物車內容
   * @param existsGood 既存商品
   */
  public updateCart(existsGood: Cart): void {
    const FIND_EXIST = this.cart.filter(item => item.id == existsGood.id);
    if (FIND_EXIST.length > 0) {
      const INDEX = this.cart.findIndex(item => item == FIND_EXIST[0]);
      if (existsGood.quantity <= 0) {
        if (confirm("確定要移除此項商品嗎？")) {
          this.removeFromCart(existsGood.id);
        } else {
          this.cart[INDEX].quantity = 1;
        }
      } else {
        this.cart[INDEX] = existsGood;
      }

      this.writeToLocalStorage();
    }
  }

  /**
   * 從購物車移除商品
   * @param id 商品 ID
   */
  public removeFromCart(id: number) {
    if (confirm("確定要移除此項商品嗎？")) {
      const target = this.cart.filter(good => good.id == id);

      if (target.length > 0) {
        const index = this.cart.indexOf(target[0]);
        this.cart.splice(index, 1);

        this.writeToLocalStorage();
      }
    }
  }

  /**
   * 重置購物車
   */
  public resetCart() {
    if (confirm("確定要重置您的購物車嗎？此操作不可復原")) {
      this.cart = [];

      this.removeCartFromLocalStorage();
    }
  }

  /**
   * 取得購物車內容
   * @returns 購物車所有內容
   */
  public getCart() {
    const CART = localStorage.getItem(this.local_storage_cart_name);
    if (CART != null) {
      this.cart = JSON.parse(CART);
    } else {
      this.writeToLocalStorage();
    }

    return this.cart;
  }


  /**
   * 將購物車儲存至瀏覽器的 LS
   */
  private writeToLocalStorage() {
    const CART = JSON.stringify(this.cart);
    localStorage.setItem(
      this.local_storage_cart_name,
      CART
    );
  }

  /**
   * 移除所有購物車
   */
  private removeCartFromLocalStorage() {
    localStorage.setItem(
      this.local_storage_cart_name,
      "[]"
    );
  }

  /**
   * 取得目前購物車中商品加總的總額
   * @returns 購物車目前加總總額
   */
  public getTotalPrices() {
    const CART_ITEMS = this.getCart();
    if (CART_ITEMS.length == 0) {
      return 0;
    }

    const PRICES = CART_ITEMS
      .map(item => item.prices * item.quantity)
      .reduce((a, b) => a + b);

    return PRICES;
  }

  /**
   * 儲存購物車
   */
   public saveCart(): void {
    const url = `${environment.backendUri}/goods/cart/save`;
    const data: Array<BackendCart> = this.cart.map(good => {
      return {
        id: good.id,
        quantity: good.quantity,
        price: good.prices
      };
    });

    this.requestService.post<BaseResponse<[]>>(url, { cart: data })
      .subscribe();
  }

  /**
   * 移除儲存的購物車
   */
  public removeSavedCart(): void {
    const url = `${environment.backendUri}/goods/cart/${1}`;
    this.requestService.post<BaseResponse<null>>(url, { _method: "delete" })
      .subscribe();
  }
}
