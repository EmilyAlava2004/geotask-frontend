import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonItem, IonGrid, IonLabel, IonRow, IonCol, IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardContent } from '@ionic/angular/standalone';
import * as mapboxgl from 'mapbox-gl';
import { Geolocation } from '@capacitor/geolocation';
import { LocationService, Location } from 'src/app/services/location.service';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: true,
  imports: [IonCardContent, IonCardHeader, IonCard, IonLabel, IonItem, IonContent,
    IonHeader, IonTitle, IonToolbar, IonButton,
    IonSelect, IonSelectOption,
    CommonModule, FormsModule
  ]
})
export class MapaPage implements OnInit {

  lastLocationId: number | null = null;
  currentCoords: { lat: number; lng: number } | null = null;
  nuevasCoords: { lat: number; lng: number } | null = null;
  selectedLocationId: number | null = null;
  locations: Location[] = [];
  selectedLocationToDelete: number | null = null;

  map!: mapboxgl.Map;

  constructor(private locationService: LocationService) {}

  ngOnInit() {
    this.locationService.getAllLocations().subscribe({
    next: res => {
      this.locations = res;
      console.log('Ubicaciones cargadas:', this.locations);
    },
    error: err => {
      console.error('Error al cargar ubicaciones', err);
      alert('No se pudieron cargar las ubicaciones guardadas');
    }
  });
    this.cargarUbicaciones();
  }

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

  cargarUbicaciones() {
  this.locationService.getAllLocations().subscribe({
    next: (res) => {
      this.locations = res;
      console.log('Ubicaciones cargadas:', this.locations);
    },
    error: (err) => {
      console.error('Error al cargar ubicaciones', err);
      alert('Error al cargar ubicaciones');
    }
  });
}

  cargarMapa(longitud: number, latitud: number) {
    this.map = new mapboxgl.Map({
      accessToken: 'pk.eyJ1IjoidGhvbWFza2x6IiwiYSI6ImNsM3VibWJwbTI4emkzZXBlamVjOHp0Z2YifQ.QhFxYxdIC2m4vGlEkMqrow',
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [longitud, latitud],
      zoom: 13,
    });

    this.map.on('load', () => this.map.resize());

    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.addControl(new mapboxgl.FullscreenControl());
    this.map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }));

    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = 'url(../../assets/icon/placeholder.png)';
    el.style.width = '32px';
    el.style.height = '32px';

    new mapboxgl.Marker(el).setLngLat([longitud, latitud]).addTo(this.map);
  }

  guardarUbicacion() {
    alert('Haz clic en el mapa para seleccionar la ubicación que deseas guardar.');

    const clickHandler = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      this.map.off('click', clickHandler);

      new mapboxgl.Marker().setLngLat([lng, lat]).addTo(this.map);

      const nombre = prompt('Ingresa un nombre para la ubicación:', 'Nueva ubicación');
      if (!nombre || nombre.trim() === '') {
        alert('Debes ingresar un nombre válido');
        return;
      }

      const nuevaUbicacion: Location = {
        name: nombre.trim(),
        latitude: lat,
        longitude: lng,
        geofence_radius: 100
      };

      this.locationService.createLocation(nuevaUbicacion).subscribe({
        next: res => {
          console.log('Ubicación guardada:', res);
          this.lastLocationId = res.id as number;
          alert('Ubicación guardada correctamente');
          this.locations.push(res); // actualiza lista local
        },
        error: err => {
          console.error('Error al guardar ubicación', err);
          alert('Error al guardar ubicación');
        }
      });
    };

    this.map.on('click', clickHandler);
  }

  editarUbicacion() {
    const locationId = this.selectedLocationId;
    if (!locationId) {
      alert('Debes seleccionar una ubicación para editar');
      return;
    }

    alert('Haz clic en el mapa para seleccionar la nueva ubicación.');

    const clickHandler = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      this.map.off('click', clickHandler);

      const nuevoNombre = prompt('Nuevo nombre de la ubicación:', 'Ubicación actualizada');
      if (!nuevoNombre || nuevoNombre.trim() === '') {
        alert('Nombre inválido');
        return;
      }

      const nuevoRadioStr = prompt('Nuevo radio de geocerca (en metros):', '200');
      const nuevoRadio = Number(nuevoRadioStr);
      if (isNaN(nuevoRadio) || nuevoRadio <= 0) {
        alert('Radio inválido');
        return;
      }

      const ubicacionActualizada: Location = {
        name: nuevoNombre.trim(),
        latitude: lat,
        longitude: lng,
        geofence_radius: nuevoRadio
      };

      this.locationService.updateLocation(locationId, ubicacionActualizada).subscribe({
        next: res => {
          console.log('Ubicación actualizada con éxito:', res);
          alert('Ubicación actualizada correctamente');
          new mapboxgl.Marker({ color: 'green' })
            .setLngLat([lng, lat])
            .addTo(this.map);
        },
        error: err => {
          console.error('Error al actualizar la ubicación', err);
          alert('Error al actualizar la ubicación');
        }
      });
    };

    this.map.on('click', clickHandler);
  }

  eliminarUbicacion() {
  const locationId = this.selectedLocationId; // ✅ Aquí el cambio
  if (!locationId) {
    alert('Debes seleccionar una ubicación para eliminar');
    return;
  }

  const confirmacion = confirm('¿Estás seguro de que deseas eliminar esta ubicación?');
  if (!confirmacion) return;

  this.locationService.deleteLocation(locationId).subscribe({
    next: res => {
      console.log('Ubicación eliminada:', res);
      alert('Ubicación eliminada correctamente');
      this.locations = this.locations.filter(loc => loc.id !== locationId);
      this.selectedLocationId = null;
    },
    error: err => {
      console.error('Error al eliminar ubicación', err);
      alert('Error al eliminar ubicación');
    }
  });
}

}
