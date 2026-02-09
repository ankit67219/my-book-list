import { Routes } from '@angular/router';
import { BookList } from './book-list/book-list';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { AuthorList } from './author-list/author-list';
import { UserList } from './user-list/user-list';
// import { Dashboard } from './dashboard/dashboard';
import { AdminUsers } from './admin-users/admin-users';
import { ViewBooks } from './view-books/view-books';
import { Child } from './child/child';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { HomeDashboard } from './home-dashboard/home-dashboard';
import { BookUsers } from './book-users/book-users';
import { BookStore } from './book-store/book-store';
import { ShoppingCart } from './shopping-cart/shopping-cart';
import { Checkout } from './checkout/checkout';
import { OrderHistory } from './order-history/order-history';
import { authGuard, adminGuard, Authome, Authbook, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full'},
    { path: 'login', component: Login, canActivate: [guestGuard]},
    { path: 'home', component: HomeDashboard, canActivate: [Authome]},
    { path: 'books', loadComponent: () => import('./book-list/book-list').then(m => m.BookList), canActivate: [Authbook]},
    { path: 'signup', component: Signup, canActivate: [guestGuard]},
    { path: 'authors', loadComponent: () => import('./author-list/author-list').then(m => m.AuthorList) },
    { path: 'users', component: UserList},
    // { path: 'dashboard', component: Dashboard},
    { path: 'admins', component: AdminUsers, canActivate: [adminGuard]},
    { path: 'view-books', component: ViewBooks},
    { path: 'link', component: Child},
    { path: 'admins-dashboard', component: AdminDashboard, canActivate: [adminGuard] },
    { path: 'my-books', component: BookUsers, canActivate: [authGuard] },
    
    // E-commerce routes
    { path: 'store', component: BookStore, canActivate: [authGuard]},
    { path: 'cart', component: ShoppingCart, canActivate: [authGuard]},
    { path: 'checkout', component: Checkout, canActivate: [authGuard]},
    { path: 'order-history', component: OrderHistory, canActivate: [adminGuard]}
];
