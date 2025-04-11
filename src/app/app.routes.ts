import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  },
  { 
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { 
    path: '',
    redirectTo: 'home',
    pathMatch: 'full' 
  },
  // Optionnel : route pour les pages non trouvées
  { 
    path: '**',
    redirectTo: 'home'
  },
  {
    path: 'history',
    loadComponent: () => import('./history/history.page').then( m => m.HistoryPage)
  },
  {
    path: 'connectivity',
    loadComponent: () => import('./connectivity/connectivity.page').then( m => m.ConnectivityPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.page').then( m => m.SettingsPage)
  }
];