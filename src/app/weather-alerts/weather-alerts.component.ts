import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonBadge,
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonRefresher,
  IonRefresherContent,
  IonFab,
  IonFabButton,
  IonChip,
  IonText
} from '@ionic/angular/standalone';
import { WeatherNotificationService, WeatherAlert } from '../services/weather-notification.service';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { 
  notifications, 
  notificationsOutline, 
  checkmarkCircle,
  alertCircle,
  warningOutline,
  refresh,
  settings
} from 'ionicons/icons';

@Component({
  selector: 'app-weather-alerts',
  templateUrl: './weather-alerts.component.html',
  styleUrls: ['./weather-alerts.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonButton,
    IonButtons,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonRefresher,
    IonRefresherContent,
    IonFab,
    IonFabButton,
    IonChip,
    IonText
  ]
})
export class WeatherAlertsComponent implements OnInit, OnDestroy {
  alerts: WeatherAlert[] = [];
  unreadCount = 0;
  notificationsEnabled = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: WeatherNotificationService
  ) {
    addIcons({ 
      notifications, 
      notificationsOutline, 
      checkmarkCircle,
      alertCircle,
      warningOutline,
      refresh,
      settings
    });
  }

  ngOnInit() {
    // S'abonner aux observables
    this.subscriptions.push(
      this.notificationService.alerts$.subscribe(alerts => {
        this.alerts = alerts;
      }),
      
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      }),
      
      this.notificationService.notificationsEnabled$.subscribe(enabled => {
        this.notificationsEnabled = enabled;
      })
    );

    // Initialiser les notifications si pas déjà fait
    if (!this.notificationsEnabled) {
      this.initializeNotifications();
    }
  }

  ngOnDestroy() {
    // Nettoyer les subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async initializeNotifications() {
    await this.notificationService.initializePushNotifications();
  }

  async handleRefresh(event: any) {
    // Recharger les alertes
    await this.notificationService['loadAlerts']();
    event.target.complete();
  }

  async markAllAsRead() {
    await this.notificationService.markAllAlertsAsRead();
  }

  async markAsRead(alert: WeatherAlert) {
    if (alert.id && !alert.read) {
      await this.notificationService.markAlertAsRead(alert.id);
    }
  }

  async sendTestNotification() {
    await this.notificationService.sendTestNotification();
  }

  async toggleNotifications() {
    if (this.notificationsEnabled) {
      await this.notificationService.disableNotifications();
    } else {
      await this.notificationService.initializePushNotifications();
    }
  }

  getAlertIcon(type: string): string {
    const icons: Record<string, string> = {
      'EXTREME_RAIN': '🌧️',
      'FLOOD_WARNING': '🌊',
      'STORM_WARNING': '⚡',
      'HIGH_WIND': '💨',
      'HEAT_WAVE': '🔥',
      'COLD_WAVE': '❄️',
      'FROST_ALERT': '🌨️',
      'HIGH_TEMPERATURE': '🌡️',
      'SENSOR_ISSUE': '⚠️',
      'SENSOR_MAINTENANCE': '🔧',
      'TEST': '🧪'
    };
    return icons[type] || '📢';
  }

  getSeverityClass(severity: string): string {
    return `alert-${severity}`;
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return new Date(date).toLocaleDateString('fr-FR');
  }
}