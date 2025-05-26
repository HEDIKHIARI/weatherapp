import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';

@Injectable({
  providedIn: 'root'
})
export class FirebaseMessagingService {

  constructor(
    private firestore: AngularFirestore,
    private functions: AngularFireFunctions
  ) {}

  async sendWeatherAlert(alertData: any) {
    // Utiliser une Cloud Function Firebase pour envoyer la notification
    const sendNotification = this.functions.httpsCallable('sendWeatherAlert');
    
    try {
      const result = await sendNotification({
        title: 'Alerte Météorologique',
        body: `${alertData.type}: ${alertData.message}`,
        data: {
          alertType: alertData.type,
          severity: alertData.severity,
          timestamp: new Date().toISOString()
        }
      }).toPromise();
      
      console.log('Notification envoyée:', result);
    } catch (error) {
      console.error('Erreur envoi notification:', error);
    }
  }
}