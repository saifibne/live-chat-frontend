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
import { MessageComponent } from './components/home/message/message.component';
import { ShortTextPipe } from './pipes/shortText.pipe';
import { FriendComponent } from './components/home/friends/friend.component';
import { AccountComponent } from './components/home/account/account.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MatMomentDateModule,
} from '@angular/material-moment-adapter';
import { ArrayFilterPipe } from './pipes/arrayFilter.pipe';
import { LoadingComponent } from './components/loading/loading.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ArrayFriendPipe } from './pipes/arrayFriend.pipe';

const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    LogInComponent,
    HomeComponent,
    ChatComponent,
    FriendComponent,
    MessageComponent,
    ShortTextPipe,
    AccountComponent,
    ArrayFilterPipe,
    ArrayFriendPipe,
    LoadingComponent,
  ],
  imports: [
    BrowserModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    SocialLoginModule,
    HttpClientModule,
    RoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatMomentDateModule,
    MatDatepickerModule,
    MatProgressBarModule,
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
    {
      provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS,
      useValue: { userStrict: true },
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
