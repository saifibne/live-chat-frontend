import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SignInComponent } from '../components/signIn/signIn.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [SignInComponent],
  imports: [
    CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: SignInComponent }]),
  ],
})
export class SignInModule {}
