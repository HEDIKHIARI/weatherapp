import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { 
  IonContent, IonCard, IonIcon, IonText, IonButton 
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [IonContent, IonCard, IonIcon, IonButton]
})
export class DashboardComponent implements OnInit {
  currentWeather = {
    temperature: 22.5,
    humidity: 65,
    pressure: 1013,
    wind: {
      speed: 15,
      direction: 'NE',
      directionAngle: 45
    },
    precipitation: 2.4,
    airQuality: {
      pm25: 12,
      pm10: 24
    },
    uvIndex: 5
  };

  isTemperatureRising = true;
  isHumidityRising = false;
  isPressureRising = true;
  isWindRising = false;
  isPrecipitationRising = true;

  constructor(
    private navCtrl: NavController,
    private router: Router
  ) {}

  ngOnInit() {
    Chart.register(...registerables);
    this.createCharts();
  }

  // Navigation methods
  goToHomePage() {
    this.navCtrl.navigateRoot('/home');
    // Alternative with Angular Router:
    // this.router.navigate(['/home']);
  }

  refreshData() {
    console.log('Mise à jour des données...');
    // Implémentez votre logique d'actualisation ici
  }

  showHistory() {
    console.log('Ouverture historique...');
    // Implémentez votre logique de navigation ici
  }

  // Chart methods
  createCharts() {
    this.createChart('temperatureChart', {
      label: 'Température (°C)',
      data: [20, 21, 22, 23, 22.5, 22, 22.5, 23],
      borderColor: '#ff6b6b',
      backgroundColor: 'rgba(255, 107, 107, 0.1)'
    });

    this.createChart('humidityChart', {
      label: 'Humidité (%)',
      data: [60, 62, 63, 65, 64, 65, 64, 65],
      borderColor: '#4dabf7',
      backgroundColor: 'rgba(77, 171, 247, 0.1)'
    });

    this.createChart('pressureChart', {
      label: 'Pression (hPa)',
      data: [1012, 1012.5, 1013, 1013.5, 1013, 1013.2, 1013, 1013.5],
      borderColor: '#20c997',
      backgroundColor: 'rgba(32, 201, 151, 0.1)'
    });

    this.createChart('windChart', {
      label: 'Vent (km/h)',
      data: [12, 14, 15, 16, 15, 14, 15, 16],
      borderColor: '#fcc419',
      backgroundColor: 'rgba(252, 196, 25, 0.1)'
    });

    this.createChart('precipitationChart', {
      label: 'Précipitations (mm)',
      data: [0, 0.5, 1, 1.5, 2, 2.4, 2.2, 2.4],
      borderColor: '#748ffc',
      backgroundColor: 'rgba(116, 143, 252, 0.1)'
    });

    this.createChart('airQualityChart', {
      label: 'PM2.5 (µg/m³)',
      data: [10, 12, 11, 13, 12, 12, 11, 12],
      borderColor: '#b197fc',
      backgroundColor: 'rgba(177, 151, 252, 0.1)'
    });

    this.createChart('uvChart', {
      label: 'Indice UV',
      data: [3, 4, 5, 6, 5, 4, 3, 2],
      borderColor: '#ff922b',
      backgroundColor: 'rgba(255, 146, 43, 0.1)'
    });
  }

  private createChart(chartId: string, config: any) {
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['6h', '8h', '10h', '12h', '14h', '16h', '18h', '20h'],
        datasets: [{
          label: config.label,
          data: config.data,
          borderColor: config.borderColor,
          backgroundColor: config.backgroundColor,
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#fff',
          pointBorderColor: config.borderColor,
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#868e96'
            }
          },
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: '#868e96'
            }
          }
        }
      }
    });
  }

  // Helper methods
  getAirQualityColor() {
    const pm25 = this.currentWeather.airQuality.pm25;
    if (pm25 <= 12) return '#51cf66';
    if (pm25 <= 35) return '#fcc419';
    if (pm25 <= 55) return '#ff922b';
    return '#fa5252';
  }

  getAirQualityStatus() {
    const pm25 = this.currentWeather.airQuality.pm25;
    if (pm25 <= 12) return 'Bon';
    if (pm25 <= 35) return 'Moyen';
    if (pm25 <= 55) return 'Mauvais';
    return 'Très mauvais';
  }

  getUvIntensity() {
    const uv = this.currentWeather.uvIndex;
    if (uv <= 2) return 'Faible';
    if (uv <= 5) return 'Modéré';
    if (uv <= 7) return 'Fort';
    if (uv <= 10) return 'Très fort';
    return 'Extrême';
  }
}