import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Users, Author, Book } from '../user-services/users';
import { AuthorList } from '../author-list/author-list';
import { Profile } from '../profile/profile';
@Component({
  selector: 'app-book-list',
  imports: [FormsModule, CommonModule, AuthorList],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css',
  standalone: true,
})
export class BookList {
  // Book Array with author, book and status
books: { aname: string; name: string; status: string }[] = [];
// New Book and Author input fields
newbook: string = '';
newauthor: string = '';

// Modal for Update and Remove
showRemoveModal: boolean = false;
indexToRemove: number | null = null;
// For Delete Function
bookToDelete: { status: string; aname: string; name: string } | null = null;

constructor(private router: Router, private usersService: Users, public profileService: Profile) {
  this.books = this.usersService.getbooks();
}

//For Adding new books with validation
addBook() {
  console.log('Before Add Book', this.addBook);
  if (this.newbook.trim() && this.newauthor.trim()) {
    this.usersService.addbook({ aname: this.newauthor, name: this.newbook.trim(), status: 'Reading'});
    this.books = this.usersService.getbooks();
    console.log('Book Added:', this.newbook);
    console.log('Author Added:', this.newauthor);
    console.log('Book List', this.books);
    this.newbook = '';
    this.newauthor = '';
  }
  else {
    alert('Enter Both Book and Author');
  }
    console.log('After Add Book', this.addBook);
}

//B

removebook(index: number) {
  this.indexToRemove = index;
  this.bookToDelete = this.books[index];
  this.showRemoveModal = true;
}

//For Remove or Update Books and Authors
confirmRemove() {
  if (this.indexToRemove !== null && this.bookToDelete) {
    // Update status first if changed
    this.usersService.updatestatus(this.indexToRemove, this.bookToDelete.status);
    // Then remove the book
    this.usersService.removebook(this.indexToRemove);
    this.books = this.usersService.getbooks();
    this.showRemoveModal = false;
    this.indexToRemove = null;
    this.bookToDelete = null;
  }
}


//Simple Modal cancel function

// cancelRemove() {
//   this.showRemoveModal = false;
//   this.indexToRemove = null;
//   this.bookToDelete = null;
// }

// Mark Book Status Functions
completed(index: number) {
  this.updatestatus(index, "Completed");

  console.log('completed', this.completed);
}

reading (index: number) {
  this.updatestatus(index, "Reading");
}

dropped (index: number) {
    this.updatestatus(index, "Dropped");
}

planning (index: number) {
  this.updatestatus(index, "Plan to Read");
}

 // Update status of a book in service and local list
updatestatus(index: number, status: string){
   this.usersService.updatestatus(index, status);
   this.books[index].status = status; 
}

//table header sorting

anameAsc: boolean = true;
nameAsc: boolean = true;
statusAsc: boolean = true;

// Define custom order
statusOrder: { [key: string]: number } = {
  "Completed": 1,
  "Reading": 2,
  "Dropped": 3,
  "Plan to Read": 4
};


//Sorting functions for Books and Authors
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


sortByStatus() {
  this.statusAsc = !this.statusAsc;

  this.books.sort((a, b) => {
    const orderA = this.statusOrder[a.status] || 99;
    const orderB = this.statusOrder[b.status] || 99;

    return this.statusAsc ? orderA - orderB : orderB - orderA;
  });
}


//Pagination: Current Page and Items Per Page

currentPage = this.loadSavedPage();
itemsPerPage = 20;

//loading saved page from local storage

private loadSavedPage(): number {
  const savedPage = localStorage.getItem('currentPage');
  if (savedPage) {
    const pageNum = parseInt(savedPage, 10);
    return Math.max(1, pageNum); // Ensure at least page 1
  }
  return 1; // Default to page 1 if nothing saved
}

//to load book list of current page from certain items per page
get bookspagination() {
  const start = (this.currentPage - 1) * this.itemsPerPage;
  const end = start + this.itemsPerPage;
  return this.books.slice(start, end);
}

// function for next and previous page
nextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
     localStorage.setItem('currentPage', this.currentPage.toString());
  }
  console.log('nextPage', this.nextPage);
}

previousPage() {
  if (this.currentPage > 1) {         
    this.currentPage--;
     localStorage.setItem('currentPage', this.currentPage.toString());
  }
      console.log('previousPage', this.previousPage);
}

//function to jump into specific page
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

//Calculation of total pages
get totalPages() {
  return Math.ceil(this.books.length / this.itemsPerPage);      
}

// Router for Other Pages/Components
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

// For updating book and author details
updateBookAndAuthor(index: number, updated: { aname: string; name: string; status: string }) {
  this.usersService.updateBookAndAuthor(index, updated);
  this.books = this.usersService.getbooks(); // refresh flat list
  this.showRemoveModal = false;
}

goToCatalog() {
  this.router.navigate(['/users']);
}


closeRemoveModal() {
  this.showRemoveModal = false;
}

gotoadmins() {
  this.router.navigate(['/admins'])
}

}