import { Injectable } from '@angular/core';
import { Database, ref, onValue } from '@angular/fire/database';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SensorService {
  private sensorDataSubject = new BehaviorSubject<any>(null);
  public sensorData$ = this.sensorDataSubject.asObservable();

  constructor(private db: Database) {
    this.listenToSensorData();
  }

  private listenToSensorData(): void {
    const path = 'sensors/capteurs';
    const dbRef = ref(this.db, path);

    onValue(dbRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const parsedData = {
          humiditySensor: Object.keys(data.humidite || {})[0] || null,
          temperatureSensor: Object.keys(data.temperature || {})[0] || null,
          pressureSensor: Object.keys(data.pression || {})[0] || null,
          rainSensor: Object.keys(data.pluie || {})[0] || null,
          windSensor: Object.keys(data.vent || {})[0] || null
        };
        this.sensorDataSubject.next(parsedData);
      } else {
        this.sensorDataSubject.next(null);
      }
    }, (error) => {
      console.error('Firebase read error:', error);
    });
  }

  getRealtimeData(path: string): Observable<any> {
    const dbRef = ref(this.db, path);
    return new Observable<any>(subscriber => {
      const unsubscribe = onValue(dbRef, (snapshot) => {
        subscriber.next(snapshot.val());
      }, (error) => {
        subscriber.error(error);
      });

      return () => unsubscribe(); // Cleanup
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
