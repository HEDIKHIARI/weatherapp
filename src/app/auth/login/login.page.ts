import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonInput, Platform } from '@ionic/angular';
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
export class LoginPage implements OnInit, AfterViewInit {
  @ViewChild('emailInput') emailInput!: IonInput;
  @ViewChild('passwordInput') passwordInput!: IonInput;
  
  email = '';
  password = '';
  message = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private auth: Auth,
    private platform: Platform
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

  ngAfterViewInit() {
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
      ion-input input {
        -webkit-user-select: text !important;
        user-select: text !important;
        -webkit-touch-callout: default !important;
        -webkit-tap-highlight-color: rgba(0,0,0,0.1) !important;
        pointer-events: auto !important;
        cursor: text !important;
        font-size: 16px !important;
        caret-color: #F4B942 !important;
      }
      
      ion-input input:focus {
        -webkit-user-select: text !important;
        user-select: text !important;
        outline: none !important;
        caret-color: #F4B942 !important;
        animation: blink-caret 1s step-end infinite;
      }
      
      ion-item {
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

    // Améliorer la gestion tactile des inputs Ionic
    const inputs = document.querySelectorAll('ion-input');
    inputs.forEach(input => {
      input.addEventListener('click', async () => {
        console.log('Ion-input clicked');
        try {
          await (input as any).setFocus();
          const nativeInput = await (input as any).getInputElement();
          if (nativeInput) {
            nativeInput.focus();
            nativeInput.click();
            this.forceVisibleCursor(nativeInput);
          }
        } catch (error) {
          console.error('Error focusing input:', error);
        }
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

  async onEmailFocus() {
    console.log('Email input focused');
    await this.focusSpecificInput(this.emailInput);
  }

  async onPasswordFocus() {
    console.log('Password input focused');
    await this.focusSpecificInput(this.passwordInput);
  }

  private async focusSpecificInput(inputRef: IonInput) {
    console.log('Focusing specific input...');
    
    try {
      await inputRef.setFocus();
      const nativeInput = await inputRef.getInputElement();
      if (nativeInput) {
        // Focus normal
        nativeInput.focus();
        nativeInput.click();
        
        // Fix spécial Galaxy
        this.forceVisibleCursor(nativeInput);
      }
    } catch (error) {
      console.error('Error focusing specific input:', error);
    }
  }

  // Méthode de test pour debugger
  async testEmailFocus() {
    console.log('=== TESTING EMAIL FOCUS ===');
    try {
      await this.focusSpecificInput(this.emailInput);
      console.log('Email focus test completed');
    } catch (error) {
      console.error('Email focus test failed:', error);
    }
  }

  onEmailInputNative(event: any) {
    this.email = event.target.value;
    console.log('Email updated (native):', this.email);
  }

  onPasswordInputNative(event: any) {
    this.password = event.target.value;
    console.log('Password updated (native):', this.password?.length, 'characters');
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
      .then(() =>{
      console.log('Login successful!');
      console.log('Navigating to dashboard...');
      
      // Test de navigation
      this.router.navigate(['/dashboard']).then(success => {
        console.log('Navigation success:', success);
        if (!success) {
          console.error('Navigation failed!');
          this.message = 'Erreur de navigation vers le dashboard';
        }
      }).catch(error => {
        console.error('Navigation error:', error);
        this.message = 'Erreur de navigation: ' + error.message;
      });
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