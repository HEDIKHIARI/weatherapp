import { Injectable, inject } from '@angular/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Platform } from '@ionic/angular';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastController = inject(ToastController);
  
  // URL de votre backend (changez selon votre configuration)
  private backendUrl = 'http://localhost:3000'; // Pour le développement
  // private backendUrl = 'https://votre-backend.herokuapp.com'; // Pour la production
  
  // Stockage local du token pour accès facile
  private currentToken: string | null = null;
  
  constructor(private platform: Platform) {}

  async initializePushNotifications() {
    if (!this.platform.is('capacitor')) {
      console.log('Push notifications only work on device');
      return;
    }

    try {
      // Demander les permissions
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      
      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      }

      // Enregistrer l'appareil pour les notifications push
      await PushNotifications.register();
      
      // Configurer les listeners
      this.setupListeners();
      
      // Demander les permissions pour les notifications locales aussi
      await LocalNotifications.requestPermissions();
      
      console.log('Push notifications initialized successfully');
      
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      this.showToast('Erreur lors de l\'initialisation des notifications', 'danger');
    }
  }

  private setupListeners() {
    // Token reçu - AVEC AFFICHAGE POUR TEST
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('=== TOKEN FCM POUR TEST ===');
      console.log(token.value);
      console.log('=========================');
      
      // Afficher dans une alerte pour faciliter la copie
      alert(`Token FCM: ${token.value}`);
      
      // Afficher aussi dans un toast
      await this.showToast(`Token FCM reçu (voir console)`, 'success', 5000);
      
      // Sauvegarder le token
      this.currentToken = token.value;
      await this.saveTokenToBackend(token.value);
      
      // Optionnel : Copier dans le presse-papier (si disponible)
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(token.value);
          console.log('Token copié dans le presse-papier!');
          await this.showToast('Token copié dans le presse-papier!', 'success');
        } catch (err) {
          console.error('Impossible de copier le token:', err);
        }
      }
    });

    // Erreur d'enregistrement
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration: ' + JSON.stringify(error));
      this.showToast('Erreur d\'enregistrement des notifications', 'danger');
    });

    // Notification reçue (app en foreground)
    PushNotifications.addListener('pushNotificationReceived', 
      async (notification: PushNotificationSchema) => {
        console.log('Push received in foreground: ' + JSON.stringify(notification));
        
        // Afficher une notification locale si l'app est ouverte
        await this.showLocalNotification(notification);
        
        // Afficher aussi un toast
        await this.showToast(notification.body || 'Nouvelle alerte météo', 'warning');
      }
    );

    // Notification cliquée
    PushNotifications.addListener('pushNotificationActionPerformed', 
      (notification: ActionPerformed) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
        
        // Récupérer les données de la notification
        const data = notification.notification.data;
        
        // Naviguer selon le type d'alerte
        if (data && data.type) {
          switch (data.type) {
            case 'HIGH_TEMPERATURE':
            case 'FROST_ALERT':
            case 'HIGH_WIND':
            case 'HEAVY_RAIN':
              this.router.navigate(['/dashboard']);
              break;
            case 'SENSOR_ISSUE':
              this.router.navigate(['/settings']);
              break;
            default:
              this.router.navigate(['/dashboard']);
          }
        } else {
          this.router.navigate(['/dashboard']);
        }
      }
    );
  }

  private async showLocalNotification(notification: PushNotificationSchema) {
    await LocalNotifications.schedule({
      notifications: [{
        title: notification.title || 'Alerte Météo',
        body: notification.body || '',
        id: new Date().getTime(),
        schedule: { at: new Date(Date.now() + 1000) },
        sound: 'default',
        attachments: undefined,
        actionTypeId: '',
        extra: notification.data
      }]
    });
  }

  private async saveTokenToBackend(token: string) {
    const user = this.auth.currentUser;
    if (!user) {
      console.warn('Pas d\'utilisateur connecté, token non sauvegardé');
      return;
    }

    try {
      // Sauvegarder dans Firestore
      const userRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userRef, {
        fcmToken: token,
        lastUpdated: new Date(),
        platform: this.getPlatformInfo(),
        email: user.email
      }, { merge: true });

      // Envoyer au backend Node.js
      await this.http.post(`${this.backendUrl}/register`, {
        userId: user.uid,
        token: token,
        email: user.email,
        platform: this.getPlatformInfo()
      }).toPromise();

      console.log('Token saved successfully to Firestore and backend');
      await this.showToast('Notifications activées avec succès', 'success');
      
    } catch (error) {
      console.error('Error saving token:', error);
      await this.showToast('Erreur lors de la sauvegarde du token', 'danger');
    }
  }

  // Méthode pour obtenir le token actuel
  getCurrentToken(): string | null {
    return this.currentToken;
  }

  // Méthode pour envoyer une notification d'alerte météo
  async sendWeatherAlert(alert: {
    type: string;
    severity: string;
    message: string;
  }) {
    const user = this.auth.currentUser;
    if (!user) return;

    try {
      await this.http.post(`${this.backendUrl}/send-alert`, {
        userId: user.uid,
        alert: {
          title: this.getAlertTitle(alert.type),
          message: alert.message,
          data: {
            type: alert.type,
            severity: alert.severity,
            timestamp: new Date().toISOString()
          }
        }
      }).toPromise();
      
      console.log('Alert sent successfully');
    } catch (error) {
      console.error('Error sending alert:', error);
    }
  }

  // Méthode pour tester l'envoi d'une notification
  async testNotification() {
    const user = this.auth.currentUser;
    if (!user || !this.currentToken) {
      await this.showToast('Veuillez vous connecter et activer les notifications', 'warning');
      return;
    }

    try {
      const response = await this.http.get(
        `${this.backendUrl}/test-notification/${user.uid}`
      ).toPromise();
      
      console.log('Test notification sent:', response);
      await this.showToast('Notification de test envoyée!', 'success');
    } catch (error) {
      console.error('Error sending test notification:', error);
      await this.showToast('Erreur lors du test', 'danger');
    }
  }

  private getAlertTitle(type: string): string {
    const titles: Record<string, string> = {
      'EXTREME_RAIN': '🌧️ Pluie extrême',
      'FLOOD_WARNING': '🌊 Alerte inondation',
      'STORM_WARNING': '⚡ Alerte tempête',
      'HIGH_WIND': '💨 Vents violents',
      'HEAT_WAVE': '🔥 Canicule',
      'COLD_WAVE': '❄️ Vague de froid',
      'HIGH_TEMPERATURE': '🌡️ Température élevée',
      'FROST_ALERT': '🌨️ Alerte gel',
      'HEAVY_RAIN': '🌧️ Fortes pluies',
      'HIGH_HUMIDITY': '💧 Humidité élevée',
      'LOW_HUMIDITY': '🏜️ Sécheresse',
      'HIGH_PRESSURE': '📈 Pression élevée',
      'LOW_PRESSURE': '📉 Pression basse',
      'SENSOR_MAINTENANCE': '🔧 Maintenance capteur'
    };
    return titles[type] || '⚠️ Alerte météo';
  }

  private getPlatformInfo(): string {
    if (this.platform.is('android')) return 'android';
    if (this.platform.is('ios')) return 'ios';
    if (this.platform.is('desktop')) return 'web';
    return 'unknown';
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success', duration: number = 3000) {
    const toast = await this.toastController.create({
      message,
      duration,
      color,
      position: 'top',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  // Méthode pour désactiver les notifications
  async disablePushNotifications() {
    try {
      await PushNotifications.removeAllListeners();
      
      const user = this.auth.currentUser;
      if (user) {
        // Supprimer le token de Firestore
        const userRef = doc(this.firestore, 'users', user.uid);
        await setDoc(userRef, {
          fcmToken: null,
          lastUpdated: new Date()
        }, { merge: true });
      }
      
      this.currentToken = null;
      await this.showToast('Notifications désactivées', 'warning');
    } catch (error) {
      console.error('Error disabling notifications:', error);
    }
  }

  // Méthode pour vérifier si les notifications sont activées
  async areNotificationsEnabled(): Promise<boolean> {
    if (!this.platform.is('capacitor')) {
      return false;
    }
    
    const permStatus = await PushNotifications.checkPermissions();
    return permStatus.receive === 'granted';
  }
}