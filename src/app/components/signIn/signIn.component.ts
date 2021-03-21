import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { FormControl, FormGroup } from '@angular/forms';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
} from 'angularx-social-login';

@Component({
  selector: 'app-sign-in',
  templateUrl: './signIn.component.html',
  styleUrls: ['./signIn.component.css'],
})
export class SignInComponent implements OnInit {
  fbIcon = faFacebook;
  googleIcon = faGoogle;
  form!: FormGroup;
  user!: SocialUser;
  fbLogInOption = {
    fields: 'picture.type(large),name, email',
  };
  @ViewChild('pictureUpload') picUploadForm!: ElementRef;
  @ViewChild('picture') picture!: ElementRef;
  @ViewChild('picSrc') picSrc!: ElementRef;
  constructor(
    private renderer: Renderer2,
    private authService: SocialAuthService
  ) {}
  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null),
      email: new FormControl(null),
      password: new FormControl(null),
    });
    this.authService.authState.subscribe((user) => {
      this.user = user;
      // console.log(user);
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
        }
      };
    }
  }
  onReset() {
    this.renderer.removeStyle(this.picUploadForm.nativeElement, 'display');
    this.renderer.removeStyle(this.picture.nativeElement, 'display');
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
    } else if (response.pictureUrl) {
      this.renderer.setAttribute(
        this.picSrc.nativeElement,
        'src',
        response.pictureUrl
      );
    }
  }
  onSubmit() {
    console.log(this.form);
  }
}
