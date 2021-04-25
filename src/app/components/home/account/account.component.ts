import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { UserInterface } from '../../../model/user.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent implements OnInit {
  user!: UserInterface;
  form!: FormGroup;
  constructor(private userService: UserService) {}
  ngOnInit() {
    this.userService.getOwnerDetails().subscribe((result) => {
      if (result) {
        this.user = result.userDetails;
        this.form = new FormGroup({
          firstName: new FormControl(result.userDetails.name.split(' ')[0]),
          lastName: new FormControl(
            result.userDetails.name.split(' ').slice(1).join(' ')
          ),
          phoneNo: new FormControl(
            result.userDetails.phoneNo ? result.userDetails.phoneNo : null,
            [
              Validators.pattern('[0-9]*'),
              Validators.minLength(10),
              Validators.maxLength(10),
            ]
          ),
          birthDate: new FormControl(
            result.userDetails.birthDate
              ? moment(new Date(result.userDetails.birthDate))
              : null
          ),
          email: new FormControl(result.userDetails.email, [
            Validators.required,
            Validators.email,
          ]),
          address: new FormControl(
            result.userDetails.address ? result.userDetails.address : null
          ),
        });
      }
    });
  }
  onSubmit() {
    const firstName = this.form.get('firstName')?.value;
    const lastName = this.form.get('lastName')?.value;
    const phoneNo = this.form.get('phoneNo')?.value;
    const address = this.form.get('address')?.value;
    const email = this.form.get('email')?.value;
    const birthDate = this.form.get('birthDate')?.value.toDate();
    console.log(birthDate);
    this.userService
      .changeUserData(
        this.user._id,
        firstName,
        lastName,
        phoneNo,
        email,
        address,
        birthDate
      )
      .subscribe((result) => {
        console.log(result);
      });
  }
}
