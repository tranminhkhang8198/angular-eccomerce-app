import { ServerResponse, ProductModel } from './../models/product.model';
import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private SERVER_URL = environment.SERVER_URL;
  constructor(private http: HttpClient) {}

  getAllProducts(numberOfResults = 10): Observable<ServerResponse> {
    return this.http.get<ServerResponse>(this.SERVER_URL + '/products', {
      params: {
        limit: numberOfResults.toString(),
      },
    });
  }

  getSingleProduct(id: number): Observable<ProductModel> {
    return this.http.get<ProductModel>(this.SERVER_URL + '/products/' + id);
  }

  getProductsFromCategory(categoryName: string): Observable<ProductModel[]> {
    return this.http.get<ProductModel[]>(
      this.SERVER_URL + '/products/category/' + categoryName
    );
  }
}
