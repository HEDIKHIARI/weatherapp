import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, 
  IonCardHeader, IonCardTitle, IonCardContent, IonItem, 
  IonIcon, IonLabel, IonProgressBar, IonButton, IonButtons,
  IonBackButton, ToastController
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { 
  checkmarkCircle, closeCircle, cloudDone, cloudOffline,
  wifi, refresh, informationCircle, alertCircle, time
} from 'ionicons/icons';

@Component({
  selector: 'app-connectivity',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonIcon, IonLabel, IonProgressBar,
    IonButton, IonButtons, IonBackButton
  ],
  templateUrl: './connectivity.page.html',
  styleUrls: ['./connectivity.page.scss'],
  
})
export class ConnectivityPage implements OnInit, OnDestroy {
  // Services
 
  private toastCtrl = inject(ToastController);
  private translate = inject(TranslateService);

  // Connection states
  esp32Status: 'connected' | 'disconnected' = 'disconnected';
  lastConnectionTime: string | null = null;
  
  // WiFi
  wifiStrength = 0;
  wifiStrengthIcon = 'wifi-outline';
  
  // MQTT
  mqttConnected = false;
  private mqttSub?: Subscription;

  constructor() {
    addIcons({
      checkmarkCircle, closeCircle, cloudDone, cloudOffline,
      wifi, refresh, informationCircle, alertCircle, time
    });
  }

  ngOnInit(): void {
    this.initMQTT();
    this.translate.setDefaultLang('fr'); // Défaut français
  }

  ngOnDestroy(): void {
    this.mqttSub?.unsubscribe();
  }

  private initMQTT(): void {
    try {
      this.mqttConnected = true;
      
     

      // Simulation de connexion (à remplacer par vos topics réels)
      setTimeout(() => {
        this.esp32Status = 'connected';
        this.lastConnectionTime = new Date().toLocaleTimeString();
        this.wifiStrength = 85;
        this.mqttConnected = true;
      }, 1500);
      
    } catch (error) {
      console.error('MQTT initialization error:', error);
      this.mqttConnected = false;
      this.showToast(this.translate.instant('IOT.MQTT_CONNECT_FAIL'), 'danger');
    }
  }

  getWifiStrengthColor(): string {
    if (this.wifiStrength > 75) return 'success';
    if (this.wifiStrength > 50) return 'success';
    if (this.wifiStrength > 25) return 'warning';
    return 'danger';
  }

  async reconnect(): Promise<void> {
    this.esp32Status = 'disconnected';
    this.mqttConnected = false;
    this.wifiStrength = 0;
    
    await this.showToast(this.translate.instant('IOT.RECONNECTING'), 'warning');
    
    setTimeout(() => {
      this.esp32Status = 'connected';
      this.lastConnectionTime = new Date().toLocaleTimeString();
      this.wifiStrength = 85;
      this.mqttConnected = true;
      this.showToast(this.translate.instant('IOT.RECONNECT_SUCCESS'), 'success');
    }, 2000);
  }

  private async showToast(message: string, color: 'success'|'warning'|'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}