import { Router } from '@angular/router';
import { UserService, ResponseModel } from './../../services/user.service';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  myUser: any;

  constructor(
    private authService: SocialAuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.userData$
      .pipe(
        map((user) => {
          if (user instanceof SocialUser) {
            return {
              ...user,
              email: 'test@test.com',
            };
          } else {
            return user;
          }
        })
      )
      .subscribe((data: ResponseModel | SocialUser) => {
        this.myUser = data;

        console.log(this.myUser);
      });
  }

  logout() {
    this.userService.logout();
  }
}
