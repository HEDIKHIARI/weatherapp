import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HomePage {
  constructor(private router: Router) {}

  // Méthode garantie pour la navigation
  goToDashboard() {
    this.router.navigate(['/dashboard'],);
  }
}