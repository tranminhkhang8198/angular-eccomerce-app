import { UserService } from './../../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SocialAuthService } from 'angularx-social-login';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  inputEmail: string;
  inputPassword: string;

  constructor(
    private authService: SocialAuthService,
    private router: Router,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userService.authState$.subscribe((authState) => {
      if (authState) {
        this.router.navigateByUrl(
          this.route.snapshot.queryParams['returnUrl'] || '/profile'
        );
      } else {
        this.router.navigateByUrl('/login');
      }
    });
  }

  login(form: NgForm) {
    const email: string = this.inputEmail;
    const password: string = this.inputPassword;

    if (form.invalid) {
      return;
    }

    form.reset();
    this.userService.loginUser(email, password);
  }

  signInWithGoogle() {
    this.userService.googleLogin();
  }
}
