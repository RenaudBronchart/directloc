import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, BookingRequest } from '../types/booking';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly API = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) {}

  create(data: BookingRequest): Observable<Booking> {
    return this.http.post<Booking>(this.API, data);
  }

  my(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.API}/my`);
  }
}
