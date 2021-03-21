import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  signUp(form: FormData) {
    return this.http.post('http://localhost:3000/sign-up', form);
  }
}
