import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc
} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
 
  private user$ = new BehaviorSubject<User | null>(null);

  constructor(private auth: Auth,private firestore :Firestore) {
    
  }

  /**
   * Inscription d'un nouvel utilisateur + enregistrement dans Firestore
   */
  async register(email: string, password: string, username: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;

    // Enregistrement du profil utilisateur dans Firestore
    const userRef = doc(this.firestore, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      username: username,
      createdAt: new Date()
    });

    console.log("Utilisateur enregistré dans Firestore !");
    return user;
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    return signOut(this.auth);
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  getCurrentUser() {
    return this.user$.asObservable();
  }
}
