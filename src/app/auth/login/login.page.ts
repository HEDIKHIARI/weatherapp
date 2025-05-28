import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, IonInput, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Keyboard } from '@capacitor/keyboard';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  @ViewChild('emailInput') emailInput!: IonInput;
  @ViewChild('passwordInput') passwordInput!: IonInput;
  
  email = '';
  password = '';
  message = '';
  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private auth: Auth,
    private formBuilder: FormBuilder,
    private platform: Platform
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async ngOnInit() {
    onAuthStateChanged(this.auth, (user: User | null) => {
      if (user) {
        this.router.navigate(['/dashboard']);
      }
    });

    // Handle keyboard events on mobile
    if (this.platform.is('capacitor')) {
      await this.setupKeyboardHandling();
    }
  }

  private async setupKeyboardHandling() {
    try {
      // Add keyboard event listeners
      Keyboard.addListener('keyboardWillShow', () => {
        document.body.classList.add('keyboard-open');
      });

      Keyboard.addListener('keyboardWillHide', () => {
        document.body.classList.remove('keyboard-open');
      });

      // Set keyboard configuration
      await Keyboard.setAccessoryBarVisible({ isVisible: true });
      await Keyboard.setScroll({ isDisabled: false });
    } catch (error) {
      console.error('Keyboard setup error:', error);
    }
  }

  async focusInput(inputElement: IonInput) {
    if (this.platform.is('capacitor')) {
      setTimeout(async () => {
        await inputElement.setFocus();
      }, 150);
    }
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

  ngOnDestroy() {
    // Clean up keyboard listeners
    if (this.platform.is('capacitor')) {
      Keyboard.removeAllListeners();
    }
  }
}