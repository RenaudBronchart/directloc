// src/app/services/property.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page, Property, PropertyDetail } from '../models/property.model';
import { PropertyRequest } from '../types/property-request.type';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly API = 'http://localhost:8080/api/properties';

  constructor(private http: HttpClient) {}

  /** Liste paginée + filtres (q, adults, children, rooms) */
  getAll(params?: {
    q?: string;
    adults?: number;
    children?: number;
    rooms?: number;
    page?: number;   // 0-based
    size?: number;   // default 12
  }): Observable<Page<Property>> {
    let httpParams = new HttpParams();

    if (params) {
      const { q, adults, children, rooms, page, size } = params;
      if (q) httpParams = httpParams.set('q', q);
      if (adults != null)   httpParams = httpParams.set('adults', String(adults));
      if (children != null) httpParams = httpParams.set('children', String(children));
      if (rooms != null)    httpParams = httpParams.set('rooms', String(rooms));
      if (page != null)     httpParams = httpParams.set('page', String(page));
      if (size != null)     httpParams = httpParams.set('size', String(size));
    }

    return this.http.get<Page<Property>>(this.API, { params: httpParams });
  }

  /** Détail (→ PropertyDetail pour supporter description/ownerEmail optionnels) */
  getPropertyById(id: string): Observable<PropertyDetail> {
    return this.http.get<PropertyDetail>(`${this.API}/${id}`);
  }

  /** Mes biens (non paginé) */
  getMyProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.API}/my`);
  }

  /** Création */
  createProperty(data: PropertyRequest): Observable<Property> {
    return this.http.post<Property>(this.API, data);
  }

  /** Mise à jour */
  updateProperty(id: string, data: PropertyRequest): Observable<Property> {
    return this.http.put<Property>(`${this.API}/${id}`, data);
  }

  /** Suppression */
  deleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
