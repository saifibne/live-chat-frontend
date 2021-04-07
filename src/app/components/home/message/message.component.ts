import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ChatService } from '../../../services/chat.service';
import { io } from 'socket.io-client';
import { UserService } from '../../../services/user.service';
import { mergeMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
})
export class MessageComponent implements OnInit {
  groupId: string = '';
  socketEventName!: string;
  showLoadMore = false;
  prevScrollHeight!: number;
  page!: number;
  observer!: IntersectionObserver;
  userDetails!: {
    _id: string;
    userId: { _id: string; name: string; pictureUrl: string };
  };
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

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private userService: UserService,
    private renderer: Renderer2,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const socket = io('http://localhost:3000');
    this.route.queryParams
      .pipe(
        mergeMap((result: Params) => {
          this.groupId = result['chatId'];
          return this.chatService.getChat(result.chatId);
        })
      )
      .subscribe((result) => {
        if (result) {
          this.page = 1;
          this.userDetails = result.user;
          this.chats = result.chats;
          if (this.observer) {
            this.observer.disconnect();
          }
          if (!result.pagination) {
            this.renderer.setStyle(
              this.loadMore.nativeElement,
              'display',
              'none'
            );
          } else {
            this.renderer.removeStyle(this.loadMore.nativeElement, 'display');
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
      });
  }
  scrollToBottom() {
    this.messageWrapper.nativeElement.scrollTop = this.messageWrapper.nativeElement.scrollHeight;
    this.runScrollToBottom = false;
  }
  sendMessage(message: string) {
    this.chatService.addMessage(message, this.groupId).subscribe((result) => {
      if (result) {
        this.scrollToBottom();
      }
    });
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
        this.renderer.setProperty(this.messageInput.nativeElement, 'value', '');
      }
    });
  }
  getMoreChats() {
    this.chatService
      .getMoreChats(this.groupId, this.page)
      .subscribe((result) => {
        if (result) {
          this.pushToChats(result.chats);
        }
        this.page += 1;
      });
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
        this.renderer.setStyle(this.loadMore.nativeElement, 'display', 'none');
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
}
