import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './components/signIn/signIn.component';
import { LogInComponent } from './components/logIn/logIn.component';
import { HomeComponent } from './components/home/home.component';
import { ChatComponent } from './components/home/chat/chat.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    children: [{ path: ':linkName', component: ChatComponent }],
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
