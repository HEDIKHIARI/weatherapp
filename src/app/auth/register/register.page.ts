import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class RegisterPage {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  message: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  async register() {
    if (!this.email || !this.password || !this.username) {
      this.message = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.message = 'Les mots de passe ne correspondent pas.';
      return;
    }

    try {
      // ✅ Créer l'utilisateur
      await this.authService.register(this.email, this.password, this.username);

      // ✅ Déconnexion immédiate
      const { getAuth, signOut } = await import('@angular/fire/auth');
      await signOut(getAuth());

      // ✅ Message de succès
      const toast = await this.toastController.create({
        message: 'Compte créé avec succès. Veuillez vous connecter.',
        duration: 2500,
        color: 'success'
      });
      await toast.present();

      // ✅ Redirection forcée vers login (léger délai pour garantir le signOut complet)
      setTimeout(() => {
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }, 100);

    } catch (err: any) {
      console.error(err);
      this.message = err.message || 'Une erreur est survenue.';
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
