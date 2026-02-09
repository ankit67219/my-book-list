import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { BookList } from './book-list/book-list';
import { Login } from './login/login';
import { CommonModule } from '@angular/common';
import { Signup } from './signup/signup';
import { Child } from './child/child';
import { AuthorList } from './author-list/author-list';
import { Users } from './user-services/users';
import { Dashboard } from './dashboard/dashboard';
import { Profile } from './profile/profile';
import { CartService } from './cart-service/cart.service';

@Component({
  selector: 'app-root',
  imports: [BookList, Login, Signup, RouterOutlet, RouterLink,CommonModule, Child, AuthorList, Dashboard],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{

  username: string = '';
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  userRole: string = '';
  LogoutConfirmation = false;
  cartItemCount: number = 0;
  //  isDarkMode = false;  // Track current theme mode

  constructor(
    private router: Router, 
    private usersService: Users, 
    private profile: Profile,
    private cartService: CartService
  ) {
    // Initialize theme on app load
    // this.usersService.initTheme();
    // this.isDarkMode = localStorage.getItem('theme') === 'dark';
  }

   ngOnInit() {
    // Subscribe to user state changes
    this.profile.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.username = user ? user.uname : '';
      this.isAdmin = user?.role === 'admin';
      this.userRole = user?.role || '';
    });

    // Subscribe to cart changes
    this.cartService.cartItems$.subscribe(() => {
      this.cartItemCount = this.cartService.getCartItemCount();
    });
  }
  protected readonly title = ('Book List');

  gotohome() {
    this.router.navigate(['/home']);
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToBooks() {
    this.router.navigate(['/books']);
  }

  gotoauthors() {
    this.router.navigate(['/authors']);
  }

  onlogout(){
  alert('Log Out Successful');
  this.profile.logout();
  this.LogoutConfirmation = false;
  this.router.navigate(['/login']);
}
asklogout() {
    console.log("Checking Log Out Button");
  this.LogoutConfirmation = true;
}

cancellogout() {
  this.LogoutConfirmation = false;
}

goToBookList() {
  this.router.navigate(['/dashboard']);
}

goToStore() {
  this.router.navigate(['/store']);
}

goToCart() {
  this.router.navigate(['/cart']);
}

goToOrders() {
  this.router.navigate(['/order-history']);
}

goToAdminDashboard() {
  this.router.navigate(['/admins-dashboard']);
}

}
