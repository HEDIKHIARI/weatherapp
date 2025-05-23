import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core'; // Import TranslateModule


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule,TranslateModule]
})
export class HomePage {
  constructor(private router: Router) {}

  Login() {
    this.router.navigate(['/login']);
  }
}