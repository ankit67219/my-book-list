import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Profile } from '../profile/profile';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsers {

  users: any[] = [];
  showModal: boolean = false;
  editUserData: any = [];

  constructor(private profileService: Profile, private router: Router) {
    this.loadUsers();
  }

    loadUsers() {
    this.users = this.profileService.getAllUsers();
    }

    removeUser(uname: string) {
      this.profileService.removeUser(uname);
      this.loadUsers();
    }

    openEditModal(user: any) {
      this.editUserData = { ...user};
      this.showModal = true;
    }

    saveEdit() {
      const result = this.profileService.updateUser(this.editUserData.uname, {
        name: this.editUserData.name,
        email: this.editUserData.email,
        role: this.editUserData.role,
      });
      alert(result.message);
      this.showModal = false;
      this.loadUsers();
    }

    closeModal() {
      this.showModal = false;
    }

    gotoadmins() {
      this.router.navigate(['/admins-dashboard'])
    }

}
