import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SensorService {
  private apiUrl = 'http://localhost:8100//sensors'; // Replace with the actual API URL

  constructor(private http: HttpClient) {}

  getSensorData(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}