import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecruitComponent } from './recruit.component';

const routes: Routes = [{ path: '', component: RecruitComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecruitRoutingModule { }
