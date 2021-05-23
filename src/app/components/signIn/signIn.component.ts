import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
} from 'angularx-social-login';

import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-sign-in',
  templateUrl: './signIn.component.html',
  styleUrls: ['./signIn.component.css'],
})
export class SignInComponent implements OnInit {
  fbIcon = faFacebook;
  googleIcon = faGoogle;
  infoIcon = faInfoCircle;
  checkIcon = faCheckCircle;
  eyeIcon = faEye;
  form!: FormGroup;
  user!: SocialUser;
  imageFile: File | undefined;
  imageUrl!: string | undefined;
  warningMessage!: string | undefined;
  showWarning = false;
  showPassword = false;
  showPasswordWarning = false;
  fbLogInOption = {
    fields: 'picture.type(large),name, email',
  };
  @ViewChild('pictureUpload') picUploadForm!: ElementRef;
  @ViewChild('picture') picture!: ElementRef;
  @ViewChild('picSrc') picSrc!: ElementRef;
  @ViewChild('emailWarning') emailWarning!: ElementRef;
  @ViewChild('passwordWarning') passwordWarning!: ElementRef;
  @ViewChild('signUpNotification') signUpNotification!: ElementRef;
  constructor(
    private renderer: Renderer2,
    private authService: SocialAuthService,
    private userService: UserService,
    private http: HttpClient,
    private router: Router
  ) {}
  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, Validators.required),
      email: new FormControl(
        null,
        [Validators.required, Validators.email],
        this.validateEmail.bind(this)
      ),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(8),
        this.reCheckConfirmPassword.bind(this),
      ]),
      confirmPassword: new FormControl(null, [
        Validators.required,
        this.validateConfirmPassword.bind(this),
      ]),
    });
    this.authService.authState.subscribe((user) => {
      this.user = user;
    });
  }
  onSelectImg(event: Event) {
    const e = <HTMLInputElement>event.target;
    const file = e.files as FileList;
    if (file.length > 0) {
      const flReader = new FileReader();
      flReader.readAsDataURL(file[0]);
      flReader.onload = () => {
        if (typeof flReader.result === 'string') {
          this.renderer.setStyle(
            this.picUploadForm.nativeElement,
            'display',
            'none'
          );
          this.renderer.setStyle(
            this.picture.nativeElement,
            'display',
            'block'
          );
          this.picSrc.nativeElement.attributes[1].nodeValue = flReader.result;
          this.imageFile = file[0];
        }
      };
    }
  }
  onReset() {
    this.renderer.removeStyle(this.picUploadForm.nativeElement, 'display');
    this.renderer.removeStyle(this.picture.nativeElement, 'display');
    this.imageFile = undefined;
    this.imageUrl = undefined;
  }
  signInWithGoogle(): void {
    this.authService
      .signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((response: { email: string; name: string; photoUrl: string }) => {
        this.updateDom({
          name: response.name,
          email: response.email,
          photoUrl: response.photoUrl,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }
  signInWithFacebook(): void {
    this.authService
      .signIn(FacebookLoginProvider.PROVIDER_ID, this.fbLogInOption)
      .then(
        (response: {
          response: {
            name: string;
            email: string;
            picture: { data: { url: string } };
          };
        }) => {
          this.updateDom({
            name: response.response.name,
            email: response.response.email,
            pictureUrl: response.response.picture.data.url,
          });
        }
      )
      .catch((error) => {
        console.log(error);
      });
  }
  get emailExist() {
    if (
      this.form.get('email')?.getError('email') &&
      this.form.get('email')?.touched
    ) {
      this.warningMessage =
        'Email address should not be empty and should be valid.';
      return true;
    } else if (this.form.get('email')?.getError('emailExists')) {
      this.warningMessage = 'Email address already exists, try different one.';
      return true;
    } else {
      this.warningMessage = undefined;
      return false;
    }
  }
  clickPasswordWarning() {
    this.showPasswordWarning = !this.showPasswordWarning;
    if (this.showPasswordWarning) {
      this.renderer.addClass(
        this.passwordWarning.nativeElement,
        'show-warning'
      );
    } else {
      this.renderer.removeClass(
        this.passwordWarning.nativeElement,
        'show-warning'
      );
    }
  }
  focusPassword() {
    this.showPasswordWarning = false;
    if (this.passwordWarning) {
      this.renderer.removeClass(
        this.passwordWarning.nativeElement,
        'show-warning'
      );
    }
  }
  private updateDom(response: {
    name: string;
    email: string;
    photoUrl?: string;
    pictureUrl?: string;
  }) {
    this.form.patchValue({
      name: response.name,
      email: response.email,
    });
    this.renderer.setStyle(this.picUploadForm.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.picture.nativeElement, 'display', 'block');
    if (response.photoUrl) {
      const newPhotoUrl = response.photoUrl.replace('s96-c', 's200-c');
      this.renderer.setAttribute(this.picSrc.nativeElement, 'src', newPhotoUrl);
      this.imageUrl = response.photoUrl;
    } else if (response.pictureUrl) {
      this.renderer.setAttribute(
        this.picSrc.nativeElement,
        'src',
        response.pictureUrl
      );
      this.imageUrl = response.pictureUrl;
    }
  }
  private validateEmail(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    return this.http
      .get<{ message: string; code: number }>(
        `${environment.host}/email-check?email=${control.value}`
      )
      .pipe(
        map((result) => {
          if (result.code === 201) {
            return { emailExists: true };
          } else {
            return null;
          }
        })
      );
  }
  private validateConfirmPassword(control: AbstractControl) {
    if (this.form) {
      if (this.form.get('password')?.value != control.value) {
        return { confirmPassword: true };
      }
    }
    return null;
  }
  private reCheckConfirmPassword(control: AbstractControl) {
    if (this.form) {
      if (
        this.form.get('confirmPassword')?.value != control.value &&
        this.form.get('confirmPassword')?.touched
      ) {
        this.form.get('confirmPassword')?.setErrors({ confirmPassword: true });
      } else if (
        this.form.get('confirmPassword')?.value == control.value &&
        this.form.get('confirmPassword')?.touched
      ) {
        this.form.get('confirmPassword')?.setErrors(null);
      }
    }
    return null;
  }
  clickIcon() {
    this.showWarning = !this.showWarning;
    if (this.showWarning) {
      this.renderer.addClass(this.emailWarning.nativeElement, 'show-warning');
    } else {
      this.renderer.removeClass(
        this.emailWarning.nativeElement,
        'show-warning'
      );
    }
  }
  onShowPassword(el: Element) {
    this.showPassword = !this.showPassword;
    if (this.showPassword) {
      this.renderer.setAttribute(el, 'type', 'text');
    } else {
      this.renderer.setAttribute(el, 'type', 'password');
    }
  }
  onFocus() {
    this.showWarning = false;
    if (this.emailWarning) {
      this.renderer.removeClass(
        this.emailWarning.nativeElement,
        'show-warning'
      );
    }
  }
  onSubmit() {
    const form = new FormData();
    form.append('name', (<FormControl>this.form.get('name')).value);
    form.append('email', (<FormControl>this.form.get('email')).value);
    form.append('password', (<FormControl>this.form.get('password')).value);
    if (this.imageUrl) {
      form.append('imageUrl', this.imageUrl);
    } else if (this.imageFile) {
      form.append('image', this.imageFile);
    }
    this.userService.signUp(form).subscribe(() => {
      this.renderer.addClass(
        this.signUpNotification.nativeElement,
        'show-sign__success'
      );
      setTimeout(() => this.router.navigate(['log-in']), 300);
    });
  }
}
