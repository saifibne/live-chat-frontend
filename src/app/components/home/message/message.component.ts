import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../../services/chat.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
})
export class MessageComponent implements OnInit, AfterViewChecked {
  groupId!: string;
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
  slideContainerPixel = 0;
  runScrollToBottom = true;
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('messageWrapper') messageWrapper!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((result) => {
      this.groupId = result['chatId'];
      this.chatService.getChat(result.chatId).subscribe((result) => {
        // console.log(result);
        if (result) {
          this.userDetails = result.user;
          this.chats = result.chats;
        }
      });
    });
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
  ngAfterViewChecked() {
    this.scrollToBottom();
  }
}
