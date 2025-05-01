import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
    title: 'Accueil'  // Ajout du titre de page
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
    path: 'login',
    title: 'Connexion',
    loadComponent: () => import('./auth/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    title: 'Inscription',
    loadComponent: () => import('./auth/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'forgot-password',
    title: 'Mot de passe oublié',
    loadComponent: () => import('./auth/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage)
  },
  { 
    path: '',
    redirectTo: 'home',
    pathMatch: 'full' 
  },
  // Route de fallback - Doit être la dernière
  { 
    path: '**',
    redirectTo: 'home',
    title: 'Page non trouvée'
  }
];