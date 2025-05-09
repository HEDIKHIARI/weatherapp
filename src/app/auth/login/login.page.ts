import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, FormsModule],
  templateUrl: './login.page.html',
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  message = '';

  private auth = inject(Auth);
  private router = inject(Router);

  constructor(private authService: AuthService) {}

  ngOnInit() {
    onAuthStateChanged(this.auth, (user: User | null) => {
      if (user) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  login() {
    if (!this.email || !this.password || this.password.length < 6) {
      this.message = 'Veuillez saisir un email valide et un mot de passe (min. 6 caractères).';
      return;
    }

    this.authService.login(this.email, this.password)
      .then(() => {
       
        this.router.navigate(['/dashboard']);
      })
      .catch(err => {
        console.error(err);
        this.message = err.message;
      });
  }

  register() {
    this.router.navigate(['/register']);
  }

  forgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}
