import { Injectable } from '@angular/core';
import { getDatabase, ref, onValue, DatabaseReference } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { set, update } from 'firebase/database';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private db = getDatabase();
  private sensorDataSubject = new BehaviorSubject<any>(null);
  sensorData$ = this.sensorDataSubject.asObservable();

  constructor() {
    const app = initializeApp(environment.firebase);
    this.listenToSensorData();
  }

  private listenToSensorData() {
    const dataRef: DatabaseReference = ref(this.db, 'sensors'); // Chemin: /sensors

    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      this.sensorDataSubject.next(data);
    }, {
      onlyOnce: false
    });
  }

  getCurrentSensorData(): any {
    return this.sensorDataSubject.value;
  }
  updateSensorData(sensorId: string, data: any): Promise<void> {
  const sensorRef = ref(this.db, `sensors/${sensorId}`);
  return update(sensorRef, data);
}

writeNewSensor(sensorId: string, data: any): Promise<void> {
  const sensorRef = ref(this.db, `sensors/${sensorId}`);
  return set(sensorRef, data);
}
}
