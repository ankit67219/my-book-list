import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../cart-service/cart.service';

@Component({
  selector: 'app-shopping-cart',
  imports: [CommonModule],
  templateUrl: './shopping-cart.html',
  styleUrl: './shopping-cart.css',
  standalone: true,
})
export class ShoppingCart implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  itemCount: number = 0;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.cartTotal = this.cartService.getCartTotal();
      this.itemCount = this.cartService.getCartItemCount();
    });
  }

  // Update quantity
  updateQuantity(bookId: string, quantity: number) {
    if (quantity > 0) {
      this.cartService.updateQuantity(bookId, quantity);
    }
  }

  // Increase quantity
  increaseQuantity(bookId: string) {
    const item = this.cartItems.find(i => i.book.id === bookId);
    if (item) {
      this.cartService.updateQuantity(bookId, item.quantity + 1);
    }
  }

  // Decrease quantity
  decreaseQuantity(bookId: string) {
    const item = this.cartItems.find(i => i.book.id === bookId);
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(bookId, item.quantity - 1);
    }
  }

  // Remove item
  removeItem(bookId: string) {
    this.cartService.removeFromCart(bookId);
  }

  // Clear cart
  clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  // Continue shopping
  continueShopping() {
    this.router.navigate(['/store']);
  }

  // Proceed to checkout
  proceedToCheckout() {
    if (this.cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    this.router.navigate(['/checkout']);
  }
}
