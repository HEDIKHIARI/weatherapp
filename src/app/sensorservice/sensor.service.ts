import { Injectable } from '@angular/core';
import { Database, ref, onValue, DataSnapshot } from '@angular/fire/database';
import { BehaviorSubject } from 'rxjs';
@Injectable({ providedIn: 'root',
})
export class SensorService {
  private sensorDataSubject = new BehaviorSubject<any>(null);
  sensorData$ = this.sensorDataSubject.asObservable();

  constructor(private db: Database) {
    this.listenToSensorData();
  }

  private listenToSensorData() {
    const sensorRef = ref(this.db, 'sensors'); // Chemin dans Firebase
    onValue(ref(this.db, 'sensors'), (snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot : DataSnapshot  & { key: string }) => {
          const key = childSnapshot.key || ''; // Vérifiez que `key` est bien de type `string`
          const value = childSnapshot.val();
          // Vérifiez que les données ne sont pas des booléens
      if (typeof value !== 'boolean') {
        console.log(`Key: ${key}, Value:`, value);
      } else {
        console.error(`Invalid data type for key ${key}:`, value);
      }
    });
  } else {
    console.log('No data available');
  }
    });
  }
}