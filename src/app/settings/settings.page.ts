import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, LoadingController, AlertController, ActionSheetController } from '@ionic/angular';
//import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FormsModule } from '@angular/forms';
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
  IonNote
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
    IonAvatar,
    IonItem,
    IonLabel,
    IonInput,
    IonToggle,
    IonSelect,
    IonSelectOption,
    IonRange,
    IonNote
  ]
})
export class SettingsPage implements OnInit {



  // Configuración del usuario
  userProfile = {
    name: '',
    email: '',
    avatar: 'https://via.placeholder.com/80'
  };

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
    private actionSheetCtrl: ActionSheetController
  ) { }

  ngOnInit() {
    this.loadSettings();
  }

  // Cargar configuraciones guardadas
  loadSettings() {
    // Aquí cargarías las configuraciones desde tu servicio/storage
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      Object.assign(this, settings);
    }
  }

  // Guardar configuraciones
  async saveSettings() {
    const loading = await this.loadingCtrl.create({
      message: 'Guardando configuración...',
      duration: 1000
    });
    await loading.present();

    try {
      // Simular guardado
      const allSettings = {
        userProfile: this.userProfile,
        notifications: this.notifications,
        mapSettings: this.mapSettings,
        syncSettings: this.syncSettings,
        securitySettings: this.securitySettings,
        appSettings: this.appSettings
      };

      localStorage.setItem('appSettings', JSON.stringify(allSettings));

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

  // Cambiar avatar
  /*async changeAvatar() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Seleccionar imagen',
      buttons: [
        {
          text: 'Cámara',
          icon: 'camera',
          handler: () => {
            this.selectImage(CameraSource.Camera);
          }
        },
        {
          text: 'Galería',
          icon: 'images',
          handler: () => {
            this.selectImage(CameraSource.Photos);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  // Seleccionar imagen
  async selectImage(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: source
      });

      this.userProfile.avatar = image.dataUrl || '';
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  }
*/
  // Cambiar contraseña
  async changePassword() {
    const alert = await this.alertCtrl.create({
      header: 'Cambiar Contraseña',
      inputs: [
        {
          name: 'currentPassword',
          type: 'password',
          placeholder: 'Contraseña actual'
        },
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'Nueva contraseña'
        },
        {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirmar contraseña'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Actualizar',
          handler: (data) => {
            if (data.newPassword !== data.confirmPassword) {
              this.showToast('Las contraseñas no coinciden', 'danger');
              return false;
            }
            this.updatePassword(data);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  // Actualizar contraseña
  async updatePassword(passwords: any) {
    const loading = await this.loadingCtrl.create({
      message: 'Actualizando contraseña...'
    });
    await loading.present();

    try {
      // Aquí implementarías la lógica para cambiar la contraseña
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await loading.dismiss();
      this.showToast('Contraseña actualizada exitosamente', 'success');
    } catch (error) {
      await loading.dismiss();
      this.showToast('Error al actualizar la contraseña', 'danger');
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
        <p><strong>Versión:</strong> ${this.appInfo.version}</p>
        <p><strong>Desarrollado por:</strong> Tu Empresa</p>
        <p><strong>Descripción:</strong> Aplicación para gestión de tareas georreferenciadas</p>
      `,
      buttons: ['Cerrar']
    });
    await alert.present();
  }

  // Cerrar sesión
  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          handler: () => {
            // Aquí implementarías la lógica de logout
            localStorage.clear();
            this.navCtrl.navigateRoot('/login');
          }
        }
      ]
    });
    await alert.present();
  }

  // Ver configuraciones de notificaciones
  openNotificationsPage() {
    this.navCtrl.navigateForward('/notifications-settings');
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
}