import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseParams, CustomerHeaders, RequestBody } from 'src/app/abstracts/http-client';
import { SecureLocalStorageService } from '../secure-local-storage/secure-local-storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  private headers: HttpHeaders = new HttpHeaders();
  constructor(
    private http: HttpClient,
    private router: Router,
    private secureLocalStorageService: SecureLocalStorageService
  ) { }

  /**
   * URL 前處理
   *
   * @param originalUri 原始傳入的網址
   * @returns 經處理後的網址
   */
  private preprocessUri(originalUri: string): string {
    if (
      originalUri.indexOf('https://') > -1 ||
      originalUri.indexOf('http://') > -1
    ) {
      return originalUri;
    }

    const protocol = `${location.protocol}//`
    const hostname = location.host;
    const currentPath = location.pathname.replace(this.router.url, '');
    const path = (currentPath.slice(-1) === '/') ? currentPath : `${currentPath}/`;
    const uri = (originalUri.indexOf('/') === 0) ? originalUri.substring(1) : originalUri;

    return `${protocol}${hostname}${path}${uri}`;
  }

  /**
   * 取得標頭
   * @param header 自訂標頭
   * @return 組合完的標頭
   */
  private setHeaders(header?: CustomerHeaders): void {
    this.headers = new HttpHeaders({
      Accept: "application/json"
    });

    if (this.secureLocalStorageService.has("accessToken")) {
      const accessToken = this.secureLocalStorageService.get("accessToken");
      this.headers = this.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    if (header !== undefined) {
      Object.entries(header).forEach(([key, value]) => {
        this.headers = this.headers.set(key, value);
      });
    }
  }

  /**
   * 處理查詢字串資料
   * @param params 新的查詢字串
   * @returns 查詢字串或空值
   */
  private setParams(params?: BaseParams): HttpParams | undefined {
    if (params == undefined) {
      return undefined;
    }

    let httpParams = new HttpParams();
    Object
      .entries(params)
      .forEach(([key, value]) => {
        httpParams = httpParams.set(key, value);
      });

    return httpParams;
  }

  /**
   * 處理請求失敗
   * @param error 請求失敗資料
   */
  public requestFailedHandler(error: HttpErrorResponse): void {
    console.error(error);

    if (error.status === 0) {
      // 客戶端網路錯誤
      console.error(`請求過程中發生錯誤: ${error.message}`);
    }

    const errorMessage = (error.error.message == null) ? error.message : error.error.message;

    if (error.status >= 400 && error.status < 500) {
      alert(`給定的資料有誤，訊息為: ${errorMessage}`)
    }

    if (error.status >= 500) {
      alert('系統內部發生錯誤，請聯絡管理員處理');
    }
  }

  /**
   * 發起 GET 請求
   * @param url 請求網址
   * @param param 新的查詢字串
   * @param header 請求標頭
   * @returns RxJS 可觀察物件
   */
  public get<T>(url: string, param?: BaseParams, header?: CustomerHeaders): Observable<T> {
    this.setHeaders(header);
    const PARAMS = this.setParams(param);
    url = this.preprocessUri(url);

    return this.http.get<T>(url, {
        headers: this.headers,
        params: PARAMS,
      });
  }

  /**
   * 發起 POST 請求
   * @param url 請求網址
   * @param body 請求酬載
   * @param param 新的查詢字串
   * @param header 自訂標頭
   * @returns RxJS 可觀察物件
   */
  public post<T>(url: string, body?: RequestBody, param?: BaseParams, header?: CustomerHeaders): Observable<T> {
    this.setHeaders(header);
    const PARAMS = this.setParams(param);
    url = this.preprocessUri(url);

    return this.http.post<T>(url, body, {
        headers: this.headers,
        params: PARAMS,
      });
  }

  /**
   * 發起 PUT 請求
   * @param url 請求網址
   * @param body 請求酬載
   * @param param 新的查詢字串
   * @param header 自訂標頭
   * @returns RxJS 可觀察物件
   */
   public put<T>(url: string, body?: RequestBody, param?: BaseParams, header?: CustomerHeaders): Observable<T> {
    this.setHeaders(header);
    const PARAMS = this.setParams(param);
    url = this.preprocessUri(url);

    return this.http.put<T>(url, body, {
        headers: this.headers,
        params: PARAMS,
      });
  }

  /**
   * 發起 PATCH 請求
   * @param url 請求網址
   * @param body 請求酬載
   * @param param 新的查詢字串
   * @param header 自訂標頭
   * @returns RxJS 可觀察物件
   */
  public patch<T>(url: string, body?: RequestBody, param?: BaseParams, header?: CustomerHeaders): Observable<T> {
    this.setHeaders(header);
    const PARAMS = this.setParams(param);
    url = this.preprocessUri(url);

    return this.http.patch<T>(url, body, {
        headers: this.headers,
        params: PARAMS,
      });
  }

  /**
   * 發起 DELETE 請求
   * @param url 請求網址
   * @param param 新的查詢字串
   * @param header 自訂標頭
   * @returns RxJS 可觀察物件
   */
   public delete<T>(url: string, param?: BaseParams, header?: CustomerHeaders): Observable<T> {
    this.setHeaders(header);
    const PARAMS = this.setParams(param);
    url = this.preprocessUri(url);

    return this.http.delete<T>(url, {
        headers: this.headers,
        params: PARAMS,
      });
  }

  /**
   * 以表單發起 POST 請求
   * @param url 請求網址
   * @param formData 表單資料
   * @param param 新的查詢字串
   * @param header 自訂標頭
   * @returns RxJS 可觀察物件
   */
  public formDataPost<T>(url: string, formData: FormData, param?: BaseParams, header?: CustomerHeaders): Observable<T> {
    this.setHeaders(header);
    const params = this.setParams(param);

    return this.http.post<T>(url, formData, {
      headers: this.headers,
      params: params,
    });
  }
}
