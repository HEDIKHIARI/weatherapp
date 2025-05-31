import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, 
  IonCardHeader, IonCardTitle, IonCardContent, IonItem, 
  IonIcon, IonLabel, IonProgressBar, IonButton, IonButtons, IonBadge } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';

import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { 
  checkmarkCircle, closeCircle, wifi, refresh, arrowBack, hardwareChip, flash } from 'ionicons/icons';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ESP32MinimalService, esp32_data } from '../services/esp32.service';

@Component({
  selector: 'app-connectivity-minimal',
  standalone: true,
  imports: [IonBadge, IonButtons, 
    CommonModule,
    TranslateModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonIcon, IonLabel, IonProgressBar, IonButton
  ],
  templateUrl: './connectivity.page.html',
  styleUrls: ['./connectivity.page.scss']
})
export class ConnectivityPage implements OnInit, OnDestroy {
 

  private esp32Service = inject(ESP32MinimalService);
  private translate = inject(TranslateService);
  private navCtrl: NavController = inject(NavController);
  
  esp32Connected = false;
  wifiConnected = false;
  wifiStrength = 0;
  
  private subscription?: Subscription;

  constructor() {
    addIcons({arrowBack,refresh,hardwareChip,wifi,flash,checkmarkCircle,closeCircle});
    
    // Configure translations
    this.initializeTranslations();
  }

  private initializeTranslations(): void {
    // Set default language
    this.translate.setDefaultLang('fr');
    
    // Get browser language
    const browserLang = this.translate.getBrowserLang();
    
    // Use browser language if available, otherwise use French
    const langToUse = browserLang?.match(/en|fr/) ? browserLang : 'fr';
    this.translate.use(langToUse);
  }

  ngOnInit(): void {
    this.subscription = this.esp32Service.data$.subscribe((data: esp32_data) => {
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

  // Method to change language
  changeLanguage(lang: string): void {
    this.translate.use(lang);
  }
 goBack(): void {
    this.navCtrl.back();
  }
  // Get current language
  getCurrentLanguage(): string {
    return this.translate.currentLang || this.translate.defaultLang;
  }
}