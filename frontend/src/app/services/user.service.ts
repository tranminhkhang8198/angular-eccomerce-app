import { BehaviorSubject } from 'rxjs';
import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  SocialAuthService,
  SocialUser,
  GoogleLoginProvider,
} from 'angularx-social-login';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  auth: boolean = false;
  private SERVER_URL = environment.SERVER_URL;
  private user;
  authState$ = new BehaviorSubject<boolean>(this.auth);
  userData$ = new BehaviorSubject<SocialUser | ResponseModel>(null);
  userRole: number;

  constructor(
    private authService: SocialAuthService,
    private httpClient: HttpClient
  ) {
    // console.log(this.isLoggedIn);

    authService.authState.subscribe((user: SocialUser) => {
      if (user != null) {
        this.auth = true;
        this.authState$.next(this.auth);
        this.userData$.next(user);
      }
    });
  }

  // Login user with email and password
  loginUser(email: string, password: string) {
    this.httpClient
      .post(`${this.SERVER_URL}/auth/login`, { email, password })
      .subscribe((data: ResponseModel) => {
        this.auth = data.auth;
        this.authState$.next(this.auth);
        this.userData$.next(data);
        localStorage.setItem('access_token', data.token);
      });
  }

  get isLoggedIn(): boolean {
    let authToken = localStorage.getItem('access_token');
    return authToken !== null ? true : false;
  }

  // Google Authentication
  googleLogin() {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  logout() {
    this.authService.signOut();
    this.auth = false;
    this.authState$.next(this.auth);
    localStorage.removeItem('access_token');
  }
}

export interface ResponseModel {
  token: string;
  auth: boolean;
  email: string;
  fname: string;
  lname: string;
  photoUrl: string;
  userId: number;
}
