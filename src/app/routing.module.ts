import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './components/signIn/signIn.component';
import { LogInComponent } from './components/logIn/logIn.component';
import { HomeComponent } from './components/home/home.component';
import { ChatComponent } from './components/home/chat/chat.component';
import { MessageComponent } from './components/home/message/message.component';
import { FriendComponent } from './components/home/friends/friend.component';
import { AccountComponent } from './components/home/account/account.component';
import { LoadingComponent } from './components/loading/loading.component';

const routes: Routes = [
  { path: '', redirectTo: 'home/chats', pathMatch: 'full' },
  { path: 'loading', component: LoadingComponent },
  {
    path: 'home',
    component: HomeComponent,
    children: [
      {
        path: 'account',
        pathMatch: 'full',
        component: AccountComponent,
      },
      {
        path: ':linkName',
        component: ChatComponent,
        children: [
          { path: 'chat', component: MessageComponent },
          { path: 'friend', component: FriendComponent },
        ],
      },
    ],
  },
  {
    path: 'sign-up',
    component: SignInComponent,
  },
  { path: 'log-in', component: LogInComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class RoutingModule {}
