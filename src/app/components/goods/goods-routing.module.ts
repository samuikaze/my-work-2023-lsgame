import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CartContentComponent } from './cart-content/cart-content.component';
import { GoodsContentComponent } from './goods-content/goods-content.component';
import { GoodsListComponent } from './goods-list/goods-list.component';

const routes: Routes = [
  { path: "", component: GoodsListComponent },
  { path: "cart", component: CartContentComponent },
  { path: ":id", component: GoodsContentComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GoodsRoutingModule { }
