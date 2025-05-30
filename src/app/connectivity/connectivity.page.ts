import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, 
  IonCardHeader, IonCardTitle, IonCardContent, IonItem, 
  IonIcon, IonLabel, IonProgressBar, IonButton
} from '@ionic/angular/standalone';

import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { 
  checkmarkCircle, closeCircle, wifi, refresh
} from 'ionicons/icons';

import { ESP32MinimalService, ESP32Data } from '..//services/esp32.service';

@Component({
  selector: 'app-connectivity-minimal',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonIcon, IonLabel, IonProgressBar, IonButton
  ],
  templateUrl: './connectivity.page.html',
  styleUrls: ['./connectivity.page.scss']
})
export class ConnectivityPage implements OnInit, OnDestroy {
  private esp32Service = inject(ESP32MinimalService);
  
  esp32Connected = false;
  wifiConnected = false;
  wifiStrength = 0;
  
  private subscription?: Subscription;

  constructor() {
    addIcons({ checkmarkCircle, closeCircle, wifi, refresh });
  }

  ngOnInit(): void {
    this.subscription = this.esp32Service.data$.subscribe((data: ESP32Data) => {
      this.esp32Connected = data.esp32_connected;
      this.wifiConnected = data.wifi_connected;
      this.wifiStrength = data.wifi_strength;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getWifiColor(): string {
    if (!this.wifiConnected) return 'danger';
    if (this.wifiStrength > 70) return 'success';
    if (this.wifiStrength > 40) return 'warning';
    return 'danger';
  }

  // Simulation pour test
  async simulate(): Promise<void> {
    const esp32 = Math.random() > 0.5;
    const wifi = esp32 ? Math.random() > 0.3 : false;
    const strength = wifi ? Math.floor(Math.random() * 100) : 0;

    await this.esp32Service.updateData({
      esp32_connected: esp32,
      wifi_connected: wifi,
      wifi_strength: strength
    });
  }
}