import { Component, OnInit } from '@angular/core';
import { Platform, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  
  constructor(private platform: Platform) {
    console.log('AppComponent constructor');
  }

  async ngOnInit() {
    console.log('AppComponent ngOnInit');
    await this.initializeApp();
  }

  private async initializeApp() {
    console.log('Initializing app...');
    
    // Attendre que la plateforme soit prête
    await this.platform.ready();
    console.log('Platform ready');

    // Configuration spécifique pour les appareils mobiles
    if (Capacitor.isNativePlatform()) {
      console.log('Native platform detected, setting up mobile features...');
      await this.setupMobileFeatures();
    } else {
      console.log('Web platform detected');
      this.setupWebFeatures();
    }
  }

  private async setupMobileFeatures() {
    try {
      // Configuration de la barre de statut
      await StatusBar.setStyle({ style: Style.Default });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
      console.log('StatusBar configured');

      // Configuration du clavier avec gestion d'erreur
      await this.setupKeyboardHandling();

      // Masquer le splash screen
      await SplashScreen.hide();
      console.log('SplashScreen hidden');
      
      // Configuration supplémentaire pour Android
      if (this.platform.is('android')) {
        await this.setupAndroidSpecific();
      }
      
      console.log('Mobile features initialized successfully');
    } catch (error) {
      console.error('Error initializing mobile features:', error);
      // Utiliser le fallback même en cas d'erreur
      this.setupBasicKeyboardHandling();
    }
  }

  private setupWebFeatures() {
    console.log('Setting up web-specific features...');
    this.setupBasicKeyboardHandling();
  }

  private async setupKeyboardHandling() {
    try {
      // Essayer d'importer le plugin Keyboard avec gestion d'erreur
      const { Keyboard } = await import('@capacitor/keyboard');
      console.log('Keyboard plugin imported successfully');

      // Tester si les méthodes sont disponibles
      await this.testKeyboardMethods(Keyboard);
      
    } catch (error) {
      console.warn('Keyboard plugin not available or not working:', error);
      // Fallback vers la détection native
      this.setupBasicKeyboardHandling();
    }
  }

  private async testKeyboardMethods(Keyboard: any) {
    try {
      // Tester chaque méthode individuellement
      console.log('Testing Keyboard methods...');
      
      // Test 1: setAccessoryBarVisible
      try {
        await Keyboard.setAccessoryBarVisible({ isVisible: true });
        console.log('✓ setAccessoryBarVisible works');
      } catch (e: any) {
        console.warn('✗ setAccessoryBarVisible not supported:', e.message);
      }

      // Test 2: setScroll
      try {
        await Keyboard.setScroll({ isDisabled: false });
        console.log('✓ setScroll works');
      } catch (e: any) {
        console.warn('✗ setScroll not supported:', e.message);
      }

      // Test 3: setResizeMode
      try {
        await Keyboard.setResizeMode({ mode: 'body' as any });
        console.log('✓ setResizeMode works');
      } catch (e: any) {
        console.warn('✗ setResizeMode not supported:', e.message);
      }

      // Ajouter les listeners seulement si pas d'erreur majeure
      this.setupKeyboardListeners(Keyboard);
      
    } catch (error) {
      console.error('Keyboard methods test failed:', error);
      this.setupBasicKeyboardHandling();
    }
  }

  private setupKeyboardListeners(Keyboard: any) {
    try {
      // Écouteurs d'événements clavier
      Keyboard.addListener('keyboardWillShow', (info: any) => {
        console.log('Keyboard will show:', info);
        document.body.classList.add('keyboard-open');
        
        const content = document.querySelector('ion-content');
        if (content && info.keyboardHeight) {
          (content as any).style.setProperty('--keyboard-offset', `${info.keyboardHeight}px`);
        }
      });

      Keyboard.addListener('keyboardWillHide', () => {
        console.log('Keyboard will hide');
        document.body.classList.remove('keyboard-open');
        
        const content = document.querySelector('ion-content');
        if (content) {
          (content as any).style.setProperty('--keyboard-offset', '0px');
        }
      });

      Keyboard.addListener('keyboardDidShow', (info: any) => {
        console.log('Keyboard did show:', info);
        this.forceInputRedraw();
      });

      Keyboard.addListener('keyboardDidHide', () => {
        console.log('Keyboard did hide');
      });

      console.log('Keyboard listeners added successfully');

    } catch (error) {
      console.warn('Could not add keyboard listeners:', error);
      this.setupBasicKeyboardHandling();
    }
  }

  private setupBasicKeyboardHandling() {
    console.log('Setting up basic keyboard handling (fallback)...');
    
    let keyboardOpen = false;
    const initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    
    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      if (heightDifference > 150 && !keyboardOpen) {
        keyboardOpen = true;
        document.body.classList.add('keyboard-open');
        console.log('Keyboard opened (viewport method)');
        
        const content = document.querySelector('ion-content');
        if (content) {
          (content as any).style.setProperty('--keyboard-offset', `${heightDifference}px`);
        }
        
        setTimeout(() => this.forceInputRedraw(), 300);
        
      } else if (heightDifference <= 150 && keyboardOpen) {
        keyboardOpen = false;
        document.body.classList.remove('keyboard-open');
        console.log('Keyboard closed (viewport method)');
        
        const content = document.querySelector('ion-content');
        if (content) {
          (content as any).style.setProperty('--keyboard-offset', '0px');
        }
      }
    };

    // Utiliser visualViewport si disponible
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      console.log('Using visualViewport for keyboard detection');
    } else {
      window.addEventListener('resize', handleViewportChange);
      console.log('Using window resize for keyboard detection');
    }

    // Améliorer le focus des inputs
    this.setupInputFocusHandling();
  }

  private setupInputFocusHandling() {
    console.log('Setting up input focus handling...');
    
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        console.log('Input focused:', target);
        
        setTimeout(() => {
          target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }, 300);

        if (this.platform.is('capacitor')) {
          setTimeout(() => {
            target.focus();
            target.click();
          }, 100);
        }
      }
    });

    // Gérer les clics sur les labels Ionic
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'ION-LABEL') {
        const ionItem = target.closest('ion-item');
        const ionInput = ionItem?.querySelector('ion-input');
        if (ionInput) {
          setTimeout(() => {
            (ionInput as any).setFocus();
          }, 100);
        }
      }
    });
  }

  private forceInputRedraw() {
    setTimeout(() => {
      const inputs = document.querySelectorAll('ion-input');
      inputs.forEach(input => {
        try {
          (input as any).forceUpdate?.();
        } catch (e: any) {
          // Ignorer les erreurs
        }
      });
    }, 100);
  }

  private async setupAndroidSpecific() {
    console.log('Setting up Android-specific features...');
    
    try {
      if (this.platform.is('android')) {
        // Désactiver le zoom automatique sur les inputs
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        
        // Vérifier si le meta n'existe pas déjà
        const existingMeta = document.querySelector('meta[name="viewport"]');
        if (!existingMeta) {
          document.getElementsByTagName('head')[0].appendChild(meta);
          console.log('Android viewport meta tag added');
        }
      }
    } catch (error) {
      console.error('Error setting up Android features:', error);
    }
  }
}