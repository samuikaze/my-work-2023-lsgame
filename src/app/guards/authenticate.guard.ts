import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonService } from '../services/common-service/common.service';

/* @Injectable({
  providedIn: 'root'
})
export class AuthenticateGuard implements CanActivate {

  constructor (
    private commonService: CommonService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const authed = this.commonService.checkAuthenticateState();

    if (! authed) {
      alert("請先登入");
    }

    return authed;
  }

} */

export const authenticateGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  return new Promise<boolean>(async (resolve, reject) => {
    const commonService = inject(CommonService);
    const router = inject(Router);
    const authed = await commonService.checkAuthenticateState();

    if (! authed) {
      alert("請先登入");
      router.navigate(['/']);
    }

    resolve(authed);
  });
}
