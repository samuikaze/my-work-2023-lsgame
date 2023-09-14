import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Breadcrumb } from 'src/app/abstracts/common';
import { BaseResponse } from 'src/app/abstracts/http-client';
import {
  Account,
  UpdateUser,
  SignInResponse,
  User,
  UpdateUserResponse,
} from 'src/app/abstracts/single-sign-on';
import { TokenUser } from 'src/app/abstracts/single-sign-on';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { SecureLocalStorageService } from 'src/app/services/secure-local-storage/secure-local-storage.service';
import { environment } from 'src/environments/environment';
import { Modal } from 'bootstrap';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonService } from 'src/app/services/common-service/common.service';
import { Modals, NavigatorStatuses, SignIn, SignUp } from './navigator';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, DatePipe, AsyncPipe } from '@angular/common';
import { Buffer } from 'buffer';
import { TokenType } from 'src/app/enums/token-type';

@Component({
  selector: 'app-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.sass'],
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, FormsModule, DatePipe, AsyncPipe],
})
export class NavigatorComponent implements OnInit {
  public statuses: NavigatorStatuses = {
    signInPWVisible: false,
    signUpPWVisible: false,
    signUpPWConfirmVisible: false,
    loaded: false,
    logining: false,
    logined: false,
    updatingUser: false,
  };
  public breadcrumbs: Breadcrumb[] = [];
  public datetime: Date = new Date();
  public user: TokenUser = {
    userId: -1,
    account: '',
    roles: [],
    scope: [],
    sub: '',
    tokenType: TokenType.AccessToken,
    username: '',
  };
  // public loaded: boolean = true;
  public signInError: string = '';
  public signUpError: string = '';
  private modals: Modals = {};
  private clockId?: number = undefined;
  public adminPanelUri: string = '#';
  @Input() public signIn: SignIn = {
    account: '',
    password: '',
  };
  @Input() public signUp: SignUp = {
    account: '',
    password: '',
    password_confirmation: '',
    email: '',
    name: '',
  };
  @Input() public modifyUser: UpdateUser = {
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
  };
  constructor(
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private requestService: RequestService,
    private secureLocalStorageService: SecureLocalStorageService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.getBreadcrumb();
        this.getLoginStatus()
          .then(() => this.checkAuthenticateStatus())
          .then(() => (this.adminPanelUri = this.getAdminPanelUri()));
      }
    });
  }

  /**
   * 取得登入狀態
   */
  private getLoginStatus(): Promise<boolean> {
    return new Promise<boolean>(async (resolve, rejects) => {
      this.user = (await this.commonService.getUserData()) || {};
      if (Object.keys(this.user).length > 0) {
        this.statuses.logined = true;
      }
      this.modifyUser = this.commonService.deepCloneObject(this.user);
      resolve(true);
    });
  }

  /**
   * 取得目前麵包屑
   */
  public getBreadcrumb(): void {
    setTimeout(() => {
      this.breadcrumbs = this.breadcrumbService.getBreadcrumb();
    }, 50);
  }

  /**
   * 確認是否為最後一筆麵包屑
   * @param index 索引
   * @returns 是否為最後一筆麵包屑
   */
  public isLastBreadcrumb(index: number): boolean {
    return index == this.breadcrumbs.length - 1;
  }

  /**
   * 確認目前是否為登入狀態
   * @returns 目前是否為登入狀態
   */
  public isLoggedin(): boolean {
    return !this.statuses.logining && Object.keys(this.user).length > 0;
  }

  /**
   * 確認是否顯示登入按鈕
   * @returns 是否顯示登入按鈕
   */
  public isLoginBtnShow(): boolean {
    return !this.statuses.logined && !this.statuses.logining;
  }

  private toggleModalStatus(loggedIn: boolean): void {
    setTimeout(() => {
      if (loggedIn) {
        this.modals['signOutModal'] = new Modal('#signOutModal');
        this.modals['userSettings'] = new Modal('#userSettings');

        if (this.modals.hasOwnProperty('memberModal')) {
          delete this.modals['memberModal'];
        }

        this.currentDateTime();
      } else {
        this.modals['memberModal'] = new Modal('#memberModal');
        if (this.modals.hasOwnProperty('signOutModal')) {
          delete this.modals['signOutModal'];
        }

        if (this.modals.hasOwnProperty('userSettings')) {
          delete this.modals['userSettings'];
        }
        clearInterval(this.clockId);
      }
    }, 50);

    this.signInError = '';
    this.signUpError = '';
  }

  /**
   * 確認目前登入狀態
   */
  private checkAuthenticateStatus(): void {
    if (Object.keys(this.user).length > 0) {
      this.toggleModalStatus(true);
    } else {
      this.toggleModalStatus(false);
    }

    this.statuses.loaded = true;
  }

  /**
   * 註冊
   */
  public fireSignUp(): void {
    this.statuses.loaded = false;

    if (
      this.signUp.account.length == 0 ||
      this.signUp.password.length == 0 ||
      this.signUp.password_confirmation.length == 0 ||
      this.signUp.email.length == 0 ||
      this.signUp.name.length == 0
    ) {
      this.signUpError = '請確認所有欄位是否皆已填妥';
      this.statuses.loaded = true;
      return;
    }

    const url = `${environment.ssoApiUri}/api/v1/user/signup`;
    this.requestService
      .post<BaseResponse<SignInResponse>>(url, this.signUp)
      .subscribe({
        next: (response) => {
          const base64UriUser = Buffer.from(
            response.data.accessToken.token,
            'base64'
          )
            .toString('ascii')
            .split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');
          const user = Buffer.from(base64UriUser, 'base64').toString('ascii');
          this.secureLocalStorageService.set(
            'accessToken',
            response.data.accessToken.token
          );
          this.secureLocalStorageService.set(
            'refreshToken',
            response.data.refreshToken.token
          );
          this.secureLocalStorageService.set('user', user);
          this.user = JSON.parse(user);
          this.operationModal('memberModal', 'close');
          this.clearForm();
          this.toggleModalStatus(true);
          this.statuses.loaded = true;
        },
        error: (error: HttpErrorResponse) => {
          if (error.status >= 500) {
            this.signInError =
              '系統發生無法預期的錯誤，請聯絡網站管理員協助處理';
          } else {
            let errorMsg = (error.error as BaseResponse<null>).message;
            if (errorMsg === null) {
              errorMsg = '請再次確認輸入的資訊是否正確';
            }
            this.signUpError = errorMsg;
          }

          this.statuses.loaded = true;
        },
      });
  }

  /**
   * 登入
   */
  public fireSignIn(): void {
    this.statuses.logining = true;
    this.signInError = '';

    if (this.signIn.account.length == 0 || this.signIn.password.length == 0) {
      this.signInError = '請確認所有欄位是否皆已填妥';
      this.statuses.loaded = true;
      return;
    }

    const url = `${environment.ssoApiUri}/api/v1/user/signin`;
    this.requestService
      .post<BaseResponse<SignInResponse>>(url, this.signIn)
      .subscribe({
        next: (response) => {
          this.secureLocalStorageService.set(
            'accessToken',
            response.data.accessToken.token
          );
          this.secureLocalStorageService.set(
            'refreshToken',
            response.data.refreshToken.token
          );
          const base64UriUser = Buffer.from(
            response.data.accessToken.token,
            'base64'
          )
            .toString('ascii')
            .split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');
          const user = JSON.parse(
            Buffer.from(base64UriUser, 'base64').toString('ascii')
          );
          this.getUserData(user);
          this.operationModal('memberModal', 'close');
          this.clearForm();
          this.toggleModalStatus(true);
          this.statuses.logined = true;
        },
        error: (error: HttpErrorResponse) => {
          if (error.status >= 500) {
            this.signInError =
              '系統發生無法預期的錯誤，請聯絡網站管理員協助處理';
          } else {
            let errorMsg = (error.error as BaseResponse<null>).message;
            if (errorMsg === null) {
              errorMsg = '請再次確認輸入的資訊是否正確';
            }
            this.signInError = errorMsg;
          }
        },
        complete: () => {
          this.statuses.logining = false;
        },
      });
  }

  /**
   * 取得使用者帳號資料
   * @param userInToken 權杖中的使用者帳號資料
   */
  private getUserData(userInToken: TokenUser): void {
    const uri = `${environment.ssoApiUri}/api/v1/user`;
    this.requestService.get<BaseResponse<Account>>(uri).subscribe({
      next: (response) => {
        const user = Object.assign(userInToken, response.data) as User;
        this.user = user;
        this.modifyUser = user;
        this.secureLocalStorageService.set('user', JSON.stringify(user));
      },
      error: (errors: HttpErrorResponse) => {
        this.requestService.requestFailedHandler(errors);
      },
    });
  }

  /**
   * 登出
   */
  public fireSignOut(): void {
    this.statuses.loaded = false;

    if (Object.keys(this.user).length > 0) {
      const accessToken = this.secureLocalStorageService.get('accessToken');
      if (accessToken !== null) {
        const url = `${environment.ssoApiUri}/api/v1/user/signout`;
        const header = { Authorization: `Bearer ${accessToken}` };
        this.requestService
          .post<BaseResponse<null>>(url, undefined, undefined, header)
          .subscribe({
            next: () => {
              this.commonService.clearAuthenticateData();
              this.user = {};
              this.operationModal('signOutModal', 'close');
              this.toggleModalStatus(false);
              this.statuses.loaded = true;
              location.reload();
            },
          });
      }
    } else {
      this.commonService.clearAuthenticateData();
      this.user = {};
      this.operationModal('signOutModal', 'close');
      this.toggleModalStatus(false);
      this.statuses.loaded = true;
      location.reload();
    }
  }

  /**
   * 操作指定 Modal
   * @param modal 目標 Modal 名稱
   * @param action 操作
   */
  public operationModal(modal: string, action: 'open' | 'close'): void {
    if (this.modals[modal] !== undefined) {
      switch (action) {
        case 'open':
          this.modals[modal].show();
          break;
        case 'close':
          this.modals[modal].hide();
          break;
      }
    }
  }

  /**
   * 清除表單資料
   */
  private clearForm(): void {
    this.signIn = { account: '', password: '' };
    this.signUp = {
      account: '',
      password: '',
      password_confirmation: '',
      email: '',
      name: '',
    };
  }

  /**
   * 取得密碼欄位 HTML class 字串
   * @param action 表單種類
   * @returns HTML class 字串
   */
  public getPasswordInputType(action: string): string {
    let type = 'password';
    let condition = false;

    switch (action) {
      case 'sign-in':
        condition = this.statuses.signInPWVisible;
        break;
      case 'sign-up':
        condition = this.statuses.signUpPWVisible;
        break;
      case 'sign-up-confirm':
        condition = this.statuses.signUpPWConfirmVisible;
        break;
    }

    if (condition) {
      type = 'text';
    }

    return type;
  }

  /**
   * 取得密碼欄位眼睛的 HTML class 字串
   * @param type 表單種類
   * @returns HTML class 字串
   */
  public getEyeClass(type: string): string {
    let element_class = 'bi bi-eye-fill';
    let condition = false;

    switch (type) {
      case 'sign-in':
        condition = this.statuses.signInPWVisible;
        break;
      case 'sign-up':
        condition = this.statuses.signUpPWVisible;
        break;
      case 'sign-up-confirm':
        condition = this.statuses.signUpPWConfirmVisible;
        break;
    }

    if (condition) {
      element_class = 'bi bi-eye-slash-fill';
    }

    return element_class;
  }

  /**
   * 切換密碼是否可視
   * @param type 表單種類
   */
  public togglePWVisible(type: string): void {
    switch (type) {
      case 'sign-in':
        this.statuses.signInPWVisible = !this.statuses.signInPWVisible;
        break;
      case 'sign-up':
        this.statuses.signUpPWVisible = !this.statuses.signUpPWVisible;
        break;
      case 'sign-up-confirm':
        this.statuses.signUpPWConfirmVisible =
          !this.statuses.signUpPWConfirmVisible;
    }
  }

  /**
   * 取得現在時間
   */
  private currentDateTime(): void {
    this.clockId = window.setInterval(() => {
      this.datetime = new Date();
    }, 1000);
  }

  /**
   * 是否顯示管理選單
   * @returns 是否顯示管理選單
   */
  public showAdministratorMenu(): boolean {
    const roles = this.user.roles?.map((role) => role.id);

    return roles == null ? false : roles.includes(1);
  }

  /**
   * 跳轉到後台管理介面
   */
  public routeToAdminPanel(): void {
    alert('功能尚未開放');
  }

  /**
   * 取得權限文字
   * @returns 權限文字
   */
  public getRoles(): string | undefined {
    return this.user?.roles?.map((role) => role.name).join('、');
  }

  /**
   * 取得後台管理網址
   * @returns 後台管理網址
   */
  public getAdminPanelUri(): string {
    const accessToken = this.secureLocalStorageService.get('accessToken');

    if (accessToken != null) {
      const data = this.secureLocalStorageService.encrypt(accessToken);
      const token = Buffer.from(data)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

      return `${environment.backStage}/?token=${token}`;
    }

    return '';
  }

  /**
   * 取得圖片完整網址
   * @param type 類型
   * @param filename 檔案名稱
   * @param folder 資料夾名稱，僅有檔案儲存服務會有
   * @returns 完整網址
   */
  public getImageUrl(
    type: 'fileStorage' | 'dataurl',
    filename: string,
    folder?: string
  ): string {
    let url = '';
    switch (type) {
      case 'fileStorage':
        url += `${environment.fileStorageServiceUri}/`;
        if (
          folder !== undefined &&
          folder !== null &&
          typeof folder === 'string' &&
          folder.length > 0
        ) {
          url += `${folder}/`;
        }

        url += `${filename}`;
        break;
      case 'dataurl':
        url += filename;
        break;
    }

    return url;
  }

  /**
   * 檢查電子郵件是否已經過驗證
   * @returns 電子郵件是否已經過驗證
   */
  public isEmailVerified(): boolean {
    return this.modifyUser.emailVerifiedAt != null;
  }

  /**
   * 取得電子郵件驗證訊息文字
   * @returns 電子郵件驗證訊息文字
   */
  public getEmailVerifyMessage(): string {
    if (this.modifyUser.emailVerifiedAt == null) {
      return '電子郵件尚未認證';
    } else {
      const date = this.commonService.processDateTime(
        this.modifyUser.emailVerifiedAt,
        6
      );
      return `電子郵件已於 ${date} 完成驗證`;
    }
  }

  /**
   * 檢查是否可以更新使用者帳號資料
   * @returns 是否可以更新使用者帳號資料
   */
  public canFireUpdateUser(): boolean {
    const baseCondition =
      !this.statuses.updatingUser &&
      this.modifyUser.username != null &&
      this.modifyUser.username.length > 0 &&
      this.modifyUser.email != null &&
      this.modifyUser.email.length > 0;

    const passwordCondition =
      this.modifyUser.password == null ||
      (this.modifyUser.password != null &&
        this.modifyUser.password.length > 0 &&
        this.modifyUser.password_confirmation != null &&
        this.modifyUser.password_confirmation.length > 0 &&
        this.modifyUser.password === this.modifyUser.password_confirmation);

    return baseCondition && passwordCondition;
  }

  /**
   * 更新使用者帳號資料
   */
  public fireUpdateUser(): void {
    if (!this.canFireUpdateUser()) {
      return;
    }

    this.statuses.updatingUser = true;

    const password =
      this.modifyUser.password != null && this.modifyUser.password.length > 0
        ? this.modifyUser.password
        : null;
    const passwordConfirmation =
      this.modifyUser.password_confirmation != null &&
      this.modifyUser.password_confirmation.length > 0
        ? this.modifyUser.password_confirmation
        : null;
    const body = {
      username: this.modifyUser.username,
      email: this.modifyUser.email,
      password: password,
      passwordConfirmation: passwordConfirmation,
    };

    const uri = `${environment.ssoApiUri}/api/v1/user`;
    this.requestService.patch<BaseResponse<UpdateUserResponse>>(uri, body)
      .subscribe({
        next: response => {
          const user = Object.assign(this.user, response.data);
          this.user = this.commonService.deepCloneObject(user);
          this.modifyUser = this.commonService.deepCloneObject(user);
          this.secureLocalStorageService.set("user", JSON.stringify(user));
        },
        error: (errors: HttpErrorResponse) => {
          this.requestService.requestFailedHandler(errors);
        },
        complete: () => {
          this.statuses.updatingUser = false;
        }
      });
  }
}
