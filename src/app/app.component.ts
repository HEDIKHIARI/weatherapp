import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { DashboardComponent } from './dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    IonApp,
    IonRouterOutlet,
    DashboardComponent
  ],
  providers: [] // No need for provideHttpClient here
})
<<<<<<< HEAD
export class AppComponent {
  constructor() {}
}
=======
export class AppComponent {}
>>>>>>> efaf774711c2ae5bf1797f3e89288554cf8b9208
