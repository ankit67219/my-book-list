import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Profile, User } from '../profile/profile';
import { Users } from '../user-services/users';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  currentUser: User | null = null;
  allUsers: User[] = [];
  stats = {
    totalUsers: 0,
    admins: 0,
    normalUsers: 0,
    totalBooks: 0,
    totalAuthors: 0,
  };

  // Only keep delete confirmation modal
  showDeleteConfirmModal = false;
  userToDelete: User | null = null;

  constructor(
    private router: Router,
    private profileService: Profile,
    private usersService: Users
  ) {}

  ngOnInit() {
    // Check if admin
    if (!this.profileService.isAdmin()) {
      alert('Access denied. Admins only.');
      this.router.navigate(['/home']);
      return;
    }

    this.loadData();
  }

  loadData() {
    this.currentUser = this.profileService.getCurrentUser();
    this.allUsers = this.profileService.getAllUsers();
    
    // Get user stats
    const userStats = this.getUserStats();
    this.stats = {
      totalUsers: userStats.total,
      admins: userStats.admins,
      normalUsers: userStats.users,
      totalBooks: 0, // You can implement this if needed
      totalAuthors: 0, // You can implement this if needed
    };
  }

  // Helper method to get user stats
  private getUserStats() {
    const users = this.profileService.getAllUsers();
    return {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      users: users.filter(u => u.role === 'user').length,
    };
  }

  // Update user role directly from dropdown
  updateUserRole(user: User) {
    if (user.uname === this.currentUser?.uname) {
      alert('You cannot change your own role');
      this.loadData(); // Reload to reset dropdown
      return;
    }

    const newRole = user.role;
    const confirmMessage = `Are you sure you want to change ${user.uname}'s role to ${newRole}?`;
    
    if (confirm(confirmMessage)) {
      const result = this.profileService.updateUser(user.uname, {
        role: newRole
      });

      if (result.success) {
        alert(`User ${user.uname} is now a ${newRole}`);
        this.loadData(); // Reload to show updated role
      } else {
        alert(`Error: ${result.message}`);
        this.loadData(); // Reload to reset dropdown if failed
      }
    } else {
      this.loadData(); // Reload to reset dropdown if cancelled
    }
  }

  // Navigation methods
  gotohome() {
    this.router.navigate(['/home']);
  }

  gotologin() {
    this.profileService.logout();
    this.router.navigate(['/login']);
  }

  goToCatalog() {
    this.router.navigate(['/users']);
  }

  gotobooks() {
    this.router.navigate(['/books']);
  }

  gotoauthors() {
    this.router.navigate(['/authors']);
  }

  // Delete User functions
  confirmDeleteUser(user: User) {
    this.userToDelete = user;
    this.showDeleteConfirmModal = true;
  }

  closeDeleteConfirmModal() {
    this.showDeleteConfirmModal = false;
    this.userToDelete = null;
  }

  deleteUser() {
    if (!this.userToDelete) return;

    const result = this.profileService.removeUser(this.userToDelete.uname);
    
    if (result.success) {
      alert(result.message);
      this.closeDeleteConfirmModal();
      this.loadData();
    } else {
      alert(result.message);
    }
  }

  // Check if user can be deleted (not current user)
  canDelete(user: User): boolean {
    return user.uname !== this.currentUser?.uname;
  }
}