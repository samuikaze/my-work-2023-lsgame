import { Component, OnInit } from '@angular/core';
import { ViewportScroller } from '@angular/common';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.sass'],
    standalone: true
})
export class FooterComponent implements OnInit {

  constructor(private viewportService: ViewportScroller) { }

  ngOnInit(): void {
  }

  showArrowToTop(): void {
    //
  }

  returnToTop(): void {
    this.viewportService.scrollToPosition([0, 0]);
  }

}
