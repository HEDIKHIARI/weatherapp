import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { 
  IonHeader, 
  IonToolbar, 
  IonButtons, 
  IonBackButton, 
  IonTitle, 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonItem, 
  IonIcon, 
  IonLabel, 
  IonProgressBar, 
  IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  checkmarkCircle, 
  closeCircle, 
  wifi, 
  warning, 
  cloudDone, 
  cloudOffline, 
  refresh 
} from 'ionicons/icons';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-iot-configuration',
  templateUrl: './connectivity.page.html',
  styleUrls: ['./connectivity.page.scss'],
  standalone: true,
  imports: [
    IonHeader, 
    IonToolbar, 
    IonButtons, 
    IonBackButton, 
    IonTitle, 
    IonContent, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardContent, 
    IonItem, 
    IonIcon, 
    IonLabel, 
    IonProgressBar, 
    IonButton
  ]
})
export class ConnectivityPage {
  // Statut ESP32
  esp32Status: 'connected' | 'disconnected' = 'disconnected';
  lastConnectionTime: string | null = null;

  // WiFi
  wifiStrength = 0;
  wifiStrengthIcon = 'wifi';

  // MQTT
  mqttConnected = false;

  constructor(private toastController: ToastController) {
    // Ajout des icônes utilisées dans le template
    addIcons({
      checkmarkCircle,
      closeCircle,
      wifi,
      warning,
      cloudDone,
      cloudOffline,
      refresh
    });
    
    this.initializeData();
  }

  async initializeData() {
    await this.loadEsp32Status();
    await this.loadWifiStatus();
    await this.loadMqttStatus();
  }

  private async loadEsp32Status() {
    // Simulation de chargement
    setTimeout(() => {
      this.esp32Status = 'connected';
      this.lastConnectionTime = new Date().toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }, 1500);
  }

  private async loadWifiStatus() {
    let strength = 0;
    const interval = setInterval(() => {
      strength += 10;
      this.wifiStrength = strength;
      this.updateWifiStrengthIcon();
      
      if (strength >= 80) {
        clearInterval(interval);
      }
    }, 300);
  }

  private async loadMqttStatus() {
    setTimeout(() => {
      this.mqttConnected = true;
    }, 2500);
  }

  private updateWifiStrengthIcon() {
    if (this.wifiStrength > 75) {
      this.wifiStrengthIcon = 'wifi';
    } else if (this.wifiStrength > 50) {
      this.wifiStrengthIcon = 'wifi';
    } else if (this.wifiStrength > 25) {
      this.wifiStrengthIcon = 'wifi';
    } else {
      this.wifiStrengthIcon = 'warning';
    }
  }

  getWifiStrengthColor(): string {
    if (this.wifiStrength > 75) {
      return 'success';
    } else if (this.wifiStrength > 50) {
      return 'success';
    } else if (this.wifiStrength > 25) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  async reconnect() {
    if (this.esp32Status === 'connected') return;
    
    const toast = await this.toastController.create({
      message: 'Tentative de reconnexion en cours...',
      duration: 2000,
      position: 'top'
    });
    await toast.present();

    // Réinitialisation
    this.esp32Status = 'disconnected';
    this.mqttConnected = false;
    this.wifiStrength = 0;

    // Simulation reconnexion
    setTimeout(() => {
      this.esp32Status = 'connected';
      this.lastConnectionTime = new Date().toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      this.mqttConnected = true;
      
      let strength = 0;
      const interval = setInterval(() => {
        strength += 10;
        this.wifiStrength = strength;
        this.updateWifiStrengthIcon();
        
        if (strength >= 80) {
          clearInterval(interval);
        }
      }, 300);
    }, 3000);
  }
}