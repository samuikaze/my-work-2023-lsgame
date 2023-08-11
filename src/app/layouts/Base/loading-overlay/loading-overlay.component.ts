import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.sass']
})
export class LoadingOverlayComponent implements OnInit {

  public show: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

  /**
   * 顯示覆蓋
   */
  public showOverlay() {
    this.show = true;
  }

  /**
   * 隱藏覆蓋
   */
  public hideOverlay() {
    this.show = false;
  }
}
