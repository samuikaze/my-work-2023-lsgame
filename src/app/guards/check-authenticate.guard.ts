import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonService } from '../services/common-service/common.service';

/* @Injectable({
  providedIn: 'root'
})
export class CheckAuthenticateGuard implements CanActivate {

  constructor(private commonService: CommonService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.commonService.checkAuthenticateState();

    return true;
  }

} */

/**
 * 驗證登入權杖是否有效 (線上驗證，過期會重取權杖)
 * @param route
 * @param state
 * @returns 是否登入
 */
export const checkAuthenticateGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
    const commonService = inject(CommonService);

    commonService.checkAuthenticateState();

    return true;
}
