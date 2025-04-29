import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
    title: 'Accueil'  // Ajout du titre de page
  },
  { 
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Tableau de bord'
  },
  {
    path: 'history',
    loadComponent: () => import('./history/history.page').then(m => m.HistoryPage),
    title: 'Historique'
  },
  {
    path: 'connectivity',
    loadComponent: () => import('./connectivity/connectivity.page').then(m => m.ConnectivityPage),
    title: 'Connectivité IoT'
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.page').then(m => m.SettingsPage),
    title: 'Paramètres'
  },
  { 
    path: '',
    redirectTo: 'home',
    pathMatch: 'full' 
  },
<<<<<<< HEAD
  // Route de fallback - Doit être la dernière
=======
>>>>>>> chore/test
  { 
    path: '**',
    redirectTo: 'home',
    title: 'Page non trouvée'
  }
];