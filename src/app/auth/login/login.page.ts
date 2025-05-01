import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class LoginPage {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router) {}

  login() { 
    console.log('Username:', this.username);
    console.log('Password:', this.password);
    
    // Simple authentication logic
    if (this.username === 'admin' && this.password === 'password') {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Invalid username or password';
    }
  }

  register() {
    this.router.navigate(['/register']);
  }

  forgotPassword() {
    if (!this.username) {
      this.errorMessage = 'Please enter your username first';
      return;
    }
    this.router.navigate(['/forgot-password'], {
      state: { username: this.username }
    });
  }
}