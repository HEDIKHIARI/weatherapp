import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

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

  constructor(
    private authService: AuthService,
    private toastController: ToastController,
    private router: Router
  ) {}

  async resetPassword() {
    if (!this.email) {
      this.message = 'Veuillez entrer votre adresse e-mail.';
      return;
    }

    try {
      await this.authService.resetPassword(this.email);
      const toast = await this.toastController.create({
        message: 'Un lien de réinitialisation a été envoyé à votre adresse e-mail.',
        duration: 3000,
        color: 'success'
      });
      await toast.present();
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.message = error.message || 'Une erreur est survenue.';
    }
  }

  // 🔁 Méthode ajoutée pour revenir manuellement au login
  login() {
    this.router.navigate(['/login']);
  }
}
