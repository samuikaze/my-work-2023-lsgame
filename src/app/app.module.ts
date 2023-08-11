import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { LightboxModule } from 'ngx-lightbox';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layouts/Base/header/header.component';
import { BodyComponent } from './layouts/Base/body/body.component';
import { FooterComponent } from './layouts/Base/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { LoadingOverlayComponent } from './layouts/Base/loading-overlay/loading-overlay.component';
import { NavigatorComponent } from './components/navigator/navigator.component';
import { CheckAuthenticateGuard } from './guards/check-authenticate.guard';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    BodyComponent,
    FooterComponent,
    HomeComponent,
    LoadingOverlayComponent,
    NavigatorComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    LightboxModule
  ],
  providers: [
    CheckAuthenticateGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
