import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// Firebase v9+ modular
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideDatabase, getDatabase } from '@angular/fire/database';

import { environment } from './environments/environment';
import { Storage } from '@ionic/storage-angular';

// ngx-translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';

// AJOUT IMPORTANT: Import des modules de formulaires
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const firebaseApp = initializeApp(environment.firebase);
const auth = getAuth(firebaseApp);

// Fonction pour charger les traductions
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// Initialisation avant le lancement
async function initializeAppConfig() {
  const storage = new Storage();
  await storage.create();
  const savedLang = await storage.get('userLanguage');
  const defaultLang = savedLang || 'fr';
  return { storage, defaultLang };
}

// Bootstrap de l'application
initializeAppConfig().then(({ storage, defaultLang }) => {
  console.log('Firebase initialisé avec succès');
  
  bootstrapApplication(AppComponent, {
    providers: [
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
      provideIonicAngular(),
      provideRouter(routes, withPreloading(PreloadAllModules)),
      provideHttpClient(withInterceptorsFromDi()),
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideAuth(() => getAuth()),
      provideFirestore(() => getFirestore()),
      provideDatabase(() => getDatabase()),
     
      // Storage & langue par défaut
      { provide: Storage, useValue: storage },
      { provide: 'defaultLanguage', useValue: defaultLang },
      { provide: 'FIREBASE_AUTH', useValue: auth },

      // AJOUT IMPORTANT: Providers pour les formulaires
      importProvidersFrom(FormsModule),
      importProvidersFrom(ReactiveFormsModule),

      // ngx-translate
      importProvidersFrom(
        TranslateModule.forRoot({
          defaultLanguage: defaultLang,
          loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient]
          }
        })
      ),
    ]
  }).catch((err) => console.error('Bootstrap error:', err));
});