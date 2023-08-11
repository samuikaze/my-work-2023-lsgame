import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SecureLocalStorageService {

  constructor() { }

  /**
   * 寫入加密資料到本地儲存空間中
   * @param key 鍵名
   * @param value 值
   */
  public set(key: string, value: string): void {
    value = CryptoJS.AES.encrypt(value, environment.secretKey).toString();

    localStorage.setItem(key, value);
  }

  /**
   * 解密並取得本地儲存空間中的資料
   * @param key 鍵名
   * @returns 值
   */
  public get(key: string): string|null {
    let value = localStorage.getItem(key);

    if (value != null) {
      let encoder = CryptoJS.enc.Utf8;
      value = CryptoJS.AES.decrypt(value, environment.secretKey).toString(encoder);
    }

    return value;
  }

  /**
   * 移除本地儲存空間中指定的資料
   * @param key 鍵名
   */
  public remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * 確認鍵名是否存在
   * @param key 鍵名
   * @returns 是否存在
   */
  public has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}
