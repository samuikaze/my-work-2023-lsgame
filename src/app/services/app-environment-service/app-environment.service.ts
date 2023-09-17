import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { RequestService } from '../request-service/request.service';

@Injectable({
  providedIn: 'root',
})
export class AppEnvironmentService {
  private configFromJson?: any = undefined;
  constructor(private requestService: RequestService) {}

  /**
   * 從 assets/configs.json 取得設定值
   */
  public retrievingConfigsFromJson(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.requestService.get<any>('assets/configs.json').subscribe({
        next: (response) => {
          this.configFromJson = response;
          resolve(true);
        },
        error: (errors: HttpErrorResponse) => {
          this.configFromJson = {};

          if (errors.status !== 404) {
            console.error(errors);

            reject(errors.message);

            return;
          }

          resolve(true);
        },
      });
    });
  }

  /**
   * 取得設定值
   *
   * 若 configs.json 與 environment.ts 皆存在相同值，將以 configs.json 為主
   *
   * @param key 設定值鍵名
   * @returns 設定值
   */
  public async getConfig(key: string): Promise<any> {
    if (this.configFromJson === undefined) {
      await new Promise<void>(resolve => setTimeout(resolve, 100));
      return this.getConfig(key);
    }

    if (Object.keys(this.configFromJson).includes(key)) {
      return this.configFromJson[key];
    }

    if (Object.keys(environment).includes(key)) {
      return environment[key as keyof typeof environment];
    }

    return undefined;
  }
}
