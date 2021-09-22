import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SearchUser, UserInterface } from '../model/user.model';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { exhaustMap, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';

import { ChatConnectionModel } from '../model/chat.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  userToken = new BehaviorSubject<{
    message: string;
    token: string;
    userId: string;
  } | null>(null);
  // userDataSubject = new Subject<{
  //   name: string;
  //   pictureUrl: string;
  //   notifications: [{ message: string; imageUrl: string }];
  //   pendingRequests: [
  //     { userId: { _id: string; name: string; pictureUrl: string } }
  //   ];
  // }>();
  // showProgressBar = new Subject<boolean>();
  socket!: Socket;

  constructor(private http: HttpClient, private router: Router) {}

  signUp(form: FormData) {
    return this.http.post(`${environment.host}/sign-up`, form);
  }
  logIn(email: string, password: string) {
    return this.http
      .post<{ message: string; token: string; code: number; userId: string }>(
        `${environment.host}/log-in`,
        {
          email: email,
          password: password,
        }
      )
      .pipe(
        tap((result) => {
          if (result.message === 'successfully login') {
            this.userToken.next(result);
            this.socket = io(environment.host, {
              extraHeaders: { userId: result.userId },
            });
            localStorage.setItem('token', result.token);
          }
        })
      );
  }
  logOut() {
    localStorage.removeItem('token');
    if (this.socket) {
      this.socket.disconnect();
    }
    return this.userToken.pipe(
      switchMap((result) => {
        if (result) {
          return this.http.get<{ message: string; code: number }>(
            `${environment.host}/log-out`,
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
  autoLogin() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/log-in']);
      return this.userToken.next(null);
    }
    this.http
      .get<{ message: string; token: string; code: number; userId: string }>(
        `${environment.host}/auto-login`,
        {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
        }
      )
      .subscribe(
        (result) => {
          if (result.code === 200) {
            this.userToken.next(result);
            this.socket = io(environment.host, {
              extraHeaders: { userId: result.userId },
            });
            localStorage.setItem('token', result.token);
          } else {
            this.userToken.next(null);
            this.router.navigate(['/log-in']);
          }
        },
        () => {
          localStorage.removeItem('token');
          this.userToken.next(null);
          return this.router.navigate(['/log-in']);
        }
      );
  }
  searchUser(userName: string) {
    return this.userToken.pipe(
      exhaustMap((result) => {
        if (result) {
          return this.http.get<{ message: string; users: SearchUser[] }>(
            `${environment.host}/search?user=${userName}`,
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
          }>(`${environment.host}/add-user`, {
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
  // userData() {
  //   return this.userToken.pipe(
  //     exhaustMap((result) => {
  //       if (result) {
  //         return this.http
  //           .get<{
  //             message: string;
  //             name: string;
  //             pictureUrl: string;
  //             notifications: [{ message: string; imageUrl: string }];
  //             pendingRequests: [
  //               { userId: { _id: string; name: string; pictureUrl: string } }
  //             ];
  //             code: number;
  //           }>(`${environment.host}/user-data`, {
  //             headers: new HttpHeaders({
  //               Authorization: `Bearer ${result.token}`,
  //             }),
  //           })
  //           .pipe(
  //             tap((result) => {
  //               this.userDataSubject.next({
  //                 name: result.name,
  //                 pictureUrl: result.pictureUrl,
  //                 notifications: result.notifications,
  //                 pendingRequests: result.pendingRequests,
  //               });
  //             })
  //           );
  //       } else {
  //         return of(null);
  //       }
  //     })
  //   );
  // }
  acceptFriendRequest(userId: string) {
    return this.userToken.pipe(
      exhaustMap((result) => {
        if (result) {
          return this.http.get(`${environment.host}/accept-user-request`, {
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
          return this.http.get(`${environment.host}/reject-request`, {
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
            code: number;
            chatConnections: ChatConnectionModel[];
          }>(`${environment.host}/get-chat-channels`, {
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
            code: number;
            friends: {
              _id: string;
              userId: {
                _id: string;
                name: string;
                email: string;
                pictureUrl: string;
              };
            }[];
          }>(`${environment.host}/friend-list`, {
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
      `${environment.host}/user-details`,
      {
        params: new HttpParams().set('friendId', userId),
      }
    );
  }
  // getOwnerDetails() {
  //   return this.userToken.pipe(
  //     exhaustMap((result) => {
  //       if (result) {
  //         return this.http.get<{ message: string; userDetails: UserInterface }>(
  //           `${environment.host}/account-details`,
  //           {
  //             headers: new HttpHeaders({
  //               Authorization: `Bearer ${result.token}`,
  //             }),
  //           }
  //         );
  //       } else {
  //         return of(null);
  //       }
  //     })
  //   );
  // }
  changeUserData(
    userId: string,
    firstName: string,
    lastName: string,
    phoneNo: number,
    email: string,
    address: string,
    birthDate: Date
  ) {
    return this.http.post(`${environment.host}/update-account-data/${userId}`, {
      firstName,
      lastName,
      phoneNo,
      email,
      address,
      birthDate,
    });
  }
  changePassword(password: string, newPassword: string) {
    return this.userToken.pipe(
      exhaustMap((result) => {
        if (result) {
          return this.http.post<{ message: string; code: number }>(
            `${environment.host}/change-password`,
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
  clearNotifications() {
    return this.userToken.pipe(
      exhaustMap((result) => {
        if (result) {
          return this.http.get(`${environment.host}/clear-notifications`, {
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
}
