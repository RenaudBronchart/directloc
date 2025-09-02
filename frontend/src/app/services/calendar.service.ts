import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PropertyBlockCreateDto } from '../dto/calendar.dto';
import { CalendarEventModel } from '../models/calendar.model';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly API = `${environment.apiBase.replace(/\/$/, '')}/api/calendar`;

  constructor(private http: HttpClient) {}

  host(from: string, to: string): Observable<CalendarEventModel[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<CalendarEventModel[]>(`${this.API}/host`, { params })
      .pipe(map(list => list.map(e => ({ ...e, start: new Date(e.start), end: new Date(e.end) } as any))));
  }

  guest(from: string, to: string): Observable<CalendarEventModel[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<CalendarEventModel[]>(`${this.API}/guest`, { params })
      .pipe(map(list => list.map(e => ({ ...e, start: new Date(e.start), end: new Date(e.end) } as any))));
  }

  createBlock(dto: PropertyBlockCreateDto): Observable<void> {
    return this.http.post<void>(`${this.API}/blocks`, dto);
  }

  deleteBlock(blockId: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/blocks/${blockId}`);
  }
}
