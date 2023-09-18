import { Component, OnInit } from '@angular/core';
import { FooterComponent } from './layouts/base/footer/footer.component';
import { BodyComponent } from './layouts/base/body/body.component';
import { NavigatorComponent } from './components/navigator/navigator.component';
import { HeaderComponent } from './layouts/base/header/header.component';
import 'bootstrap/dist/js/bootstrap.bundle.js'
import { AppEnvironmentService } from './services/app-environment-service/app-environment.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.sass'],
    standalone: true,
    imports: [HeaderComponent, NavigatorComponent, BodyComponent, FooterComponent]
})
export class AppComponent implements OnInit {
  title = 'lsgames-frontend';

  constructor(
    private appEnvironmentService: AppEnvironmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.router.events.subscribe(async (event) => {
      if (event instanceof NavigationEnd) {
        this.appEnvironmentService.retrievingConfigsFromJson();
      }
    });
  }
}
