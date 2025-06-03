import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ToastController, Platform } from '@ionic/angular';
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
export class ForgotPasswordPage implements AfterViewInit {
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;

  email: string = '';
  message: string = '';

  constructor(
    private authService: AuthService,
    private toastController: ToastController,
    private router: Router,
    private platform: Platform
  ) {
    console.log('ForgotPasswordPage constructor called');
  }

  ngAfterViewInit() {
    console.log('ForgotPasswordPage ngAfterViewInit called');
    
    // Setup mobile input handling après l'initialisation de la vue
    if (this.platform.is('capacitor')) {
      setTimeout(() => {
        this.setupMobileInputs();
        this.forceKeyboardSupport();
      }, 500);
    }
  }

  private forceKeyboardSupport() {
    console.log('Forcing keyboard support...');
    
    // Forcer la configuration du viewport pour mobile
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(meta);
    }

    // Forcer les propriétés CSS des inputs
    const style = document.createElement('style');
    style.textContent = `
      .native-input {
        -webkit-user-select: text !important;
        user-select: text !important;
        -webkit-touch-callout: default !important;
        -webkit-tap-highlight-color: rgba(0,0,0,0.1) !important;
        pointer-events: auto !important;
        cursor: text !important;
        font-size: 16px !important;
        caret-color: #F4B942 !important;
      }
      
      .native-input:focus {
        -webkit-user-select: text !important;
        user-select: text !important;
        outline: none !important;
        caret-color: #F4B942 !important;
        animation: blink-caret 1s step-end infinite;
      }
      
      .native-input-container {
        pointer-events: auto !important;
      }
      
      @keyframes blink-caret {
        from, to { border-right-color: transparent; }
        50% { border-right-color: #F4B942; }
      }
    `;
    document.head.appendChild(style);
  }

  private setupMobileInputs() {
    console.log('Setting up mobile inputs...');
    
    // Forcer l'affichage du curseur sur les inputs
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT') {
        console.log('Input focused on mobile');
        this.forceVisibleCursor(target as HTMLInputElement);
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    });

    // Améliorer la gestion tactile des inputs natifs
    const inputs = document.querySelectorAll('.native-input');
    inputs.forEach(input => {
      input.addEventListener('click', () => {
        console.log('Native input clicked');
        const htmlInput = input as HTMLInputElement;
        htmlInput.focus();
        htmlInput.click();
        this.forceVisibleCursor(htmlInput);
      });
    });
  }

  private forceVisibleCursor(nativeInput: HTMLInputElement) {
    console.log('Forcing visible cursor for Galaxy...');
    
    // Forcer les styles du curseur
    nativeInput.style.caretColor = '#F4B942';
    nativeInput.style.color = '#2C3E50';
    nativeInput.style.fontSize = '16px';
    nativeInput.style.cursor = 'text';
    
    // Séquence spéciale pour Galaxy
    nativeInput.focus();
    nativeInput.setSelectionRange(nativeInput.value.length, nativeInput.value.length);
    
    // Force le curseur en simulant une saisie
    setTimeout(() => {
      nativeInput.focus();
      nativeInput.click();
      
      // Simuler un caractère puis l'effacer (pour forcer le curseur)
      const currentValue = nativeInput.value;
      nativeInput.value = currentValue + ' ';
      nativeInput.value = currentValue;
      
      // Repositionner le curseur
      nativeInput.setSelectionRange(currentValue.length, currentValue.length);
    }, 100);
  }

  onEmailFocus() {
    console.log('Email input focused');
    this.focusSpecificInput(this.emailInput);
  }

  private focusSpecificInput(inputRef: ElementRef<HTMLInputElement>) {
    console.log('Focusing specific input...');
    
    try {
      if (inputRef && inputRef.nativeElement) {
        const nativeInput = inputRef.nativeElement;
        nativeInput.focus();
        nativeInput.click();
        this.forceVisibleCursor(nativeInput);
      }
    } catch (error) {
      console.error('Error focusing specific input:', error);
    }
  }

  // Méthode de test pour debugger
  testEmailFocus() {
    console.log('=== TESTING EMAIL FOCUS ===');
    try {
      this.focusSpecificInput(this.emailInput);
      console.log('Email focus test completed');
    } catch (error) {
      console.error('Email focus test failed:', error);
    }
  }

  onEmailInputNative(event: any) {
    this.email = event.target.value;
    console.log('Email updated (native):', this.email);
  }

  async resetPassword() {
    console.log('=== RESET PASSWORD ATTEMPT ===');
    console.log('Email value:', this.email);

    if (!this.email || !this.email.trim()) {
      this.message = 'Veuillez entrer votre adresse e-mail.';
      console.log('Validation failed: email empty');
      return;
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.message = 'Veuillez saisir un email valide.';
      console.log('Validation failed: invalid email format');
      return;
    }

    try {
      console.log('Calling authService.resetPassword...');
      await this.authService.resetPassword(this.email.trim());
      
      const toast = await this.toastController.create({
        message: 'Un lien de réinitialisation a été envoyé à votre adresse e-mail.',
        duration: 3000,
        color: 'success'
      });
      await toast.present();
      
      console.log('Reset password successful, redirecting to login...');
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Reset password error:', error);
      this.message = error.message || 'Une erreur est survenue.';
    }
  }

  // 🔁 Méthode ajoutée pour revenir manuellement au login
  login() {
    console.log('Navigate to login');
    this.router.navigate(['/login']);
  }
}