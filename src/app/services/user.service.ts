import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SearchUser, UserInterface } from '../model/user.model';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { exhaustMap, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ChatConnectionModel } from '../model/chat.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  userToken = new BehaviorSubject<{
    message: string;
    token: string;
    userId: string;
  } | null>(null);
  userDataSubject = new Subject<{
    notifications: [{ message: string; imageUrl: string }];
    pendingRequests: [
      { userId: { _id: string; name: string; pictureUrl: string } }
    ];
  }>();

  constructor(private http: HttpClient, private router: Router) {}

  signUp(form: FormData) {
    return this.http.post('http://localhost:3000/sign-up', form);
  }
  logIn(email: string, password: string) {
    return this.http
      .post<{ message: string; token: string; code: number; userId: string }>(
        'http://localhost:3000/log-in',
        {
          email: email,
          password: password,
        }
      )
      .pipe(
        tap((result) => {
          if (result.message === 'successfully login') {
            this.userToken.next(result);
            localStorage.setItem('token', result.token);
          }
        })
      );
  }
  autoLogin() {
    const token = localStorage.getItem('token');
    if (!token) {
      return this.userToken.next(null);
    }
    this.http
      .get<{ message: string; token: string; code: number; userId: string }>(
        'http://localhost:3000/auto-login',
        {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
        }
      )
      .subscribe(
        (result) => {
          // console.log(result);
          if (result.code === 200) {
            this.userToken.next(result);
            localStorage.setItem('token', result.token);
          } else {
            this.userToken.next(null);
            this.router.navigate(['/log-in']);
          }
        },
        (error) => {
          console.log(error);
          localStorage.removeItem('token');
          this.userToken.next(null);
        }
      );
  }
  searchUser(userName: string) {
    return this.userToken.pipe(
      exhaustMap((result) => {
        if (result) {
          return this.http.get<{ message: string; users: SearchUser[] }>(
            `http://localhost:3000/search?user=${userName}`,
            {
              headers: new HttpHeaders({
                Authorization: `Bearer ${result.token}`,
              }),
            }
          );
        } else {
          return of(null);
        }
      })
    );
  }
  sendFriendRequest(userId: string) {
    return this.userToken.pipe(
      exhaustMap((result) => {
        if (result) {
          return this.http.get<{
            message: string;
            token: string;
            code: number;
          }>('http://localhost:3000/add-user', {
            params: new HttpParams().set('user', userId),
            headers: new HttpHeaders({
              Authorization: `Bearer ${result.token}`,
            }),
          });
        } else {
          return of(null);
        }
      })
    );
  }
  userData() {
    return this.userToken.pipe(
      switchMap((result) => {
        if (result) {
          return this.http
            .get<{
              message: string;
              notifications: [{ message: string; imageUrl: string }];
              pendingRequests: [
                { userId: { _id: string; name: string; pictureUrl: string } }
              ];
              code: number;
            }>('http://localhost:3000/user-data', {
              headers: new HttpHeaders({
                Authorization: `Bearer ${result.token}`,
              }),
            })
            .pipe(
              tap((result) => {
                this.userDataSubject.next({
                  notifications: result.notifications,
                  pendingRequests: result.pendingRequests,
                });
              })
            );
        } else {
          return of(null);
        }
      })
    );
  }
  acceptFriendRequest(userId: string) {
    return this.userToken.pipe(
      exhaustMap((result) => {
        if (result) {
          return this.http.get('http://localhost:3000/accept-user-request', {
            params: new HttpParams().set('userId', userId),
            headers: new HttpHeaders({
              Authorization: `Bearer ${result.token}`,
            }),
          });
        } else {
          return of(null);
        }
      })
    );
  }
  rejectFriendRequest(userId: string) {
    return this.userToken.pipe(
      exhaustMap((result) => {
        if (result) {
          return this.http.get('http://localhost:3000/reject-request', {
            params: new HttpParams().set('userId', userId),
            headers: new HttpHeaders({
              Authorization: `Bearer ${result.token}`,
            }),
          });
        } else {
          return of(null);
        }
      })
    );
  }
  chatConnections() {
    return this.userToken.pipe(
      exhaustMap((result) => {
        if (result) {
          return this.http.get<{
            message: string;
            chatConnections: ChatConnectionModel[];
          }>('http://localhost:3000/get-chat-channels', {
            headers: new HttpHeaders({
              Authorization: `Bearer ${result.token}`,
            }),
          });
        } else {
          return of(null);
        }
      })
    );
  }
  getFriendsList() {
    return this.userToken.pipe(
      exhaustMap((result) => {
        if (result) {
          return this.http.get<{
            message: string;
            friends: {
              _id: string;
              userId: {
                _id: string;
                name: string;
                email: string;
                pictureUrl: string;
              };
            }[];
          }>('http://localhost:3000/friend-list', {
            headers: new HttpHeaders({
              Authorization: `Bearer ${result.token}`,
            }),
          });
        } else {
          return of(null);
        }
      })
    );
  }
  getFriendDetails(userId: string) {
    return this.http.get<{ message: string; userDetails: UserInterface }>(
      'http://localhost:3000/user-details',
      {
        params: new HttpParams().set('friendId', userId),
      }
    );
  }
  getOwnerDetails() {
    return this.userToken.pipe(
      exhaustMap((result) => {
        if (result) {
          return this.http.get<{ message: string; userDetails: UserInterface }>(
            'http://localhost:3000/account-details',
            {
              headers: new HttpHeaders({
                Authorization: `Bearer ${result.token}`,
              }),
            }
          );
        } else {
          return of(null);
        }
      })
    );
  }
  changeUserData(
    userId: string,
    firstName: string,
    lastName: string,
    phoneNo: number,
    email: string,
    address: string,
    birthDate: Date
  ) {
    return this.http.post(
      `http://localhost:3000/update-account-data/${userId}`,
      {
        firstName,
        lastName,
        phoneNo,
        email,
        address,
        birthDate,
      }
    );
  }
  changePassword(password: string, newPassword: string) {
    return this.userToken.pipe(
      exhaustMap((result) => {
        if (result) {
          return this.http.post<{ message: string; code: number }>(
            'http://localhost:3000/change-password',
            {
              password: password,
              newPassword: newPassword,
            },
            {
              headers: new HttpHeaders({
                Authorization: `Bearer ${result.token}`,
              }),
            }
          );
        } else {
          return of(null);
        }
      })
    );
  }
}
