import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonBackButton 
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js';
import { registerables } from 'chart.js';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-historique',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton
  ]
})
export class HistoryPage implements AfterViewInit {
  @ViewChild('temperatureChart') temperatureChartRef!: ElementRef;
  @ViewChild('humidityChart') humidityChartRef!: ElementRef;
  @ViewChild('pressureChart') pressureChartRef!: ElementRef;

  constructor(private translate: TranslateService) {
    Chart.register(...registerables);
  }

  ngAfterViewInit() {
    this.createCharts();
  }

  createCharts() {
    this.createTemperatureChart();
    this.createHumidityChart();
    this.createPressureChart();
  }

  private createTemperatureChart() {
    const label = this.translate.instant('HISTORY.TEMPERATURE_LABEL');
    this.createChart(
      this.temperatureChartRef,
      label,
      [22, 23, 25, 27, 26, 24],
      '#36a2eb',
      this.generateMonthLabels()
    );
  }

  private createHumidityChart() {
    const label = this.translate.instant('HISTORY.HUMIDITY_LABEL');
    this.createChart(
      this.humidityChartRef,
      label,
      [45, 50, 55, 60, 58, 52],
      '#ffce56',
      this.generateMonthLabels()
    );
  }

  private createPressureChart() {
    const label = this.translate.instant('HISTORY.PRESSURE_LABEL');
    this.createChart(
      this.pressureChartRef,
      label,
      [1015, 1013, 1010, 1012, 1014, 1016],
      '#4bc0c0',
      this.generateMonthLabels()
    );
  }

  private generateMonthLabels(): string[] {
    return [
      this.translate.instant('MONTHS.JAN'),
      this.translate.instant('MONTHS.FEB'),
      this.translate.instant('MONTHS.MAR'),
      this.translate.instant('MONTHS.APR'),
      this.translate.instant('MONTHS.MAY'),
      this.translate.instant('MONTHS.JUN')
    ];
  }

  private createChart(
    chartRef: ElementRef,
    label: string,
    data: number[],
    borderColor: string,
    labels: string[]
  ) {
    const ctx = chartRef.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: label,
          data: data,
          borderColor: borderColor,
          backgroundColor: this.hexToRgba(borderColor, 0.1),
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: label.split(')')[0]
          }
        },
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}