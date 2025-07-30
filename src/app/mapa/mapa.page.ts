import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonItem, IonGrid, IonLabel, IonRow, IonCol, IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardContent } from '@ionic/angular/standalone';
import * as mapboxgl from 'mapbox-gl';
import mbxDirections from '@mapbox/mapbox-sdk/services/directions';
import { Geolocation } from '@capacitor/geolocation';
import { LocationService, Location } from 'src/app/services/location.service';
import { TaskService, } from 'src/app/services/task.service';

import { Task } from '../interface/Itask.interface';

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
  tasks: Task[] = [];
filtroCategoria: string = 'all';
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
    el.className = 'marker current-location-marker';
    el.style.backgroundImage = 'url(./assets/icon/placeholder.png)';
    el.style.width = '32px';
    el.style.height = '32px';

    new mapboxgl.Marker(el).setLngLat([longitud, latitud]).addTo(this.map);
  }


filtrarTareas() {
  const tareasFiltradas = this.tasks.filter(t =>
    this.filtroCategoria === 'all' || t.category === this.filtroCategoria
  );

   const existingTaskMarkers = document.querySelectorAll('.task-marker');
  existingTaskMarkers.forEach(marker => marker.remove());

  // Agregar nuevos marcadores
  tareasFiltradas.forEach(task => {
    if (!task.Location) return;
    const el = document.createElement('div');
    el.className = 'marker task-marker';

el.style.backgroundImage = 'url(./assets/icon/task-marker.png)';
    el.style.width = '32px';
    el.style.height = '32px';

    const popup = new mapboxgl.Popup({ offset: 25 }).setText(
      `${task.title} (${task.category}) - ${task.status}`
    );

    new mapboxgl.Marker(el)
      .setLngLat([task.Location.longitude, task.Location.latitude])
      .setPopup(popup)
      .addTo(this.map);
  });
}

map!: mapboxgl.Map;


  directionsClient: any;

  constructor(private locationService: LocationService
              , private taskService: TaskService
  ) {
   this.directionsClient = mbxDirections({
  accessToken: 'pk.eyJ1IjoidGhvbWFza2x6IiwiYSI6ImNsM3VibWJwbTI4emkzZXBlamVjOHp0Z2YifQ.QhFxYxdIC2m4vGlEkMqrow'
});
  }



seleccionarUbicacionParaTarea() {
  alert('Haz clic en el mapa para seleccionar una ubicación para la tarea.');

  const clickHandler = (e: mapboxgl.MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    this.map.off('click', clickHandler);

    const nombre = prompt('Nombre de la ubicación para tarea:', 'Ubicación para tarea');
    if (!nombre || nombre.trim() === '') {
      alert('Nombre inválido');
      return;
    }

    const nuevaUbicacion: Location = {
      name: nombre.trim(),
      latitude: lat,
      longitude: lng,
      geofence_radius: 100
    };

    // Guarda la ubicación
    this.locationService.createLocation(nuevaUbicacion).subscribe({
      next: res => {
        console.log('Ubicación guardada para tarea:', res);
        this.locations.push(res);

        // Almacena el ID para que lo uses en el modal
        localStorage.setItem('ubicacionParaTarea', res.id!.toString());
        alert('Ubicación guardada y lista para usar en una nueva tarea.');

        // Podrías redirigir o abrir el modal de nueva tarea automáticamente aquí
      },
      error: err => {
        console.error('Error al guardar ubicación para tarea', err);
        alert('Error al guardar ubicación');
      }
    });
  };

  this.map.on('click', clickHandler);
}
cargarTareasConUbicacion() {
  this.taskService.getTasks().subscribe({
    next: (res) => {
       console.log('Tareas crudas:', res);
      this.tasks = res.filter(t => t.Location); // Solo tareas con ubicación
      this.agregarMarcadoresDeTareas();
      this.checkNearbyTasks();       // ✅ Mover aquí
      this.filtrarTareas();          // ✅ Mover aquí
    },
    error: (err) => {
      console.error('Error al obtener tareas', err);
    }
  });
}

async calcularRuta(start: [number, number], end: [number, number]) {
  const response = await this.directionsClient.getDirections({
    profile: 'driving',
    geometries: 'geojson',
    waypoints: [
      { coordinates: start },
      { coordinates: end }
    ]
  }).send();

  const ruta = response.body.routes[0].geometry;

  // ✅ Elimina la ruta anterior
  if (this.map.getLayer('route')) {
    this.map.removeLayer('route');
  }
  if (this.map.getSource('route')) {
    this.map.removeSource('route');
  }

  this.map.addSource('route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: ruta,
      properties: {}
    }
  });

  this.map.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#3b9ddd',
      'line-width': 6
    }
  });
}

agregarMarcadoresDeTareas() {
  this.tasks.forEach(task => {
    if (!task.Location) return;

    const el = document.createElement('div');
  el.className = 'marker task-marker';
el.style.backgroundImage = 'url(assets/icon/task-marker.png)';
el.style.backgroundSize = 'contain';
el.style.backgroundRepeat = 'no-repeat';
el.style.backgroundPosition = 'center';

    el.style.width = '32px';
    el.style.height = '32px';
    el.style.backgroundSize = 'cover';

    const popupHtml = `
      <strong>${task.title}</strong><br>
      Categoría: ${task.category}<br>
      Estado: ${task.status}<br>
      <button id="go-to-task-${task.id}">Ir Aquí</button>
    `;

    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml);

    const marker = new mapboxgl.Marker(el)
      .setLngLat([task.Location.longitude, task.Location.latitude])
      .setPopup(popup)
      .addTo(this.map);

    // Esperamos a que el popup se abra para agregar el event listener al botón
    marker.getElement().addEventListener('click', () => {
      setTimeout(() => {
        const button = document.getElementById(`go-to-task-${task.id}`);
        if (button) {
          button.addEventListener('click', () => {
            if (this.currentCoords) {
              this.calcularRuta(
                [this.currentCoords.lng, this.currentCoords.lat],
                [task.Location!.longitude, task.Location!.latitude]
              );
            } else {
              alert('No se pudo obtener tu ubicación actual.');
            }
          });
        }
      }, 500); // tiempo de espera para asegurar que el DOM del popup se renderice
    });
  });
}


async ngAfterViewInit() {
  await this.getCurrentPosition();
  this.cargarTareasConUbicacion(); // todo se desencadena aquí
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
checkNearbyTasks() {
  if (!this.currentCoords) return;

  const { lat: userLat, lng: userLng } = this.currentCoords;

  this.tasks.forEach(task => {
    if (!task.Location) return;
    const { latitude, longitude, geofence_radius } = task.Location;

    const distance = this.getDistanceInMeters(userLat, userLng, latitude, longitude);
    if (distance <= (geofence_radius ?? 100)) {
      alert(`🟢 Estás cerca de la tarea: ${task.title}`);
    }
  });
}

getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Radio de la Tierra en metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
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
