import { Injectable, inject } from '@angular/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Platform, ToastController, AlertController } from '@ionic/angular';
import { 
  Firestore, 
  doc, 
  setDoc, 
  collection, 
  addDoc,
  query,
  where,
  getDocs,
  updateDoc
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Network } from '@capacitor/network';

export interface WeatherAlert {
  id?: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'extreme';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private platform = inject(Platform);

  // URL du backend - IMPORTANT: Changez ceci pour votre IP locale ou URL de production
  private backendUrl = this.getBackendUrl();

  // État
  private notificationsEnabled = new BehaviorSubject<boolean>(false);
  public notificationsEnabled$ = this.notificationsEnabled.asObservable();
  
  private currentToken = new BehaviorSubject<string | null>(null);
  public currentToken$ = this.currentToken.asObservable();

  private unreadCount = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCount.asObservable();

  private alerts = new BehaviorSubject<WeatherAlert[]>([]);
  public alerts$ = this.alerts.asObservable();

  // Flag pour éviter l'initialisation multiple
  private isInitialized = false;

  constructor() {
    this.loadAlerts();
  }

  /**
   * Obtient l'URL du backend selon l'environnement
   */
  private getBackendUrl(): string {
    if (this.platform.is('capacitor')) {
      // Pour Android/iOS, utilisez l'IP de votre machine
      // Remplacez par votre IP locale (ex: 192.168.1.100)
      return '192.168.100.113:3000'; // CHANGEZ CETTE IP!
    } else {
      // Pour le web/développement
      return 'http://192.168.100.113:3000';
    }
  }

  /**
   * Initialise les notifications (appelé une seule fois)
   */
  async initializePushNotifications() {
    if (this.isInitialized) {
      console.log('Notifications déjà initialisées');
      return;
    }

    if (!this.platform.is('capacitor')) {
      console.log('Push notifications uniquement sur mobile');
      return;
    }

    console.log('🚀 Initialisation des notifications...');
    console.log('Backend URL:', this.backendUrl);

    try {
      // Vérifier la connexion réseau
      const status = await Network.getStatus();
      if (!status.connected) {
        throw new Error('Pas de connexion réseau');
      }

      // Permissions
      let permStatus = await PushNotifications.checkPermissions();
      console.log('Permissions actuelles:', permStatus);
      
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      
      if (permStatus.receive !== 'granted') {
        throw new Error('Permissions refusées');
      }

      // Enregistrement
      await PushNotifications.register();
      console.log('✅ Enregistrement réussi');
      
      // Listeners
      this.setupListeners();
      
      // Permissions locales
      await LocalNotifications.requestPermissions();
      
      // Créer le canal de notification pour Android
      if (this.platform.is('android')) {
        await this.createNotificationChannel();
      }
      
      this.notificationsEnabled.next(true);
      this.isInitialized = true;
      console.log('✅ Notifications initialisées avec succès');
      
    } catch (error: any) {
      console.error('❌ Erreur initialisation:', error);
      await this.showToast(`Erreur: ${error.message}`, 'danger');
    }
  }

  /**
   * Crée le canal de notification pour Android
   */
  private async createNotificationChannel() {
    try {
      await LocalNotifications.createChannel({
        id: 'weather-alerts',
        name: 'Alertes Météo',
        description: 'Notifications pour les alertes météo',
        importance: 5,
        visibility: 1,
        sound: 'beep.wav',
        vibration: true,
        lights: true,
        lightColor: '#FF5722'
      });
      console.log('✅ Canal de notification créé');
    } catch (error) {
      console.error('Erreur création canal:', error);
    }
  }

  /**
   * Configure les listeners
   */
  private setupListeners() {
    // Token reçu
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('🔑 Token FCM reçu:', token.value);
      this.currentToken.next(token.value);
      
      // Sauvegarder
      await this.saveTokenToBackend(token.value);
      
      // Debug sur Android
      if (this.platform.is('android') && this.platform.is('capacitor')) {
        await this.showTokenAlert(token.value);
      }
    });

    // Erreur
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('❌ Erreur registration:', error);
      this.showToast('Erreur enregistrement notifications', 'danger');
    });

    // Notification reçue (foreground)
    PushNotifications.addListener('pushNotificationReceived', 
      async (notification: PushNotificationSchema) => {
        console.log('📱 Notification reçue:', notification);
        
        const alert: WeatherAlert = {
          type: notification.data?.type || 'GENERAL',
          severity: notification.data?.severity || 'medium',
          title: notification.title || 'Alerte Météo',
          message: notification.body || '',
          timestamp: new Date(),
          read: false,
          data: notification.data
        };
        
        await this.addAlert(alert);
        await this.showLocalNotification(notification);
      }
    );

    // Notification cliquée
    PushNotifications.addListener('pushNotificationActionPerformed', 
      async (notification: ActionPerformed) => {
        console.log('👆 Notification cliquée:', notification);
        
        const data = notification.notification.data;
        if (data?.type) {
          this.handleNotificationNavigation(data.type);
        } else {
          this.router.navigate(['/dashboard']);
        }
      }
    );
  }

  /**
   * Sauvegarde le token
   */
  private async saveTokenToBackend(token: string) {
    const user = this.auth.currentUser;
    if (!user) {
      console.warn('Pas d\'utilisateur connecté');
      return;
    }

    try {
      // Firestore
      const userRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userRef, {
        fcmToken: token,
        lastUpdated: new Date(),
        platform: this.getPlatformInfo(),
        email: user.email,
        notificationsEnabled: true
      }, { merge: true });

      // Backend Node.js
      const response = await this.http.post(`${this.backendUrl}/register`, {
        userId: user.uid,
        token: token,
        email: user.email,
        platform: this.getPlatformInfo()
      }).toPromise();

      console.log('✅ Token sauvegardé:', response);
      await this.showToast('Notifications activées', 'success');
      
    } catch (error: any) {
      console.error('❌ Erreur sauvegarde token:', error);
      
      // Afficher l'erreur détaillée
      if (error.status === 0) {
        await this.showToast('Backend non accessible. Vérifiez l\'URL.', 'danger');
      } else {
        await this.showToast(`Erreur: ${error.message}`, 'danger');
      }
    }
  }

  /**
   * Affiche le token pour debug
   */
  private async showTokenAlert(token: string) {
    const alert = await this.alertController.create({
      header: '🔑 Token FCM',
      message: `
        <div style="word-break: break-all; font-size: 12px;">
          ${token}
        </div>
        <br>
        <div style="font-size: 14px;">
          Backend URL: ${this.backendUrl}
        </div>
      `,
      buttons: [
        {
          text: 'Copier Token',
          handler: () => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(token);
              this.showToast('Token copié!', 'success');
            }
          }
        },
        {
          text: 'Tester',
          handler: () => {
            this.testDirectNotification(token);
          }
        },
        'OK'
      ]
    });
    await alert.present();
  }

  /**
   * Test direct avec token
   */
  async testDirectNotification(token?: string) {
    const fcmToken = token || this.currentToken.value;
    if (!fcmToken) {
      await this.showToast('Token manquant', 'warning');
      return;
    }

    try {
      const response = await this.http.post(`${this.backendUrl}/test-direct`, {
        token: fcmToken
      }).toPromise();
      
      console.log('✅ Test réussi:', response);
      await this.showToast('Notification test envoyée!', 'success');
    } catch (error: any) {
      console.error('❌ Erreur test:', error);
      await this.showToast(`Erreur: ${error.message}`, 'danger');
    }
  }

  /**
   * Notification locale
   */
  private async showLocalNotification(notification: PushNotificationSchema) {
    await LocalNotifications.schedule({
      notifications: [{
        id: new Date().getTime(),
        title: notification.title || 'Alerte Météo',
        body: notification.body || '',
        channelId: 'weather-alerts',
        sound: 'beep.wav',
        smallIcon: 'ic_stat_icon_config_sample',
        largeIcon: 'ic_launcher_foreground',
        extra: notification.data
      }]
    });
  }

  /**
   * Ajoute une alerte
   */
  async addAlert(alert: WeatherAlert) {
    try {
      // Firestore
      const alertsCollection = collection(this.firestore, 'alerts');
      const docRef = await addDoc(alertsCollection, {
        ...alert,
        userId: this.auth.currentUser?.uid,
        timestamp: new Date()
      });
      
      alert.id = docRef.id;
      
      // Mise à jour locale
      const currentAlerts = this.alerts.value;
      this.alerts.next([alert, ...currentAlerts].slice(0, 50)); // Garder max 50
      
      this.updateUnreadCount();
      
      // Toast
      await this.showToast(
        `${this.getAlertIcon(alert.type)} ${alert.title}`, 
        this.getSeverityColor(alert.severity)
      );
      
    } catch (error) {
      console.error('Erreur ajout alerte:', error);
    }
  }

  /**
   * Envoie une alerte météo
   */
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
      
      console.log('✅ Alerte envoyée');
    } catch (error) {
      console.error('❌ Erreur envoi alerte:', error);
    }
  }

  /**
   * Charge les alertes
   */
  private async loadAlerts() {
    const user = this.auth.currentUser;
    if (!user) return;

    try {
      const alertsQuery = query(
        collection(this.firestore, 'alerts'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(alertsQuery);
      const alerts: WeatherAlert[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        alerts.push({
          id: doc.id,
          ...data,
          timestamp: data['timestamp']?.toDate() || new Date()
        } as WeatherAlert);
      });
      
      alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      this.alerts.next(alerts.slice(0, 50));
      this.updateUnreadCount();
      
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    }
  }

  /**
   * Met à jour le compteur
   */
  private updateUnreadCount() {
    const alerts = this.alerts.value;
    const unread = alerts.filter(a => !a.read).length;
    this.unreadCount.next(unread);
  }

  /**
   * Navigation
   */
  private handleNotificationNavigation(type: string) {
    const routes: Record<string, string> = {
      'HIGH_TEMPERATURE': '/dashboard',
      'FROST_ALERT': '/dashboard',
      'EXTREME_RAIN': '/dashboard',
      'SENSOR_ISSUE': '/settings',
      'default': '/dashboard'
    };
    
    this.router.navigate([routes[type] || routes['default']]);
  }

  /**
   * Désactive les notifications
   */
  async disableNotifications() {
    try {
      await PushNotifications.removeAllListeners();
      
      if (this.auth.currentUser) {
        const userDoc = doc(this.firestore, 'users', this.auth.currentUser.uid);
        await updateDoc(userDoc, {
          fcmToken: null,
          notificationsEnabled: false
        });
      }
      
      this.currentToken.next(null);
      this.notificationsEnabled.next(false);
      this.isInitialized = false;
      
      await this.showToast('Notifications désactivées', 'warning');
    } catch (error) {
      console.error('Erreur:', error);
    }
  }

  // Helpers
  private getAlertTitle(type: string): string {
    const titles: Record<string, string> = {
      'EXTREME_RAIN': '🌧️ Pluie extrême',
      'HIGH_TEMPERATURE': '🌡️ Température élevée',
      'FROST_ALERT': '❄️ Alerte gel',
      'HIGH_WIND': '💨 Vents violents',
      'SENSOR_MAINTENANCE': '🔧 Maintenance capteur',
      'default': '⚠️ Alerte météo'
    };
    return titles[type] || titles['default'];
  }

  private getAlertIcon(type: string): string {
    const icons: Record<string, string> = {
      'EXTREME_RAIN': '🌧️',
      'HIGH_TEMPERATURE': '🌡️',
      'FROST_ALERT': '❄️',
      'HIGH_WIND': '💨',
      'SENSOR_MAINTENANCE': '🔧',
      'default': '📢'
    };
    return icons[type] || icons['default'];
  }

  private getSeverityColor(severity: string): 'success' | 'warning' | 'danger' {
    switch (severity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high':
      case 'extreme': return 'danger';
      default: return 'warning';
    }
  }

  private getPlatformInfo(): string {
    if (this.platform.is('android')) return 'android';
    if (this.platform.is('ios')) return 'ios';
    return 'web';
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }

  // Getters
  getCurrentToken(): string | null {
    return this.currentToken.value;
  }

  isNotificationsEnabled(): boolean {
    return this.notificationsEnabled.value;
  }

  getAlerts(): WeatherAlert[] {
    return this.alerts.value;
  }
}