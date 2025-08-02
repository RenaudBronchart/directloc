import { HttpClient } from '@angular/common/http'; // Used to make HTTP requests to the backend
import { Injectable } from '@angular/core'; // Marks this class as injectable for dependency injection
import { Observable } from 'rxjs'; // Handles asynchronous data streams
import { Property } from '../models/property.model'; // Interface/model representing a property
import { PropertyRequest } from '../types/property-request.type'; // DTO type used for creating/updating a property

@Injectable({ providedIn: 'root' }) // Makes the service available app-wide
export class PropertyService {
  private API = 'http://localhost:8080/properties'; // Base API URL for all property-related endpoints

  constructor(private http: HttpClient) {} // Injects HttpClient for making API calls

  getAllProperties(): Observable<Property[]> {
    // Fetch all properties from the backend
    return this.http.get<Property[]>(this.API);
  }

  getPropertyById(id: string): Observable<Property> {
    // Fetch a single property by its ID
    return this.http.get<Property>(`${this.API}/${id}`);
  }

  getMyProperties(): Observable<Property[]> {
    // Fetch properties that belong to the currently logged-in user
    return this.http.get<Property[]>(`${this.API}/my`);
  }

  createProperty(data: PropertyRequest): Observable<any> {
    // Create a new property with the provided data
    return this.http.post(this.API, data);
  }

  updateProperty(id: string, data: PropertyRequest): Observable<any> {
    // Update an existing property by ID using the provided data
    return this.http.put(`${this.API}/${id}`, data);
  }

  deleteProperty(id: string): Observable<any> {
    // Delete a property by its ID
    return this.http.delete(`${this.API}/${id}`);
  }
}
