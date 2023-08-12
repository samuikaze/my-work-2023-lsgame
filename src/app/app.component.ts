import { Component } from '@angular/core';
import { FooterComponent } from './layouts/Base/footer/footer.component';
import { BodyComponent } from './layouts/Base/body/body.component';
import { NavigatorComponent } from './components/navigator/navigator.component';
import { HeaderComponent } from './layouts/Base/header/header.component';
import 'bootstrap/dist/js/bootstrap.bundle.js'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.sass'],
    standalone: true,
    imports: [HeaderComponent, NavigatorComponent, BodyComponent, FooterComponent]
})
export class AppComponent {
  title = 'lsgames-frontend';
}
