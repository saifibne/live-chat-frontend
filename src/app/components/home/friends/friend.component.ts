import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { UserService } from '../../../services/user.service';
import { UserInterface } from '../../../model/user.model';
import { faCommentDots } from '@fortawesome/free-regular-svg-icons';
import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { ChatService } from '../../../services/chat.service';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.component.html',
  styleUrls: ['./friend.component.css'],
})
export class FriendComponent implements OnInit {
  chatIcon = faCommentDots;
  calenderIcon = faCalendar;
  emailIcon = faEnvelope;
  user!: UserInterface;
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private chatService: ChatService,
    private router: Router
  ) {}
  ngOnInit() {
    this.chatService.showEmptySpace.next(false);
    this.route.queryParams
      .pipe(
        switchMap((result) => {
          return this.userService.getFriendDetails(result['friendId']);
        })
      )
      .subscribe((result) => {
        this.user = result.userDetails;
      });
  }
  getChatConnection(friendId: string) {
    this.chatService
      .getParticularChatConnection(friendId)
      .subscribe((result) => {
        if (result) {
          this.router
            .navigate(['/home/chats/chat'], {
              queryParams: { chatId: result.chatConnection._id },
            })
            .then(() => {
              this.chatService.latestChatConnection.next(result.chatConnection);
            });
        }
      });
  }
}
