import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Location {
  id?: number;
  name?: string;
  latitude: number;
  longitude: number;
  geofence_radius?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = 'http://localhost:3000/api/locations';

  constructor(private http: HttpClient) {}

  createLocation(location: Location): Observable<Location> {
    return this.http.post<Location>(this.apiUrl, location);
  }

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(this.apiUrl);
  }
  
  getAllLocations(): Observable<Location[]> {
  return this.http.get<Location[]>(`http://localhost:3000/api/locations`);
}

  updateLocation(id: number, location: Location) {
  return this.http.put<Location>(`http://localhost:3000/api/locations/${id}`, location);
}

  deleteLocation(id: number) {
  return this.http.delete(`${this.apiUrl}/${id}`);
}
}