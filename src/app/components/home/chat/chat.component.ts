import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';

import { faBell } from '@fortawesome/free-solid-svg-icons';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { UserService } from '../../../services/user.service';
import { SearchUser } from '../../../model/user.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  bellIcon = faBell;
  optionIcon = faEllipsisV;
  userIcon = faUserPlus;
  crossIcon = faTimesCircle;
  rightIcon = faCheckCircle;
  popSearchText: string = '';
  headingText!: string;
  showEmail!: boolean;
  showText!: boolean;
  showDropDown = false;
  searchedUsers: SearchUser[] = [];
  searchText = new Subject<string>();
  searchSubscriber!: Subscription;
  userSubject!: Subscription;
  @ViewChild('popupWrapper') popupWrapper!: ElementRef;
  @ViewChild('searchWrapper') searchWrapper!: ElementRef;
  @ViewChild('dropDown') dropDown!: ElementRef;
  @ViewChild('notification') notification!: ElementRef;
  @ViewChild('successNotification') successNotification!: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private renderer: Renderer2
  ) {}
  ngOnInit() {
    this.route.params.subscribe((param) => {
      if (param['linkName'] === 'friends') {
        this.headingText = 'Friends';
        this.showEmail = true;
        this.showText = false;
        this.userService.userData().subscribe();
      } else {
        this.headingText = 'chats';
        this.showEmail = false;
        this.showText = true;
        this.userService.userData().subscribe();
      }
    });
    this.userSubject = this.userService.userDataSubject.subscribe((result) => {
      console.log(result);
    });
    this.searchSubscriber = this.searchText
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((result) => {
          if (result.length > 0) {
            return this.userService.searchUser(result);
          } else {
            return of(null);
          }
        })
      )
      .subscribe((result) => {
        if (result) {
          this.searchedUsers = result.users;
        } else {
          this.searchedUsers = [];
        }
      });
  }
  onSearch() {
    this.searchText.next(this.popSearchText);
  }
  clickAddUser() {
    this.showDropDown = false;
    if (this.dropDown) {
      this.renderer.removeClass(
        this.dropDown.nativeElement,
        'show-option__dropdown'
      );
    }
    this.renderer.setStyle(
      this.popupWrapper.nativeElement,
      'visibility',
      'visible'
    );
    this.renderer.addClass(
      this.searchWrapper.nativeElement,
      'show-search__popup'
    );
  }
  clickDropDown() {
    this.showDropDown = !this.showDropDown;
    if (this.showDropDown) {
      this.renderer.addClass(
        this.dropDown.nativeElement,
        'show-option__dropdown'
      );
    } else {
      this.renderer.removeClass(
        this.dropDown.nativeElement,
        'show-option__dropdown'
      );
    }
  }
  closeAddUser() {
    this.searchedUsers = [];
    setTimeout(() => {
      this.renderer.removeStyle(this.popupWrapper.nativeElement, 'visibility');
    }, 200);
    this.renderer.removeClass(
      this.searchWrapper.nativeElement,
      'show-search__popup'
    );
  }
  sendRequest(userId: string) {
    this.userService.sendFriendRequest(userId).subscribe((result) => {
      console.log(result);
      if (result) {
        if (result.code === 202) {
          this.renderer.addClass(
            this.notification.nativeElement,
            'show-notification'
          );
          setTimeout(() => {
            this.renderer.removeClass(
              this.notification.nativeElement,
              'show-notification'
            );
          }, 2000);
        } else if (result.code === 200) {
          this.renderer.addClass(
            this.successNotification.nativeElement,
            'show-notification'
          );
          setTimeout(() => {
            this.renderer.removeClass(
              this.successNotification.nativeElement,
              'show-notification'
            );
          }, 2000);
        }
      }
    });
  }
  ngOnDestroy() {
    this.searchSubscriber.unsubscribe();
    this.userSubject.unsubscribe();
  }
}
