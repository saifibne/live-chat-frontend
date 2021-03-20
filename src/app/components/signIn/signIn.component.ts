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

@Component({
  selector: 'app-sign-in',
  templateUrl: './signIn.component.html',
  styleUrls: ['./signIn.component.css'],
})
export class SignInComponent implements OnInit {
  fbIcon = faFacebook;
  googleIcon = faGoogle;
  form!: FormGroup;
  @ViewChild('pictureUpload') picUploadForm!: ElementRef;
  @ViewChild('picture') picture!: ElementRef;
  @ViewChild('picSrc') picSrc!: ElementRef;
  constructor(private renderer: Renderer2) {}
  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null),
      email: new FormControl(null),
      password: new FormControl(null),
    });
  }
  fbSignUp() {
    //@ts-ignore
    FB.login((response) => {
      if (response.status === 'connected') {
        //@ts-ignore
        FB.api(
          '/me?fields=name,email,picture.type(large)',
          (result: {
            name: string;
            email: string;
            picture: { data: { url: string } };
          }) => {
            this.form.patchValue({
              name: result.name,
              email: result.email,
            });
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
            this.renderer.setAttribute(
              this.picSrc.nativeElement,
              'src',
              result.picture.data.url
            );
          }
        );
      }
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
  onSubmit() {
    console.log(this.form);
  }
}
