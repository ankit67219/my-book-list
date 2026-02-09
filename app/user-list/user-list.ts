import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Profile } from '../profile/profile';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList {

  users: any[] = [];
  
  showModal: boolean = false;
  editUserData: any = {};
  
  constructor(private profileService: Profile) {
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
    this.editUserData = { ...user }; // clone user data
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
}
