import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { UserService } from '../../../services/user.service';
import { UserInterface } from '../../../model/user.model';
import { faCommentDots } from '@fortawesome/free-regular-svg-icons';
import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';

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
    private userService: UserService
  ) {}
  ngOnInit() {
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
}
