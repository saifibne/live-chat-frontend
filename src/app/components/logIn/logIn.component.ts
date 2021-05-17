import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../../services/user.service';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faLock } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-log-in',
  templateUrl: './logIn.component.html',
  styleUrls: ['./logIn.component.css'],
})
export class LogInComponent {
  showPassword = false;
  showError = false;
  userIcon = faUser;
  lockIcon = faLock;
  showLoading = false;
  @ViewChild('passwordInput') passwordInput!: ElementRef;
  constructor(
    private renderer: Renderer2,
    private userService: UserService,
    private router: Router
  ) {}
  clickShowPassword() {
    this.showPassword = !this.showPassword;
    if (this.showPassword) {
      this.renderer.setAttribute(
        this.passwordInput.nativeElement,
        'type',
        'text'
      );
    } else {
      this.renderer.setAttribute(
        this.passwordInput.nativeElement,
        'type',
        'password'
      );
    }
  }
  onSignIn(form: { email: string; password: string }) {
    this.showError = false;
    this.showLoading = true;
    this.userService.logIn(form.email, form.password).subscribe((result) => {
      this.showLoading = false;
      switch (result.code) {
        case 201:
          this.showError = true;
          break;
        case 202:
          this.showError = true;
          break;
        case 200:
          this.showError = false;
          this.router.navigate(['/home/chats']);
      }
    });
  }
}
