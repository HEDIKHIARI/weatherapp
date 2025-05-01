import { Routes } from '@angular/router';


export const routes: Routes = [
  // Redirection par défaut
  { 
    path: 'home',
    title: 'Accueil',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),

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

  // Routes protégées
 
  { 
    path: 'dashboard',
    title: 'Tableau de bord',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),

  },
  {
    path: 'history',
    title: 'Historique',
    loadComponent: () => import('./history/history.page').then(m => m.HistoryPage),
   
  },
  {
    path: 'connectivity',
    title: 'Connectivité',
    loadComponent: () => import('./connectivity/connectivity.page').then(m => m.ConnectivityPage),
    
  },
  {
    path: 'settings',
    title: 'Paramètres',
    loadComponent: () => import('./settings/settings.page').then(m => m.SettingsPage),
 
  },
  

  // Gestion des routes inconnues
  
];