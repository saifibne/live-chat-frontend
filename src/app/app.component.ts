import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  showProgressBar!: boolean;
  constructor(
    private userService: UserService,
    private cd: ChangeDetectorRef
  ) {}
  ngOnInit() {
    this.userService.autoLogin();
    this.userService.showProgressBar.subscribe((result) => {
      this.showProgressBar = result;
      this.cd.detectChanges();
    });
  }
}
