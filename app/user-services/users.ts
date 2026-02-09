import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Profile, User } from '../profile/profile';

// Data structures for Book and Author
export interface Book {
  id: string;
  name: string;
  status: 'Reading' | 'Completed' | 'Dropped' | 'Plan to Read';
}

export interface Author {
  id: string;
  name: string;
  books: Book[];
}

@Injectable({ providedIn: 'root' })
export class Users {
  private authors: Author[] = [];

  constructor(private profileService: Profile) {
    // Load books when user changes
    this.profileService.currentUser$.subscribe(() => {
      this.loadAuthors();
    });
  }

  // Get storage key based on current user
  private getStorageKey(): string {
    const currentUser = this.profileService.getCurrentUser();
    if (currentUser && currentUser.uname) {
      return `books_${currentUser.uname}`;
    }
    return 'books_guest';
  }

  // Returns list of authors
  getAuthors(): Author[] {
    return this.authors;
  }

  // For Simple list of Books (flat view)
  getbooks(): { aname: string; name: string; status: string }[] {
    const flatBooks: { aname: string; name: string; status: string }[] = [];

    this.authors.forEach(author => {
      author.books.forEach(book => {
        flatBooks.push({
          aname: author.name,
          name: book.name,
          status: book.status,
        });
      });
    });
    return flatBooks;
  }

  // Get dashboard statistics
  getDashboardStats() {
    const books = this.getbooks();
    const totalBooks = books.length;
    const completedBooks = books.filter(book => book.status === 'Completed').length;
    const readingBooks = books.filter(book => book.status === 'Reading').length;
    const droppedBooks = books.filter(book => book.status === 'Dropped').length;
    const planToReadBooks = books.filter(book => book.status === 'Plan to Read').length;

    const currentYearBooks = completedBooks + readingBooks + droppedBooks;
    const pagesThisMonth = completedBooks * 300;
    const averageRating = 4.2;

    return {
      totalBooks,
      completedBooks,
      currentYearBooks,
      pagesThisMonth,
      averageRating,
      readingBooks,
      planToReadBooks,
      droppedBooks,
    };
  }

  // Get books by status
  getBooksByStatus(status: string, limit: number = 3) {
    const books = this.getbooks();
    return books.filter(book => book.status === status).slice(0, limit);
  }

  // Get book cover placeholder
  getBookCover(title: string, author: string): string {
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#f5576c',
      '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
      '#fa709a', '#fee140', '#a8edea', '#fed6e3',
    ];

    const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color = colors[hash % colors.length];
    const initials = title.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);

    return `https://via.placeholder.com/150x200/${color.replace('#', '')}/ffffff?text=${initials}`;
  }

  // Add a new book
  addbook(book: { aname: string; name: string; status: string }) {
    let author = this.authors.find(a => a.name.toLowerCase() === book.aname.toLowerCase());

    if (!author) {
      author = {
        id: this.generateId(),
        name: book.aname,
        books: [],
      };
      this.authors.push(author);
    }

    // Check if book already exists for this author
    const bookExists = author.books.find(b => b.name.toLowerCase() === book.name.toLowerCase());
    if (bookExists) {
      return { success: false, message: 'This book already exists for this author' };
    }

    author.books.push({
      id: this.generateId(),
      name: book.name,
      status: book.status as Book['status'],
    });
    this.saveAuthors();
    return { success: true, message: 'Book added successfully' };
  }

  // Remove a book
  removebook(index: number) {
    const flatBooks = this.getbooks();
    if (index >= 0 && index < flatBooks.length) {
      const bookToRemove = flatBooks[index];
      const author = this.authors.find(a => a.name === bookToRemove.aname);
      if (author) {
        author.books = author.books.filter(b => b.name !== bookToRemove.name);
        if (author.books.length === 0) {
          this.authors = this.authors.filter(a => a.id !== author!.id);
        }
        this.saveAuthors();
      }
    }
  }

  // Update book status
  updatestatus(index: number, status: string) {
    const flatBooks = this.getbooks();
    if (index >= 0 && index < flatBooks.length) {
      const bookToUpdate = flatBooks[index];
      const author = this.authors.find(a => a.name === bookToUpdate.aname);
      if (author) {
        const book = author.books.find(b => b.name === bookToUpdate.name);
        if (book) {
          book.status = status as Book['status'];
          this.saveAuthors();
        }
      }
    }
  }

  // Update book and author
  updateBookAndAuthor(index: number, updated: { aname: string; name: string; status: string }) {
    const flatBooks = this.getbooks();
    if (index >= 0 && index < flatBooks.length) {
      const bookToUpdate = flatBooks[index];
      const author = this.authors.find(a => a.name === bookToUpdate.aname);

      if (author) {
        const book = author.books.find(b => b.name === bookToUpdate.name);
        if (book) {
          book.name = updated.name;
          book.status = updated.status as Book['status'];

          if (author.name !== updated.aname) {
            author.books = author.books.filter(b => b.id !== book.id);

            if (author.books.length === 0) {
              this.authors = this.authors.filter(a => a.id !== author.id);
            }

            let newAuthor = this.authors.find(a => a.name.toLowerCase() === updated.aname.toLowerCase());
            if (!newAuthor) {
              newAuthor = { id: this.generateId(), name: updated.aname, books: [] };
              this.authors.push(newAuthor);
            }

            newAuthor.books.push(book);
          }

          this.saveAuthors();
        }
      }
    }
  }

  // Generate unique ID
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Save authors to localStorage (user-specific)
  private saveAuthors() {
    const storageKey = this.getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(this.authors));
  }

  // Load authors from localStorage (user-specific)
  private loadAuthors() {
    const storageKey = this.getStorageKey();
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      this.authors = JSON.parse(stored);
    } else {
      this.authors = [];
      // Optionally seed with sample data for new users
      this.seedSampleBooks();
    }
  }

  // Seed sample books for new users
  private seedSampleBooks() {
    const currentUser = this.profileService.getCurrentUser();
    if (!currentUser) return;

    // Add some sample books for new users
    // const sampleBooks = [
    //   { aname: 'Hey George Orwell', name: '1984', status: 'Reading' },
    //   { aname: 'Harper Lee', name: 'To Kill a Mockingbird', status: 'Planning' },
    //   { aname: 'J.K. Rowling', name: 'Harry Potter and the Sorcerer\'s Stone', status: 'Completed' },
    // ];

    // sampleBooks.forEach(book => this.addbook(book));
  }

  // Get all books for all users (admin only)
  getAllBooksForAllUsers(): { user: string; books: { aname: string; name: string; status: string }[] }[] {
    const currentUser = this.profileService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return [];
    }

    const allUsers = this.profileService.getAllUsers();
    const result: { user: string; books: { aname: string; name: string; status: string }[] }[] = [];

    allUsers.forEach((user: User) => {
      const storageKey = `books_${user.uname}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const authors: Author[] = JSON.parse(stored);
        const flatBooks: { aname: string; name: string; status: string }[] = [];

        authors.forEach(author => {
          author.books.forEach(book => {
            flatBooks.push({
              aname: author.name,
              name: book.name,
              status: book.status,
            });
          });
        });

        result.push({ user: user.uname, books: flatBooks });
      }
    });

    return result;
  }

  // Get total books count across all users (admin only)
  getTotalBooksCount(): number {
    const allData = this.getAllBooksForAllUsers();
    return allData.reduce((total, userData) => total + userData.books.length, 0);
  }

  // Get unique authors count across all users (admin only)
  getUniqueAuthorsCount(): number {
    const allData = this.getAllBooksForAllUsers();
    const allAuthors = new Set<string>();
    allData.forEach(userData => {
      userData.books.forEach(book => allAuthors.add(book.aname));
    });
    return allAuthors.size;
  }
}
