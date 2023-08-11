import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewsListComponent } from './news-list/news-list.component';
import { NewsContentComponent } from './news-content/news-content.component';

const routes: Routes = [
  { path: "", component: NewsListComponent },
  { path: ":id", component: NewsContentComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewsRoutingModule { }
