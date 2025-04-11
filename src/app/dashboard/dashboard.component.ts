import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import crucial
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, 
  IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonIcon, IonProgressBar, IonButtons,
  IonButton, IonFooter, IonSegment, IonSegmentButton, 
  IonLabel
} from '@ionic/angular/standalone'; // Notez le /standalone
import { addIcons } from 'ionicons';
import { partlySunny, thermometer, water, speedometer, cloud, flag, 
        speedometerOutline, rainy, sunny, refresh, home, time, 
        settings, wifi, remove, trendingUp, 
        trendingDown } from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true, // Important pour le mode standalone
  imports: [
    CommonModule, // Nécessaire pour ngClass, ngIf, etc.
    IonHeader, IonToolbar, IonTitle, IonContent, IonGrid,
    IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonIcon, IonProgressBar, IonButtons,
    IonButton, IonFooter, IonSegment, IonSegmentButton,
    IonLabel
  ]
})

export class DashboardComponent implements OnInit {
  // Sensor values
  temperature: number = 22.5;
  humidity: number = 65;
  pressure: number = 1013;
  pm25: number = 12;
  pm10: number = 24;
  windSpeed: number = 15;
  windDirection: number = 45; // en degrés
  precipitation: number = 5.2;
  precipitationRate: number = 0.5;
  uvIndex: number = 4;
  
  // Calculated values
  airQualityText: string = '--';
  airQualityColor: string = 'medium';
  airQualityClass: string = '';
  windDirectionText: string = '--';
  windDirectionIcon: string = 'compass';
  uvText: string = '--';
  uvColor: string = 'medium';
  uvClass: string = '';
  pressureTrend: string = 'stable';
  pressureTrendIcon: string = 'remove';
  pressureTrendColor: string = 'medium';
  
  lastUpdate: Date = new Date();

  constructor() {
    addIcons({
      partlySunny, thermometer, water, speedometer, cloud, flag,
      speedometerOutline, rainy, sunny, refresh, home, time,
      settings, wifi,  remove, trendingUp,
      trendingDown
    });
  }

  ngOnInit() {
    this.loadData();
    // Refresh data every 5 minutes
    setInterval(() => this.loadData(), 300000);
  }

  loadData() {
    // Simuler des données aléatoires pour la démo
    this.temperature = this.getRandomInRange(15, 30, 1);
    this.humidity = this.getRandomInRange(30, 90, 0);
    this.pressure = this.getRandomInRange(980, 1030, 0);
    this.pm25 = this.getRandomInRange(5, 50, 1);
    this.pm10 = this.getRandomInRange(10, 80, 1);
    this.windSpeed = this.getRandomInRange(0, 40, 1);
    this.windDirection = this.getRandomInRange(0, 360, 0);
    this.precipitation = this.getRandomInRange(0, 20, 1);
    this.precipitationRate = this.getRandomInRange(0, 5, 1);
    this.uvIndex = this.getRandomInRange(0, 12, 1);
    this.lastUpdate = new Date();
    
    this.calculateDerivedValues();
  }

  private getRandomInRange(min: number, max: number, decimals: number): number {
    const rand = Math.random() * (max - min) + min;
    return parseFloat(rand.toFixed(decimals));
  }

  calculateDerivedValues() {
    // Air quality calculation
    const aqi = Math.max(this.pm25 / 25, this.pm10 / 50) * 100;
    if (aqi < 50) {
      this.airQualityText = 'Bon';
      this.airQualityColor = 'success';
      this.airQualityClass = 'good';
    } else if (aqi < 100) {
      this.airQualityText = 'Modéré';
      this.airQualityColor = 'warning';
      this.airQualityClass = 'moderate';
    } else {
      this.airQualityText = 'Mauvais';
      this.airQualityColor = 'danger';
      this.airQualityClass = 'bad';
    }

    // Wind direction
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    this.windDirectionText = directions[Math.round(this.windDirection / 22.5) % 16];
    this.windDirectionIcon = 'arrow-round-forward';

    // UV index
    if (this.uvIndex <= 2) {
      this.uvText = 'Faible';
      this.uvColor = 'success';
      this.uvClass = 'uv-low';
    } else if (this.uvIndex <= 5) {
      this.uvText = 'Modéré';
      this.uvColor = 'warning';
      this.uvClass = 'uv-moderate';
    } else if (this.uvIndex <= 7) {
      this.uvText = 'Élevé';
      this.uvColor = 'warning';
      this.uvClass = 'uv-high';
    } else if (this.uvIndex <= 10) {
      this.uvText = 'Très élevé';
      this.uvColor = 'danger';
      this.uvClass = 'uv-very-high';
    } else {
      this.uvText = 'Extrême';
      this.uvColor = 'danger';
      this.uvClass = 'uv-extreme';
    }

    // Pressure trend (simplified)
    if (this.pressure > 1018) {
      this.pressureTrend = 'Haut';
      this.pressureTrendIcon = 'trending-up';
      this.pressureTrendColor = 'success';
    } else if (this.pressure < 1008) {
      this.pressureTrend = 'Bas';
      this.pressureTrendIcon = 'trending-down';
      this.pressureTrendColor = 'danger';
    } else {
      this.pressureTrend = 'Stable';
      this.pressureTrendIcon = 'remove';
      this.pressureTrendColor = 'medium';
    }
  }

  refreshData() {
    this.loadData();
  }

  segmentChanged(ev: any) {
    console.log('Segment changed', ev.detail.value);
    // Implémentez la navigation ici si nécessaire
  }
}