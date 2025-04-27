import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonBackButton, IonSegment, IonSegmentButton, IonCol, IonButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js';
import { registerables } from 'chart.js';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-historique',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [ 
    CommonModule,
    TranslateModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonSegment, IonSegmentButton,
    FormsModule    
  ]
})
export class HistoryPage implements AfterViewInit {
  @ViewChild('temperatureChart') temperatureChartRef!: ElementRef;
  @ViewChild('humidityChart') humidityChartRef!: ElementRef;
  @ViewChild('pressureChart') pressureChartRef!: ElementRef;
  @ViewChild('precipitationChart') precipitationChartRef!: ElementRef;
  
  selectedWeek: number = 1; // Semaine par défaut
  weeks = [1, 2, 3, 4]; // 4 dernières semaines
  chartInstances: Chart[] = [];

  constructor(private translate: TranslateService) {
    Chart.register(...registerables);
  }

  ngAfterViewInit() {
    this.createCharts();
  }

  weekChanged(event: any) {
    this.selectedWeek = event.detail.value;
    this.updateCharts();
  }

  createCharts() {
    this.createTemperatureChart();
    this.createHumidityChart();
    this.createPressureChart();
    this.createPrecipitationChart();
  }

  updateCharts() {
    this.chartInstances.forEach(chart => chart.destroy());
    this.chartInstances = [];
    this.createCharts();
  }

  private getWeekData(weekNumber: number): any {
    // Simulation de données pour 4 semaines
    const weeklyData = {
      temperature: [
        [22, 23, 25, 27, 26, 24, 23], // Semaine 1
        [21, 22, 24, 26, 25, 23, 22], // Semaine 2
        [20, 21, 23, 25, 24, 22, 21], // Semaine 3
        [19, 20, 22, 24, 23, 21, 20]  // Semaine 4
      ],
      humidity: [
        [45, 50, 55, 60, 58, 52, 48],
        [44, 49, 54, 59, 57, 51, 47],
        [43, 48, 53, 58, 56, 50, 46],
        [42, 47, 52, 57, 55, 49, 45]
      ],
      pressure: [
        [1015, 1013, 1010, 1012, 1014, 1016, 1015],
        [1014, 1012, 1009, 1011, 1013, 1015, 1014],
        [1013, 1011, 1008, 1010, 1012, 1014, 1013],
        [1012, 1010, 1007, 1009, 1011, 1013, 1012]
      ],
      precipitation: [
        [0, 2, 5, 0, 0, 1, 3], // mm
        [1, 3, 0, 0, 2, 4, 1],
        [0, 0, 0, 5, 3, 0, 0],
        [2, 1, 0, 0, 0, 2, 5]
      ]
    };

    return {
      temperature: weeklyData.temperature[weekNumber - 1],
      humidity: weeklyData.humidity[weekNumber - 1],
      pressure: weeklyData.pressure[weekNumber - 1],
      precipitation: weeklyData.precipitation[weekNumber - 1]
    };
  }

  private createTemperatureChart() {
    const label = this.translate.instant('HISTORY.TEMPERATURE_LABEL');
    const data = this.getWeekData(this.selectedWeek).temperature;
    
    const chart = this.createChart(
      this.temperatureChartRef,
      label,
      data,
      '#36a2eb',
      this.generateDayLabels()
    );
    this.chartInstances.push(chart);
  }

  private createHumidityChart() {
    const label = this.translate.instant('HISTORY.HUMIDITY_LABEL');
    const data = this.getWeekData(this.selectedWeek).humidity;
    
    const chart = this.createChart(
      this.humidityChartRef,
      label,
      data,
      '#ffce56',
      this.generateDayLabels()
    );
    this.chartInstances.push(chart);
  }

  private createPressureChart() {
    const label = this.translate.instant('HISTORY.PRESSURE_LABEL');
    const data = this.getWeekData(this.selectedWeek).pressure;
    
    const chart = this.createChart(
      this.pressureChartRef,
      label,
      data,
      '#4bc0c0',
      this.generateDayLabels()
    );
    this.chartInstances.push(chart);
  }

  private createPrecipitationChart() {
    const label = this.translate.instant('HISTORY.PRECIPITATION_LABEL');
    const data = this.getWeekData(this.selectedWeek).precipitation;
    
    const chart = this.createChart(
      this.precipitationChartRef,
      label,
      data,
      '#9966ff',
      this.generateDayLabels(),
      'bar' // Type différent pour les précipitations
    );
    this.chartInstances.push(chart);
  }

  private generateDayLabels(): string[] {
    return [
      this.translate.instant('DAYS.MON'),
      this.translate.instant('DAYS.TUE'),
      this.translate.instant('DAYS.WED'),
      this.translate.instant('DAYS.THU'),
      this.translate.instant('DAYS.FRI'),
      this.translate.instant('DAYS.SAT'),
      this.translate.instant('DAYS.SUN')
    ];
  }

  private createChart(
    chartRef: ElementRef,
    label: string,
    data: number[],
    borderColor: string,
    labels: string[],
    type: 'line' | 'bar' = 'line'
  ): Chart {
    const ctx = chartRef.nativeElement.getContext('2d');
    return new Chart(ctx, {
      type: type,
      data: {
        labels: labels,
        datasets: [{
          label: label,
          data: data,
          borderColor: borderColor,
          backgroundColor: type === 'line' 
            ? this.hexToRgba(borderColor, 0.1) 
            : this.hexToRgba(borderColor, 0.7),
          tension: type === 'line' ? 0.4 : 0,
          fill: true,
          borderWidth: 2
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
            text: `${label.split(')')[0]} - ${this.translate.instant('WEEK')} ${this.selectedWeek}`
          }
        },
        scales: {
          y: {
            beginAtZero: type === 'bar' // Commence à 0 pour les précipitations (type bar)
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