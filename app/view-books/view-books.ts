import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../cart-service/cart.service'; // Add this import

@Component({
  selector: 'app-view-books',
  imports: [FormsModule, CommonModule],
  templateUrl: './view-books.html',
  styleUrl: './view-books.css',
})
export class ViewBooks implements OnInit { // Implement OnInit
  
  // Replace personal books with book store data
  books: { aname: string; name: string; description: string }[] = [];
  
  // Remove these fields (no longer needed for personal books)
  // newbook: string = '';
  // newauthor: string = '';
  // searchAuthor: string = '';
  // searchBook: string = '';
  
  // Keep only one search field
  searchQuery: string = '';
  
  // Remove modal related fields (no longer editing personal books)
  // showRemoveModal: boolean = false;
  // indexToRemove: number | null = null;
  // bookToDelete: { status: string; aname: string; name: string } | null = null;

  // Sorting (keep only author and book sorting)
  anameAsc: boolean = true;
  nameAsc: boolean = true;
  // Remove statusAsc: boolean = true;

  // Pagination: Current Page and Items Per Page
  currentPage = this.loadSavedPage();
  itemsPerPage = 5;

  constructor(
    private router: Router, 
    private cartService: CartService // Add CartService here
  ) {}

  ngOnInit() {
    this.loadBookStoreBooks();
  }

  // Load books from Book Store instead of personal books
  loadBookStoreBooks() {
    const storeBooks = this.cartService.getMockBooks();
    
    // Transform to the format we need (only author, name, description)
    this.books = storeBooks.map(book => ({
      aname: book.aname,
      name: book.name,
      description: book.description
    }));
  }

  // Apply search filter
  applyFilters() {
    this.currentPage = 1; // Reset to first page when searching
  }

  // Sorting functions for Books and Authors (keep these)
  sortByBook() {
    this.books.sort((a, b) =>
      this.nameAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    this.nameAsc = !this.nameAsc;
  } 

  sortByAuthor() {
    this.books.sort((a, b) =>
      this.anameAsc ? a.aname.localeCompare(b.aname) : b.aname.localeCompare(a.aname)
    );
    this.anameAsc = !this.anameAsc;
  }

  // Remove status sorting since we don't have status anymore
  // sortByStatus() {
  //   this.books.sort((a, b) =>
  //     this.statusAsc ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status)
  //   );
  //   this.statusAsc = !this.statusAsc;
  // }

  // Pagination: loading saved page from local storage
  private loadSavedPage(): number {
    const savedPage = localStorage.getItem('currentPage');
    if (savedPage) {
      const pageNum = parseInt(savedPage, 10);
      return Math.max(1, pageNum);
    }
    return 1;
  }

  // Get paginated books with search filter
  get bookspagination() {
    let filteredBooks = this.books;
    
    // Apply search filter if searchQuery exists (search in author, name, and description)
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filteredBooks = this.books.filter(book =>
        book.aname.toLowerCase().includes(query) ||
        book.name.toLowerCase().includes(query) ||
        book.description.toLowerCase().includes(query)
      );
    }
    
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return filteredBooks.slice(start, end);
  }

  // function for next and previous page
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      localStorage.setItem('currentPage', this.currentPage.toString());
    }
  }

  previousPage() {
    if (this.currentPage > 1) {         
      this.currentPage--;
      localStorage.setItem('currentPage', this.currentPage.toString());
    }
  }

  // function to jump into specific page
  goToPage(page: number) {
    this.currentPage = page;
    localStorage.setItem('currentPage', this.currentPage.toString());
  }

  getPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Calculation of total pages
  get totalPages() {
    let filteredBooks = this.books;
    
    // Apply the same filter logic for accurate page count
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filteredBooks = this.books.filter(book =>
        book.aname.toLowerCase().includes(query) ||
        book.name.toLowerCase().includes(query) ||
        book.description.toLowerCase().includes(query)
      );
    }
    
    return Math.ceil(filteredBooks.length / this.itemsPerPage);      
  }

  // Router for Other Pages/Components (keep these)
  asklogout() {
    this.router.navigate(['/login']);
  }

  gotoauthors() {
    this.router.navigate(['/authors']);
  }

  // Unique List for Authors in Search
  getUniqueAuthors(): string[] {
    const authors = new Set(this.books.map(book => book.aname).filter(aname => aname.trim() !== ''));
    return Array.from(authors).sort();
  }

  goToCatalog() {
    this.router.navigate(['/users']);
  }

  // Remove these methods (no longer needed):
  // addBook()
  // removebook()
  // confirmRemove()
  // completed()
  // reading()
  // dropped()
  // updatestatus()
  // updateBookAndAuthor()
  // closeRemoveModal()
}