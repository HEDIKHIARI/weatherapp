import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core'; // Import TranslateModule
import { SensorService } from '../sensorservice/sensor.service'; // Import SensorService


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule,TranslateModule, RouterModule]
})
export class HomePage {
  sensorData: any;
  constructor(private router: Router, private sensorService: SensorService) {
    this.sensorService.sensorData$.subscribe((data) => {
      this.sensorData = data;
      console.log('Données reçues :', data);
    });
  }
  Login() {
    this.router.navigate(['/login']); // Redirige vers la page de connexion
  }
  }