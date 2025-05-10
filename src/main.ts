import { bootstrapApplication } from '@angular/platform-browser';
import { 
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules 
} from '@angular/router';
import { 
  IonicRouteStrategy, 
  provideIonicAngular 
} from '@ionic/angular/standalone';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { 
  TranslateModule, 
  TranslateLoader,
  TranslateService, 
  LangChangeEvent
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { getDatabase } from "firebase/database";
import { environment } from './environments/environment';

// Import Firebase SDKs
import { initializeApp as firebaseInitializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Initialize Firebase
const firebaseApp = firebaseInitializeApp(environment.firebase);
const analytics = getAnalytics(firebaseApp);
const database = getDatabase(firebaseApp);
// Configuration améliorée du loader de traduction
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(
    http,
    './assets/i18n/', // Chemin vers les fichiers de traduction
    '.json' // Extension des fichiers
  );
}

// Fonction d'initialisation améliorée avec gestion de la langue
async function initializeApp() {
  const storage = new Storage();
  await storage.create();
  
  // Initialisation avec la langue sauvegardée ou le français par défaut
  const savedLang = await storage.get('userLanguage');
  const defaultLang = savedLang || 'fr';
  
  return {
    storage,
    defaultLang
  };
}

// Bootstrap de l'application avec la traduction
initializeApp().then(({ storage, defaultLang }) => {
  bootstrapApplication(AppComponent, {
    providers: [
      // Configuration des routes et d'Ionic
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
      provideIonicAngular(),
      provideRouter(routes, withPreloading(PreloadAllModules)),
      
      // Configuration HTTP
      provideHttpClient(withInterceptorsFromDi()), // Provide HttpClient here
      
      // Configuration du stockage
      { provide: Storage, useValue: storage },
      
      // Configuration de la traduction
      importProvidersFrom(
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient]
          }
        })
      ),
      
      // Provider pour la langue par défaut
      { provide: 'defaultLanguage', useValue: defaultLang }
    ]
  }).then((appRef) => {
    // Use ApplicationRef to access the injector
    const translate = appRef.injector.get(TranslateService);
    translate.setDefaultLang('fr'); // Langue de fallback
    translate.use(defaultLang); // Langue courante

    // Sauvegarde du changement de langue
    const appStorage = appRef.injector.get(Storage);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
      appStorage.set('userLanguage', event.lang);
    });
  }).catch((err) => console.error('Bootstrap error:', err));
});