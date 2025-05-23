import { Injectable, inject } from '@angular/core';
import { Database, ref, get, onValue, query, orderByKey } from '@angular/fire/database';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseDbService {
  private db = inject(Database);

  // Récupère les données en temps réel (inchangé)
  getStationData(): Observable<any> {
    return new Observable(observer => {
      const stationRef = ref(this.db, 'stationData');
      const unsubscribe = onValue(
        stationRef, 
        (snapshot) => observer.next(snapshot.val()),
        (error) => observer.error(error)
      );
      return () => unsubscribe();
    });
  }

  // Récupère la liste des dates disponibles (inchangé)
  async getDatesList(): Promise<string[]> {
    const snapshot = await get(query(ref(this.db, 'historicalData'), orderByKey()));
    return snapshot.exists() ? Object.keys(snapshot.val()) : [];
  }

  // CORRECTION APPLIQUÉE ICI : Typage et conversion des données
  async getDailyData(date: string): Promise<{ 
    temperature: number[], 
    humidity: number[], 
    pressure: number[], 
    precipitation: number[] 
  }> {
    const snapshot = await get(ref(this.db, `historicalData/${date}`));
    
    if (!snapshot.exists()) {
      return { 
        temperature: [], 
        humidity: [], 
        pressure: [], 
        precipitation: [] 
      };
    }

    const data = snapshot.val();
    
    // Conversion des données pour garantir des tableaux
    return {
      temperature: data.temperature || Array(24).fill(0),
      humidity: data.humidity || Array(24).fill(0),
      pressure: data.pressure || Array(24).fill(0),
      precipitation: data.precipitation || Array(24).fill(0)
    };
  }

  // Récupère des données ponctuelles (inchangé)
  getData(path: string): Observable<any> {
    return from(
      get(ref(this.db, path))
        .then(snapshot => snapshot.exists() ? snapshot.val() : null)
    );
  }
}