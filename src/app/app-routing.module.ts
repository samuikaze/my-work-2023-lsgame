import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CheckAuthenticateGuard } from './guards/check-authenticate.guard';

const routes: Routes = [
  {
    path: "",
    canActivate: [CheckAuthenticateGuard],
    children: [
      {
        path: "",
        component: HomeComponent
      },
      {
        path: "news",
        loadChildren: () => import("./components/news/news-routing.module").then(m => m.NewsRoutingModule)
      },
      {
        path: "products",
        loadChildren: () => import("./components/product/product-list/product-list-routing.module").then(m => m.ProductListRoutingModule)
      },
      {
        path: "goods",
        loadChildren: () => import("./components/goods/goods-routing.module").then(m => m.GoodsRoutingModule)
      },
      {
        path: "forums",
        loadChildren: () => import("./components/forum/forum-routing.module").then(m => m.ForumRoutingModule)
      },
      {
        path: "about",
        loadChildren: () => import("./components/about/about-routing.module").then(m => m.AboutRoutingModule)
      },
      {
        path: "recruit",
        loadChildren: () => import("./components/recruit/recruit-routing.module").then(m => m.RecruitRoutingModule)
      },
      {
        path: "faq",
        loadChildren: () => import("./components/faq/faq-routing.module").then(m => m.FaqRoutingModule)
      },
      {
        path: "contact",
        loadChildren: () => import("./components/contact/contact-routing.module").then(m => m.ContactRoutingModule)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
