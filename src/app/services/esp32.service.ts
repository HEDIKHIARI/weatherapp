import { Injectable, inject } from '@angular/core';
import { Database, ref, onValue, set } from '@angular/fire/database';
import { BehaviorSubject } from 'rxjs';

export interface ESP32Data {
  esp32_connected: boolean;
  wifi_connected: boolean;
  wifi_strength: number; // 0-100%
}

@Injectable({
  providedIn: 'root'
})
export class ESP32MinimalService {
  private database = inject(Database);
  private esp32Ref = ref(this.database, 'esp32_data');
  
  private dataSubject = new BehaviorSubject<ESP32Data>({
    esp32_connected: false,
    wifi_connected: false,
    wifi_strength: 0
  });
  
  public data$ = this.dataSubject.asObservable();

  constructor() {
    this.initListener();
  }

  private initListener(): void {
    onValue(this.esp32Ref, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.dataSubject.next(data);
      }
    });
  }

  // Pour simulation/test
  async updateData(data: Partial<ESP32Data>): Promise<void> {
    const current = this.dataSubject.value;
    await set(this.esp32Ref, { ...current, ...data });
  }
}