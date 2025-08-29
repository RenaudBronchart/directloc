// src/app/services/property.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { PageModel } from '../models/page.model';
import { PropertyModel, PropertyDetail } from '../models/property.model';
import {
  PropertyRequestDto,
  PropertyResponseDto,
} from '../dto/property.dto';
import {
  toProperty,
  toPropertyDetail,
  toPropertyRequestDto,
} from '../adapters/property.adapter';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly API = 'http://localhost:8080/api/properties';

  constructor(private http: HttpClient) {}

  /**
   * Paged listing with optional filters (q, adults, children, rooms).
   * Returns UI models, not raw DTOs.
   */
  getAll(params?: {
    q?: string;
    adults?: number;
    children?: number;
    rooms?: number;
    page?: number;   // 0-based
    size?: number;   // default 12
  }): Observable<PageModel<PropertyModel>> {
    let httpParams = new HttpParams();
    if (params) {
      const { q, adults, children, rooms, page, size } = params;
      if (q)               httpParams = httpParams.set('q', q);
      if (adults != null)  httpParams = httpParams.set('adults', String(adults));
      if (children != null)httpParams = httpParams.set('children', String(children));
      if (rooms != null)   httpParams = httpParams.set('rooms', String(rooms));
      if (page != null)    httpParams = httpParams.set('page', String(page));
      if (size != null)    httpParams = httpParams.set('size', String(size));
    }

    return this.http.get<PageModel<PropertyResponseDto>>(this.API, { params: httpParams }).pipe(
      map((pageDto) => ({
        ...pageDto,
        content: pageDto.content.map(toProperty),
      }))
    );
  }

  /** Detail endpoint → UI model. */
  getPropertyById(id: string): Observable<PropertyDetail> {
    return this.http
      .get<PropertyResponseDto>(`${this.API}/${id}`)
      .pipe(map(toPropertyDetail));
  }

  /** Owner’s properties (non paginated) → UI models. */
  getMyProperties(): Observable<PropertyModel[]> {
    return this.http
      .get<PropertyResponseDto[]>(`${this.API}/my`)
      .pipe(map(list => list.map(toProperty)));
  }

  /** Create → send DTO, receive DTO, map to UI. */
  createProperty(data: PropertyRequestDto): Observable<PropertyModel> {
    return this.http
      .post<PropertyResponseDto>(this.API, toPropertyRequestDto(data))
      .pipe(map(toProperty));
  }

  /** Update → send DTO, receive DTO, map to UI. */
  updateProperty(id: string, data: PropertyRequestDto): Observable<PropertyModel> {
    return this.http
      .put<PropertyResponseDto>(`${this.API}/${id}`, toPropertyRequestDto(data))
      .pipe(map(toProperty));
  }

  /** Delete. */
  deleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
