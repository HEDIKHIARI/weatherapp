import { Injectable } from '@angular/core';
import { getDatabase, ref, set } from '@angular/fire/database';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private db = getDatabase();

  // Example function to save data to Firebase
  saveData(path: string, data: any) {
    const dataRef = ref(this.db, path);
    set(dataRef, data);
  }

  // Example function to get data from Firebase
  getData(path: string) {
    const dataRef = ref(this.db, path);
    // Add logic to read data (e.g., using get() or onValue)
  }
}
