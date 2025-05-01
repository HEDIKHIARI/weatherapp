import { bootstrapApplication } from '@angular/platform-browser';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { 
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules, 
  withDebugTracing
} from '@angular/router';
import { 
  IonicRouteStrategy, 
  provideIonicAngular 
} from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';

// Configuration Firebase
export const firebaseApp = initializeApp(environment.firebase);
export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);

// Configuration TranslateLoader
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// Configuration de l'application
export const appConfig: ApplicationConfig = {
  providers: [
    // Configuration des routes
    provideRouter(routes, withDebugTracing()),
    
    // Configuration Ionic
    provideIonicAngular(),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    
    // Configuration Firebase
    { provide: 'FIREBASE_APP', useValue: firebaseApp },
    { provide: 'FIREBASE_AUTH', useValue: auth },
    { provide: 'FIRESTORE', useValue: firestore },
    
    // Configuration HTTP
    provideHttpClient(withInterceptorsFromDi()),
    
    // Configuration i18n
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        }
      })
    ),
    
    // Configuration Storage
    importProvidersFrom(Storage)
  ]
};

// Initialisation asynchrone
async function initializeAppWithConfig() {
  try {
    // Initialisation du storage
    const storage = new Storage();
    await storage.create();
    const savedLang = await storage.get('userLanguage');
    const defaultLang = savedLang || 'fr';

    // Bootstrap de l'application avec la config
    const appRef = await bootstrapApplication(AppComponent, {
      ...appConfig,
      providers: [
        ...appConfig.providers,
        { provide: Storage, useValue: storage },
        { provide: 'defaultLanguage', useValue: defaultLang }
      ]
    });

    // Configuration de la langue
    const translate = appRef.injector.get(TranslateService);
    translate.setDefaultLang('fr');
    translate.use(defaultLang);

    // Ecoute des changements de langue
    translate.onLangChange.subscribe((event: any) => {
      storage.set('userLanguage', event.lang);
    });

  } catch (error) {
    console.error('Application initialization failed:', error);
  }
}

// Vérification de la config Firebase
if (!environment.firebase) {
  throw new Error('Firebase configuration is missing in environment.ts');
}

// Lancement de l'application
initializeAppWithConfig();