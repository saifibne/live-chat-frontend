import { Injectable } from '@angular/core';
import { exhaustMap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  latestChatConnection = new Subject<{
    message: string;
    _id: string;
    name: string;
    pictureUrl: string;
    time: Date;
  }>();
  currentChatConnection = new Subject<{
    message: string;
    _id: string;
    name: string;
    pictureUrl: string;
    time: Date;
  }>();
  showEmptySpace = new Subject<boolean>();
  constructor(private userService: UserService, private http: HttpClient) {}
  getChat(chatId: string) {
    return this.userService.userToken.pipe(
      exhaustMap((result) => {
        if (result) {
          return this.http.get<{
            message: string;
            user: {
              _id: string;
              userId: { _id: string; name: string; pictureUrl: string };
            };
            chats: {
              owner: boolean;
              text: string;
              time: Date;
              userId: { _id: string; pictureUrl: string };
              _id: string;
            }[];
            pagination: boolean;
          }>('http://localhost:3000/get-chat', {
            headers: new HttpHeaders({
              Authorization: `Bearer ${result.token}`,
            }),
            params: new HttpParams().set('chatId', chatId),
          });
        } else {
          return of(null);
        }
      })
    );
  }
  getMoreChats(chatId: string, page: number) {
    return this.userService.userToken.pipe(
      exhaustMap((result) => {
        if (result) {
          return this.http.get<{
            message: string;
            chats: {
              owner: boolean;
              text: string;
              time: Date;
              userId: { _id: string; pictureUrl: string };
              _id: string;
            }[];
          }>('http://localhost:3000/additional-chats', {
            headers: new HttpHeaders({
              Authorization: `Bearer ${result.token}`,
            }),
            params: new HttpParams()
              .set('chatId', chatId)
              .set('page', page.toString()),
          });
        } else {
          return of(null);
        }
      })
    );
  }
  addMessage(message: string, groupId: string) {
    return this.userService.userToken.pipe(
      exhaustMap((result) => {
        if (result) {
          return this.http.post(
            'http://localhost:3000/add-message',
            { message: message },
            {
              params: new HttpParams().set('groupId', groupId),
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
  getParticularChatConnection(friendId: string) {
    return this.userService.userToken.pipe(
      exhaustMap((result) => {
        if (result) {
          return this.http.get<{
            message: string;
            chatConnection: {
              _id: string;
              message: string;
              name: string;
              pictureUrl: string;
              time: Date;
            };
          }>('http://localhost:3000/single-chat-connection', {
            headers: new HttpHeaders({
              Authorization: `Bearer ${result.token}`,
            }),
            params: new HttpParams().set('friendId', friendId),
          });
        } else {
          return of(null);
        }
      })
    );
  }
}
