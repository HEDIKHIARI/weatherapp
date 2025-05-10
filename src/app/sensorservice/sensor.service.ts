import { Injectable } from '@angular/core';
import { Database, ref, onValue, DataSnapshot } from '@angular/fire/database';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SensorService {
  private sensorDataSubject = new BehaviorSubject<any>(null);
  sensorData$ = this.sensorDataSubject.asObservable();

  constructor(private db: Database) {
    this.listenToStationMeteoData();
    this.logSensorData(); // Optionnel : juste pour debug dans la console
  }

  // Écoute des données temps réel sur /station_meteo
  private listenToStationMeteoData() {
    const refPath = ref(this.db, '/station_meteo');
    onValue(refPath, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.sensorDataSubject.next(data); // Met à jour l'observable
      } else {
        console.warn('Aucune donnée trouvée dans /station_meteo');
      }
    });
  }

  // Optionnel : simple console log des données /sensors pour debug
  private logSensorData() {
    const sensorRef = ref(this.db, 'sensors');
    onValue(sensorRef, (snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot: DataSnapshot & { key: string }) => {
          const key = childSnapshot.key || '';
          const value = childSnapshot.val();
          if (typeof value !== 'boolean') {
            console.log(`Sensor [${key}] :`, value);
          } else {
            console.error(`Valeur invalide pour ${key} :`, value);
          }
        });
      } else {
        console.log('Aucune donnée disponible dans /sensors');
      }
    });
  }
}
