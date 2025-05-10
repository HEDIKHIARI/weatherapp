import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// Removed duplicate import of SensorService
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
  arrowBack, compass, notifications, timeOutline, moon } from 'ionicons/icons';
import { ModalController, AlertController } from '@ionic/angular/standalone';
import { getDatabase, ref, onValue } from 'firebase/database';
import { SettingsPage } from '../settings/settings.page';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { SensorService } from '../sensorservice/sensor.service';
// Types d'alertes
type AlertType = 
  'EXTREME_RAIN' | 'FLOOD_WARNING' | 'STORM_WARNING' | 
  'HIGH_WIND' | 'HEAT_WAVE' | 'COLD_WAVE' |
  'AIR_QUALITY' | 'UV_ALERT' | 'SENSOR_ISSUE' |
  'FIRE_RISK' | 'FROST_ALERT' | 'THUNDERSTORM' |
  'SNOW_ALERT' | 'HAIL_WARNING' | 'DROUGHT_WARNING' |
  'HUMIDITY_ALERT' | 'PRESSURE_DROP' | 'SENSOR_MAINTENANCE';

interface WeatherAlert {
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'extreme';
  message: string;
  timestamp: Date;
  read: boolean;
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
  sensorData: any = null;
  humidity: number = 0;
  rain: number = 0;
  pressure:  number = 0;
  temperature:  number = 0;
  wind:  number = 0;

  // Other variables
  isLoading: boolean = true;

  

  darkMode = false;
  private prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  toggleDarkMode() {
    document.body.classList.toggle('dark', this.darkMode);
    localStorage.setItem('darkMode', JSON.stringify(this.darkMode));
    this.applyTheme();

  }

  private loadThemePreference() {
    const savedMode = localStorage.getItem('darkMode');
    this.darkMode = savedMode ? JSON.parse(savedMode) : this.prefersDark.matches;
    this.toggleDarkMode();
  }

  private applyTheme() {
    const theme = this.darkMode ? 'dark' : 'light';
    document.body.setAttribute('color-theme', theme);
  }
  

 
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
  _temperature: number = 22.5; // Always in Celsius
  private _windSpeed: number = 15; // Always in km/h
  private _pressure: number = 1013; // Always in hPa
  private _precipitation: number = 5.2; // Always in mm
  private _precipitationRate: number = 0.5; // Always in mm/h
  
  // Display values (converted based on selected units)
  displayTemperature: number = this._temperature;
  displayWindSpeed: number = this._windSpeed;
  displayPressure: number = this._pressure;
  displayPrecipitation: number = this._precipitation;
  displayPrecipitationRate: number = this._precipitationRate;

  // Other sensor values
  // Removed duplicate declaration of 'humidity' with conflicting type
  pm25: number = 12;
  pm10: number = 24;
  windDirection: number = 45;
  
  
  // Measurement units
  temperatureUnit: string = 'celsius';
  windSpeedUnit: string = 'kmh';
  pressureUnit: string = 'hpa';
  precipitationUnit: string = 'mm';
  
  // Calculated values
  airQualityText: string = '--';
  airQualityColor: string = 'medium';
  windDirectionText: string = '--';

  pressureTrend: string = 'stable';
  pressureTrendIcon: string = 'remove';
  
  lastUpdate: Date = new Date();
  isRefreshing: boolean = false;
  

  constructor(
    private modalCtrl: ModalController,
    private translate: TranslateService,
    private platform: Platform,
    private alertCtrl: AlertController,
    private router: Router, // Ajout du Router dans le constructeur
    private sensorService: SensorService
    
  ) {
    if (this.platform.is('ios')) {
      document.body.classList.add('ios');
    } else if (this.platform.is('android')) {
      document.body.classList.add('md');
    }

    
   addIcons({home,sunny,moon,refresh,thermometer,flag,compass,water,speedometer,rainy,cloud,notifications,time,settings,timeOutline,partlySunny,speedometerOutline,wifi,remove,trendingUp,trendingDown,arrowBack});
   this.prefersDark.addEventListener('change', (e) => {
    this.darkMode = e.matches;
    this.toggleDarkMode();
  });
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
    // Fetch sensor data from Firebase
    this.fetchSensorData();
    
  
    // Subscribe to sensor data updates from the service
    if (!this.sensorService.sensorData$) {
      console.warn('SensorService is not emitting data.');
    } else {
      this.sensorService.sensorData$.subscribe((data: any) => {
        if (data) {
          console.log('Données des capteurs :', data);
        } else {
          console.log('Aucune donnée disponible');
        }
      });
    }
  
    // Load initial data and setup periodic updates
    this.loadData();
    this.checkConnectivity();
    this.setupConnectivityListeners();
    this.checkForAlerts();
  
    // Periodic updates
    setInterval(() => this.loadData(), 300000); // Every 5 minutes
    setInterval(() => this.checkSensorStatus(), 12 * 3600000); // Every 12 hours
  
    // Load dark mode preference
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      this.darkMode = JSON.parse(savedMode);
      document.body.classList.toggle('dark', this.darkMode);
      this.loadThemePreference();
    }
  }
  
  fetchSensorData() {
    const db = getDatabase(); // Initialize Firebase Realtime Database
    const sensorsRef = ref(db, 'sensors/capteurs'); // Path to the "capteurs" node in Firebase
  
    // Listen for real-time updates
    onValue(
      sensorsRef,
      (snapshot) => {
        const data = snapshot.val();
  
        if (data) {
          console.log('Sensor data fetched:', data);
          this.sensorData = data;
  
          // Update UI with sensor data
          this.humidity = parseFloat(data.humidite) || 0; // Ensure humidity is a number
          this.rain = data.pluie || '--';
          this.pressure = data.pression || '--';
          this.wind = data.vent || '--';
        } else {
          console.log('No sensor data available.');
          this.sensorData = null;
        }
  
        this.isLoading = false;
      },
      (error: Error) => {
        console.error('Error fetching sensor data:', error);
        this.isLoading = false;
      }
    );
  }

  checkForAlerts() {
    // Simulation d'alertes basées sur les conditions actuelles
    const newAlerts: WeatherAlert[] = [];
    
    if (this._windSpeed > 30) {
      newAlerts.push({
        type: 'HIGH_WIND',
        severity: 'high',
        message: this.translate.instant('ALERTS.HIGH_WIND', { speed: this._windSpeed }),
        timestamp: new Date(),
        read: false
      });
    }

    if (this.pm25 > 35 || this.pm10 > 50) {
      newAlerts.push({
        type: 'AIR_QUALITY',
        severity: 'medium',
        message: this.translate.instant('ALERTS.POOR_AIR_QUALITY'),
        timestamp: new Date(),
        read: false
      });
    }

    if (newAlerts.length > 0) {
      this.addAlerts(newAlerts);
    }
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
  }

  addAlerts(alerts: WeatherAlert[]) {
    this.alerts.unshift(...alerts);
    this.updateUnreadCount();
    alerts.forEach(alert => this.presentAlertNotification(alert));
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
    const alertPopup = await this.alertCtrl.create({
      header: this.getAlertTitle(alert.type),
      message: alert.message,
      buttons: ['OK'],
      cssClass: `alert-${alert.severity}`
    });
    await alertPopup.present();
  }

  getAlertIcon(type: AlertType): string {
    const icons = {
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
    
    this.sensorService.sensorData$.subscribe((data) => {
      if (data) {
        this.displayTemperature = data.temperature;
        this.displayWindSpeed = data.windSpeed;
        this.displayPressure = data.pressure;
        this.humidity = data.humidity;
        this._precipitation = data.precipitation;
      }
      
      if (data.language) {
        this.translate.use(data.language);
      }
      
      this.convertDisplayValues();
    });
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
    this.isRefreshing = true;
    
    // Simulate new data (always in metric units)
    this._temperature = this.getRandomInRange(15, 30, 1);
    this._windSpeed = this.getRandomInRange(0, 40, 1);
    this._pressure = this.getRandomInRange(980, 1030, 0);
    this._precipitation = this.getRandomInRange(0, 20, 1);
    this._precipitationRate = this.getRandomInRange(0, 5, 1);
    
    // Update display values
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
    const aqi = Math.max(this.pm25 / 25, this.pm10 / 50) * 100;
    if (aqi < 50) {
      this.airQualityText = this.translate.instant('AIR_QUALITY.GOOD');
      this.airQualityColor = 'success';
    } else if (aqi < 100) {
      this.airQualityText = this.translate.instant('AIR_QUALITY.MODERATE');
      this.airQualityColor = 'warning';
    } else {
      this.airQualityText = this.translate.instant('AIR_QUALITY.POOR');
      this.airQualityColor = 'danger';
    }

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

  refreshData() {
    this.loadData();
  }
}