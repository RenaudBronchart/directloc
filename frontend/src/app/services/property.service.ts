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
   * Acepta TODOS los filtros del componente, pero solo envía al backend los soportados hoy:
   *  - q, region
   *  - adults, children, rooms (el back ya fusiona rooms→bedroomsMin y adults+children→guestsMin)
   *  - minPrice, maxPrice, bedroomsMin, bathroomsMin
   *  - guestsMin (mapeado desde maxGuestsMin)
   *  - checkIn, checkOut
   *  - pool, parking, petsAllowed (desde petFriendly)
   *  - wifiMin
   *  - sortBy, page, size
   *
   * El resto se ignoran silenciosamente (forward-compatible).
   */
  getAll(params?: {
    // básicos / texto / región
    q?: string; region?: string; city?: string;

    // ocupación + rooms
    adults?: number; children?: number; rooms?: number;

    // precio y numéricos
    minPrice?: number; maxPrice?: number;
    bedroomsMin?: number; bathroomsMin?: number; bedsMin?: number;
    maxGuestsMin?: number;              // (UI) → guestsMin (BE)
    areaM2Min?: number;                 // ignorado por BE hoy
    minNightsMin?: number;              // ignorado por BE hoy

    // distancias
    maxDistCenterKm?: number;           // ignorado por BE hoy
    maxDistBeachKm?: number;            // ignorado por BE hoy

    // conectividad
    wifiMin?: number;

    // tipos (hoy no usados por el BE en GET)
    propertyType?: string;  // enum name
    viewType?: string;      // enum name

    // amenities (BE GET soporta solo pool/parking/petsAllowed)
    pool?: boolean;
    parking?: boolean;
    petFriendly?: boolean;  // UI → petsAllowed (BE)
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

    if (params) {
      const p = params;

      // básicos
      set('q', p.q);
      set('region', p.region);
      // (city no lo usa el back en GET; no lo enviamos)

      // ocupación
      if (p.adults   != null) set('adults', p.adults);
      if (p.children != null) set('children', p.children);
      if (p.rooms    != null) set('rooms', p.rooms); // el back ya lo convierte a bedroomsMin si aplica

      // precio y numéricos soportados
      if (p.minPrice     != null) set('minPrice',     p.minPrice);
      if (p.maxPrice     != null) set('maxPrice',     p.maxPrice);
      if (p.bedroomsMin  != null) set('bedroomsMin',  p.bedroomsMin);
      if (p.bathroomsMin != null) set('bathroomsMin', p.bathroomsMin);

      // guestsMin (si UI pasa maxGuestsMin lo mapeamos)
      if (p.maxGuestsMin != null) set('guestsMin', p.maxGuestsMin);

      // fechas
      const ci = toYMD(p.checkIn), co = toYMD(p.checkOut);
      if (ci) set('checkIn', ci);
      if (co) set('checkOut', co);

      // amenities soportados en GET hoy
      if (p.pool        != null) set('pool',        p.pool);
      if (p.parking     != null) set('parking',     p.parking);
      if (p.petFriendly != null) set('petsAllowed', p.petFriendly); // rename UI→BE

      // conectividad
      if (p.wifiMin     != null) set('wifiMin', p.wifiMin);

      // sort & paging
      if (p.sortBy != null) set('sortBy', p.sortBy);
      if (p.page   != null) set('page',   p.page);
      if (p.size   != null) set('size',   p.size);

      // NOTA: los demás filtros (bedsMin, areaM2Min, minNightsMin, distancias, propertyType, viewType,
      // smokingAllowed, garden, terrace, balcony, hotTub, airConditioning, heating, accessible, workspace)
      // hoy no están soportados por el back en GET; por eso no se envían.
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
