import { ProductModel } from './../models/product.model';
import { ProductService } from './product.service';
import { CartModelPublic, CartModelServer } from './../models/cart.model';
import { environment } from './../../environments/environment';
import { OrderService } from './order.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationExtras } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private SERVER_URL = environment.SERVER_URL;

  // Data variable to store the cart information on the client's local storage
  private cartDataClient: CartModelPublic = {
    total: 0,
    productsData: [
      {
        inCart: 0,
        id: 0,
      },
    ],
  };

  // Data variable to store cart information on the server
  private cartDataServer: CartModelServer = {
    total: 0,
    data: [
      {
        numInCart: 0,
        product: undefined,
      },
    ],
  };

  // OBSERVABLES FOR THE COMPONENTS TO SUBSCRIBE
  cartTotal$ = new BehaviorSubject<number>(0);
  cartData$ = new BehaviorSubject<CartModelServer>(this.cartDataServer);

  constructor(
    private http: HttpClient,
    private productService: ProductService,
    private orderService: OrderService,
    private router: Router,
    private toast: ToastrService,
    private spinner: NgxSpinnerService
  ) {
    this.cartTotal$.next(this.cartDataServer.total);
    this.cartData$.next(this.cartDataServer);

    // get the information from local storage (if any)
    let cartLocalStorage: CartModelPublic = JSON.parse(
      localStorage.getItem('cart')
    );

    // Check if the info variable is null or has some data in it
    if (
      cartLocalStorage !== null &&
      cartLocalStorage !== undefined &&
      cartLocalStorage.productsData[0].inCart !== 0
    ) {
      // Local storage if not empty has some information
      this.cartDataClient = cartLocalStorage;

      // Loop through each entry and put it the cartDataServer object
      this.cartDataClient.productsData.forEach((productData) => {
        this.productService
          .getSingleProduct(productData.id)
          .subscribe((productResponse: ProductModel) => {
            if (this.cartDataServer.data[0].numInCart === 0) {
              this.cartDataServer.data[0].numInCart = productData.inCart;
              this.cartDataServer.data[0].product = productResponse;
            } else {
              // CartDataServer already has some entry in it
              this.cartDataServer.data.push({
                numInCart: productData.inCart,
                product: productResponse,
              });
            }

            this.CalculateTotal();

            this.cartData$.next({ ...this.cartDataServer });
            this.cartTotal$.next(this.cartDataServer.total);
          });
      });
    }
  }

  AddProductToCart(id: number, quantity?: number) {
    this.productService.getSingleProduct(id).subscribe((product) => {
      // 1. If the cart is empty
      if (this.cartDataServer.data[0].product === undefined) {
        this.cartDataServer.data[0].product = product;
        this.cartDataServer.data[0].numInCart =
          quantity !== undefined ? quantity : 1;

        // CALCULATE TOTAL AMOUNT
        this.CalculateTotal();

        this.cartDataClient.productsData[0].inCart = this.cartDataServer.data[0].numInCart;
        this.cartDataClient.productsData[0].id = product.id;
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
        this.cartData$.next({ ...this.cartDataServer });

        // DISPLAY A TOAST NOTIFICATION
        this.toast.success(
          `${product.name} added to the cart`,
          'Product Added',
          {
            timeOut: 1500,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-top-right',
          }
        );
      } else {
        // 2. If the cart has some items
        const index = this.cartDataServer.data.findIndex(
          (data) => data.product.id === product.id
        );

        // a. If that item is already in the cart => index is positive value
        if (index !== -1) {
          if (quantity !== undefined && quantity <= product.quantity) {
            this.cartDataServer.data[index].numInCart =
              this.cartDataServer.data[index].numInCart < product.quantity
                ? quantity
                : product.quantity;
          } else {
            this.cartDataServer.data[index].numInCart < product.quantity
              ? this.cartDataServer.data[index].numInCart++
              : product.quantity;

            this.cartDataServer.data[index].numInCart =
              this.cartDataServer.data[index].numInCart < product.quantity
                ? this.cartDataServer.data[index].numInCart++
                : product.quantity;
          }

          this.cartDataClient.productsData[
            index
          ].inCart = this.cartDataServer.data[index].numInCart;

          this.CalculateTotal();
          this.cartDataClient.total = this.cartDataServer.total;

          localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          this.cartData$.next({ ...this.cartDataServer });

          // DISPLAY A TOAST NOTIFICATION
          this.toast.info(
            `${product.name} quantity updated in the cart`,
            'Product Updated',
            {
              timeOut: 1500,
              progressBar: true,
              progressAnimation: 'increasing',
              positionClass: 'toast-top-right',
            }
          );
        } else {
          // b. If that item not in the cart
          this.cartDataServer.data.push({
            numInCart: 1,
            product,
          });

          this.cartDataClient.productsData.push({
            inCart: 1,
            id: product.id,
          });

          // DISPLAY A TOAST NOTIFICATION
          this.toast.success(
            `${product.name} added to the cart`,
            'Product Added',
            {
              timeOut: 1500,
              progressBar: true,
              progressAnimation: 'increasing',
              positionClass: 'toast-top-right',
            }
          );

          // CALCULATE TOTAL AMOUNT
          this.CalculateTotal();
          this.cartDataClient.total = this.cartDataServer.total;
          localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          this.cartData$.next({ ...this.cartDataServer });
        }
      }
    });
  }

  UpdateCartItems(index: number, increase: boolean) {
    let data = this.cartDataServer.data[index];

    if (increase) {
      data.numInCart < data.product.quantity
        ? data.numInCart++
        : data.product.quantity;
      this.cartDataClient.productsData[index].inCart = data.numInCart;

      // CALCULATE TOTAL AMOUNT
      this.CalculateTotal();
      this.cartDataClient.total = this.cartDataServer.total;
      localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      this.cartData$.next({ ...this.cartDataServer });
    } else {
      data.numInCart--;

      if (data.numInCart < 1) {
        if (!this.DeleteProductFromCart(index)) {
          data.numInCart++;
        }
        this.cartData$.next({ ...this.cartDataServer });
      } else {
        this.cartData$.next({ ...this.cartDataServer });
        this.cartDataClient.productsData[index].inCart = data.numInCart;

        // CALCULATE TOTAL AMOUNT
        this.CalculateTotal();
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      }
    }
  }

  DeleteProductFromCart(index: number) {
    if (window.confirm('Are you sure you want to remove the item?')) {
      this.cartDataServer.data.splice(index, 1);
      this.cartDataClient.productsData.splice(index, 1);

      // TODO CALCULATE AMOUNT
      this.CalculateTotal();
      this.cartDataClient.total = this.cartDataServer.total;

      if (this.cartDataClient.total === 0) {
        this.cartDataClient = {
          total: 0,
          productsData: [{ inCart: 0, id: 0 }],
        };

        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      } else {
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      }

      if (this.cartDataServer.total === 0) {
        this.cartDataServer = {
          total: 0,
          data: [
            {
              numInCart: 0,
              product: undefined,
            },
          ],
        };

        this.cartData$.next({ ...this.cartDataServer });
      } else {
        this.cartData$.next({ ...this.cartDataServer });
      }
    } else {
      return false;
    }
  }

  private CalculateTotal() {
    let total = 0;

    this.cartDataServer.data.forEach((data) => {
      const { numInCart } = data;
      const { price } = data.product;

      total += numInCart * price;
    });

    this.cartDataServer.total = total;
    this.cartTotal$.next(this.cartDataServer.total);
  }

  calculateSubTotal(index: number) {
    let subTotal = 0;

    const data = this.cartDataServer.data[index];

    subTotal = data.product.price * data.numInCart;

    return subTotal;
  }

  CheckoutFromCart(userId: number) {
    this.http
      .post(`${this.SERVER_URL}/orders/payment`, null)
      .subscribe((res: { success: boolean }) => {
        if (res.success) {
          this.http
            .post(`${this.SERVER_URL}/orders/new`, {
              userId,
              products: this.cartDataClient.productsData,
            })
            .subscribe((data: OrderResponse) => {
              this.orderService
                .getSingleOrder(data.order_id)
                .then((products) => {
                  console.log(products);
                  if (data.success) {
                    const navigationExtras: NavigationExtras = {
                      state: {
                        message: data.message,
                        products,
                        orderId: data.order_id,
                        total: this.cartDataClient.total,
                      },
                    };

                    // HIDE SPINNER
                    this.spinner.hide().then();
                    this.router
                      .navigate(['/thankyou'], navigationExtras)
                      .then((response) => {
                        this.cartDataClient = {
                          total: 0,
                          productsData: [
                            {
                              inCart: 0,
                              id: 0,
                            },
                          ],
                        };
                        this.cartTotal$.next(0);
                        localStorage.setItem(
                          'cart',
                          JSON.stringify(this.cartDataClient)
                        );
                      });

                    this.resetSeverData();
                  } else {
                    this.spinner.hide().then();
                    this.router.navigateByUrl('/checkout').then();

                    this.toast.error(
                      'Sorry, failed to book the order',
                      'Order Status',
                      {
                        timeOut: 1500,
                        progressBar: true,
                        progressAnimation: 'increasing',
                        positionClass: 'toast-top-right',
                      }
                    );
                  }
                });
            });
        }
      });
  }

  private resetSeverData() {
    this.cartDataServer = {
      total: 0,
      data: [
        {
          numInCart: 0,
          product: undefined,
        },
      ],
    };

    this.cartData$.next({ ...this.cartDataServer });
  }
}

interface OrderResponse {
  order_id: number;
  success: boolean;
  message: string;
  products: [
    {
      id: string;
      numInCart: number;
    }
  ];
}
