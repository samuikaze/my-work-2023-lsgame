import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { IAlbum, Lightbox } from 'ngx-lightbox';
import { lastValueFrom } from 'rxjs';
import { BaseResponse } from 'src/app/abstracts/http-client';
import { Account, RefreshTokenPayloads, SignInResponse, User } from 'src/app/abstracts/single-sign-on';
import { TokenUser } from 'src/app/abstracts/single-sign-on';
import { environment } from 'src/environments/environment';
import { RequestService } from '../request-service/request.service';
import { SecureLocalStorageService } from '../secure-local-storage/secure-local-storage.service';
import { Buffer } from 'buffer';

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
  public processDateTime(raw: string | Date, num: number): string {
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
   * 確認目前登入狀態 (離線驗證)
   * @returns 是否為登入狀態
   */
  public checkAuthenticateStateOffline(): boolean {
    const userJson = this.secureLocalStorageService.get('user') || "";
    const accessToken = this.secureLocalStorageService.get('accessToken') || "";
    if (userJson.length === 0 || accessToken.length === 0) {
      return false;
    }

    const user = JSON.parse(userJson) as User;

    const userAccessToken = JSON.parse(
      Buffer.from(
        Buffer.from(accessToken, 'base64')
          .toString('ascii')
          .split('.')[1]
          .replace(/-/g, '+')
          .replace(/_/g, '/'),
        'base64'
      ).toString('ascii')
    ) as TokenUser;

    if (user.jti !== userAccessToken.jti) {
      return false;
    }

    return true;
  }

  /**
   * 確認目前登入狀態
   * @returns 是否為登入狀態
   */
  public async checkAuthenticateState(): Promise<boolean> {
    const accessToken = this.secureLocalStorageService.get("accessToken") || "";
    const user = this.secureLocalStorageService.get("user") || "";
    if (accessToken.length === 0 || user.length === 0) {
      this.clearAuthenticateData();
      return false;
    }

    const userObj = JSON.parse(user) as TokenUser;
    const expireDate = new Date((userObj.exp ?? 0) * 1000);
    if (new Date() > expireDate) {
      try {
        return await this.reactiveAccessToken();
      } catch (error) {
        this.clearAuthenticateData();
        alert(error);
        return false;
      }
    }

    return true;
  }

  /**
   * 以重整權杖取得新的存取權杖
   * @returns 是否成功重新取得存取權杖
   */
  public async reactiveAccessToken(): Promise<boolean> {
    const refreshToken = this.secureLocalStorageService.get("refreshToken") || "";
    if (refreshToken.length === 0) {
      throw new Error("重整權杖不存在");
    }

    const payloadJson = Buffer.from(refreshToken, 'base64').toString('ascii').split('.')[1];
    const payloads = JSON.parse(payloadJson) as RefreshTokenPayloads;
    const expireDate = new Date((payloads.exp ?? 0) * 1000);
    if (new Date() > expireDate) {
      throw new Error("重整權杖已過期");
    }

    const uri = `${environment.ssoApiUri}/api/v1/user/token/refresh`;
    const header = { Authorization: `Bearer ${refreshToken}` };
    return new Promise<boolean>((resolve, reject) => {
      this.requestService.post<BaseResponse<SignInResponse>>(uri, undefined, header)
        .subscribe({
          next: response => {
            this.secureLocalStorageService.set("accessToken", response.data.accessToken.token);
            this.secureLocalStorageService.set("refreshToken", response.data.refreshToken.token);
            const base64UriUser = Buffer.from(response.data.accessToken.token, 'base64')
              .toString('ascii')
              .split('.')[1]
              .replace(/-/g, '+')
              .replace(/_/g, '/');
            const user = JSON.parse(Buffer.from(base64UriUser, 'base64').toString('ascii'));
            this.setUserData(user);
            resolve(true);
          },
          error: (errors: HttpErrorResponse) => {
            if (errors.status >= 500) {
              throw new Error("伺服器發生無法預期的錯誤，請重試一次");
            }

            if (errors.status >= 400 && errors.status < 500) {
              this.clearAuthenticateData();
              throw new Error("重新取得登入狀態失敗，請重新登入");
            }

            reject(false);
          }
        });
      });
  }

  /**
   * 取得使用者帳號資料
   * @param userInToken 權杖中的使用者帳號資料
   */
  private setUserData(userInToken: TokenUser): void {
    const uri = `${environment.ssoApiUri}/api/v1/user`;
    this.requestService.get<BaseResponse<Account>>(uri)
      .subscribe({
        next: response => {
          const user = Object.assign(userInToken, response.data) as User;
          this.secureLocalStorageService.set("user", JSON.stringify(user));
        },
        error: (errors: HttpErrorResponse) => {
          this.requestService.requestFailedHandler(errors);
        }
      });
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
  public async getUserData(): Promise<TokenUser | undefined> {
    await this.checkAuthenticateState();

    let user = this.secureLocalStorageService.get("user") || "";
    if (user.length === 0) {
      return undefined;
    }

    return JSON.parse(user);
  }

  /**
   * 複製物件
   * @param original 原始物件
   * @returns 複製的物件
   */
  public deepCloneObject(original: any): any {
    return JSON.parse(JSON.stringify(original));
  }
}
