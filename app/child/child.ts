import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { CartService, EcommerceBook, CartItem } from '../cart-service/cart.service';

@Component({
  selector: 'app-child',
  imports: [],
  templateUrl: './child.html',
  styleUrl: './child.css',
})
export class Child implements OnInit {

  books: EcommerceBook[] = [];
  cartItemCount: number = 0;
  filteredBooks: EcommerceBook[] = [];


  @Input() message!: string;

  scrollLeft() {
  document.querySelector('.scroll-row')?.scrollBy({ left: -300, behavior: 'smooth' });
}
scrollRight() {
  document.querySelector('.scroll-row')?.scrollBy({ left: 300, behavior: 'smooth' });
}

constructor(private cartService: CartService) {}

  ngOnInit() {
    this.books = this.cartService.getMockBooks();
    this.filteredBooks = this.books;

    // Subscribe to cart changes
    this.cartService.cartItems$.subscribe(() => {
      this.cartItemCount = this.cartService.getCartItemCount();
    });
  }

  
}
