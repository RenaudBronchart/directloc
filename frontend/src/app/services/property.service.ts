// src/app/services/property.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { PageModel } from '../models/page.model';
import { PropertyModel, PropertyDetail } from '../models/property.model';
import { PropertyRequestDto, PropertyResponseDto } from '../dto/property.dto';
import { toProperty, toPropertyDetail, toPropertyRequestDto } from '../adapters/property.adapter';
import { environment } from '../../environments/environment';

/** Safe date → yyyy-MM-dd for backend LocalDate. */
function toYMD(d?: Date | string | null): string | undefined {
  if (!d) return undefined;
  if (typeof d === 'string') return d;
  const y = d.getFullYear(), m = `${d.getMonth() + 1}`.padStart(2, '0'), day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

type SortBy = 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'GUESTS_DESC';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly API_BASE = ((environment as any).apiBase || 'http://localhost:8080') as string;
  private readonly API = `${this.API_BASE.replace(/\/$/, '')}/api/properties`;

  constructor(private http: HttpClient) {}

  /**
   * Paged listing (GET /api/properties).
   * Ahora enviamos TODOS los filtros soportados por el backend.
   */
  getAll(params?: {
    // básicos / texto / región
    q?: string; region?: string; city?: string;

    // ocupación + rooms (el back calcula guestsMin si le pasas adults+children)
    adults?: number; children?: number; rooms?: number;

    // precio y numéricos
    minPrice?: number; maxPrice?: number;
    bedroomsMin?: number; bathroomsMin?: number; bedsMin?: number;
    maxGuestsMin?: number;              // UI → guestsMin (BE)
    areaM2Min?: number;
    minNightsMin?: number;

    // distancias
    maxDistCenterKm?: number;
    maxDistBeachKm?: number;

    // conectividad
    wifiMin?: number;

    // tipos
    propertyType?: string;  // enum name
    viewType?: string;      // enum name

    // amenities
    pool?: boolean;
    parking?: boolean;
    petFriendly?: boolean;
    smokingAllowed?: boolean;
    garden?: boolean;
    terrace?: boolean;
    balcony?: boolean;
    hotTub?: boolean;
    airConditioning?: boolean;
    heating?: boolean;
    accessible?: boolean;
    workspace?: boolean;

    // fechas
    checkIn?: Date | string;
    checkOut?: Date | string;

    // orden/paginación
    sortBy?: SortBy;
    page?: number; size?: number;
  }): Observable<PageModel<PropertyModel>> {
    let httpParams = new HttpParams();
    const set = (k: string, v: any) => {
      if (v !== null && v !== undefined && v !== '') httpParams = httpParams.set(k, String(v));
    };
    const setTrue = (k: string, v?: boolean) => { if (v === true) set(k, true); };

    if (params) {
      const p = params;

      // básicos
      set('q', p.q);
      set('region', p.region);
      // city: lo ignoramos en GET, pero puedes enviarlo si el BE lo usa

      // ocupación
      if (p.adults   != null) set('adults', p.adults);
      if (p.children != null) set('children', p.children);
      if (p.rooms    != null) set('rooms', p.rooms);

      // precio y numéricos
      if (p.minPrice     != null) set('minPrice',     p.minPrice);
      if (p.maxPrice     != null) set('maxPrice',     p.maxPrice);
      if (p.bedroomsMin  != null) set('bedroomsMin',  p.bedroomsMin);
      if (p.bathroomsMin != null) set('bathroomsMin', p.bathroomsMin);
      if (p.bedsMin      != null) set('bedsMin',      p.bedsMin);

      // guestsMin (desde UI maxGuestsMin)
      if (p.maxGuestsMin != null) set('guestsMin', p.maxGuestsMin);

      // surface & nights
      if (p.areaM2Min    != null) set('areaM2Min',    p.areaM2Min);
      if (p.minNightsMin != null) set('minNightsMin', p.minNightsMin);

      // distancias
      if (p.maxDistCenterKm != null) set('maxDistCenterKm', p.maxDistCenterKm);
      if (p.maxDistBeachKm  != null) set('maxDistBeachKm',  p.maxDistBeachKm);

      // conectividad
      if (p.wifiMin != null) set('wifiMin', p.wifiMin);

      // tipos
      if (p.propertyType) set('propertyType', p.propertyType);
      if (p.viewType)     set('viewType',     p.viewType);

      // amenities: solo cuando true
      setTrue('pool',            p.pool);
      setTrue('parking',         p.parking);
      setTrue('petFriendly',     p.petFriendly);
      setTrue('smokingAllowed',  p.smokingAllowed);
      setTrue('garden',          p.garden);
      setTrue('terrace',         p.terrace);
      setTrue('balcony',         p.balcony);
      setTrue('hotTub',          p.hotTub);
      setTrue('airConditioning', p.airConditioning);
      setTrue('heating',         p.heating);
      setTrue('accessible',      p.accessible);
      setTrue('workspace',       p.workspace);

      // fechas
      const ci = toYMD(p.checkIn), co = toYMD(p.checkOut);
      if (ci) set('checkIn',  ci);
      if (co) set('checkOut', co);

      // sort & paging
      if (p.sortBy != null) set('sortBy', p.sortBy);
      if (p.page   != null) set('page',   p.page);
      if (p.size   != null) set('size',   p.size);
    }

    return this.http
      .get<PageModel<PropertyResponseDto>>(this.API, { params: httpParams })
      .pipe(map(pageDto => ({ ...pageDto, content: pageDto.content.map(toProperty) })));
  }

  /** Detail endpoint → UI model. */
  getPropertyById(id: string): Observable<PropertyDetail> {
    return this.http.get<PropertyResponseDto>(`${this.API}/${id}`).pipe(map(toPropertyDetail));
  }

  /** My properties → UI models. */
  getMyProperties(): Observable<PropertyModel[]> {
    return this.http.get<PropertyResponseDto[]>(`${this.API}/my`).pipe(map(list => list.map(toProperty)));
  }

  /** Create / Update */
  createProperty(data: PropertyRequestDto): Observable<PropertyModel> {
    const payload: PropertyRequestDto = toPropertyRequestDto({ ...data });
    return this.http.post<PropertyResponseDto>(this.API, payload).pipe(map(toProperty));
  }

  updateProperty(id: string, data: PropertyRequestDto): Observable<PropertyModel> {
    const payload: PropertyRequestDto = toPropertyRequestDto({ ...data });
    return this.http.put<PropertyResponseDto>(`${this.API}/${id}`, payload).pipe(map(toProperty));
  }

  deleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
