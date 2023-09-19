import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Breadcrumb } from 'src/app/abstracts/common';
import { BaseResponse } from 'src/app/abstracts/http-client';
import {
  Account,
  UpdateUser,
  SignInResponse,
  User,
  UpdateUserResponse,
  Token,
  SystemAccessTokenRequest,
} from 'src/app/abstracts/single-sign-on';
import { TokenUser } from 'src/app/abstracts/single-sign-on';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { SecureLocalStorageService } from 'src/app/services/secure-local-storage/secure-local-storage.service';
import { Modal } from 'bootstrap';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonService } from 'src/app/services/common-service/common.service';
import { Modals, NavigatorStatuses, SelectedImage, SignIn, SignUp } from './navigator';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, DatePipe, AsyncPipe } from '@angular/common';
import { Buffer } from 'buffer';
import { TokenType } from 'src/app/enums/token-type';
import { AppEnvironmentService } from 'src/app/services/app-environment-service/app-environment.service';
import { ApiServiceTypes } from 'src/app/enums/api-service-types';
import { v4 as uuidv4 } from 'uuid';
import { SingleFileUploadResponse } from 'src/app/abstracts/file-storage-service';

@Component({
  selector: 'app-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.sass'],
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, FormsModule, DatePipe, AsyncPipe],
})
export class NavigatorComponent implements OnInit {
  @ViewChild('virtualAvator')
  public virtualAvator?: ElementRef;
  public statuses: NavigatorStatuses = {
    signInPWVisible: false,
    signUpPWVisible: false,
    signUpPWConfirmVisible: false,
    loaded: false,
    signUping: false,
    logining: false,
    logined: false,
    updatingUser: false,
  };
  private fileStorageServiceUri: string = '';
  public breadcrumbs: Breadcrumb[] = [];
  public datetime: Date = new Date();
  public user: User = {
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
  private selectedImage: SelectedImage = {
    dataurl: '',
    filename: '',
    size: 0
  };
  @Input() public signIn: SignIn = {
    account: '',
    password: '',
  };
  @Input() public signUp: SignUp = {
    account: '',
    password: '',
    password_confirmation: '',
    email: '',
    username: '',
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
    private commonService: CommonService,
    private appEnvironmentService: AppEnvironmentService
  ) {}

  async ngOnInit(): Promise<void> {
    this.router.events.subscribe(async (event) => {
      if (event instanceof NavigationEnd) {
        this.getBreadcrumb();
        await this.getFileStorageServiceUrl();
        this.getLoginStatus()
          .then(() => this.checkAuthenticateStatus());
      }
    });
  }

  /**
   * 取得檔案儲存服務網址
   */
  private async getFileStorageServiceUrl(): Promise<void> {
    this.fileStorageServiceUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.FileStorageService);
  }

  /**
   * 取得登入狀態
   */
  private getLoginStatus(): Promise<boolean> {
    return new Promise<boolean>((resolve, rejects) => {
      this.user = this.commonService.getUserData() || {};
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
  public async fireSignUp(): Promise<void> {
    if (
      this.signUp.account.length == 0 ||
      this.signUp.password.length == 0 ||
      this.signUp.password_confirmation.length == 0 ||
      this.signUp.email.length == 0 ||
      this.signUp.username.length == 0
    ) {
      this.signUpError = '請確認所有欄位是否皆已填妥';
      return;
    }

    this.statuses.signUping = true;

    const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.SingleSignOn);
    const url = `${baseUri}/api/v1/user/signup`;
    this.requestService
      .post<BaseResponse<SignInResponse>>(url, this.signUp)
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
          this.statuses.signUping = false;
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
            this.signUpError = errorMsg;
          }

          this.statuses.signUping = false;
        },
      });
  }

  /**
   * 登入
   */
  public async fireSignIn(): Promise<void> {
    this.statuses.logining = true;
    this.signInError = '';

    if (this.signIn.account.length == 0 || this.signIn.password.length == 0) {
      this.signInError = '請確認所有欄位是否皆已填妥';
      this.statuses.logining = false;
      return;
    }

    const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.SingleSignOn);
    const url = `${baseUri}/api/v1/user/signin`;
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
          this.statuses.logining = false;
        },
        error: (error: HttpErrorResponse) => {
          if (error.status >= 500) {
            this.signInError =
              '系統發生無法預期的錯誤，請聯絡網站管理員協助處理';
          } else if (error.status >= 400 && error.status < 500) {
            let errorMsg = (error.error as BaseResponse<null>).message;
            if (errorMsg == null) {
              errorMsg = '請再次確認輸入的資訊是否正確';
            }
            this.signInError = errorMsg;
          } else {
            this.signInError =
              '系統發生無法預期的錯誤，請聯絡網站管理員協助處理';
          }

          this.statuses.logining = false;
        }
      });
  }

  /**
   * 取得使用者帳號資料
   * @param userInToken 權杖中的使用者帳號資料
   */
  private async getUserData(userInToken: TokenUser): Promise<void> {
    const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.SingleSignOn);
    const uri = `${baseUri}/api/v1/user`;
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
  public async fireSignOut(): Promise<void> {
    this.statuses.loaded = false;
    const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.SingleSignOn);

    if (Object.keys(this.user).length > 0) {
      const accessToken = this.secureLocalStorageService.get('accessToken');
      if (accessToken !== null) {
        const url = `${baseUri}/api/v1/user/signout`;
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
      username: '',
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
   * 取得圖片完整網址
   * @param type 類型
   * @param filename 檔案名稱
   * @param folder 資料夾名稱，僅有檔案儲存服務會有
   * @returns 完整網址
   */
  public getImageUrl(): string {
    if (this.selectedImage.dataurl.length > 0) {
      return this.selectedImage.dataurl;
    }

    if (
      this.user.virtualAvator != null &&
      this.user.virtualAvator.length > 0 &&
      this.fileStorageServiceUri.length > 0
    ) {
      return `${this.fileStorageServiceUri}/api/v1/file/${this.user.virtualAvator}`;
    }

    return 'assets/images/users/avators/example-avator.jpg';
  }

  /**
   * 將選擇的圖片顯示到網頁上
   * @param event 選擇檔案事件
   */
  public readImageUrl(event: Event): void {
    if (event == null || event.target == null) {
      return;
    }

    const target = (event.target as HTMLInputElement)
    if (target.files && target.files[0]) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        this.selectedImage.dataurl = (fileReader.result as string);
        this.selectedImage.filename = file.name;
        this.selectedImage.size = file.size;
      }

      const file = target.files[0];

      fileReader.readAsDataURL(file);
    }
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
   * 上傳虛擬形象
   * @returns 虛擬形象圖檔路徑
   */
  private async uploadVirtualAvator(): Promise<string|null> {
    if (this.selectedImage.dataurl.length > 0) {
      const array = this.selectedImage.dataurl.split(',');
      const mimeMatch = array[0].match(/:(.*?);/);
      if (mimeMatch == null) {
        throw new Error('無法辨別圖檔的檔案類型');
      }
      const mime = mimeMatch[1];
      const byteString = atob(array[1]);
      let times = byteString.length;
      let uint8Array = new Uint8Array(times);

      while (times--) {
        uint8Array[times] = byteString.charCodeAt(times);
      }

      console.log(uint8Array);
      const virtualAvatorImage = new Blob([uint8Array], {type: mime});

      let formData = new FormData();
      formData.append('uploadId', uuidv4());
      formData.append('filename', this.selectedImage.filename);
      formData.append('file', virtualAvatorImage);

      const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.FileStorageService);
      const uri = `${baseUri}/api/v1/file/upload`;
      return new Promise<string>((resolve, reject) => {
        this.requestService.formDataPost<BaseResponse<SingleFileUploadResponse>>(uri, formData)
          .subscribe({
            next: response => {
              resolve(response.data.path);
            },
            error: (errors: HttpErrorResponse) => {
              this.requestService.requestFailedHandler(errors);
              reject(errors);
            }
          });
      });
    }

    return null;
  }

  /**
   * 更新使用者帳號資料
   */
  public async fireUpdateUser(): Promise<void> {
    if (!this.canFireUpdateUser()) {
      return;
    }

    this.statuses.updatingUser = true;

    try {
      const avatorPath = await this.uploadVirtualAvator();

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
        virtualAvator: avatorPath,
        password: password,
        passwordConfirmation: passwordConfirmation,
      };

      const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.SingleSignOn);
      const uri = `${baseUri}/api/v1/user/update`;
      this.requestService.patch<BaseResponse<UpdateUserResponse>>(uri, body)
        .subscribe({
          next: response => {
            const user = Object.assign(this.user, response.data);
            this.user = this.commonService.deepCloneObject(user);
            this.modifyUser = this.commonService.deepCloneObject(user);
            this.secureLocalStorageService.set("user", JSON.stringify(user));
            this.clearSelectedImage();
            alert('更新成功');
            this.statuses.updatingUser = false;
          },
          error: (errors: HttpErrorResponse) => {
            this.requestService.requestFailedHandler(errors);
            this.statuses.updatingUser = false;
          }
        });
    } catch (errors) {
      alert("上傳虛擬形象圖檔發生錯誤，請確認圖檔是否過大，或是重整頁面後再試一次!");
      this.statuses.updatingUser = false;
    }
  }

  /**
   * 清除選擇的圖檔
   */
  private clearSelectedImage(): void {
    this.selectedImage = {
      dataurl: '',
      filename: '',
      size: 0
    };

    if (this.virtualAvator != null) {
      this.virtualAvator.nativeElement.value = null;
    }
  }

  /**
   * 跳轉到後臺頁面
   */
  public navigateToBackStage(): void {
    this.appEnvironmentService.getConfig(ApiServiceTypes.SingleSignOn)
      .then(baseUri => {
        const uri = `${baseUri}/api/v1/system/token`;
        const body: SystemAccessTokenRequest = {
          system: "LSGamesFrontend - Backstage",
          accessToken: this.secureLocalStorageService.get('accessToken') ?? '',
          refreshToken: this.secureLocalStorageService.get('refreshToken') ?? ''
        };
        this.requestService.post<BaseResponse<Token>>(uri, body)
          .subscribe({
            next: async response => {
              const backStageUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.BackStage);
              const base64Uri = response.data.token
                .replace(/\+/g, '-')
                .replace(/\//g, '_');
              location.href = `${backStageUri}/?token=${base64Uri}`;
            },
            error: (errors: HttpErrorResponse) => {
              this.requestService.requestFailedHandler(errors);
            },
          });
      });
  }
}
