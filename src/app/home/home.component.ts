import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core'; // Import TranslateModule


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule,TranslateModule, RouterModule]
})
export class HomePage {
  constructor(private router: Router) {}
  // Navigate to the login page
  Login() {
    this.router.navigate(['/login']); // Redirige vers la page de connexion
  }
  }