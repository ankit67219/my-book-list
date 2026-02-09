import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem, ShippingAddress } from '../cart-service/cart.service';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
  standalone: true,
})
export class Checkout implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  shippingCost: number = 0;
  tax: number = 0;
  grandTotal: number = 0;

  // Shipping form
  shippingAddress: ShippingAddress = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  };

  // Validation flags
  formSubmitted: boolean = false;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      if (this.cartItems.length === 0) {
        this.router.navigate(['/cart']);
      }
      this.calculateTotals();
    });
  }

  calculateTotals() {
    this.cartTotal = this.cartService.getCartTotal();
    this.shippingCost = this.cartTotal > 50 ? 0 : 5.99;
    this.tax = this.cartTotal * 0.1;
    this.grandTotal = this.cartTotal + this.shippingCost + this.tax;
  }

  // Validate form
  isFormValid(): boolean {
    return (
      this.shippingAddress.fullName.trim() !== '' &&
      this.shippingAddress.email.trim() !== '' &&
      this.shippingAddress.phone.trim() !== '' &&
      this.shippingAddress.address.trim() !== '' &&
      this.shippingAddress.city.trim() !== '' &&
      this.shippingAddress.state.trim() !== '' &&
      this.shippingAddress.zipCode.trim() !== '' &&
      this.shippingAddress.country.trim() !== ''
    );
  }

  // Place order
  placeOrder() {
    this.formSubmitted = true;

    if (!this.isFormValid()) {
      alert('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.shippingAddress.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Place order
    const order = this.cartService.placeOrder(this.shippingAddress);

    alert(
      `Order placed successfully!\nOrder ID: ${order.id}\n\nThank you for your purchase!`
    );

    this.router.navigate(['/order-history']);
  }

  // Go back to cart
  backToCart() {
    this.router.navigate(['/cart']);
  }
}
