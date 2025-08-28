// src/app/services/booking.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Booking, BookingRequest } from '../types/booking';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly API_ROOT = 'http://localhost:8080/api';
  private readonly API = `${this.API_ROOT}/bookings`;

  constructor(private http: HttpClient) {}

  create(data: BookingRequest): Observable<Booking> {
    return this.http.post<Booking>(this.API, data);
  }

  my(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.API}/my`);
  }

  getBookedDays(propertyId: string, from: string, to: string): Observable<string[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http
      .get<{ days: string[] }>(`${this.API_ROOT}/properties/${propertyId}/booked-days`, { params })
      .pipe(map(res => res.days ?? []));
  }

  getById(id: number | string): Observable<Booking> {
    return this.http.get<Booking>(`${this.API}/${id}`);
  }
}
