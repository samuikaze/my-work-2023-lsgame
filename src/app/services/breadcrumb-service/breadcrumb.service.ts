import { Injectable } from '@angular/core';
import { Breadcrumb } from 'src/app/abstracts/common';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {

  private breadcrumbs: Breadcrumb[] = [];
  constructor() { }

  /**
   * 重置麵包屑
   */
  private clearBreadcrumb(): void {
    this.breadcrumbs = [
      {
        title: "洛嬉遊戲",
        uri: "/"
      }
    ];
  }

  /**
   * 重置麵包屑並將新的麵包屑推進陣列中
   * @param breadcrumb 新麵包屑
   */
  setBreadcrumb(breadcrumb?: Breadcrumb): void {
    this.clearBreadcrumb();

    if (breadcrumb !== undefined) {
      this.breadcrumbs.push(breadcrumb);
    }
  }

  /**
   * 將新的麵包屑推進陣列中
   * @param breadcrumb 新的麵包屑
   */
  addBreadcrumb(breadcrumb: Breadcrumb): void {
    this.breadcrumbs.push(breadcrumb);
  }

  /**
   * 移除最後一筆麵包屑
   */
  removeBreadcrumb(): void {
    this.breadcrumbs.pop();
  }

  /**
   * 取得目前麵包屑
   * @returns 所有麵包屑
   */
  public getBreadcrumb(): Breadcrumb[] {
    return this.breadcrumbs;
  }
}
