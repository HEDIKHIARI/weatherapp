import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, Platform } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class RegisterPage implements AfterViewInit {
  @ViewChild('usernameInput') usernameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;
  @ViewChild('confirmPasswordInput') confirmPasswordInput!: ElementRef<HTMLInputElement>;

  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  message: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController,
    private platform: Platform
  ) {
    console.log('RegisterPage constructor called');
  }

  ngAfterViewInit() {
    console.log('RegisterPage ngAfterViewInit called');
    
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

  onUsernameFocus() {
    console.log('Username input focused');
    this.focusSpecificInput(this.usernameInput);
  }

  onEmailFocus() {
    console.log('Email input focused');
    this.focusSpecificInput(this.emailInput);
  }

  onPasswordFocus() {
    console.log('Password input focused');
    this.focusSpecificInput(this.passwordInput);
  }

  onConfirmPasswordFocus() {
    console.log('Confirm password input focused');
    this.focusSpecificInput(this.confirmPasswordInput);
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
  testUsernameFocus() {
    console.log('=== TESTING USERNAME FOCUS ===');
    try {
      this.focusSpecificInput(this.usernameInput);
      console.log('Username focus test completed');
    } catch (error) {
      console.error('Username focus test failed:', error);
    }
  }

  onUsernameInputNative(event: any) {
    this.username = event.target.value;
    console.log('Username updated (native):', this.username);
  }

  onEmailInputNative(event: any) {
    this.email = event.target.value;
    console.log('Email updated (native):', this.email);
  }

  onPasswordInputNative(event: any) {
    this.password = event.target.value;
    console.log('Password updated (native):', this.password?.length, 'characters');
  }

  onConfirmPasswordInputNative(event: any) {
    this.confirmPassword = event.target.value;
    console.log('Confirm password updated (native):', this.confirmPassword?.length, 'characters');
  }

  async register() {
    console.log('=== REGISTER ATTEMPT ===');
    console.log('Username:', this.username);
    console.log('Email:', this.email);
    console.log('Password length:', this.password?.length);
    console.log('Confirm password length:', this.confirmPassword?.length);

    if (!this.email || !this.password || !this.username) {
      this.message = 'Veuillez remplir tous les champs.';
      console.log('Validation failed: missing fields');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.message = 'Les mots de passe ne correspondent pas.';
      console.log('Validation failed: passwords do not match');
      return;
    }

    if (this.password.length < 6) {
      this.message = 'Le mot de passe doit contenir au moins 6 caractères.';
      console.log('Validation failed: password too short');
      return;
    }

    try {
      console.log('Calling authService.register...');
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

      console.log('Registration successful, redirecting to login...');

      // ✅ Redirection forcée vers login (léger délai pour garantir le signOut complet)
      setTimeout(() => {
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }, 100);

    } catch (err: any) {
      console.error('Registration error:', err);
      this.message = err.message || 'Une erreur est survenue.';
    }
  }

  goToLogin() {
    console.log('Navigate to login');
    this.router.navigate(['/login']);
  }
}