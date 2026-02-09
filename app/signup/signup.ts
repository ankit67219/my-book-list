import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Profile } from '../profile/profile';   // <-- import your service

@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  name = '';
  uname = '';
  email = '';
  password = '';
  confirmPassword = '';

    // Flags for invalid states
  nameInvalid = false;
  unameInvalid = false;
  emailInvalid = false;
  passwordInvalid = false;
  confirmPasswordInvalid = false;

  constructor(private router: Router, private profileService: Profile) {}

  onSignup() {
       // Reset flags
    this.nameInvalid = !this.name;
    this.unameInvalid = !this.uname;
    this.emailInvalid = !this.email;
    this.passwordInvalid = !this.password;
    this.confirmPasswordInvalid = !this.confirmPassword;

    if (this.name && this.uname && this.email && this.password) {

      // Name Validation
      if (!this.name || this.name.trim() === '') {
     this.nameInvalid = true;
         alert('Yo! ' + this.name);
    return;
    } else {

    }


      // Username length validation
      const usernameRegexlen = /^.{6,30}$/;
      if (!usernameRegexlen.test(this.uname)) {
           this.unameInvalid = true;
        alert('At least 6 characters are required for Username');
        return;
      }

      // Username allowed characters validation
      const usernameRegex = /^[a-zA-Z0-9_]{6,30}$/;
      if (!usernameRegex.test(this.uname)) {
           this.unameInvalid = true;
        alert('Only letters & numbers are allowed with no spaces');
        return;
      }

      if (this.email) {
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
          this.emailInvalid = true;
          alert('Email Invalid');
          return;
        }
      }

      // Password length validation
      if (this.password.length < 8) {
            this.passwordInvalid = true;
        alert('8 characters required for password');
        return;
      }

      // Confirm password validation
      if (this.password !== this.confirmPassword) {
            this.passwordInvalid = true;
        alert('Passwords do not match');
        return;
      }

      // Call Profile service to save user
      const result = this.profileService.signup({
        name: this.name,
        uname: this.uname,
        email: this.email,
        password: this.password,
      });

      if (result.success) {
        alert(result.message);
        this.router.navigate(['/home']);
      } else {
        alert(result.message);
      }
    } else {
      alert('Enter everything properly');
    }
  }
}