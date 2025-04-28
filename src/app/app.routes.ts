import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '',
    redirectTo: 'home',
    pathMatch: 'full' 
  },
  { 
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  },
  { 
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
<<<<<<< HEAD
=======
  { 
    path: '',
    redirectTo: 'home',
    pathMatch: 'full' 
  },
  { 
    path: '**',
    redirectTo: 'home'
  },
>>>>>>> efaf774711c2ae5bf1797f3e89288554cf8b9208
  {
    path: 'history',
    loadComponent: () => import('./history/history.page').then(m => m.HistoryPage)
  },
  {
    path: 'connectivity',
    loadComponent: () => import('./connectivity/connectivity.page').then(m => m.ConnectivityPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.page').then(m => m.SettingsPage)
  },
  // La route wildcard doit TOUJOURS être en dernier
  { 
    path: '**',
    redirectTo: 'home'
  }
];