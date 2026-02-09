import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Users, Author } from '../user-services/users';

@Component({
  selector: 'app-author-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './author-list.html',
  styleUrl: './author-list.css',
})
export class AuthorList {
  authors: Author[] = [];
  expandedAuthorId: string | null = null;

  constructor(private usersService: Users) {
    this.authors = this.usersService.getAuthors();
  }

  // Toggle to show or hide books for an author
  toggleAuthor(authorId: string) {
    this.expandedAuthorId = this.expandedAuthorId === authorId ? null : authorId;
  }

    sortByAuthor() {
    this.authors.sort((a, b) => a.name.localeCompare(b.name));
  }

}
