import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { ChatComponent } from './components/home/chat/chat.component';
import { MessageComponent } from './components/home/message/message.component';
import { FriendComponent } from './components/home/friends/friend.component';

const routes: Routes = [
  { path: '', redirectTo: 'home/chats', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent,
    children: [
      {
        path: 'account',
        pathMatch: 'full',
        loadChildren: () =>
          import('./modules/account.module').then((m) => m.AccountModule),
      },
      {
        path: ':linkName',
        component: ChatComponent,
        children: [
          {
            path: 'chat',
            component: MessageComponent,
          },
          {
            path: 'friend',
            component: FriendComponent,
          },
        ],
      },
    ],
  },
  {
    path: 'sign-up',
    loadChildren: () =>
      import('./modules/signIn.module').then((m) => m.SignInModule),
  },
  {
    path: 'log-in',
    loadChildren: () =>
      import('./modules/logIn.module').then((m) => m.LogInModule),
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class RoutingModule {}
