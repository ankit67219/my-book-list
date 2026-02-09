import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, EcommerceBook } from '../cart-service/cart.service';

@Component({
  selector: 'app-book-store',
  imports: [CommonModule, FormsModule],
  templateUrl: './book-store.html',
  styleUrl: './book-store.css',
  standalone: true,
})
export class BookStore implements OnInit {
  books: EcommerceBook[] = [];
  filteredBooks: EcommerceBook[] = [];
  categories: string[] = ['All', 'Fiction', 'Classic', 'Fantasy', 'Romance','Self-Help', 'Biography'];
  selectedCategory: string = 'All';
  searchQuery: string = '';
  sortBy: string = 'name';
  cartItemCount: number = 0;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.books = this.cartService.getMockBooks();
    this.filteredBooks = this.books;

    // Subscribe to cart changes
    this.cartService.cartItems$.subscribe(() => {
      this.cartItemCount = this.cartService.getCartItemCount();
    });
  }

  // Filter by category
  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  // Search books
  searchBooks() {
    this.applyFilters();
  }

  // Apply all filters
  applyFilters() {
    let result = this.books;

    // Filter by category
    if (this.selectedCategory !== 'All') {
      result = result.filter(book => book.category === this.selectedCategory);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(
        book =>
          book.name.toLowerCase().includes(query) ||
          book.aname.toLowerCase().includes(query)
      );
    }

    // Sort
    this.sortBooks(result);

    this.filteredBooks = result;
  }

  // Sort books
  sortBooks(books: EcommerceBook[]) {
    switch (this.sortBy) {
      case 'name':
        books.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        books.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        books.sort((a, b) => b.price - a.price);
        break;
      case 'author':
        books.sort((a, b) => a.aname.localeCompare(b.aname));
        break;
    }
  }

  // Change sort
  onSortChange() {
    this.applyFilters();
  }

  // Add to cart
  addToCart(book: EcommerceBook) {
    this.cartService.addToCart(book, 1);
    alert(`"${book.name}" added to cart!`);
  }

  // View cart
  viewCart() {
    this.router.navigate(['/cart']);
  }

  // Check if book is in stock
  isInStock(book: EcommerceBook): boolean {
    return book.stock > 0;
  }
}
