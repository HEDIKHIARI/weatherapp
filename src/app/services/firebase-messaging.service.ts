import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseMessagingService {
  constructor(private afMessaging: AngularFireMessaging) {}

  requestPermission() {
    return this.afMessaging.requestToken.pipe(
      mergeMap(token => {
        console.log('FCM Token:', token);
        // Envoyez ce token à votre backend pour enregistrement
        if (token) {
          return this.saveToken(token);
        } else {
          // Gérez le cas où le token est null
          return of(null);
        }
      })
    );
  }

  private saveToken(token: string) {
    // Implémentez l'envoi du token à votre API
    return of(null);
  }

  receiveMessages() {
    return this.afMessaging.messages;
  }
}