import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SignInComponent } from './components/signIn/signIn.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  SocialLoginModule,
  SocialAuthServiceConfig,
} from 'angularx-social-login';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
} from 'angularx-social-login';
import { HttpClientModule } from '@angular/common/http';
import { LogInComponent } from './components/logIn/logIn.component';
import { RoutingModule } from './routing.module';
import { HomeComponent } from './components/home/home.component';
import { ChatComponent } from './components/home/chat/chat.component';
import { FriendsComponent } from './components/home/friends/friends.component';

@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    LogInComponent,
    HomeComponent,
    ChatComponent,
    FriendsComponent,
  ],
  imports: [
    BrowserModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    SocialLoginModule,
    HttpClientModule,
    RoutingModule,
    FormsModule,
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '999950806045-4iub9emqfnmd1jjqj83usjrmh5mhok64.apps.googleusercontent.com'
            ),
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('2680349712277582'),
          },
        ],
      } as SocialAuthServiceConfig,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
