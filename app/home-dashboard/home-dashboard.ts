import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Users } from '../user-services/users';
import { CommonModule } from '@angular/common';
import { Profile } from '../profile/profile';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-home-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './home-dashboard.html',
  styleUrl: './home-dashboard.css',
})
export class HomeDashboard implements OnInit{

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

  isReadingOpen = true;
  isCompletedOpen = true;
  isPlanningOpen = true;
  isDroppedOpen = true;


    currentUsername: string = '';
    currentPage: number = 1;

     searchQuery: string = '';
  activeStatusFilters: string[] = [];
  statusFilters = ['Reading', 'Completed', 'Dropped', 'Plan to Read'];

   sortColumn: string = 'aname';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  constructor(private router: Router, 
    private userService: Users,
  public profileService: Profile) {

  }



    // activeStatusFilters: string[] = [];
    getBookCountByStatus(status: string): number {
    return this.books.filter(book => book.status === status).length;
  }


    gotologin() {
    this.router.navigate(['/login'])
  }


  gotoadmins() {
    this.router.navigate(['/admins'])
  }
  goToCatalog() {
    this.router.navigate(['/users'])
  }

  gotobooks() {
    this.router.navigate(['/books'])
  }
  //   filterBooks() {
  //   let filtered = [...this.books];
    
  //   // Apply search filter
  //   if (this.searchQuery.trim()) {
  //     const query = this.searchQuery.toLowerCase();
  //     filtered = filtered.filter(book => 
  //       book.aname.toLowerCase().includes(query) || 
  //       book.name.toLowerCase().includes(query)
  //     );
  //   }
    
  //   // Apply status filters
  //   if (this.activeStatusFilters.length > 0) {
  //     filtered = filtered.filter(book => 
  //       this.activeStatusFilters.includes(book.status)
  //     );
  //   }
    
  //   // Apply sorting
  //   filtered.sort((a, b) => {
  //     const aValue = a[this.sortColumn as keyof typeof a];
  //     const bValue = b[this.sortColumn as keyof typeof b];
      
  //     if (typeof aValue === 'string' && typeof bValue === 'string') {
  //       return this.sortDirection === 'asc' 
  //         ? aValue.localeCompare(bValue)
  //         : bValue.localeCompare(aValue);
  //     }
  //     return 0;
  //   });
    
  //   this.filteredBooks = filtered;
  //   this.currentPage = 1; // Reset to first page after filtering
  // }
  gotoauthors() {
    this.router.navigate(['/authors'])
  }

  gotolink() {
    this.router.navigate(['/link'])
  }

  gotohome() {
    this.router.navigate(['/home'])
  }

    getActualIndex(filteredIndex: number): number {
    const book = this.filteredBooks[filteredIndex];
    return this.books.findIndex(b => 
      b.aname === book.aname && b.name === book.name
    );
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

    editBook(index: number) {
    const actualIndex = this.getActualIndex(index);
    this.indexToRemove = actualIndex;
    this.bookToDelete = this.books[actualIndex];
    this.showRemoveModal = true;
  }
     loadUserBooks() {
    this.books = this.userService.getbooks();
    this.filterBooks();
    this.currentPage = 1; // Reset to first page when loading
  }

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

   bookToDelete: {
    status: string;
    aname: string;
    name: string
  } | null = null;


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

  getBooksByStatus(status: string, source: {aname: string; name: string; status: string; coverUrl?: string} [] = this.books) {
  return source.filter(book => book.status === status);
}

// selectBook(book: { aname: string; name: string; status: string; coverUrl?: string }) {
//   // Example: navigate to book details or highlight it
//   console.log('Selected book:', book);
//   // Clear search after selection
//   this.searchQuery = '';
//   this.filteredBooks = [];
// }

// selectBook(book: any) {
//   this.router.navigate(['/home', book.aname, book.name]);

//   this.searchQuery = '';
//   this.searchResults = [];
// }

selectBook(book: { aname: string; name: string; status: string; coverUrl?: string }) {
  // Put selected text into input
  this.searchQuery = `${book.name}`;

  // Close dropdown
  this.searchResults = [];

  // OPTIONAL: if you want to re-filter the page immediately
  this.filterBooks();
}

searchResults: any[] = [];
filterBooks() {
  const query = this.searchQuery.trim().toLowerCase();

  // 🔹 DROPDOWN results (simple search only)
  this.searchResults = query
    ? this.books.filter(book =>
        book.aname.toLowerCase().includes(query) ||
        book.name.toLowerCase().includes(query)
      )
    : [];

  // 🔹 PAGE filtering (your existing logic)
  let filtered = [...this.books];

  if (query) {
    filtered = filtered.filter(book =>
      book.aname.toLowerCase().includes(query) ||
      book.name.toLowerCase().includes(query)
    );
  }

  if (this.activeStatusFilters.length > 0) {
    filtered = filtered.filter(book =>
      this.activeStatusFilters.includes(book.status)
    );
  }

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
  this.currentPage = 1;
}

isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }



}
