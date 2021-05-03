import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ChatService } from '../../../services/chat.service';
import { io } from 'socket.io-client';
import { UserService } from '../../../services/user.service';
import { delay, exhaustMap, switchMap, take } from 'rxjs/operators';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { of } from 'rxjs';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
})
export class MessageComponent implements OnInit, OnDestroy {
  plusIcon = faPlus;
  groupId: string = '';
  socketEventName!: string;
  showLoadMore = false;
  prevScrollHeight!: number;
  showLoadingChats!: boolean;
  page!: number;
  notificationCounter!: number;
  observer!: IntersectionObserver;
  resetCounterObserver!: IntersectionObserver;
  userDetails!:
    | {
        _id: string;
        userId: { _id: string; name: string; pictureUrl: string };
      }
    | undefined;
  chats: {
    owner: boolean;
    text: string;
    time: Date;
    userId: { _id: string; pictureUrl: string };
    _id?: string;
  }[] = [];
  runScrollToBottom = true;
  @ViewChild('messageContainer', { static: true })
  messageContainer!: ElementRef;
  @ViewChild('messageWrapper', { static: true }) messageWrapper!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;
  @ViewChild('loadMore', { static: true }) loadMore!: ElementRef;
  @ViewChild('newMessageNotification') newMessageNotification!: ElementRef;
  @ViewChild('resetCounter', { static: true }) resetCounter!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private userService: UserService,
    private renderer: Renderer2,
    private cd: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const socket = io('http://localhost:3000');
    this.chatService.showEmptySpace.next(false);
    this.route.queryParams
      .pipe(
        switchMap((result: Params) => {
          this.groupId = result['chatId'];
          this.showLoadingChats = true;
          this.chats = [];
          this.userDetails = undefined;
          this.renderer.setStyle(
            this.loadMore.nativeElement,
            'visibility',
            'hidden'
          );
          return this.chatService.getChat(result.chatId);
        }),
        delay(5000)
      )
      .subscribe(
        (result) => {
          if (result) {
            this.showLoadingChats = false;
            this.page = 1;
            this.userDetails = result.user;
            this.currentChatConnection(this.userDetails.userId._id);
            this.chats = result.chats;
            if (this.observer) {
              this.observer.disconnect();
            }
            this.setResetCounterObserver(this.resetCounter.nativeElement);
            if (!result.pagination) {
              this.renderer.setStyle(
                this.loadMore.nativeElement,
                'visibility',
                'hidden'
              );
              this.renderer.setStyle(this.loadMore.nativeElement, 'height', 0);
            } else {
              this.renderer.setStyle(
                this.loadMore.nativeElement,
                'visibility',
                'visible'
              );
              this.renderer.setStyle(
                this.loadMore.nativeElement,
                'height',
                'auto'
              );
              this.observer = new IntersectionObserver(
                (entries) => {
                  if (entries[0].isIntersecting) {
                    this.getMoreChats();
                  }
                },
                { threshold: [1] }
              );
              this.observer.observe(this.loadMore.nativeElement);
            }
            this.cd.detectChanges();
            this.scrollToBottom();
            this.prevScrollHeight = this.messageWrapper.nativeElement.scrollHeight;
            socket.off(this.socketEventName);
            this.socketEventName = this.groupId;
            socket.on(
              this.groupId,
              (socketData: {
                connection: string;
                data: {
                  text: string;
                  userId: string;
                  pictureUrl: string;
                  time: Date;
                };
              }) => {
                this.handleSocketChatData(socketData.data);
              }
            );
          }
        },
        () => {
          return this.router.navigate(['/log-in']);
        }
      );
  }
  private currentChatConnection(friendId: string) {
    this.userService.userToken
      .pipe(
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
      )
      .subscribe((result) => {
        if (result) {
          this.chatService.currentChatConnection.next(result.chatConnection);
        }
      });
  }
  scrollToBottom() {
    this.messageWrapper.nativeElement.scrollTop = this.messageWrapper.nativeElement.scrollHeight;
    this.runScrollToBottom = false;
    this.notificationCounter = 0;
  }
  setResetCounterObserver(element: Element) {
    if (this.resetCounterObserver) {
      this.resetCounterObserver.disconnect();
    }
    this.resetCounterObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.notificationCounter = 0;
        }
      },
      { threshold: [0.1] }
    );
    this.resetCounterObserver.observe(element);
  }
  sendMessage(message: string) {
    this.chatService.addMessage(message, this.groupId).subscribe(
      (result) => {
        console.log(result);
        if (result) {
          this.scrollToBottom();
        }
      },
      () => {
        return this.router.navigate(['/log-in']);
      }
    );
  }
  private handleSocketChatData(data: {
    text: string;
    userId: string;
    time: Date;
    pictureUrl: string;
  }) {
    this.userService.userToken.pipe(take(1)).subscribe((result) => {
      if (result) {
        let newMessage;
        if (result.userId === data.userId) {
          newMessage = {
            text: data.text,
            time: data.time,
            owner: true,
            userId: { _id: data.userId, pictureUrl: data.pictureUrl },
          };
        } else {
          newMessage = {
            text: data.text,
            time: data.time,
            owner: false,
            userId: { _id: data.userId, pictureUrl: data.pictureUrl },
          };
        }
        this.chats.push(newMessage);
        if (result.userId !== data.userId) {
          this.cd.detectChanges();
          const calculateHeight =
            this.messageWrapper.nativeElement.scrollHeight -
            (this.messageWrapper.nativeElement.scrollTop +
              this.messageWrapper.nativeElement.clientHeight);
          console.log(calculateHeight);
          if (calculateHeight > 200) {
            this.notificationCounter += 1;
            this.renderer.addClass(
              this.newMessageNotification.nativeElement,
              'show-new_msg-notification__wrapper'
            );
            setTimeout(() => {
              this.renderer.removeClass(
                this.newMessageNotification.nativeElement,
                'show-new_msg-notification__wrapper'
              );
            }, 4000);
          } else {
            this.scrollToBottom();
          }
        }
        this.renderer.setProperty(this.messageInput.nativeElement, 'value', '');
      }
    });
  }
  getMoreChats() {
    this.chatService.getMoreChats(this.groupId, this.page).subscribe(
      (result) => {
        if (result) {
          this.pushToChats(result.chats);
        }
        this.page += 1;
      },
      () => {
        return this.router.navigate(['/log-in']);
      }
    );
  }

  pushToChats(
    newChatArray: {
      owner: boolean;
      text: string;
      time: Date;
      userId: { _id: string; pictureUrl: string };
      _id: string;
    }[]
  ) {
    for (let eachChat of newChatArray) {
      const findChat = this.chats.find((singleChat) => {
        return singleChat._id === eachChat._id;
      });
      if (findChat) {
        this.renderer.setStyle(
          this.loadMore.nativeElement,
          'visibility',
          'hidden'
        );
        this.renderer.setStyle(this.loadMore.nativeElement, 'height', 0);
        this.observer.disconnect();
        break;
      }
    }
    newChatArray.reverse().forEach((eachChat) => {
      const findChat = this.chats.find((singleChat) => {
        return singleChat._id === eachChat._id;
      });
      if (!findChat) {
        this.chats.unshift(eachChat);
      }
    });
    this.cd.detectChanges();
    this.messageWrapper.nativeElement.scrollTop =
      this.messageWrapper.nativeElement.scrollHeight - this.prevScrollHeight;
    this.prevScrollHeight = this.messageWrapper.nativeElement.scrollHeight;
  }
  onClickNotification() {
    this.renderer.removeClass(
      this.newMessageNotification.nativeElement,
      'show-new_msg-notification__wrapper'
    );
    this.scrollToBottom();
  }
  ngOnDestroy() {
    this.chatService.showEmptySpace.next(true);
  }
}
