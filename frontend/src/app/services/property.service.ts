import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Property } from '../models/property.model'; // <-- chemin corrigé

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private API = 'http://localhost:8080/properties';

  constructor(private http: HttpClient) {}

  getAllProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(this.API);
  }

  getPropertyById(id: string): Observable<Property> {
    return this.http.get<Property>(`${this.API}/${id}`);
  }

  getMyProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.API}/my`);
  }
}
