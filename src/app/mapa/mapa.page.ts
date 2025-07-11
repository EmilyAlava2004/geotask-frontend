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

  ngOnInit() {
  }

 async ngAfterViewInit(){
  await this.getCurrentPosition();
 }
 cargarMapa( longitud: number, latitud: number) {
  const map = new mapboxgl.Map({
    accessToken:
    'pk.eyJ1IjoidGhvbWFza2x6IiwiYSI6ImNsM3VibWJwbTI4emkzZXBlamVjOHp0Z2YifQ.QhFxYxdIC2m4vGlEkMqrow', // reemplaza con
    // tu clave de API de mapbox
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [longitud,latitud], // starting position [lng, lat]
    zoom: 9, // starting zoom
   });
   // maximisar mapa
   map.on('load', function() {
   map.resize();
   });
  // controles de navegacion 
  map.addControl(new mapboxgl.NavigationControl());
  map.addControl(new mapboxgl.FullscreenControl());
  //ubicacion actual
  map.addControl(new mapboxgl.GeolocateControl({
  positionOptions: {
  enableHighAccuracy: true
},
trackUserLocation: true
}));
//diseño del marcador
var el = document.createElement('div');
el.className = 'marker';
el.style.backgroundImage = 'url(../../assets/icon/placeholder.png)'; // reemplaza con la ruta de tu imagen
el.style.width = '32px';
el.style.height = '32px';

const marker = new mapboxgl.Marker(el)
.setLngLat([longitud, latitud])
.addTo(map);
 }
 async getCurrentPosition() {
  const coordinates = await Geolocation.getCurrentPosition();
this.cargarMapa( coordinates.coords.longitude,coordinates.coords.latitude);
  console.log('Current position:', coordinates);
}

}
