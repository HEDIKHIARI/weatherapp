import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

// Firebase AngularFire imports
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideDatabase, getDatabase } from '@angular/fire/database';

import { environment } from './environments/environment';
import { Storage } from '@ionic/storage-angular';

// Traduction
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// Initialisation locale (stockage + langue)
async function initializeAppConfig() {
  const storage = new Storage();
  await storage.create();
  const savedLang = await storage.get('userLanguage');
  const defaultLang = savedLang || 'fr';
  return { storage, defaultLang };
}

// Bootstrap de l'application
initializeAppConfig().then(({ storage, defaultLang }) => {
  bootstrapApplication(AppComponent, {
    providers: [
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
      provideIonicAngular(),
      provideRouter(routes, withPreloading(PreloadAllModules)),
      provideHttpClient(withInterceptorsFromDi()),

      { provide: Storage, useValue: storage },
      { provide: 'defaultLanguage', useValue: defaultLang },

      // Firebase AngularFire (pas via firebase/app !) 
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideAuth(() => getAuth()),
      provideFirestore(() => getFirestore()),
      provideDatabase(() => getDatabase()),

      // Traduction via ngx-translate
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
