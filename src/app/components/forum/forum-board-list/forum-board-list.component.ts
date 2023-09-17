import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/abstracts/common';
import { Board } from 'src/app/components/forum/forums';
import { BaseResponse } from 'src/app/abstracts/http-client';
import { BreadcrumbService } from 'src/app/services/breadcrumb-service/breadcrumb.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { RequestService } from 'src/app/services/request-service/request.service';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { AppEnvironmentService } from 'src/app/services/app-environment-service/app-environment.service';
import { ApiServiceTypes } from 'src/app/enums/api-service-types';

@Component({
    selector: 'app-forum-board-list',
    templateUrl: './forum-board-list.component.html',
    styleUrls: ['./forum-board-list.component.sass'],
    standalone: true,
    imports: [NgIf, NgFor, RouterLink]
})
export class ForumBoardListComponent implements OnInit {

  private apiPath = "forums/boards";
  public boards: Board[] = [];
  public loaded: boolean = false;
  public breadcrumb: Breadcrumb = { title: "討論專區", uri: "/forums" };
  constructor(
    private commonService: CommonService,
    private requestService: RequestService,
    private breadcrumbService: BreadcrumbService,
    private appEnvironmentService: AppEnvironmentService
  ) { }

  ngOnInit(): void {
    this.commonService.setTitle("討論專區");
    this.breadcrumbService.setBreadcrumb(this.breadcrumb);
    this.getBoards();
  }

  /**
   * 取得討論板一覽
   */
  public async getBoards() {
    this.loaded = false;
    this.boards = [];

    const baseUri = await this.appEnvironmentService.getConfig(ApiServiceTypes.Forum);
    const uri = `${baseUri}/${this.apiPath}`;
    this.requestService.get<BaseResponse<Board[]>>(uri)
      .subscribe(data => {
        this.boards = data.data;
        this.loaded = true;
      });
  }

  /**
   * 組合圖片路徑
   * @param filename 檔名
   * @returns 完整圖片路徑
   */
  public composeImagePath(filename: string): string {
    return `assets/images/forums/boards/${filename}`;
  }

  /**
   * 組合討論板網址
   * @param id 討論板 ID
   * @returns 完整討論板網址
   */
  public composeBoardPath(id: number): string {
    return `/forums/${id}`;
  }
}
