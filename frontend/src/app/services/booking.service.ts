import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { BookingModel, BookingRequest } from '../models/booking.model';
import { BookingRequestDto, BookingResponseDto, BookedDaysDto } from '../dto/booking.dto';
import { toBooking, toBookings, requestToDto } from '../adapters/booking.adapter';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly API_ROOT = `${environment.apiBase}api`;
  private readonly API = `${this.API_ROOT}/bookings`;

  constructor(private http: HttpClient) {}

  /** Create booking (REQUESTED) */
  create(data: BookingRequest): Observable<BookingModel> {
    const payload: BookingRequestDto = requestToDto(data);
    return this.http.post<BookingResponseDto>(this.API, payload).pipe(map(toBooking));
  }

  /** Current user’s bookings */
  my(): Observable<BookingModel[]> {
    return this.http.get<BookingResponseDto[]>(`${this.API}/my`).pipe(map(toBookings));
  }

  /** Calendar: booked days for a property */
  getBookedDays(propertyId: string, from: string, to: string): Observable<string[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http
      .get<BookedDaysDto>(`${this.API_ROOT}/properties/${propertyId}/booked-days`, { params })
      .pipe(map(res => res?.days ?? []));
  }

  /** Booking detail */
  getById(id: number | string): Observable<BookingModel> {
    return this.http.get<BookingResponseDto>(`${this.API}/${id}`).pipe(map(toBooking));
  }

  // Host/guest status changes — usa solo si el backend expone estos endpoints
  // approve(id: number): Observable<BookingModel> {
  //   return this.http.patch<BookingResponseDto>(`${this.API}/${id}/approve`, {}).pipe(map(toBooking));
  // }
  // decline(id: number): Observable<BookingModel> {
  //   return this.http.patch<BookingResponseDto>(`${this.API}/${id}/decline`, {}).pipe(map(toBooking));
  // }
  // cancel(id: number): Observable<BookingModel> {
  //   return this.http.patch<BookingResponseDto>(`${this.API}/${id}/cancel`, {}).pipe(map(toBooking));
  // }
}
