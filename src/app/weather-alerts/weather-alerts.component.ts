import { Component, Input, OnInit } from '@angular/core';
import { AlertController, IonBadge } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Types d'alertes possibles
export type AlertType = 
  'EXTREME_RAIN' | 'FLOOD_WARNING' | 'STORM_WARNING' | 
  'HIGH_WIND' | 'HEAT_WAVE' | 'COLD_WAVE' |
  'AIR_QUALITY' | 'UV_ALERT' | 'SENSOR_ISSUE' |
  'FIRE_RISK' | 'FROST_ALERT' | 'THUNDERSTORM' |
  'SNOW_ALERT' | 'HAIL_WARNING' | 'DROUGHT_WARNING' |
  'HUMIDITY_ALERT' | 'PRESSURE_DROP' | 'SENSOR_MAINTENANCE';

export interface WeatherAlert {
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'extreme';
  message: string;
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-weather-alerts',
  templateUrl: './weather-alerts.component.html',
  styleUrls: ['./weather-alerts.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonBadge]
})
export class WeatherAlertsComponent implements OnInit {
  @Input() alerts: WeatherAlert[] = [];
  unreadNotifications = 0;

  constructor(private alertController: AlertController) {}

  ngOnInit() {
    this.checkForAlerts();
    this.checkSensorStatus();
  }

  // Détection d'alertes
 checkForAlerts() {
  const sampleAlerts: WeatherAlert[] = [
    {
      type: 'EXTREME_RAIN',
      severity: 'high',
      message: '🌧️ Pluie extrême attendue cet après-midi',
      timestamp: new Date(),
      read: false
    },
    {
      type: 'FLOOD_WARNING',
      severity: 'extreme',
      message: '🌊 Risque d’inondation imminent dans votre région',
      timestamp: new Date(),
      read: false
    },
    {
      type: 'STORM_WARNING',
      severity: 'high',
      message: '⚡ Alerte orage violente prévue dans 2 heures',
      timestamp: new Date(),
      read: false
    },
    
    
   
   
    {
      type: 'SENSOR_ISSUE',
      severity: 'medium',
      message: '⚠️ Capteur de température ne répond pas',
      timestamp: new Date(),
      read: false
    },
    
     
   
    {
      type: 'SNOW_ALERT',
      severity: 'medium',
      message: '❄️ Neige attendue dans la matinée',
      timestamp: new Date(),
      read: false
    },
    {
      type: 'HAIL_WARNING',
      severity: 'high',
      message: '🌨️ Alerte grêle dans votre région',
      timestamp: new Date(),
      read: false
    },
    {
      type: 'DROUGHT_WARNING',
      severity: 'medium',
      message: '🏜️ Sécheresse prolongée signalée',
      timestamp: new Date(),
      read: false
    },
    {
      type: 'HUMIDITY_ALERT',
      severity: 'low',
      message: '💧 Humidité très élevée détectée',
      timestamp: new Date(),
      read: false
    },
    {
      type: 'PRESSURE_DROP',
      severity: 'low',
      message: '📉 Baisse de pression atmosphérique soudaine',
      timestamp: new Date(),
      read: false
    },
    {
      type: 'SENSOR_MAINTENANCE',
      severity: 'medium',
      message: '🔧 Capteur d\'humidité nécessite calibration',
      timestamp: new Date(),
      read: false
    }
  ];

  this.alerts = [...this.alerts, ...sampleAlerts];
  this.updateUnreadCount();
}
  // Vérification périodique des capteurs
  checkSensorStatus() {
    setInterval(() => {
      const sensorAlert: WeatherAlert = {
        type: 'SENSOR_MAINTENANCE',
        severity: 'low',
        message: 'Vérification des capteurs requise',
        timestamp: new Date(),
        read: false
      };
      this.addAlert(sensorAlert);
    }, 12 * 3600000);
  }

  addAlert(alert: WeatherAlert) {
    this.alerts.unshift(alert);
    this.updateUnreadCount();
    this.presentAlert(alert);
  }

  updateUnreadCount() {
    this.unreadNotifications = this.alerts.filter(a => !a.read).length;
  }

  async presentNotifications() {
    const alert = await this.alertController.create({
      header: 'Alertes Météo',
      subHeader: `${this.unreadNotifications} nouvelles alertes`,
      inputs: this.alerts.map(alert => ({
        type: 'radio',
        label: `${this.getAlertIcon(alert.type)} ${alert.message}`,
        value: alert.type,
        checked: alert.read
      })),
      buttons: [
        {
          text: 'Marquer comme lues',
          handler: () => {
            this.alerts.forEach(a => a.read = true);
            this.updateUnreadCount();
          }
        },
        {
          text: 'Fermer',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  async presentAlert(alert: WeatherAlert) {
    const alertPopup = await this.alertController.create({
      header: this.getAlertTitle(alert.type),
      message: alert.message,
      buttons: ['OK'],
      cssClass: `alert-${alert.severity}`
    });
    await alertPopup.present();
  }

  getAlertIcon(type: AlertType): string {
    const icons: Record<AlertType, string> = {
      'EXTREME_RAIN': '🌧️',
      'FLOOD_WARNING': '🌊',
      'STORM_WARNING': '⚡',
      'HIGH_WIND': '💨',
      'HEAT_WAVE': '🔥',
      'COLD_WAVE': '❄️',
      'AIR_QUALITY': '☁️',
      'UV_ALERT': '☀️',
      'SENSOR_ISSUE': '⚠️',
      'FIRE_RISK': '🔥',
      'FROST_ALERT': '🌨️',
      'THUNDERSTORM': '⛈️',
      'SNOW_ALERT': '❄️',
      'HAIL_WARNING': '🌨️',
      'DROUGHT_WARNING': '🏜️',
      'HUMIDITY_ALERT': '💧',
      'PRESSURE_DROP': '📉',
      'SENSOR_MAINTENANCE': '🔧'
    };
    return icons[type] || '⚠️';
  }

  getAlertTitle(type: AlertType): string {
    const titles: Record<AlertType, string> = {
      'EXTREME_RAIN': 'Pluie extrême',
      'FLOOD_WARNING': 'Alerte inondation',
      'STORM_WARNING': 'Alerte tempête',
      'HIGH_WIND': 'Vents violents',
      'HEAT_WAVE': 'Vague de chaleur',
      'COLD_WAVE': 'Vague de froid',
      'AIR_QUALITY': 'Pollution élevée',
      'SENSOR_ISSUE': 'Problème capteur',
      'FIRE_RISK': 'Risque incendie',
      'FROST_ALERT': 'Gel prévu',
      'THUNDERSTORM': 'Orage violent',
      'SNOW_ALERT': 'Chute de neige',
      'HAIL_WARNING': 'Alerte grêle',
      'DROUGHT_WARNING': 'Sécheresse',
      'HUMIDITY_ALERT': 'Humidité extrême',
      'PRESSURE_DROP': 'Chute de pression',
      'SENSOR_MAINTENANCE': 'Maintenance capteur',
      UV_ALERT: ''
    };
    return titles[type] || 'Alerte météo';
  }
}