import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';

import * as userActions from './userStore.action';
import { UserService } from '../../services/user.service';
import { UserInterface } from '../../model/user.model';
import { environment } from '../../../environments/environment';
import * as storeActions from '../store.action';

@Injectable()
export class UserStoreEffect {
  getOwnerData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userActions.startGettingUser),
      switchMap(() => {
        return this.userService.userToken.pipe(
          switchMap((result) => {
            if (result) {
              return this._http
                .get<{ message: string; userDetails: UserInterface }>(
                  `${environment.host}/account-details`,
                  {
                    headers: new HttpHeaders({
                      Authorization: `Bearer ${result.token}`,
                    }),
                  }
                )
                .pipe(
                  map((userData) =>
                    userActions.userDetail({
                      _id: userData.userDetails._id,
                      pictureUrl: userData.userDetails.pictureUrl,
                      name: userData.userDetails.name,
                      birthDate: userData.userDetails.birthDate,
                      address: userData.userDetails.address,
                      email: userData.userDetails.email,
                      phoneNo: userData.userDetails.phoneNo,
                    })
                  ),
                  catchError((error) => {
                    console.log(error);
                    return of(storeActions.redirectLoginPage());
                  })
                );
            } else {
              return of(userActions.userDetailFail());
            }
          })
        );
      })
    )
  );

  getUserData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userActions.startPersistUserData),
      switchMap(() => {
        return this.userService.userToken.pipe(
          switchMap((result) => {
            if (result) {
              return this._http
                .get<{
                  message: string;
                  name: string;
                  pictureUrl: string;
                  notifications: [{ message: string; imageUrl: string }];
                  pendingRequests: [
                    {
                      userId: { _id: string; name: string; pictureUrl: string };
                    }
                  ];
                  code: number;
                }>(`${environment.host}/user-data`, {
                  headers: new HttpHeaders({
                    Authorization: `Bearer ${result.token}`,
                  }),
                })
                .pipe(
                  map((userData) => {
                    console.log(userData);
                    return userActions.persistUserData({
                      name: userData.name,
                      pictureUrl: userData.pictureUrl,
                      notifications: userData.notifications,
                      pendingRequests: userData.pendingRequests,
                    });
                  }),
                  catchError((error: HttpErrorResponse) => {
                    console.log(error);
                    return of(storeActions.redirectLoginPage());
                  })
                );
            } else {
              return of(userActions.persistUserDataFail());
            }
          })
        );
      })
    )
  );

  redirectToLoginPage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(storeActions.redirectLoginPage),
        tap(() => {
          this.router.navigate(['/log-in']);
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private _http: HttpClient,
    private userService: UserService,
    private router: Router
  ) {}
}
