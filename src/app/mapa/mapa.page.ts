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
  map!: mapboxgl.Map;
  directionsClient: any;

  constructor(
    private locationService: LocationService,
    private taskService: TaskService
  ) {
    this.directionsClient = mbxDirections({
      accessToken: 'pk.eyJ1IjoidGhvbWFza2x6IiwiYSI6ImNsM3VibWJwbTI4emkzZXBlamVjOHp0Z2YifQ.QhFxYxdIC2m4vGlEkMqrow'
    });
  }

  ngOnInit() {
    this.cargarUbicaciones();
  }

  async ngAfterViewInit() {
    console.log('ngAfterViewInit ejecutado');
    await this.getCurrentPosition();

    // ✅ Asegurar que el mapa esté completamente cargado antes de agregar marcadores
    this.map.on('load', () => {
      console.log('Mapa completamente cargado, cargando tareas...');
      this.cargarTareasConUbicacion();
    });
  }

  async getCurrentPosition() {
    const coordinates = await Geolocation.getCurrentPosition();
    const { latitude, longitude } = coordinates.coords;
    this.currentCoords = { lat: latitude, lng: longitude };
    this.cargarMapa(longitude, latitude);
    console.log('Posición actual:', latitude, longitude);
  }

  cargarMapa(longitud: number, latitud: number) {
    this.map = new mapboxgl.Map({
      accessToken: 'pk.eyJ1IjoidGhvbWFza2x6IiwiYSI6ImNsM3VibWJwbTI4emkzZXBlamVjOHp0Z2YifQ.QhFxYxdIC2m4vGlEkMqrow',
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [longitud, latitud],
      zoom: 13,
    });

    // ✅ Importante: esperar a que el mapa se redimensione
    this.map.on('load', () => {
      this.map.resize();
      console.log('Mapa redimensionado y listo');
    });

    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.addControl(new mapboxgl.FullscreenControl());
    this.map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }));

    // Marcador de ubicación actual
    const el = document.createElement('div');
    el.className = 'marker current-location-marker';
    el.style.backgroundImage = 'url(./assets/icon/placeholder.png)';
    el.style.width = '32px';
    el.style.height = '32px';

    new mapboxgl.Marker(el).setLngLat([longitud, latitud]).addTo(this.map);
  }

  cargarTareasConUbicacion() {
    console.log('🔄 Iniciando carga de tareas...');

    this.taskService.getTasks().subscribe({
      next: (res) => {
        console.log('✅ Tareas recibidas del servidor:', res);

        // ✅ DEBUGGING DETALLADO - Ver estructura completa de cada tarea
        res.forEach((task, index) => {
          console.log(`=== TAREA ${index + 1} ===`);
          console.log('📝 Título:', task.title);
          console.log('🆔 ID:', task.id);
          console.log('📂 Categoría:', task.category);
          console.log('📍 Location completo:', task.location);
          console.log('🔑 Propiedades de Location:', task.location ? Object.keys(task.location) : 'N/A');

          // Verificar diferentes nombres posibles para la ubicación
          console.log('🔍 Verificando propiedades alternativas:');
          console.log('   - location:', (task as any).location);
          console.log('   - position:', (task as any).position);
          console.log('   - coordinates:', (task as any).coordinates);
          console.log('   - lat/lng directo:', (task as any).latitude, (task as any).longitude);
          console.log('========================');
        });

        // Filtrar solo tareas que tengan ubicación (probando diferentes propiedades)
        this.tasks = res.filter(t => {
          // Probar diferentes estructuras posibles
          const locationObj = t.location || (t as any).location || (t as any).position;

          const tieneUbicacion = locationObj &&
                                locationObj.latitude !== null &&
                                locationObj.longitude !== null &&
                                locationObj.latitude !== undefined &&
                                locationObj.longitude !== undefined &&
                                !isNaN(Number(locationObj.latitude)) &&
                                !isNaN(Number(locationObj.longitude));

          if (!tieneUbicacion) {
            console.log('⚠️ Tarea SIN ubicación válida:', {
              title: t.title,
              Location: t.location,
              locationAlt: (t as any).location,
              hasLatLng: !!(locationObj?.latitude && locationObj?.longitude)
            });
          } else {
            console.log('✅ Tarea CON ubicación válida:', {
              title: t.title,
              coordinates: [locationObj.longitude, locationObj.latitude]
            });
          }

          return tieneUbicacion;
        });

        console.log('📍 Total de tareas con ubicación válida:', this.tasks.length);
        console.log('📊 Total de tareas recibidas:', res.length);

        if (this.tasks.length > 0) {
          // ✅ Primero agregar marcadores, luego verificar proximidad
          this.agregarMarcadoresDeTareas();
          this.checkNearbyTasks();

          // ✅ Centrar el mapa para mostrar todas las tareas
          this.ajustarVistaParaTareas();
        } else {
          console.log('❌ No hay tareas con ubicación para mostrar');
          console.log('💡 Revisa el backend - las tareas deben incluir relación con Location');
        }
      },
      error: (err) => {
        console.error('❌ Error al obtener tareas:', err);
        alert('Error al cargar las tareas del mapa');
      }
    });
  }

  agregarMarcadoresDeTareas() {
    console.log('🏷️ Agregando marcadores de tareas al mapa...');

    // ✅ Limpiar marcadores existentes antes de agregar nuevos
    const existingTaskMarkers = document.querySelectorAll('.task-marker');
    existingTaskMarkers.forEach(marker => marker.remove());

    this.tasks.forEach((task, index) => {
      // ✅ Obtener ubicación de diferentes propiedades posibles
      const locationObj = task.location || (task as any).location || (task as any).position;

      if (!task?.id || !locationObj) {
        console.log('⚠️ Saltando tarea sin ID o ubicación:', task);
        return;
      }

      // Asegurar que las coordenadas sean números
      const longitude = Number(locationObj.longitude);
      const latitude = Number(locationObj.latitude);

      if (isNaN(longitude) || isNaN(latitude)) {
        console.log('⚠️ Coordenadas inválidas para tarea:', task.title, { longitude, latitude });
        return;
      }

      console.log(`📌 Agregando marcador para tarea ${index + 1}:`, {
        title: task.title,
        coordinates: [longitude, latitude],
        originalCoords: [locationObj.longitude, locationObj.latitude]
      });

      // Crear elemento del marcador
      const el = document.createElement('div');
      el.className = 'marker task-marker';

      // ✅ Solo usar la imagen del marcador, sin fondo de respaldo
      el.style.backgroundImage = 'url(assets/icon/task-marker.png)';
      el.style.backgroundSize = 'contain';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundPosition = 'center';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.cursor = 'pointer';

      // Crear popup con información de la tarea
      const popupHtml = `
        <div style="padding: 10px; min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #333;">${task.title || 'Sin título'}</h4>
          <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${task.description || 'Sin descripción'}</p>
          <div style="margin-bottom: 8px;">
            <span style="background: #007bff; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
              ${task.category || 'Sin categoría'}
            </span>
            <span style="background: ${task.status === 'completed' ? '#28a745' : '#ffc107'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 5px;">
              ${task.status || 'pendiente'}
            </span>
          </div>
          <button id="go-to-task-${task.id}" style="background: #28a745; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; width: 100%;">
            📍 Trazar ruta
          </button>
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(popupHtml);

      // Crear y agregar el marcador
      const marker = new mapboxgl.Marker(el)
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(this.map);

      console.log(`✅ Marcador agregado para "${task.title}" en:`, [longitude, latitude]);

      // ✅ Agregar event listener para el botón de ruta
      marker.getElement().addEventListener('click', () => {
        setTimeout(() => {
          const button = document.getElementById(`go-to-task-${task.id}`);
          if (button) {
            button.addEventListener('click', () => {
              if (this.currentCoords) {
                console.log('🗺️ Calculando ruta hacia:', task.title);
                this.calcularRuta(
                  [this.currentCoords.lng, this.currentCoords.lat],
                  [longitude, latitude]
                );
              } else {
                alert('No se pudo obtener tu ubicación actual.');
              }
            });
          }
        }, 100);
      });
    });

    console.log(`✅ Total de marcadores agregados: ${this.tasks.length}`);
  }

  filtrarTareas() {
    console.log('🔍 Filtrando tareas por categoría:', this.filtroCategoria);

    const tareasFiltradas = this.tasks.filter(t =>
      this.filtroCategoria === 'all' || t.category === this.filtroCategoria
    );

    console.log(`📊 Tareas después del filtro: ${tareasFiltradas.length} de ${this.tasks.length}`);

    // Limpiar marcadores existentes
    const existingTaskMarkers = document.querySelectorAll('.task-marker');
    existingTaskMarkers.forEach(marker => marker.remove());

    // Agregar marcadores filtrados
    tareasFiltradas.forEach(task => {
      if (!task.location) return;

      const el = document.createElement('div');
      el.className = 'marker task-marker';
      el.style.backgroundImage = 'url(./assets/icon/task-marker.png)';
      el.style.width = '32px';
      el.style.height = '32px';

      const popup = new mapboxgl.Popup({ offset: 25 }).setText(
        `${task.title} (${task.category}) - ${task.status}`
      );

      new mapboxgl.Marker(el)
        .setLngLat([task.location.longitude, task.location.latitude])
        .setPopup(popup)
        .addTo(this.map);
    });
  }

  async calcularRuta(start: [number, number], end: [number, number]) {
    try {
      console.log('🗺️ Calculando ruta desde:', start, 'hasta:', end);

      const response = await this.directionsClient.getDirections({
        profile: 'driving',
        geometries: 'geojson',
        waypoints: [
          { coordinates: start },
          { coordinates: end }
        ]
      }).send();

      const ruta = response.body.routes[0].geometry;

      // Eliminar ruta anterior si existe
      if (this.map.getLayer('route')) {
        this.map.removeLayer('route');
      }
      if (this.map.getSource('route')) {
        this.map.removeSource('route');
      }

      // Agregar nueva ruta
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

      console.log('✅ Ruta trazada exitosamente');
    } catch (error) {
      console.error('❌ Error al calcular ruta:', error);
      alert('Error al calcular la ruta');
    }
  }

  cargarUbicaciones() {
    this.locationService.getAllLocations().subscribe({
      next: (res) => {
        this.locations = res;
        console.log('📍 Ubicaciones cargadas:', this.locations.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar ubicaciones:', err);
        alert('Error al cargar ubicaciones');
      }
    });
  }

  checkNearbyTasks() {
    if (!this.currentCoords) {
      console.log('⚠️ No hay coordenadas actuales para verificar proximidad');
      return;
    }

    const { lat: userLat, lng: userLng } = this.currentCoords;
    console.log('🔍 Verificando tareas cercanas desde:', { userLat, userLng });

    this.tasks.forEach(task => {
      const locationObj = task.location || (task as any).location || (task as any).position;
      if (!locationObj) return;

      const { latitude, longitude, geofence_radius } = locationObj;
      const distance = this.getDistanceInMeters(userLat, userLng, Number(latitude), Number(longitude));
      const radius = geofence_radius || 100;

      console.log(`📏 Distancia a "${task.title}": ${distance.toFixed(2)}m (radio: ${radius}m)`);

      if (distance <= radius) {
        console.log(`🟢 Tarea cercana detectada: ${task.title}`);
        alert(`🟢 Estás cerca de la tarea: ${task.title}`);
      }
    });
  }

  ajustarVistaParaTareas() {
    if (this.tasks.length === 0) return;

    // Crear límites (bounds) que incluyan todas las tareas
    const bounds = new mapboxgl.LngLatBounds();

    // Agregar ubicación actual a los límites
    if (this.currentCoords) {
      bounds.extend([this.currentCoords.lng, this.currentCoords.lat]);
    }

    // Agregar cada tarea a los límites
    this.tasks.forEach(task => {
      const locationObj = task.location || (task as any).location || (task as any).position;
      if (locationObj) {
        const lng = Number(locationObj.longitude);
        const lat = Number(locationObj.latitude);
        bounds.extend([lng, lat]);
        console.log(`📍 Agregando a bounds: [${lng}, ${lat}] para "${task.title}"`);
      }
    });

    // Ajustar la vista del mapa para mostrar todos los puntos
    this.map.fitBounds(bounds, {
      padding: 50, // Padding en píxeles
      maxZoom: 15  // Zoom máximo para no acercarse demasiado
    });

    console.log('🎯 Vista del mapa ajustada para mostrar todas las tareas');
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

      this.locationService.createLocation(nuevaUbicacion).subscribe({
        next: res => {
          console.log('Ubicación guardada para tarea:', res);
          this.locations.push(res);
          localStorage.setItem('ubicacionParaTarea', res.id!.toString());
          alert('Ubicación guardada y lista para usar en una nueva tarea.');
        },
        error: err => {
          console.error('Error al guardar ubicación para tarea', err);
          alert('Error al guardar ubicación');
        }
      });
    };

    this.map.on('click', clickHandler);
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
          this.locations.push(res);
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
    const locationId = this.selectedLocationId;
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
