import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecruitRoutingModule } from './recruit-routing.module';
import { RecruitComponent } from './recruit.component';


@NgModule({
  declarations: [
    RecruitComponent
  ],
  imports: [
    CommonModule,
    RecruitRoutingModule
  ]
})
export class RecruitModule { }
