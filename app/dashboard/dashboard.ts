import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  constructor(private router: Router) {}

  gotologin() {
    this.router.navigate(['/login'])
  }

  goToCatalog() {
    this.router.navigate(['/users'])
  }

  gotobooks() {
    this.router.navigate(['/view-books'])
  }

  gotoauthors() {
    this.router.navigate(['/authors'])
  }

  gotolink() {
    this.router.navigate(['/link'])
  }
}
