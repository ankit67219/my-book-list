import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Users } from '../user-services/users';
import { Profile } from '../profile/profile';

@Component({
  selector: 'app-book-users',
  imports: [FormsModule, CommonModule],
  templateUrl: './book-users.html',
  styleUrl: './book-users.css',
})
export class BookUsers implements OnInit {
  books: { 
    aname: string;
    name: string;
    status: string
  } [] = [];

  filteredBooks: { 
    aname: string;
    name: string;
    status: string
  } [] = [];

  newBook = {
    author: '',
    title: '',
    status: 'Reading',
    notes: ''
  };

  showAddBookModal: boolean = false;
  showRemoveModal: boolean = false;
  indexToRemove: number | null = null;
  LogoutConfirmation = false;
  
  bookToDelete: {
    status: string;
    aname: string;
    name: string
  } | null = null;

  currentUsername: string = '';
  
  // Search and Filter
  searchQuery: string = '';
  activeStatusFilters: string[] = [];
  statusFilters = ['Reading', 'Completed', 'Dropped', 'Plan to Read'];
  
  // Sorting
  sortColumn: string = 'aname';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(
    private router: Router, 
    private userService: Users, 
    public profileService: Profile
  ) {}

  ngOnInit() {
    this.profileService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUsername = user.uname;
        this.loadUserBooks();
      } else {
        this.currentUsername = '';
        this.books = [];
        this.filteredBooks = [];
      }
    });
  }

  loadUserBooks() {
    this.books = this.userService.getbooks();
    this.filterBooks();
    this.currentPage = 1; // Reset to first page when loading
  }

  // Add Book Functions
  openAddBookModal() {
    if (!this.currentUsername) {
      alert('Please log in to add books');
      this.router.navigate(['/login']);
      return;
    }
    this.showAddBookModal = true;
    this.resetNewBookForm();
  }

  closeAddBookModal() {
    this.showAddBookModal = false;
    this.resetNewBookForm();
  }

  resetNewBookForm() {
    this.newBook = {
      author: '',
      title: '',
      status: 'Reading',
      notes: ''
    };
  }

  submitAddBook() {
    if (!this.newBook.author.trim() || !this.newBook.title.trim()) {
      alert('Please enter both author and book title');
      return;
    }

    // Check if book already exists
    const bookExists = this.books.some(book => 
      book.aname.toLowerCase() === this.newBook.author.toLowerCase() && 
      book.name.toLowerCase() === this.newBook.title.toLowerCase()
    );

    if (bookExists) {
      alert('This book already exists in your list!');
      return;
    }

    // Add the book
    this.userService.addbook({
      aname: this.newBook.author.trim(),
      name: this.newBook.title.trim(),
      status: this.newBook.status
    });

    // Save notes if provided
    if (this.newBook.notes.trim()) {
      this.saveBookNotes(this.newBook.author, this.newBook.title, this.newBook.notes);
    }

    this.loadUserBooks();
    this.closeAddBookModal();
    alert('Book added successfully!');
  }

  saveBookNotes(author: string, title: string, notes: string) {
    const notesKey = `book_notes_${this.currentUsername}`;
    const existingNotes = JSON.parse(localStorage.getItem(notesKey) || '{}');
    const bookKey = `${author}_${title}`.replace(/\s+/g, '_');
    existingNotes[bookKey] = notes.trim();
    localStorage.setItem(notesKey, JSON.stringify(existingNotes));
  }

  getBookNotes(author: string, title: string): string {
    const notesKey = `book_notes_${this.currentUsername}`;
    const existingNotes = JSON.parse(localStorage.getItem(notesKey) || '{}');
    const bookKey = `${author}_${title}`.replace(/\s+/g, '_');
    return existingNotes[bookKey] || '';
  }

  // Book Statistics
  getBookCountByStatus(status: string): number {
    return this.books.filter(book => book.status === status).length;
  }

  // Search and Filter Functions
  filterBooks() {
    let filtered = [...this.books];
    
    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(book => 
        book.aname.toLowerCase().includes(query) || 
        book.name.toLowerCase().includes(query)
      );
    }
    
    // Apply status filters
    if (this.activeStatusFilters.length > 0) {
      filtered = filtered.filter(book => 
        this.activeStatusFilters.includes(book.status)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[this.sortColumn as keyof typeof a];
      const bValue = b[this.sortColumn as keyof typeof b];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });
    
    this.filteredBooks = filtered;
    this.currentPage = 1; // Reset to first page after filtering
  }

  toggleStatusFilter(status: string) {
    const index = this.activeStatusFilters.indexOf(status);
    if (index === -1) {
      this.activeStatusFilters.push(status);
    } else {
      this.activeStatusFilters.splice(index, 1);
    }
    this.filterBooks();
  }

  clearFilters() {
    this.searchQuery = '';
    this.activeStatusFilters = [];
    this.filterBooks();
  }

  // Sorting Functions
  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.filterBooks();
  }

  // Book Actions
  editBook(index: number) {
    const actualIndex = this.getActualIndex(index);
    this.indexToRemove = actualIndex;
    this.bookToDelete = this.books[actualIndex];
    this.showRemoveModal = true;
  }

  changeStatus(index: number) {
    const actualIndex = this.getActualIndex(index);
    const book = this.books[actualIndex];
    const statuses = ['Reading', 'Completed', 'Dropped', 'Plan to Read'];
    const currentIndex = statuses.indexOf(book.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    
    this.userService.updatestatus(actualIndex, statuses[nextIndex]);
    this.loadUserBooks();
  }

  getActualIndex(filteredIndex: number): number {
    const book = this.filteredBooks[filteredIndex];
    return this.books.findIndex(b => 
      b.aname === book.aname && b.name === book.name
    );
  }

  // Remove Book Functions
  removebook(index: number) {
    const actualIndex = this.getActualIndex(index);
    this.indexToRemove = actualIndex;
    this.bookToDelete = this.books[actualIndex];
    this.showRemoveModal = true;
  }

  confirmRemove() {
    if (this.indexToRemove !== null && this.bookToDelete) {
      this.userService.removebook(this.indexToRemove);
      this.loadUserBooks();
      this.showRemoveModal = false;
      this.indexToRemove = null;
      this.bookToDelete = null;
    }
  }

  closeRemoveModal() {
    this.showRemoveModal = false;
    this.indexToRemove = null;
    this.bookToDelete = null;
  }

  // Pagination Functions
  get pagedBooks() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredBooks.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  get totalPages() {
    return Math.ceil(this.filteredBooks.length / this.itemsPerPage);
  }

  // Logout Functions
  asklogout() {
    this.LogoutConfirmation = true;
  }

  cancellogout() {
    this.LogoutConfirmation = false;
  }

  confirmLogout() {
    this.profileService.logout();
    this.LogoutConfirmation = false;
    this.router.navigate(['/login']);
  }
}