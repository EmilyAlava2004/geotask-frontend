import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular/standalone';
import * as mapboxgl from 'mapbox-gl';
import { Geolocation } from '@capacitor/geolocation';
import { LocationService, Location } from 'src/app/services/location.service'; // ajusta la ruta

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, CommonModule, FormsModule]
})
export class MapaPage implements OnInit {

  currentCoords: { lat: number; lng: number } | null = null;

  constructor(private locationService: LocationService) {}

  ngOnInit() {}

  async ngAfterViewInit() {
    await this.getCurrentPosition();
  }

  async getCurrentPosition() {
    const coordinates = await Geolocation.getCurrentPosition();
    const { latitude, longitude } = coordinates.coords;
    this.currentCoords = { lat: latitude, lng: longitude };
    this.cargarMapa(longitude, latitude);
    console.log('Posición actual:', latitude, longitude);
  }

  cargarMapa(longitud: number, latitud: number) {
    const map = new mapboxgl.Map({
      accessToken: 'pk.eyJ1IjoidGhvbWFza2x6IiwiYSI6ImNsM3VibWJwbTI4emkzZXBlamVjOHp0Z2YifQ.QhFxYxdIC2m4vGlEkMqrow',
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [longitud, latitud],
      zoom: 13,
    });

    map.on('load', () => map.resize());
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }));

    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = 'url(../../assets/icon/placeholder.png)';
    el.style.width = '32px';
    el.style.height = '32px';

    new mapboxgl.Marker(el).setLngLat([longitud, latitud]).addTo(map);
  }

  guardarUbicacion() {
    if (!this.currentCoords) return;

    const nuevaUbicacion: Location = {
      name: 'Ubicación actual',
      latitude: this.currentCoords.lat,
      longitude: this.currentCoords.lng,
      geofence_radius: 100
    };

    this.locationService.createLocation(nuevaUbicacion).subscribe({
      next: res => {
        console.log('Ubicación guardada:', res);
        alert('Ubicación guardada correctamente');
      },
      error: err => {
        console.error('Error al guardar ubicación', err);
        alert('Error al guardar ubicación');
      }
    });
  }
}
