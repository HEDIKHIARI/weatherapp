import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  message = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private auth: Auth
  ) {
    // Log pour vérifier l'initialisation
    console.log('LoginPage constructor called');
  }

  ngOnInit() {
    console.log('LoginPage ngOnInit called');
    
    onAuthStateChanged(this.auth, (user: User | null) => {
      if (user) {
        console.log('User already logged in, redirecting...');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  login() {
    // Logs détaillés pour debug
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email value:', this.email);
    console.log('Email type:', typeof this.email);
    console.log('Password value:', this.password);
    console.log('Password length:', this.password?.length);
    
    if (!this.email || !this.password || this.password.length < 6) {
      this.message = 'Veuillez saisir un email valide et un mot de passe (min. 6 caractères).';
      console.log('Validation failed:', this.message);
      return;
    }

    console.log('Calling authService.login...');
    this.authService.login(this.email, this.password)
      .then(() => {
        console.log('Login successful!');
        this.router.navigate(['/dashboard']);
      })
      .catch(err => {
        console.error('Login error:', err);
        this.message = err.message || 'Erreur de connexion';
      });
  }

  register() {
    console.log('Navigate to register');
    this.router.navigate(['/register']);
  }

  forgotPassword() {
    console.log('Navigate to forgot password');
    this.router.navigate(['/forgot-password']);
  }
}