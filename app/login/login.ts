import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Profile } from '../profile/profile';   // <-- import your service

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  isLoggedIn: boolean = false;
  email = '';
  password = '';
  emailInvalid = false;
  passwordInvalid = false;

  constructor(private router: Router, private profileService: Profile) {}

  onLogin() {
    this.emailInvalid = false;
    this.passwordInvalid = false;

    if (this.email && this.password) {
      console.log('Login Page', this.email, this.password);

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.emailInvalid = true;
        alert('Email Invalid');
        return;
      }

      // Password length validation
      if (this.password.length < 8) {
        this.passwordInvalid = true;
        alert('Password must be at least 8 characters long');
        return;
      }

      // Call Profile service to check credentials
      const result = this.profileService.login(this.email, this.password);

      if (result.success) {
        alert(result.message);
        this.router.navigate(['/home']);
      } else {
        this.emailInvalid = true;
        this.passwordInvalid = true;
        alert(result.message);
      }
    } else {
      alert('Enter Email & Password');
      this.emailInvalid = !this.email;
      this.passwordInvalid = !this.password;

    }
  }

onlogout() {
  // Clear any stored user session data
  this.email = '';
  this.password = '';
  this.emailInvalid = false;
  this.passwordInvalid = false;

  // Optionally clear any localStorage/sessionStorage if used
  localStorage.removeItem('user'); // or sessionStorage.removeItem('user')

  // Navigate back to login page
  this.router.navigate(['/login']);
}

}