import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { RouterModule } from '@angular/router'; // Import RouterModule
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule]
})
export class LoginPage {
  icon: string = 'assets/icon/login-icon.png'; // Chemin vers l'image
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    // Simule une connexion réussie
    if (this.email === 'test@example.com' && this.password === 'password') {
      this.router.navigate(['/dashboard']); // Redirige vers le tableau de bord
    } else {
      alert('Identifiants incorrects');
    }
  }
}