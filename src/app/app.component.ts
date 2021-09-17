import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { UserService } from './services/user.service';
import { Store } from '@ngrx/store';
import { AppStateInterface } from './store/store.reducer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  showProgressBar!: boolean;
  constructor(
    private userService: UserService,
    private cd: ChangeDetectorRef,
    private store: Store<AppStateInterface>
  ) {}
  ngOnInit() {
    this.userService.autoLogin();
    // this.userService.showProgressBar.subscribe((result) => {
    //   this.showProgressBar = result;
    //   this.cd.detectChanges();
    // });
    this.store.select('userDetails').subscribe((result) => {
      this.showProgressBar = result.loadingState;
      this.cd.detectChanges();
    });
  }
}
