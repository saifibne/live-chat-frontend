import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  take,
} from 'rxjs/operators';

import { faBell } from '@fortawesome/free-solid-svg-icons';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle as correctIcon } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../../services/user.service';
import { FriendListInterface, SearchUser } from '../../../model/user.model';
import { ChatConnectionModel } from '../../../model/chat.model';
import { ChatService } from '../../../services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
  bellIcon = faBell;
  optionIcon = faEllipsisV;
  userIcon = faUserPlus;
  crossIcon = faTimesCircle;
  rightIcon = faCheckCircle;
  correctIcon = correctIcon;
  userInfoIcon = faUser;
  popSearchText: string = '';
  headingText!: string;
  showEmail!: boolean;
  searchArrayText = '';
  showDropDown = false;
  showLoading = false;
  userId: string | undefined;
  showEmptySpace!: boolean;
  params!: string;
  arr = Array;
  loadingContainerNumber!: number;
  showLoadingChats!: boolean;
  userDetails!: { name: string; pictureUrl: string };
  searchedUsers: SearchUser[] = [];
  chatConnections!: ChatConnectionModel[] | undefined;
  existingConnection: ChatConnectionModel | undefined;
  particularConnection: ChatConnectionModel | undefined;
  friends: FriendListInterface[] | undefined;
  notifications: { message: string; imageUrl: string }[] = [];
  pendingRequest: {
    userId: { _id: string; name: string; pictureUrl: string };
  }[] = [];
  searchText = new Subject<string>();
  searchSubscriber!: Subscription;
  userSubject!: Subscription;
  chatConnectionSubscription!: Subscription;
  latestChatConnectionSubscription!: Subscription;
  @ViewChild('popupWrapper') popupWrapper!: ElementRef;
  @ViewChild('searchWrapper') searchWrapper!: ElementRef;
  @ViewChild('dropDown') dropDown!: ElementRef;
  @ViewChild('notification') notification!: ElementRef;
  @ViewChild('successNotification') successNotification!: ElementRef;
  @ViewChild('friendRequestWrapper') friendRequestWrapper!: ElementRef;
  @ViewChild('friendRequestPanel') friendRequestPanel!: ElementRef;
  @ViewChild('notificationWrapper') notificationWrapper!: ElementRef;
  @ViewChild('notificationPanel') notificationPanel!: ElementRef;
  @ViewChild('chatsWrapper') chatsWrapper!: ElementRef;
  @ViewChild('searchInputField') searchInputField!: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private renderer: Renderer2,
    private chatService: ChatService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}
  ngOnInit() {
    this.chatService.showEmptySpace.subscribe((result) => {
      this.showEmptySpace = result;
      this.cd.detectChanges();
    });
    this.route.params
      .pipe(
        switchMap((params) => {
          this.existingConnection = undefined;
          this.particularConnection = undefined;
          this.chatConnections = undefined;
          this.friends = undefined;
          this.showEmptySpace = true;
          if (params['linkName'] === 'friends') {
            this.params = 'friends';
            if (this.chatConnectionSubscription) {
              this.chatConnectionSubscription.unsubscribe();
            }
            this.headingText = 'Friends';
            this.showEmail = true;
            this.getUserData();
            this.showLoadingChats = true;
            return this.userService.getFriendsList();
          } else {
            this.params = 'chats';
            this.latestChatConnection();
            this.currentConnection();
            this.headingText = 'chats';
            this.showEmail = false;
            this.getUserData();
            this.showLoadingChats = true;
            return this.userService.chatConnections();
          }
        })
      )
      .subscribe(
        (result: any) => {
          if (result) {
            if (+result.code === 1223) {
              this.showLoadingChats = false;
              this.friends = result.friends;
            } else if (+result.code === 1224) {
              this.showLoadingChats = false;
              if (this.existingConnection) {
                const existingConnectionIndex = result.chatConnections.findIndex(
                  (eachConnection: { _id: string }) => {
                    return eachConnection._id === this.existingConnection?._id;
                  }
                );
                if (existingConnectionIndex !== -1) {
                  const newChatConnections = [...result.chatConnections];
                  newChatConnections.splice(existingConnectionIndex, 1);
                  this.chatConnections = [
                    this.existingConnection,
                    ...newChatConnections,
                  ];
                } else {
                  this.chatConnections = [
                    this.existingConnection,
                    ...result.chatConnections,
                  ];
                }
              } else if (this.particularConnection) {
                const existingConnectionIndex = result.chatConnections.findIndex(
                  (eachConnection: { _id: string }) => {
                    return (
                      eachConnection._id === this.particularConnection?._id
                    );
                  }
                );
                if (existingConnectionIndex === -1) {
                  this.chatConnections = [
                    this.particularConnection,
                    ...result.chatConnections,
                  ];
                }
              } else {
                this.chatConnections = result.chatConnections;
              }
            }
          }
        },
        () => {
          return this.router.navigate(['/log-in']);
        }
      );
    this.userSubject = this.userService.userDataSubject.subscribe((result) => {
      this.notifications = result.notifications;
      this.pendingRequest = result.pendingRequests;
      this.userDetails = { name: result.name, pictureUrl: result.pictureUrl };
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
  ngAfterViewInit() {
    const chatsWrapperHeight =
      this.chatsWrapper.nativeElement.clientHeight - 20;
    this.loadingContainerNumber = Math.floor(chatsWrapperHeight / 88);
    this.cd.detectChanges();
  }

  private latestChatConnection() {
    this.chatConnectionSubscription = this.chatService.latestChatConnection.subscribe(
      (result) => {
        this.existingConnection = result;
      },
      () => {
        return this.router.navigate(['/log-in']);
      }
    );
  }
  private currentConnection() {
    this.latestChatConnectionSubscription = this.chatService.currentChatConnection.subscribe(
      (result) => {
        this.particularConnection = result;
        if (this.chatConnections) {
          const existingConnectionIndex = this.chatConnections.findIndex(
            (eachConnection: { _id: string }) => {
              return eachConnection._id === this.particularConnection?._id;
            }
          );
          if (existingConnectionIndex === -1) {
            this.chatConnections = [
              this.particularConnection,
              ...this.chatConnections,
            ];
          }
        }
      }
    );
  }
  private getUserData() {
    this.userService.showProgressBar.next(true);
    this.userService.userData().subscribe(
      () => {
        this.userService.showProgressBar.next(false);
      },
      () => {
        return this.router.navigate(['/log-in']);
      }
    );
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
  showFriendRequests() {
    this.renderer.setStyle(
      this.friendRequestWrapper.nativeElement,
      'visibility',
      'visible'
    );
    this.renderer.addClass(
      this.friendRequestPanel.nativeElement,
      'show-search__popup'
    );
  }
  closeFriendRequests() {
    setTimeout(() => {
      this.renderer.removeStyle(
        this.friendRequestWrapper.nativeElement,
        'visibility'
      );
    }, 200);
    this.renderer.removeClass(
      this.friendRequestPanel.nativeElement,
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
    this.renderer.setProperty(this.searchInputField.nativeElement, 'value', '');
    this.popSearchText = '';
  }
  sendRequest(userId: string) {
    this.userId = userId;
    this.showLoading = true;
    this.userService
      .sendFriendRequest(userId)
      .pipe(take(1))
      .subscribe((result) => {
        if (result) {
          this.userId = undefined;
          this.showLoading = false;
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
  clickAccept(userId: string) {
    this.userService.acceptFriendRequest(userId).subscribe(
      () => {
        this.closeFriendRequests();
        this.getUserData();
      },
      () => {
        return this.router.navigate(['/log-in']);
      }
    );
  }
  clickReject(userId: string) {
    this.userService.rejectFriendRequest(userId).subscribe(
      () => {
        this.closeFriendRequests();
        this.getUserData();
      },
      () => {
        return this.router.navigate(['/log-in']);
      }
    );
  }
  openNotificationPanel() {
    this.renderer.setStyle(
      this.notificationWrapper.nativeElement,
      'visibility',
      'visible'
    );
    this.renderer.addClass(
      this.notificationPanel.nativeElement,
      'show-search__popup'
    );
  }
  closeNotificationPanel() {
    setTimeout(() => {
      this.renderer.removeStyle(
        this.notificationWrapper.nativeElement,
        'visibility'
      );
    }, 200);
    this.renderer.removeClass(
      this.notificationPanel.nativeElement,
      'show-search__popup'
    );
  }
  clearNotifications() {
    this.userService.clearNotifications().subscribe(
      () => {
        this.closeNotificationPanel();
        this.getUserData();
      },
      () => {
        return this.router.navigate(['/log-in']);
      }
    );
  }
  ngOnDestroy() {
    this.searchSubscriber.unsubscribe();
    this.userSubject.unsubscribe();
    if (this.chatConnectionSubscription) {
      this.chatConnectionSubscription.unsubscribe();
    }
    if (this.latestChatConnectionSubscription) {
      this.latestChatConnectionSubscription.unsubscribe();
    }
  }
}
