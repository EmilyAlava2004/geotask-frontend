import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, LoadingController, AlertController, ActionSheetController } from '@ionic/angular';
//import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../services/storage.service';
import {
  IonHeader,
  IonIcon,
  IonCard,
  IonToolbar,
  IonButton,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonAvatar,
  IonItem,
  IonLabel,
  IonInput,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonRange,
  IonNote,
} from "@ionic/angular/standalone";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonHeader,
    IonIcon,
    IonCard,
    IonToolbar,
    IonButton,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonToggle,
    IonSelect,
    IonSelectOption,
    IonRange,
    IonNote
  ]
})
export class SettingsPage implements OnInit {

  // Configuración de notificaciones
  notifications = {
    pushNotifications: true,
    proximityNotifications: true,
    taskReminders: true
  };

  // Configuración del mapa
  mapSettings = {
    mapType: 'roadmap',
    proximityRadius: 200,
    showCurrentLocation: true
  };

  // Configuración de sincronización
  syncSettings = {
    autoSync: true,
    wifiOnly: false
  };

  // Configuración de seguridad
  securitySettings = {
    biometricAuth: false
  };

  // Configuración de la aplicación
  appSettings = {
    theme: 'auto',
    language: 'es'
  };

  // Información de la app
  appInfo = {
    version: '1.0.0',
    lastSync: 'Hace 2 minutos'
  };

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.loadSettings();
  }

  // Cargar configuraciones guardadas
  async loadSettings() {
  const savedSettings = await this.storageService.get('appSettings');
  if (savedSettings) {
    Object.assign(this, savedSettings);
    this.applyTheme(this.appSettings.theme); // si estás usando temas
    console.log('Configuración cargada:', savedSettings);
  }
}

async saveSettings() {
  const loading = await this.loadingCtrl.create({
    message: 'Guardando configuración...',
    duration: 1000
  });
  await loading.present();

  try {
    const allSettings = {
      notifications: this.notifications,
      mapSettings: this.mapSettings,
      syncSettings: this.syncSettings,
      securitySettings: this.securitySettings,
      appSettings: this.appSettings
    };

    await this.storageService.set('appSettings', allSettings);
console.log('Configuración guardada:', allSettings);
    this.applyTheme(this.appSettings.theme); // si aplica

    const toast = await this.toastCtrl.create({
      message: 'Configuración guardada exitosamente',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();

  } catch (error) {
    const toast = await this.toastCtrl.create({
      message: 'Error al guardar la configuración',
      duration: 2000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }
}

  // Sincronizar ahora
  async forceSyncNow() {
    const loading = await this.loadingCtrl.create({
      message: 'Sincronizando...'
    });
    await loading.present();

    try {
      // Simular sincronización
      await new Promise(resolve => setTimeout(resolve, 3000));

      this.appInfo.lastSync = 'Ahora mismo';
      await loading.dismiss();
      this.showToast('Sincronización completada', 'success');
    } catch (error) {
      await loading.dismiss();
      this.showToast('Error en la sincronización', 'danger');
    }
  }

  // Limpiar caché
  async clearCache() {
    const alert = await this.alertCtrl.create({
      header: 'Limpiar Caché',
      message: '¿Estás seguro de que quieres limpiar el caché? Esto eliminará datos temporales.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Limpiar',
          handler: async () => {
            const loading = await this.loadingCtrl.create({
              message: 'Limpiando caché...'

            });
            await loading.present();

            try {
              // Simular limpieza de caché
              await new Promise(resolve => setTimeout(resolve, 2000));

              await loading.dismiss();
              await this.storageService.clear();
              this.showToast('Caché limpiado exitosamente', 'success');
            } catch (error) {
              await loading.dismiss();
              this.showToast('Error al limpiar el caché', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();

  }

  // Mostrar información de la app
  async showAbout() {
    const alert = await this.alertCtrl.create({
      header: 'Acerca de GeoTask Manager',
      message: `
        GeoTask Manager es una aplicación móvil diseñada para facilitar la gestión de tareas geolocalizadas. Está pensada para profesionales, equipos de trabajo remoto y empresas que operan en diferentes ubicaciones físicas. La app permite crear, organizar y recibir notificaciones de tareas asociadas a lugares reales, optimizando la productividad y el tiempo de desplazamiento gracias a su integración con mapas y funciones de geolocalización en tiempo real.
      `,
      buttons: ['Cerrar']
    });
    await alert.present();
  }


  // Actualizar valor del radio de proximidad
  onProximityRadiusChange(event: any) {
    this.mapSettings.proximityRadius = event.detail.value;
  }

  // Volver atrás
  goBack() {
    this.navCtrl.back();
  }

  // Mostrar toast
  async showToast(message: string, color: string = 'medium') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  applyTheme(theme: string) {
    document.body.classList.toggle('dark', theme === 'dark');
  }
}
