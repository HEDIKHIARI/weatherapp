import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, 
  IonButtons, IonIcon, IonList, IonItem, IonLabel, 
  IonSegmentButton, IonSegment, IonSelect, IonSelectOption, 
  IonRadioGroup, IonRadio, IonListHeader
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [ 
    CommonModule,
    FormsModule,
    TranslateModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonIcon, IonList,
    IonItem, IonLabel, IonSegment, IonSegmentButton,
    IonSelect, IonSelectOption, IonRadioGroup, IonRadio,
    IonListHeader
  ]
})
export class SettingsPage {
  currentSegment = 'general';
  
  // Unités
  @Input() temperatureUnit: string = 'celsius';
  @Input() windSpeedUnit: string = 'kmh';
  @Input() pressureUnit: string = 'hpa';
  @Input() precipitationUnit: string = 'mm';
  
  // Langue
  @Input() currentLanguage: string = 'fr';
  languages = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' }
  ];
  
  // Thème
  theme: string = 'auto';
  
  // Notifications
  weatherAlerts: boolean = true;
  rainNotifications: boolean = true;
  uvAlerts: boolean = false;

  @Output() settingsChanged = new EventEmitter<any>();

  constructor(
    private modalCtrl: ModalController,
    private translate: TranslateService
  ) {this.translate.setDefaultLang('fr'); // Français comme langue par défaut
    this.translate.use('en'); }

  segmentChanged(ev: any) {
    if (ev && ev.detail) {
      this.currentSegment = ev.detail.value;
    }
  }

  saveSettings() {
    const settings = {
      general: {
        theme: this.theme,
        language: this.currentLanguage
      },
      units: {
        temperature: this.temperatureUnit,
        windSpeed: this.windSpeedUnit,
        pressure: this.pressureUnit,
        precipitation: this.precipitationUnit
      },
     
    };
    
    this.settingsChanged.emit(settings);
    this.translate.use(this.currentLanguage);
    this.modalCtrl.dismiss(settings, 'saved');
  }

  closeModal() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}