import { Injectable } from '@angular/core';
import { Database, ref, onValue } from '@angular/fire/database';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SensorService {
  constructor(private db: Database) {}

  getRealtimeData(path: string): Observable<any> {
    const dbRef = ref(this.db, path);
    
    return new Observable<any>(subscriber => {
      const unsubscribe = onValue(dbRef, (snapshot) => {
        subscriber.next(snapshot.val());
      }, (error) => {
        subscriber.error(error);
      });

      return () => unsubscribe(); // Cleanup function
    });
  }

  getDataSnapshot(path: string): Promise<any> {
    const dbRef = ref(this.db, path);
    return new Promise((resolve, reject) => {
      onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        data ? resolve(data) : reject('No data available');
      }, { onlyOnce: true });
    });
  
  }
 
}