import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-test-nav',
  templateUrl: './test-nav.page.html',
  styleUrls: ['./test-nav.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class TestNavPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
