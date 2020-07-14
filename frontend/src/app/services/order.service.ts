import { environment } from './../../environments/environment';
import { ProductModel } from './../models/product.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private SERVER_URL = environment.SERVER_URL;
  private products: ProductModel[] = [];

  constructor(private http: HttpClient) {}

  getSingleOrder(orderId: number) {
    return this.http
      .get<ProductResponseModel[]>(this.SERVER_URL + '/orders/' + orderId)
      .toPromise();
  }
}

interface ProductResponseModel {
  id: number;
  title: string;
  description: string;
  price: number;
  quantityOrdered: number;
  image: string;
}
