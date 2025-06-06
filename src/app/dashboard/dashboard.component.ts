import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, 
  IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonIcon, IonProgressBar, IonButtons,
  IonButton, IonFooter, IonSegment, IonSegmentButton, 
  IonLabel, IonNote, IonBadge, IonAlert, IonItem,IonToggle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  partlySunny, thermometer, water, speedometer, cloud, flag, 
  speedometerOutline, rainy, sunny, refresh, home, time, 
  settings, wifi, remove, trendingUp, trendingDown,
  arrowBack, compass, notifications, timeOutline, moon, logOutOutline } from 'ionicons/icons';
import { ModalController, AlertController } from '@ionic/angular/standalone';
import { SettingsPage } from '../settings/settings.page';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FirebaseDbService } from '../services/firebase-db.services';
import { NotificationService } from '../services/notification.service';

// Types d'alertes
type AlertType = 
  'EXTREME_RAIN' | 'FLOOD_WARNING' | 'STORM_WARNING' | 
  'HIGH_WIND' | 'HEAT_WAVE' | 'COLD_WAVE' |
  'AIR_QUALITY' | 'UV_ALERT' | 'SENSOR_ISSUE' |
  'FIRE_RISK' | 'FROST_ALERT' | 'THUNDERSTORM' |
  'SNOW_ALERT' | 'HAIL_WARNING' | 'DROUGHT_WARNING' |
  'HUMIDITY_ALERT' | 'PRESSURE_DROP'  | 'PRESSURE_HIGH' | 'SENSOR_MAINTENANCE' |
  'HEAVY_RAIN' | 'HIGH_TEMPERATURE';

interface WeatherAlert {
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'extreme';
  message: string;
  timestamp: Date;
  read: boolean;
}
interface StationData {
  temperature?: number;
  humidity?: number;
  pressure?: number;
  vent_kmh?: number;
  pluie_mm?: number;
  wind_direction?: number;
  rainfall_rate?: number;
  last_update?: string;
}
interface AlertThresholds {
  temperature: {
    high: number;
    low: number;
  };
  windSpeed: number;
  humidity: {
    high: number;
    low: number;
  };
  pressure: {
    high: number;
    low: number;
  };
  precipitation: number;
  precipitationRate: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [ 
    CommonModule,
    FormsModule,
    TranslateModule,
    IonHeader, IonToolbar, IonTitle,  IonGrid,
    IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonIcon, IonProgressBar, IonButtons,
    IonButton, IonFooter, IonSegment, IonSegmentButton,
    IonLabel, IonBadge, IonContent
  ]
})
export class DashboardComponent implements OnInit {
 
   stationData: StationData = {}; 
 
 openConnectivity() {
  this.router.navigate(['/connectivity']); 
}
  // Variables de connectivité
  connectivityIcon: string = 'wifi';
  connectivityColor: string = 'success';
  isOnline: boolean = true;

  // Variables de notifications
  unreadNotifications = 0;
  alerts: WeatherAlert[] = [];

  // Sensor values (always stored in metric units)
    private _temperature: number = 22.5;
  private _windSpeed: number = 15;
  private _pressure: number = 1013;
  private _precipitation: number = 5.2;
  private _precipitationRate: number = 0.5;
  
  // Display values (converted based on selected units)
   displayTemperature: number = this._temperature;
  displayWindSpeed: number = this._windSpeed;
  displayPressure: number = this._pressure;
  displayPrecipitation: number = this._precipitation;
  displayPrecipitationRate: number = this._precipitationRate;


  humidity: number = 65;
 windDirection: number = 45;

  
  // Measurement units
  temperatureUnit: string = 'celsius';
  windSpeedUnit: string = 'kmh';
  pressureUnit: string = 'hpa';
  precipitationUnit: string = 'mm';
  
  // Calculated values

  windDirectionText: string = '--';

  pressureTrend: string = 'stable';
  pressureTrendIcon: string = 'remove';
  
  lastUpdate: Date = new Date();
  isRefreshing: boolean = false;
 
    private alertThresholds: AlertThresholds = {
    temperature: {
      high: 35,   // °C - heat wave threshold
      low: 0      // °C - frost threshold
    },
    windSpeed: 30, // km/h - strong wind threshold
    humidity: {
      high: 85,   // % - high humidity threshold
      low: 20     // % - low humidity threshold
    },
    pressure: {
      high: 1018, // hPa - high pressure threshold
      low: 1008   // hPa - low pressure threshold
    },
    precipitation: 50,    // mm - heavy rain threshold
    precipitationRate: 10  // mm/h - extreme rain threshold
  };
 
  constructor(
    private modalCtrl: ModalController,
    private translate: TranslateService,
    private platform: Platform,
    private alertCtrl: AlertController,
    private router: Router,
    private AuthService: AuthService,
    private firebaseDbService: FirebaseDbService,
       
  private notificationService: NotificationService,

 
    
    
  ) 
  
  {
    if (this.platform.is('ios')) {
      document.body.classList.add('ios');
    } else if (this.platform.is('android')) {
      document.body.classList.add('md');
     
    }

    
   addIcons({home,refresh,logOutOutline,thermometer,flag,compass,water,speedometer,rainy,notifications,time,settings,cloud,sunny,moon,timeOutline,partlySunny,speedometerOutline,wifi,remove,trendingUp,trendingDown,arrowBack});
   
  }

  

  // Méthode pour naviguer vers la page historique
  async openHistory() {
    try {
      const success = await this.router.navigate(['/history']);
      if (!success) {
        console.error('Navigation failed - route might not exist');
        // Fallback alternatif
        window.location.hash = '/history';
      }
    } catch (err) {
      console.error('Navigation error:', err);
      // Afficher un message à l'utilisateur si nécessaire
      const alert = await this.alertCtrl.create({
        header: 'Erreur',
        message: 'Impossible d\'accéder à l\'historique',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
  

   ngOnInit() {
  this.subscribeToStationData();
    this.loadData(); // si besoin de données initiales ou mock
    this.checkConnectivity();
    this.setupConnectivityListeners();
    this.checkForAlerts();

    setInterval(() => this.loadData(), 300000);
    setInterval(() => this.checkSensorStatus(), 12 * 3600000);
  
    
    
  }
   subscribeToStationData() {
    this.firebaseDbService.getStationData().subscribe((data: StationData) => {
      if (data) {
        this.stationData = data;
        
        // Mise à jour des valeurs internes
        this._temperature = data.temperature || 0;
        this.humidity = data.humidity || 0;
        this._pressure = data.pressure || 0;
        this._windSpeed = data.vent_kmh || 0;
        this._precipitation = data.pluie_mm || 0;
        this._precipitationRate = data.rainfall_rate || 0;
        this.windDirection = data.wind_direction || 0;
    
        
        if (data.last_update) {
          this.lastUpdate = new Date(data.last_update);
        }

        this.convertDisplayValues();
        this.calculateDerivedValues();
        this.checkForAlerts();
      }


    });
    
  }
  
 checkForAlerts() {
    const newAlerts: WeatherAlert[] = [];
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // Helper function to check for recent alerts of the same type
    const hasRecentAlert = (type: AlertType) => 
      this.alerts.some(a => a.type === type && new Date(a.timestamp) > twoHoursAgo);

    // Temperature alerts
    if (this._temperature >= this.alertThresholds.temperature.high && !hasRecentAlert('HIGH_TEMPERATURE')) {
      newAlerts.push(this.createTemperatureAlert('high'));
    } 
    else if (this._temperature <= this.alertThresholds.temperature.low && !hasRecentAlert('FROST_ALERT')) {
      newAlerts.push(this.createTemperatureAlert('low'));
    }

    // Wind alerts
    if (this._windSpeed >= this.alertThresholds.windSpeed) {
      if (this._windSpeed > 50 && !hasRecentAlert('STORM_WARNING')) {
        newAlerts.push(this.createWindAlert('extreme'));
      } 
      else if (!hasRecentAlert('HIGH_WIND')) {
        newAlerts.push(this.createWindAlert('strong'));
      }
    }

    // Precipitation alerts
    if (this._precipitation >= this.alertThresholds.precipitation && !hasRecentAlert('HEAVY_RAIN')) {
      newAlerts.push(this.createPrecipitationAlert('accumulated'));
    }
    if (this._precipitationRate >= this.alertThresholds.precipitationRate && !hasRecentAlert('EXTREME_RAIN')) {
      newAlerts.push(this.createPrecipitationAlert('rate'));
    }

    // Humidity alerts
    if (this.humidity >= this.alertThresholds.humidity.high && !hasRecentAlert('HUMIDITY_ALERT')) {
      newAlerts.push(this.createHumidityAlert('high'));
    }
    else if (this.humidity <= this.alertThresholds.humidity.low && !hasRecentAlert('DROUGHT_WARNING')) {
      newAlerts.push(this.createHumidityAlert('low'));
    }

    // Pressure alerts
    if (this._pressure >= this.alertThresholds.pressure.high && !hasRecentAlert('PRESSURE_HIGH')) {
      newAlerts.push(this.createPressureAlert('high'));
    }
    else if (this._pressure <= this.alertThresholds.pressure.low && !hasRecentAlert('PRESSURE_DROP')) {
      newAlerts.push(this.createPressureAlert('low'));
    }

    if (newAlerts.length > 0) {
      newAlerts.forEach(alert => this.addAlert(alert));
    }
  }
    private createTemperatureAlert(type: 'high' | 'low'): WeatherAlert {
    return {
      type: type === 'high' ? 'HIGH_TEMPERATURE' : 'FROST_ALERT',
      severity: type === 'high' ? 'high' : 'medium',
      message: this.translate.instant(
        type === 'high' ? 'ALERTS.HIGH_TEMPERATURE' : 'ALERTS.FROST_ALERT',
        { 
          temp: this.displayTemperature.toFixed(1),
          unit: this.temperatureUnit === 'celsius' ? '°C' : '°F'
        }
      ),
      timestamp: new Date(),
      read: false
    };
  }

  private createWindAlert(type: 'strong' | 'extreme'): WeatherAlert {
    return {
      type: type === 'extreme' ? 'STORM_WARNING' : 'HIGH_WIND',
      severity: type === 'extreme' ? 'extreme' : 'high',
      message: this.translate.instant(
        type === 'extreme' ? 'ALERTS.STORM' : 'ALERTS.HIGH_WIND',
        { 
          speed: this.displayWindSpeed.toFixed(1),
          unit: this.windSpeedUnit
        }
      ),
      timestamp: new Date(),
      read: false
    };
  }

  private createPrecipitationAlert(type: 'accumulated' | 'rate'): WeatherAlert {
    return {
      type: type === 'rate' ? 'EXTREME_RAIN' : 'HEAVY_RAIN',
      severity: type === 'rate' ? 'extreme' : 'high',
      message: this.translate.instant(
        type === 'rate' ? 'ALERTS.EXTREME_RAIN' : 'ALERTS.HEAVY_RAIN',
        { 
          amount: type === 'rate' 
            ? this.displayPrecipitationRate.toFixed(1)
            : this.displayPrecipitation.toFixed(1),
          unit: this.precipitationUnit === 'mm' 
            ? (type === 'rate' ? 'mm/h' : 'mm')
            : (type === 'rate' ? 'in/h' : 'in')
        }
      ),
      timestamp: new Date(),
      read: false
    };
  }

  private createHumidityAlert(type: 'high' | 'low'): WeatherAlert {
    return {
      type: type === 'high' ? 'HUMIDITY_ALERT' : 'DROUGHT_WARNING',
      severity: 'medium',
      message: this.translate.instant(
        type === 'high' ? 'ALERTS.HUMIDITY_HIGH' : 'ALERTS.HUMIDITY_LOW',
        { humidity: this.humidity.toFixed(0) }
      ),
      timestamp: new Date(),
      read: false
    };
  }

  private createPressureAlert(type: 'high' | 'low'): WeatherAlert {
    return {
      type: type === 'high' ? 'PRESSURE_HIGH' : 'PRESSURE_DROP',
      severity: 'medium',
      message: this.translate.instant(
        type === 'high' ? 'ALERTS.PRESSURE_HIGH' : 'ALERTS.PRESSURE_DROP',
        { 
          pressure: this.displayPressure.toFixed(1),
          unit: this.pressureUnit === 'hpa' ? 'hPa' : 
                this.pressureUnit === 'mmhg' ? 'mmHg' : 'inHg'
        }
      ),
      timestamp: new Date(),
      read: false
    };
  }

  checkSensorStatus() {
    // Simulation de problème de capteur (20% de chance)
    if (Math.random() < 0.2) {
      this.addAlert({
        type: 'SENSOR_MAINTENANCE',
        severity: 'medium',
        message: this.translate.instant('ALERTS.SENSOR_CHECK'),
        timestamp: new Date(),
        read: false
      });
    }
  }

  addAlert(alert: WeatherAlert) {
    this.alerts.unshift(alert);
    this.updateUnreadCount();
    this.presentAlertNotification(alert);
    this.notificationService.sendWeatherAlert({
  type: alert.type,
  severity: alert.severity,
  message: alert.message
  });
  }
  

  

  updateUnreadCount() {
    this.unreadNotifications = this.alerts.filter(a => !a.read).length;
  }

  async presentNotifications() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('ALERTS.TITLE'),
      subHeader: this.unreadNotifications > 0 
        ? this.translate.instant('ALERTS.NEW_ALERTS', { count: this.unreadNotifications })
        : this.translate.instant('ALERTS.NO_NEW_ALERTS'),
      inputs: this.alerts.map(alert => ({
        type: 'radio',
        label: `${this.getAlertIcon(alert.type)} ${alert.message}`,
        value: alert.type,
        checked: alert.read
      })),
      buttons: [
        {
          text: this.translate.instant('ALERTS.MARK_READ'),
          handler: () => {
            this.alerts.forEach(a => a.read = true);
            this.updateUnreadCount();
          }
        },
        {
          text: this.translate.instant('COMMON.CLOSE'),
          role: 'cancel'
        }
      ]
    });
     
    await alert.present();
  }
  

  async presentAlertNotification(alert: WeatherAlert) {
     await new Promise(resolve => setTimeout(resolve, 300));
  
  const alertPopup = await this.alertCtrl.create({
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
       'PRESSURE_HIGH': '📈', 
      'SENSOR_MAINTENANCE': '🔧',
      'HEAVY_RAIN': '🌧️',
      'HIGH_TEMPERATURE': '🌡️'
    };
    return icons[type] || '⚠️';
  }

  getAlertTitle(type: AlertType): string {
    return this.translate.instant(`ALERTS.${type}`);
  }

  // Méthodes existantes pour la connectivité
  checkConnectivity() {
    this.isOnline = navigator.onLine;
    this.updateConnectivityIcon();
  }

  updateConnectivityIcon() {
    if (this.isOnline) {
      this.connectivityIcon = 'wifi';
      this.connectivityColor = 'success';
    } else {
      this.connectivityIcon = 'wifi-off';
      this.connectivityColor = 'danger';
    }
  }

  setupConnectivityListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateConnectivityIcon();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateConnectivityIcon();
    });
  }
 async testNotification() {
  await this.notificationService.testDirectNotification();
}

  // Méthodes existantes pour les données météo
  async openSettings() {
    const modal = await this.modalCtrl.create({
      component: SettingsPage,
      componentProps: {
        temperatureUnit: this.temperatureUnit,
        windSpeedUnit: this.windSpeedUnit,
        pressureUnit: this.pressureUnit,
        precipitationUnit: this.precipitationUnit
      }
    });

    await modal.present();
    
    const { data } = await modal.onWillDismiss();
    
    if (data) {
      this.temperatureUnit = data.units.temperature;
      this.windSpeedUnit = data.units.windSpeed;
      this.pressureUnit = data.units.pressure;
      this.precipitationUnit = data.units.precipitation;
      
      if (data.language) {
        this.translate.use(data.language);
      }
      
      this.convertDisplayValues();
    }
  }

  private convertDisplayValues() {
    // Temperature conversion
    this.displayTemperature = this.temperatureUnit === 'fahrenheit' 
      ? (this._temperature * 9/5) + 32 
      : this._temperature;

    // Wind speed conversion
    switch(this.windSpeedUnit) {
      case 'mph': this.displayWindSpeed = this._windSpeed / 1.609; break;
      case 'ms': this.displayWindSpeed = this._windSpeed / 3.6; break;
      case 'knots': this.displayWindSpeed = this._windSpeed / 1.852; break;
      default: this.displayWindSpeed = this._windSpeed;
    }

    // Pressure conversion
    switch(this.pressureUnit) {
      case 'mmhg': this.displayPressure = this._pressure * 0.750062; break;
      case 'inhg': this.displayPressure = this._pressure * 0.02953; break;
      default: this.displayPressure = this._pressure;
    }

    // Precipitation conversion
    if (this.precipitationUnit === 'in') {
      this.displayPrecipitation = this._precipitation / 25.4;
      this.displayPrecipitationRate = this._precipitationRate / 25.4;
    } else {
      this.displayPrecipitation = this._precipitation;
      this.displayPrecipitationRate = this._precipitationRate;
    }
  }

  private loadData() {
   this._temperature = this.getRandomInRange(15, 30, 1);
    this._windSpeed = this.getRandomInRange(0, 40, 1);
    this._pressure = this.getRandomInRange(980, 1030, 0);
    this._precipitation = this.getRandomInRange(0, 20, 1);
    this._precipitationRate = this.getRandomInRange(0, 5, 1);

    this.convertDisplayValues();
    this.calculateDerivedValues();
    this.checkForAlerts();
    this.lastUpdate = new Date();

    this.isRefreshing = false;
  }

  private getRandomInRange(min: number, max: number, decimals: number): number {
    const rand = Math.random() * (max - min) + min;
    return parseFloat(rand.toFixed(decimals));
  }

  private calculateDerivedValues() {
    // Air quality
  

    // Wind direction
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    this.windDirectionText = directions[Math.round(this.windDirection / 22.5) % 16];

    // Pressure trend
    if (this._pressure > 1018) {
      this.pressureTrend = this.translate.instant('PRESSURE.HIGH');
      this.pressureTrendIcon = 'trendingUp';
    } else if (this._pressure < 1008) {
      this.pressureTrend = this.translate.instant('PRESSURE.LOW');
      this.pressureTrendIcon = 'trendingDown';
    } else {
      this.pressureTrend = this.translate.instant('PRESSURE.STABLE');
      this.pressureTrendIcon = 'remove';
    }
  }
  async logout() {
    try {
      await this.AuthService.logout();
      this.router.navigate(['/home']); // ou '/login' si tu préfères
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  }

  refreshData() {
    this.loadData();
  }
}