import { CartService } from './../../services/cart.service';
import { ProductModel, ServerResponse } from './../../models/product.model';
import { ProductService } from './../../services/product.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  products: ProductModel[] = [];

  constructor(
    private productService: ProductService,
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.productService
      .getAllProducts()
      .subscribe((response: ServerResponse) => {
        this.products = response.products;
        // console.log(this.products);
      });
  }

  onSelectProduct(id: number) {
    this.router.navigate(['/products', id]);
  }

  onAddToCart(id: number) {
    this.cartService.AddProductToCart(id);
  }
}
