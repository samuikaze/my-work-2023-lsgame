import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoodsRoutingModule } from './goods-routing.module';

import { GoodsListComponent } from './goods-list/goods-list.component';
import { GoodsContentComponent } from './goods-content/goods-content.component';
import { CartContentComponent } from './cart-content/cart-content.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    GoodsListComponent,
    GoodsContentComponent,
    CartContentComponent
  ],
  imports: [
    CommonModule,
    GoodsRoutingModule,
    FormsModule
  ]
})
export class GoodsModule { }
