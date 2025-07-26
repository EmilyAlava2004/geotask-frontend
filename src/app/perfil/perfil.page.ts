import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons } from '@ionic/angular/standalone';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';


import { UserService } from '../services/user.service';

import {
  IonButton,
  IonIcon,
  IonAvatar,
  IonItem,
  IonLabel,
  IonInput,
  IonToggle,
  IonSpinner,
  AlertController,
  ToastController,
  ActionSheetController,
  ModalController,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import {
  create,
  checkmark,
  camera,
  person,
  settings,
  location,
  save,
  close,
  key,
  download,
  logOut,
  chevronForward
} from 'ionicons/icons';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  avatar?: string;
  defaultLocation?: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  settings: {
    pushNotifications: boolean;
    locationNotifications: boolean;
    offlineMode: boolean;
    notificationRadius: number;
  };
}

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
}

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonAvatar,
    IonItem,
    IonLabel,
    IonInput,
    IonSpinner,
  ]
})
export class PerfilPage implements OnInit {


  profileForm: FormGroup;
  isEditMode = false;
  isLoading = false;

  // Datos del usuario
  user: User = {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+1 234 567 8900',
    position: 'Gerente de Proyecto',
    avatar: 'assets/images/profile-avatar.jpg',
    defaultLocation: {
      name: 'Oficina Central',
      address: 'Calle Principal 123, Ciudad',
      lat: -34.6037,
      lng: -58.3816
    },
    settings: {
      pushNotifications: true,
      locationNotifications: true,
      offlineMode: false,
      notificationRadius: 500
    }
  };

  // Estadísticas de tareas
  taskStats: TaskStats = {
    total: 25,
    completed: 18,
    pending: 7
  };


  personid: any;
  profile: any = {};
  userData : any = {};

  // Backup de datos originales
  private originalUserData: User;

  constructor(
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,

    private loadingController: LoadingController,
    private userService: UserService
  ) {
     this.personid = localStorage.getItem('id');
    // Registrar iconos
    addIcons({
      create,
      checkmark,
      camera,
      person,
      settings,
      location,
      save,
      close,
      key,
      download,
      'log-out': logOut,
      'chevron-forward': chevronForward
    });

    // Inicializar formulario
    this.profileForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      position: [''],
      pushNotifications: [true],
      locationNotifications: [true],
      offlineMode: [false],
      notificationRadius: [500, [Validators.min(50), Validators.max(2000)]]
    });

    // Guardar datos originales
    this.originalUserData = JSON.parse(JSON.stringify(this.user));
  }



  ngOnInit() {
    this.loadTaskStats();
    this.viewProfile();
  }
viewProfile() {
  if (!this.personid) {
    console.error('No hay ID de usuario en localStorage');
    return;
  }

  this.userService.getOneUser(this.personid).subscribe({
    next: (data: any) => {
      this.profile = data;

      const userData = this.profile.user;

      // Guardamos los datos reales en el objeto user
      this.user = {
        ...this.user,
        id: userData.id,
        name: userData.user, // Ojo: el backend lo envía como "user"
        email: userData.email,
        phone: userData.numero,
      };

      // Hacemos backup para el cancelEdit()
      this.originalUserData = JSON.parse(JSON.stringify(this.user));

      // Actualizamos el formulario con los datos obtenidos
      this.profileForm.patchValue({
        name: this.user.name,
        email: this.user.email,
        phone: this.user.phone,
      });
    },
    error: () => {
      console.error('Error al cargar el perfil');
    },
  });
}



  /**
   * Cargar datos del usuario
   */

  /**
   * Actualizar formulario con datos del usuario
   */
  private updateFormWithUserData() {
    this.profileForm.patchValue({
      name: this.user.name,
      email: this.user.email,
      phone: this.user.phone,
    });
  }

  /**
   * Cargar estadísticas de tareas
   */
  private async loadTaskStats() {
    try {
      // Aquí normalmente harías una llamada al servicio de tareas
      // Por ahora usamos datos mockeados
      await this.delay(1000); // Simular carga

      this.taskStats = {
        total: 25,
        completed: 18,
        pending: 7
      };
    } catch (error) {
      console.error('Error loading task stats:', error);
    }
  }

  /**
   * Alternar modo de edición
   */
  toggleEditMode() {
    if (this.isEditMode) {
      this.updateProfile();
    } else {
      this.isEditMode = true;
    }
  }

  /**
   * Actualizar perfil
   */
  async updateProfile() {
    if (!this.profileForm.valid) {
      await this.showToast('Por favor, completa todos los campos requeridos', 'warning');
      return;
    }

    this.isLoading = true;


    try {
      // Simular llamada a la API
      await this.delay(2000);

      // Actualizar datos del usuario
      const formData = this.profileForm.value;
      this.user = {
        ...this.user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };


      // Actualizar backup
      this.originalUserData = JSON.parse(JSON.stringify(this.user));

      this.isEditMode = false;
      await this.showToast('Perfil actualizado correctamente', 'success');

    } catch (error) {
      console.error('Error updating profile:', error);
      await this.showToast('Error al actualizar el perfil', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Cancelar edición
   */
  cancelEdit() {
    this.isEditMode = false;
    this.user = JSON.parse(JSON.stringify(this.originalUserData));
    this.updateFormWithUserData();
  }

  /**
   * Cambiar foto de perfil
   */
  async changeProfilePhoto() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Cambiar foto de perfil',
      buttons: [
        {
          text: 'Tomar foto',
          icon: 'camera',
          handler: () => {
            this.takePhoto();
          }
        },
        {
          text: 'Seleccionar de galería',
          icon: 'images',
          handler: () => {
            this.selectFromGallery();
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

  /**
   * Tomar foto con la cámara
   */
  private async takePhoto() {
    try {
      // Aquí implementarías la funcionalidad de cámara con Capacitor
      await this.delay(1000);
      await this.showToast('Funcionalidad de cámara pendiente de implementar', 'primary');
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  }

  /**
   * Seleccionar foto de galería
   */
  private async selectFromGallery() {
    try {
      // Aquí implementarías la selección de galería con Capacitor
      await this.delay(1000);
      await this.showToast('Funcionalidad de galería pendiente de implementar', 'primary');
    } catch (error) {
      console.error('Error selecting from gallery:', error);
    }
  }


  /**
   * Cambiar contraseña
   */
  async changePassword() {
    const alert = await this.alertController.create({
      header: 'Cambiar Contraseña',
      message: '¿Deseas cambiar tu contraseña? Se enviará un enlace a tu email.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar enlace',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Enviando enlace...'
            });
            await loading.present();
            try {
              await this.delay(2000);
              await this.showToast('Enlace enviado a tu email', 'success');
            } catch (error) {
              await this.showToast('Error al enviar enlace', 'danger');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });

    await alert.present();
  }


  /**
   * Cerrar sesión
   */
  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Cerrando sesión...'
            });
            await loading.present();

            try {
              await this.delay(1500);

              // Aquí implementarías la lógica de logout
              // Por ejemplo, limpiar tokens, storage local, etc.
              localStorage.clear();
              sessionStorage.clear();


              await this.showToast('Sesión cerrada correctamente', 'success');

              // Navegar a la página de login
              // this.router.navigate(['/auth/login']);

            } catch (error) {
              console.error('Error during logout:', error);
              await this.showToast('Error al cerrar sesión', 'danger');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });


    await alert.present();
  }

  /**
   * Mostrar toast de notificación
   */
  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  /**
   * Simular delay para llamadas asíncronas
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validar si el formulario tiene cambios
   */
  hasChanges(): boolean {
    const formData = this.profileForm.value;
    return (
      formData.name !== this.originalUserData.name ||
      formData.email !== this.originalUserData.email ||

      formData.phone !== this.originalUserData.phone

    );
  }

  /**
   * Obtener mensaje de validación para un campo
   */
  getFieldErrorMessage(fieldName: string): string {
    const field = this.profileForm.get(fieldName);

    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['email']) {
        return 'Email no válido';
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['pattern']) {
        return 'Formato no válido';
      }
      if (field.errors['min']) {
        return `Valor mínimo: ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `Valor máximo: ${field.errors['max'].max}`;
      }
    }

    return '';
  }

  /**
   * Verificar si un campo tiene errores
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  /**
   * Formatear número de teléfono
   */
  formatPhoneNumber(phone: string): string {
    if (!phone) return '';


    // Remover caracteres no numéricos excepto +
    const cleaned = phone.replace(/[^\d+]/g, '');

    // Aplicar formato básico
    if (cleaned.startsWith('+')) {
      return cleaned;
    } else if (cleaned.length === 10) {
      return `+1 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }

    return cleaned;
  }

  /**
   * Obtener estadísticas en formato de progreso
   */
  getCompletionPercentage(): number {
    if (this.taskStats.total === 0) return 0;
    return Math.round((this.taskStats.completed / this.taskStats.total) * 100);
  }

  /**
   * Obtener color para el indicador de progreso
   */
  getProgressColor(): string {
    const percentage = this.getCompletionPercentage();

    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  }

  /**
   * Limpiar datos del formulario
   */
  resetForm() {
    this.profileForm.reset();
    this.updateFormWithUserData();
  }

}
