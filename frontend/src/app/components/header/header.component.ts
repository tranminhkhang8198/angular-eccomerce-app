import { UserService } from './../../services/user.service';
import { CartService } from './../../services/cart.service';
import { CartModelServer } from './../../models/cart.model';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  cartData: CartModelServer;
  cartTotal: number;
  authState: boolean;

  constructor(
    private cartService: CartService,
    public userService: UserService
  ) {}

  ngOnInit(): void {
    this.cartService.cartTotal$.subscribe((total) => (this.cartTotal = total));
    this.cartService.cartData$.subscribe((data) => (this.cartData = data));

    this.userService.authState$.subscribe(
      (authState) => (this.authState = authState)
    );
  }
}
