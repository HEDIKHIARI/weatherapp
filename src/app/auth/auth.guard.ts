import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  console.log('AuthGuard déclenché pour:', state.url);
  
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  console.log('Statut connexion:', isLoggedIn);
  
  if (!isLoggedIn) {
    console.warn('Accès refusé, redirection vers /login');
    return new Router().createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }
  return true;
};