import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LogInComponent } from '../components/logIn/logIn.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [LogInComponent],
  imports: [
    FontAwesomeModule,
    FormsModule,
    CommonModule,
    MatProgressSpinnerModule,
    RouterModule.forChild([{ path: '', component: LogInComponent }]),
  ],
})
export class LogInModule {}
