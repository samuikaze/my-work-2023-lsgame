import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { IAlbum, Lightbox } from 'ngx-lightbox';
import { lastValueFrom } from 'rxjs';
import { BaseResponse } from 'src/app/abstracts/http-client';
import { SignInResponse } from 'src/app/abstracts/single-sign-on';
import { User } from 'src/app/abstracts/single-sign-on';
import { environment } from 'src/environments/environment';
import { RequestService } from '../request-service/request.service';
import { SecureLocalStorageService } from '../secure-local-storage/secure-local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private siteTitle = "洛嬉遊戲 L.S. Games";
  private tokenVerified?: Date = undefined;
  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    private lightbox: Lightbox,
    private secureLocalStorageService: SecureLocalStorageService,
    private requestService: RequestService
  ) { }

  /**
   * 設定頁面標題
   * @param newTitle 新標題
   */
  public setTitle(newTitle: string): void {
    if (newTitle.length > 0) {
      this.titleService.setTitle(`${newTitle} - ${this.siteTitle}`);
    } else {
      this.titleService.setTitle(this.siteTitle);
    }
  }

  /**
   * 處理日期時間
   *
   * @param raw 原始值
   * @param num 要返回的個數
   * @returns 處理後的值
   */
  public processDateTime(raw: string, num: number): string {
    if (num > 6) {
      num = 6;
    } else if (num < 0) {
      num = 0;
    }

    const rawDate = new Date(raw);
    const year = rawDate.getFullYear();
    const month = rawDate.getMonth() + 1;
    const date = rawDate.getDate();
    const hour = rawDate.getHours();
    const minute = rawDate.getMinutes();
    const seconds = rawDate.getSeconds();

    const dateArray = [year, month, date, hour, minute, seconds];
    const separator = ["-", "-", " ", ":", ":"];
    let result = "";
    for (let i = 0; i < num; i++) {
      if (i != 0) {
        result += `${separator[i - 1]}`;
      }

      result += (dateArray[i].toString().length < 2) ? `0${dateArray[i]}` : `${dateArray[i]}`;
    }

    return result;
  }

  /**
   * 處理 IAlbum 物件
   * @param raw 原始 img 標籤
   * @param thumb 縮圖網址
   * @param caption 替代文字
   * @param downloadUrl 下載網址
   * @returns IAlbum 物件
   */
  public generateIAlbumObject(
    raw: HTMLImageElement,
    thumb?: string,
    caption?: string,
    downloadUrl?: string
  ): IAlbum {
    if (thumb == undefined) {
      thumb = raw.src;
    }

    if (downloadUrl == undefined) {
      downloadUrl = raw.src;
    }

    const I_ALBUM: IAlbum = {
      src: raw.src,
      caption: caption,
      thumb: thumb,
      downloadUrl: downloadUrl,
    };

    return I_ALBUM;
  }

  /**
   * 打開燈箱
   * @param iAlbum 多個 IAlbum 物件
   * @param index 打開第幾張圖
   */
  public openLightbox(iAlbum: Array<IAlbum>, index: number): void {
    this.lightbox.open(iAlbum, index);
  }

  /**
   * 確認目前登入狀態
   * @param verifyToken 是否呼叫 SSO API 驗證權杖
   * @returns 是否為登入狀態
   */
  public async checkAuthenticateState(): Promise<boolean> {
    const now = new Date();
    const accessToken = this.secureLocalStorageService.get("accessToken");
    const authVerified = this.secureLocalStorageService.get("authVerified");
    // 首先權杖當然要先存在
    if (accessToken === null || accessToken.length === 0) {
      this.clearAuthenticateData();
      return false;
    }

    // 再來檢查上次驗證的時間
    if (
      authVerified !== null &&
      Math.abs(new Date(authVerified).getTime() - now.getTime()) <= environment.reverifyToken
    ) {
      this.tokenVerified = new Date(authVerified);
      return true;
    }

    // 如果權杖存在且經過驗證的時間還不是很久，直接返回已登入狀態
    if (
      accessToken.length > 0 &&
      this.tokenVerified !== undefined
    ) {
      return true;
    }

    // 權杖上次檢查時間若為空或已經超時就去檢查權杖有效性
    if (
      this.tokenVerified === undefined ||
      Math.abs(this.tokenVerified.getTime() - now.getTime()) > environment.reverifyToken
    ) {
      const url = `${environment.ssoApiUri}/api/v1/user`;
      const header = { Authorization: `Bearer ${accessToken}` };
      await lastValueFrom(
          this.requestService.get<BaseResponse<User>>(url, undefined, header)
        )
        .then(() => {
          this.secureLocalStorageService.set("authVerified", now.toISOString());
          this.tokenVerified = now;
        })
        .catch(async () => await this.reactiveAccessToken())
        .finally(() => {
          if (this.tokenVerified === undefined) {
            this.clearAuthenticateData();
          }
        });

      return this.tokenVerified !== undefined;
    }

    return false;
  }

  /**
   * 以重整權杖取得新的存取權杖
   * @returns 是否成功重新取得存取權杖
   */
  public async reactiveAccessToken(): Promise<boolean> {
    const refreshToken = this.secureLocalStorageService.get("refreshToken");
    if (refreshToken === null) {
      return false;
    }

    const url = `${environment.ssoApiUri}/api/v1/user/token/refresh`;
    const header = { Authorization: `Bearer ${refreshToken}` };
    await this.requestService.post<BaseResponse<SignInResponse>>(url, undefined, header)
      .subscribe({
        next: response => {
          const now = new Date();
          this.secureLocalStorageService.set("accessToken", response.data.accessToken.token);
          this.secureLocalStorageService.set("refreshToken", response.data.refreshToken.token);
          this.secureLocalStorageService.set("user", JSON.stringify(response.data.user));
          this.tokenVerified = now;
        },
        error: (errors: HttpErrorResponse) => {
          if (errors.status >= 500) {
            alert("伺服器發生無法預期的錯誤，請重試一次");
          }

          if (errors.status >= 400 && errors.status < 500) {
            this.clearAuthenticateData();
          }
        }
      });

    return this.tokenVerified === undefined;
  }

  /**
   * 清除登入相關的資料 (等同於登出)
   */
  public clearAuthenticateData() {
    this.secureLocalStorageService.remove("accessToken");
    this.secureLocalStorageService.remove("refreshToken");
    this.secureLocalStorageService.remove("authVerified");
    this.secureLocalStorageService.remove("user");
    this.tokenVerified = undefined;
  }

  /**
   * 登入相關資料
   * @returns 登入帳號相關資料
   */
  public getUserData(): User | undefined {
    let user = this.secureLocalStorageService.get("user");
    if (user === null) {
      return undefined;
    }

    return JSON.parse(user);
  }
}
