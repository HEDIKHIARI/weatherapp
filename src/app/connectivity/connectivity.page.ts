import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonCard, IonCardHeader, IonCardTitle } from '@ionic/angular/standalone';

@Component({
  selector: 'app-connectivity',
  templateUrl: './connectivity.page.html',
  styleUrls: ['./connectivity.page.scss'],
  standalone: true,
  imports: [IonCardTitle, IonCardHeader, IonCard, IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ConnectivityPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
