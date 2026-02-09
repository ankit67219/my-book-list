import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// User interface with role
export interface User {
  name: string;
  uname: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class Profile {
  private storageKey = 'users';
  private currentUserSub = new BehaviorSubject<User | null>(null);

  currentUser$ = this.currentUserSub.asObservable();

  constructor() {
    // Seed default admin on first load
    this.seedDefaultAdmin();
    
    // Restore current user from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSub.next(JSON.parse(savedUser));
    }
  }

  // Seed a default admin user if no users exist
  private seedDefaultAdmin() {
    const users = this.getAllUsers();
    const hasAdmin = users.some((u: User) => u.role === 'admin');
    
    if (!hasAdmin) {
      const defaultAdmin: User = {
        name: 'Admin User',
        uname: 'admin',
        email: 'admin@booklist.com',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      users.push(defaultAdmin);
      localStorage.setItem(this.storageKey, JSON.stringify(users));
      console.log('Default admin created: admin@booklist.com / admin123');
    }
  }

  // Signup - new users are always 'user' role
  signup(user: { name: string; uname: string; email: string; password: string }): { success: boolean; message: string } {
    const users: User[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');

    // Check if username exists
    const usernameExists = users.find((u: User) => u.uname.toLowerCase() === user.uname.toLowerCase());
    if (usernameExists) {
      return { success: false, message: 'This Username already exists' };
    }

    // Check if email exists
    const emailExists = users.find((u: User) => u.email.toLowerCase() === user.email.toLowerCase());
    if (emailExists) {
      return { success: false, message: 'This Email is already registered' };
    }

    // Create new user with 'user' role
    const newUser: User = {
      ...user,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    this.setCurrentUser(newUser);
    return { success: true, message: 'Welcome to Book List!' };
  }

  // Admin can create users with any role
  createUser(user: { name: string; uname: string; email: string; password: string; role: 'admin' | 'user' }): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Only admins can create users' };
    }

    const users: User[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');

    // Check if username exists
    const usernameExists = users.find((u: User) => u.uname.toLowerCase() === user.uname.toLowerCase());
    if (usernameExists) {
      return { success: false, message: 'This Username already exists' };
    }

    // Check if email exists
    const emailExists = users.find((u: User) => u.email.toLowerCase() === user.email.toLowerCase());
    if (emailExists) {
      return { success: false, message: 'This Email is already registered' };
    }

    const newUser: User = {
      ...user,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    return { success: true, message: `User "${user.uname}" created successfully!` };
  }

  // Login
  login(email: string, password: string): { success: boolean; message: string } {
    const users: User[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');

    // Find user by email
    const user = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, message: 'Email not found' };
    }

    // Check password
    if (user.password !== password) {
      return { success: false, message: 'Incorrect password' };
    }

    // Login successful
    this.setCurrentUser(user);
    return { success: true, message: `Welcome back, ${user.name}!` };
  }

  // Logout
  logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    this.currentUserSub.next(null);
  }

  // Set current user
  private setCurrentUser(user: User) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSub.next(user);
  }

  // Check if logged in
  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  // Get current user
  getCurrentUser(): User | null {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  }

  // Check if current user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  // Get all users
  getAllUsers(): User[] {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  // Get users by role
  getUsersByRole(role: 'admin' | 'user'): User[] {
    return this.getAllUsers().filter((u: User) => u.role === role);
  }

  // Get user statistics
  getUserStats() {
    const users = this.getAllUsers();
    return {
      total: users.length,
      admins: users.filter((u: User) => u.role === 'admin').length,
      users: users.filter((u: User) => u.role === 'user').length,
    };
  }

  // Remove user (admin only)
  removeUser(uname: string): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Only admins can remove users' };
    }

    // Prevent removing yourself
    if (currentUser.uname === uname) {
      return { success: false, message: 'You cannot remove yourself' };
    }

    let users: User[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const userToRemove = users.find((u: User) => u.uname === uname);
    
    if (!userToRemove) {
      return { success: false, message: 'User not found' };
    }

    users = users.filter((u: User) => u.uname !== uname);
    localStorage.setItem(this.storageKey, JSON.stringify(users));

    // Also remove user's books
    localStorage.removeItem(`books_${uname}`);

    return { success: true, message: `User "${uname}" removed successfully` };
  }

  // Update user (admin only)
  updateUser(uname: string, updates: Partial<User>): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Only admins can update users' };
    }

    let users: User[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const index = users.findIndex((u: User) => u.uname === uname);

    if (index === -1) {
      return { success: false, message: 'User not found' };
    }

    // Prevent demoting the last admin
    if (updates.role === 'user' && users[index].role === 'admin') {
      const adminCount = users.filter((u: User) => u.role === 'admin').length;
      if (adminCount <= 1) {
        return { success: false, message: 'Cannot demote the last admin' };
      }
    }

    users[index] = { ...users[index], ...updates };
    localStorage.setItem(this.storageKey, JSON.stringify(users));

    return { success: true, message: 'User updated successfully' };
  }

  // Update own profile
  updateOwnProfile(updates: { name?: string; email?: string; password?: string }): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'Not logged in' };
    }

    let users: User[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const index = users.findIndex((u: User) => u.uname === currentUser.uname);

    if (index === -1) {
      return { success: false, message: 'User not found' };
    }

    // Check if new email is taken
    if (updates.email && updates.email !== currentUser.email) {
      const emailExists = users.find((u: User) => u.email.toLowerCase() === updates.email!.toLowerCase());
      if (emailExists) {
        return { success: false, message: 'This email is already taken' };
      }
    }

    users[index] = { ...users[index], ...updates };
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    this.setCurrentUser(users[index]);

    return { success: true, message: 'Profile updated successfully' };
  }
}
