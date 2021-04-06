import {
  AfterViewChecked,
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
export class MessageComponent implements OnInit, AfterViewChecked {
  groupId: string = '';
  socketEventName!: string;
  userDetails!: {
    _id: string;
    userId: { _id: string; name: string; pictureUrl: string };
  };
  chats: {
    owner: boolean;
    text: string;
    time: Date;
    userId: { _id: string; pictureUrl: string };
  }[] = [];
  runScrollToBottom = true;
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('messageWrapper') messageWrapper!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private userService: UserService,
    private renderer: Renderer2
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
        console.log(result);
        if (result) {
          this.userDetails = result.user;
          this.chats = result.chats;
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
              console.log(socketData);
              this.handleSocketChatData(socketData.data);
              console.log(this.chats);
            }
          );
        }
      });
  }
  ngAfterViewChecked() {
    this.scrollToBottom();
  }
  scrollToBottom() {
    this.messageWrapper.nativeElement.scrollTop = this.messageWrapper.nativeElement.scrollHeight;
    this.runScrollToBottom = false;
  }
  sendMessage(message: string) {
    this.chatService.addMessage(message, this.groupId).subscribe((result) => {
      console.log(result);
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
}
