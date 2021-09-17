import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { AppComponent } from './app.component';
import { RoutingModule } from './routing.module';
import { HomeComponent } from './components/home/home.component';
import { ChatComponent } from './components/home/chat/chat.component';
import { ShortTextPipe } from './pipes/shortText.pipe';
import { ArrayFilterPipe } from './pipes/arrayFilter.pipe';
import { ArrayFriendPipe } from './pipes/arrayFriend.pipe';
import { LoadingComponent } from './components/loading/loading.component';
import { FriendComponent } from './components/home/friends/friend.component';
import { MessageComponent } from './components/home/message/message.component';
import { appState } from './store/store.reducer';
import { UserStoreEffect } from './store/userStore/userStore.effects';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ChatComponent,
    ShortTextPipe,
    ArrayFilterPipe,
    ArrayFriendPipe,
    LoadingComponent,
    FriendComponent,
    MessageComponent,
  ],
  imports: [
    BrowserModule,
    FontAwesomeModule,
    HttpClientModule,
    RoutingModule,
    StoreModule.forRoot(appState),
    EffectsModule.forRoot([UserStoreEffect]),
    FormsModule,
    BrowserAnimationsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
