import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class ForgotPasswordPage {
  email: string = '';
  message: string = '';

  constructor(private router: Router) {}

  resetPassword() {
    if (!this.email) {
      this.message = 'Please enter your email';
      return;
    }

    // Simulation d'envoi d'email
    console.log('Password reset requested for:', this.email);
    this.message = `Reset link sent to ${this.email}`;
    
    // Retour au login après 2 secondes
    setTimeout(() => {
      this.login();
    }, 2000);
  }

  // Méthode corrigée pour la navigation
  login() {
    this.router.navigate(['/login']);
  }
}