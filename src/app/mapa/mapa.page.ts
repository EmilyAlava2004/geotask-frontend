import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import * as mapboxgl from 'mapbox-gl';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MapaPage implements OnInit {

 
  constructor() { }

  ngOnInit() {}

  async ngAfterViewInit() {
    await this.getCurrentPosition();
  }

  cargarMapa(longitud: number, latitud: number) {
    const map = new mapboxgl.Map({
      accessToken: 'your-mapbox-access-token', // Reemplaza con tu clave de acceso de Mapbox
      container: 'map',  // El contenedor del mapa en tu HTML
      style: 'mapbox://styles/mapbox/streets-v11',  // Estilo del mapa
      center: [longitud, latitud],  // Coordenadas para centrar el mapa
      zoom: 9,  // Nivel de zoom
    });

    map.on('load', () => {
      map.resize();
    });

    // Controles de navegación
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.FullscreenControl());

    // Geolocalización
    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }));

    // Marcador personalizado
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = 'url(../../assets/icon/placeholder.png)';
    el.style.width = '32px';
    el.style.height = '32px';

    new mapboxgl.Marker(el)
      .setLngLat([longitud, latitud])
      .addTo(map);
  }

  async getCurrentPosition() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.cargarMapa(coordinates.coords.longitude, coordinates.coords.latitude);
    console.log('Ubicación actual:', coordinates);
  }
}