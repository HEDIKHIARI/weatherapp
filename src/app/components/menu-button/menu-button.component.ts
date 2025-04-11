import { Component } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { IonIcon, IonButton } from "@ionic/angular/standalone";

@Component({
  selector: 'app-menu-button',
  templateUrl: './menu-button.component.html',
  styleUrls: ['./menu-button.component.scss'],
  imports:[IonIcon,IonButton],
})
export class MenuButtonComponent {
  constructor(private actionSheetCtrl: ActionSheetController) {}

  async showMenu() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Options',
      buttons: [
        {
          text: 'Langue',
          icon: 'language-outline',
          handler: () => {
            this.changeLanguage();
          }
        },
        {
          text: 'Connectivité',
          icon: 'wifi-outline',
          handler: () => {
            this.checkConnectivity();
          }
        },
        {
          text: 'Paramètres',
          icon: 'settings-outline',
          handler: () => {
            this.openSettings();
          }
        },
        {
          text: 'Annuler',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  private changeLanguage() {
    console.log('Changer la langue');
    // Implémentez la logique ici
  }

  private checkConnectivity() {
    console.log('Vérifier la connectivité');
    // Implémentez la logique ici
  }

  private openSettings() {
    console.log('Ouvrir les paramètres');
    // Implémentez la logique ici
  }
}
