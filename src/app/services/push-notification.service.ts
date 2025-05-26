import { Injectable } from '@angular/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  
  constructor(private platform: Platform) {}

  async initializePushNotifications() {
    if (!this.platform.is('capacitor')) {
      console.log('Push notifications only work on device');
      return;
    }

    // Demander les permissions
    const permission = await PushNotifications.requestPermissions();
    
    if (permission.receive === 'granted') {
      // Enregistrer l'appareil pour les notifications push
      await PushNotifications.register();
      
      // Écouter les événements
      this.setupListeners();
    }
  }

  private setupListeners() {
    // Événement: Token de l'appareil reçu
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
      // Envoyer ce token à votre backend/Firebase
      this.saveTokenToFirebase(token.value);
    });

    // Événement: Erreur d'enregistrement
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Événement: Notification reçue (app en foreground)
    PushNotifications.addListener('pushNotificationReceived', 
      (notification: PushNotificationSchema) => {
        console.log('Push received: ' + JSON.stringify(notification));
        // Afficher une notification locale si l'app est ouverte
        this.showLocalNotification(notification);
      }
    );

    // Événement: Notification cliquée
    PushNotifications.addListener('pushNotificationActionPerformed', 
      (notification: ActionPerformed) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
        // Naviguer vers la page appropriée
      }
    );
  }

  private async showLocalNotification(notification: PushNotificationSchema) {
    await LocalNotifications.schedule({
      notifications: [{
        title: notification.title || 'Alerte Météo',
        body: notification.body || '',
        id: Date.now(),
        schedule: { at: new Date(Date.now() + 1000) },
        sound: 'beep.wav',
        smallIcon: 'ic_stat_icon_config_sample'
      }]
    });
  }

  private saveTokenToFirebase(token: string) {
    // Sauvegarder le token dans Firebase pour pouvoir envoyer des notifications
    // Vous devrez implémenter cette fonction selon votre structure Firebase
    console.log('Token à sauvegarder:', token);
  }
}