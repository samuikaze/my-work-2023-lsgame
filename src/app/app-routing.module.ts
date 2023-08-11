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
        loadChildren: () => import("./components/news/news.module").then(m => m.NewsModule)
      },
      {
        path: "products",
        loadChildren: () => import("./components/product/product-list/product-list.module").then(m => m.ProductListModule)
      },
      {
        path: "goods",
        loadChildren: () => import("./components/goods/goods.module").then(m => m.GoodsModule)
      },
      {
        path: "forums",
        loadChildren: () => import("./components/forum/forum.module").then(m => m.ForumModule)
      },
      {
        path: "about",
        loadChildren: () => import("./components/about/about.module").then(m => m.AboutModule)
      },
      {
        path: "recruit",
        loadChildren: () => import("./components/recruit/recruit.module").then(m => m.RecruitModule)
      },
      {
        path: "faq",
        loadChildren: () => import("./components/faq/faq.module").then(m => m.FaqModule)
      },
      {
        path: "contact",
        loadChildren: () => import("./components/contact/contact.module").then(m => m.ContactModule)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
