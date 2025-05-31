import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonBackButton, IonItem, IonLabel, IonSelect, IonSelectOption, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { FirebaseDbService } from '../services/firebase-db.services';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { 
  thermometerOutline, 
  waterOutline, 
  speedometerOutline, 
  rainyOutline, 
  analyticsOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [IonIcon, 
    IonLabel, IonItem, IonButtons, IonBackButton,
    CommonModule,
    TranslateModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonSelect, IonSelectOption, IonSpinner
  ]
})
export class HistoryPage implements OnInit, OnDestroy {
  @ViewChild('tempChart') tempChartRef!: ElementRef;
  @ViewChild('humidityChart') humidityChartRef!: ElementRef;
  @ViewChild('pressureChart') pressureChartRef!: ElementRef;
  @ViewChild('precipChart') precipChartRef!: ElementRef;
  @ViewChild('windChart') windChartRef!: ElementRef;

  selectedDate: string = new Date().toISOString().split('T')[0];
  availableDates: string[] = [];
  isLoading = true;
  private charts: Chart[] = [];
  private realTimeSub!: Subscription;

  constructor(private firebaseDb: FirebaseDbService, private router: Router) {
    Chart.register(...registerables);
    
    // Ajout des icônes
    addIcons({
      thermometerOutline,
      waterOutline,
      speedometerOutline,
      rainyOutline,
      analyticsOutline
    });
  }

  async ngOnInit() {
    await this.loadAvailableDates();
    setTimeout(() => this.createCharts(), 50); // Délai pour le rendu DOM
    this.setupRealTimeUpdates();
  }

  ngOnDestroy() {
    this.realTimeSub?.unsubscribe();
    this.destroyCharts();
  }

  private setupRealTimeUpdates() {
    this.realTimeSub = this.firebaseDb.getStationData().subscribe(data => {
      if (data && this.isTodaySelected()) {
        this.updateCharts(data);
      }
    });
  }

  private isTodaySelected(): boolean {
    const today = new Date().toISOString().split('T')[0];
    return this.selectedDate === today;
  }

  private updateCharts(data: any) {
    if (!data) return;
    
    this.updateChart(this.tempChartRef, data.temperature || []);
    this.updateChart(this.humidityChartRef, data.humidity || []);
    this.updateChart(this.pressureChartRef, data.pressure || []);
    this.updateChart(this.precipChartRef, data.precipitation || []);
    this.updateChart(this.windChartRef, data.windspeed || []);
  }

  private updateChart(chartRef: ElementRef, newData: number[]) {
    if (!chartRef?.nativeElement || !this.charts.length) return;
    
    const chartIndex = this.charts.findIndex(chart => 
      chart.canvas === chartRef.nativeElement
    );
    
    if (chartIndex >= 0 && newData) {
      this.charts[chartIndex].data.datasets[0].data = newData;
      this.charts[chartIndex].update();
    }
  }

  async loadAvailableDates() {
    try {
      this.availableDates = (await this.firebaseDb.getDatesList()).sort();
      if (this.availableDates.length > 0) {
        this.selectedDate = this.availableDates[this.availableDates.length - 1];
      }
    } catch (error) {
      console.error('Error loading dates:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async createCharts() {
    this.destroyCharts();
    
    try {
      const weatherData = await this.firebaseDb.getDailyData(this.selectedDate);
      console.log('Données Firebase:', weatherData); // Debug important
      
      if (!weatherData) {
        console.error('No data found for selected date');
        return;
      }

      // Vérification des canvas
      if (!this.tempChartRef?.nativeElement) {
        console.error('Canvas température non trouvé');
        return;
      }

      // Température
      this.charts.push(this.createChart(
        this.tempChartRef,
        'Température (°C)',
        weatherData.temperature || Array(24).fill(0),
        'rgba(255, 99, 132, 0.8)',
        'line'
      ));

      // Humidité
      this.charts.push(this.createChart(
        this.humidityChartRef,
        'Humidité (%)',
        weatherData.humidity || Array(24).fill(0),
        'rgba(54, 162, 235, 0.8)',
        'line'
      ));

      // Pression
      this.charts.push(this.createChart(
        this.pressureChartRef,
        'Pression (hPa)',
        weatherData.pressure || Array(24).fill(0),
        'rgba(255, 206, 86, 0.8)',
        'line'
      ));

      // Précipitation
      this.charts.push(this.createChart(
        this.precipChartRef,
        'Précipitation (mm)',
        weatherData.precipitation || Array(24).fill(0),
        'rgba(75, 192, 192, 0.8)',
        'bar'
      ));

      // Vent
      this.charts.push(this.createChart(
        this.windChartRef,
        'Vent (km/h)',
        weatherData.windspeed || Array(24).fill(0),
        'rgba(194, 14, 125, 0.8)',
        'bar'
      ));
    } catch (error) {
      console.error('Error creating charts:', error);
    }
  }

  private destroyCharts() {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }

  private createChart(chartRef: ElementRef, label: string, data: number[], color: string, type: any): Chart {
    const ctx = chartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Contexte 2D non disponible pour', label);
      return null as any;
    }

    return new Chart(ctx, {
      type,
      data: {
        labels: this.generateHourLabels(),
        datasets: [{
          label,
          data,
          backgroundColor: color.replace('0.8', '0.2'),
          borderColor: color,
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, 
        // Ajout important
        plugins: {
          title: {
            display: true,
            text: `${this.selectedDate}`
          }
        },
        scales: {
          y: { 
            beginAtZero: type === 'bar',
            min: type === 'bar' ? 0 : undefined
          }
        }
      }
    });
  }

  private generateHourLabels(): string[] {
    return Array.from({length: 24}, (_, i) => `${i}h`);
  }

  dateChanged(event: any) {
    this.selectedDate = event.detail.value;
    this.createCharts();
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}