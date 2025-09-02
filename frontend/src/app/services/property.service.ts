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
  const y = d.getFullYear(), m = `${d.getMonth()+1}`.padStart(2,'0'), day = `${d.getDate()}`.padStart(2,'0');
  return `${y}-${m}-${day}`;
}

type SortBy = 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'GUESTS_DESC';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly API_BASE = ((environment as any).apiBase || 'http://localhost:8080') as string;
  private readonly API = `${this.API_BASE.replace(/\/$/,'')}/api/properties`;

  constructor(private http: HttpClient) {}

  /**
   * Paged listing with the full filter set supported by backend.
   * Only sends defined params.
   */
  getAll(params?: {
    q?: string; city?: string; region?: string;
    adults?: number; children?: number; rooms?: number;
    minPrice?: number; maxPrice?: number;

    bedroomsMin?: number; bathroomsMin?: number; bedsMin?: number;
    maxGuestsMin?: number; areaM2Min?: number; minNightsMin?: number;

    maxDistCenterKm?: number; maxDistBeachKm?: number;

    wifiMin?: number;

    propertyType?: string;  // enum name
    viewType?: string;      // enum name

    pool?: boolean; parking?: boolean; petFriendly?: boolean; smokingAllowed?: boolean;
    garden?: boolean; terrace?: boolean; balcony?: boolean; hotTub?: boolean;
    airConditioning?: boolean; heating?: boolean; accessible?: boolean; workspace?: boolean;

    checkIn?: Date | string; checkOut?: Date | string;

    sortBy?: SortBy;
    page?: number; size?: number;
  }): Observable<PageModel<PropertyModel>> {
    let httpParams = new HttpParams();
    const set = (k: string, v: any) => {
      if (v !== null && v !== undefined && v !== '') httpParams = httpParams.set(k, String(v));
    };

    if (params) {
      const p = params;

      // basics
      set('q', p.q); set('city', p.city); set('region', p.region);
      if (p.adults   != null) set('adults', p.adults);
      if (p.children != null) set('children', p.children);
      if (p.rooms    != null) set('rooms', p.rooms);

      if (p.minPrice != null) set('minPrice', p.minPrice);
      if (p.maxPrice != null) set('maxPrice', p.maxPrice);

      if (p.bedroomsMin   != null) set('bedroomsMin',   p.bedroomsMin);
      if (p.bathroomsMin  != null) set('bathroomsMin',  p.bathroomsMin);
      if (p.bedsMin       != null) set('bedsMin',       p.bedsMin);
      if (p.maxGuestsMin  != null) set('maxGuestsMin',  p.maxGuestsMin);
      if (p.areaM2Min     != null) set('areaM2Min',     p.areaM2Min);
      if (p.minNightsMin  != null) set('minNightsMin',  p.minNightsMin);

      if (p.maxDistCenterKm != null) set('maxDistCenterKm', p.maxDistCenterKm);
      if (p.maxDistBeachKm  != null) set('maxDistBeachKm',  p.maxDistBeachKm);

      if (p.wifiMin != null) set('wifiMin', p.wifiMin);

      set('propertyType', p.propertyType || null);
      set('viewType', p.viewType || null);

      // amenities
      ([
        'pool','parking','petFriendly','smokingAllowed','garden','terrace','balcony',
        'hotTub','airConditioning','heating','accessible','workspace'
      ] as const).forEach(k => {
        const val = (p as any)[k];
        if (val !== undefined && val !== null) set(k, val);
      });

      // dates
      const ci = toYMD(p.checkIn), co = toYMD(p.checkOut);
      if (ci) set('checkIn', ci);
      if (co) set('checkOut', co);

      // paging/sort
      if (p.sortBy)   set('sortBy', p.sortBy);
      if (p.page != null) set('page', p.page);
      if (p.size != null) set('size', p.size);
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

  /** Create / Update left as you had them… */
  createProperty(data: PropertyRequestDto): Observable<PropertyModel> {
    const currency = (data?.currency || (environment as any).defaultCurrency || 'EUR') as string;
    const payload: PropertyRequestDto = toPropertyRequestDto({ ...data, currency });
    return this.http.post<PropertyResponseDto>(this.API, payload).pipe(map(toProperty));
  }
  updateProperty(id: string, data: PropertyRequestDto): Observable<PropertyModel> {
    const currency = (data?.currency || (environment as any).defaultCurrency || 'EUR') as string;
    const payload: PropertyRequestDto = toPropertyRequestDto({ ...data, currency });
    return this.http.put<PropertyResponseDto>(`${this.API}/${id}`, payload).pipe(map(toProperty));
  }
  deleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
