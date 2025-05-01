import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  User 
} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  currentUser: User | null = null;

  constructor() {
    this.auth.onAuthStateChanged(user => {
      this.currentUser = user;
    });
  }

  // Connexion
  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Inscription
  async register(email: string, password: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      await this.storeUserData(userCredential.user);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Réinitialisation mot de passe
  async forgotPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Déconnexion
  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  // Stockage données utilisateur
  private async storeUserData(user: User): Promise<void> {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      lastLogin: new Date()
    }, { merge: true });
  }

  // Gestion des erreurs
  private handleAuthError(error: any): string {
    const errorMap: Record<string, string> = {
      'auth/invalid-email': 'Email invalide',
      'auth/user-disabled': 'Compte désactivé',
      'auth/user-not-found': 'Aucun compte avec cet email',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/email-already-in-use': 'Email déjà utilisé',
      'auth/weak-password': 'Mot de passe trop faible (min. 6 caractères)',
      'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.'
    };
    return errorMap[error.code] || 'Erreur inconnue';
  }
}