import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { UserService } from '../../services/user.service';
import { ChatConnectionModel } from '../../model/chat.model';
import { environment } from '../../../environments/environment';
import * as chatActions from '../chatStore/chatStore.action';
import * as storeActions from '../store.action';

@Injectable()
export class ChatStoreEffect {
  getChatConnections$ = createEffect(() =>
    this.actions$.pipe(
      ofType(chatActions.startGettingChats),
      switchMap(() => {
        return this.userService.userToken.pipe(
          switchMap((result) => {
            if (result) {
              return this.http
                .get<{
                  message: string;
                  code: number;
                  chatConnections: ChatConnectionModel[];
                }>(`${environment.host}/get-chat-channels`, {
                  headers: new HttpHeaders({
                    Authorization: `Bearer ${result.token}`,
                  }),
                })
                .pipe(
                  map((data) =>
                    chatActions.chats({ chatConnections: data.chatConnections })
                  ),
                  catchError((error) => {
                    console.log(error);
                    return of(storeActions.redirectLoginPage());
                  })
                );
            } else {
              return of(chatActions.resetChats());
            }
          })
        );
      })
    )
  );

  getFriendsList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(chatActions.startGettingFriendList),
      switchMap(() => {
        return this.userService.userToken.pipe(
          switchMap((result) => {
            if (result) {
              return this.http
                .get<{
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
                })
                .pipe(
                  map((data) =>
                    chatActions.friendList({ friends: data.friends })
                  ),
                  catchError((error) => {
                    console.log(error);
                    return of(storeActions.redirectLoginPage());
                  })
                );
            } else {
              return of(chatActions.resetFriendList());
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
    private http: HttpClient,
    private userService: UserService,
    private router: Router
  ) {}
}
