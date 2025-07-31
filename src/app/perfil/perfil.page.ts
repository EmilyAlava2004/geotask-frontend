import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../services/task.service';
import { UserService } from '../services/user.service';

import {
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
  AlertController,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  create,
  checkmark,
  person,
  logOut,
  close,
  personCircleOutline
} from 'ionicons/icons';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
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
  personid: string;

  // Datos del usuario
  user: User = {
    id: '',
    name: '',
    email: '',
    phone: ''
  };

  // Datos del perfil del backend
  profile: any = {};

  // Estadísticas de tareas
  taskStats: TaskStats = {
    total: 0,
    completed: 0,
    pending: 0
  };

  // Backup de datos originales
  private originalUserData: User;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController,
    private taskService: TaskService,
    private loadingController: LoadingController,
    private userService: UserService
  ) {
    this.personid = localStorage.getItem('id') || '';

    // Registrar iconos necesarios
    addIcons({
      create,
      checkmark,
      person,
      'log-out': logOut,
      close,
      personCircleOutline
    });

    // Inicializar formulario
    this.profileForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]]
    });

    this.originalUserData = { ...this.user };
  }

  ngOnInit() {
    this.loadProfile();
    this.loadTaskStats();

    // Suscribirse a cambios en las tareas
    this.taskService.tasksChanged$.subscribe(() => {
      this.loadTaskStats();
    });
  }

  /**
   * Cargar perfil del usuario
   */
  loadProfile() {
    if (!this.personid) {
      console.error('No hay ID de usuario en localStorage');
      return;
    }

    this.userService.getOneUser(this.personid).subscribe({
      next: (data: any) => {
        if (!data?.user) {
          console.error('La respuesta del backend no contiene un objeto user válido');
          return;
        }

        this.profile = data;
        const userData = data.user;

        this.user = {
          id: userData.id,
          name: userData.user || '',
          email: userData.email || '',
          phone: userData.numero || ''
        };

        this.originalUserData = { ...this.user };
        this.updateFormWithUserData();
      },
      error: (error) => {
        console.error('Error al cargar el perfil:', error);
        this.showToast('Error al cargar el perfil', 'danger');
      }
    });
  }

  /**
   * Actualizar formulario con datos del usuario
   */
  private updateFormWithUserData() {
    this.profileForm.patchValue({
      name: this.user.name,
      email: this.user.email,
      phone: this.user.phone
    });
  }

  /**
   * Cargar estadísticas de tareas
   */
  private loadTaskStats() {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const pending = total - completed;

        this.taskStats = { total, completed, pending };
      },
      error: (error) => {
        console.error('Error al obtener estadísticas de tareas:', error);
      }
    });
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
      const formData = this.profileForm.value;

      // Simular delay para mostrar loading
      await this.delay(1500);

      // Aquí harías la llamada real al backend para actualizar
      // await this.userService.updateUser(this.user.id, formData);

      // Por ahora solo actualizamos localmente
      this.user = {
        ...this.user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };

      // Actualizar también los datos del profile para la vista
      if (this.profile?.user) {
        this.profile.user.user = formData.name;
        this.profile.user.email = formData.email;
        this.profile.user.numero = formData.phone;
      }

      this.originalUserData = { ...this.user };
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
    this.user = { ...this.originalUserData };
    this.updateFormWithUserData();
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

              localStorage.clear();
              sessionStorage.clear();

              await this.showToast('Sesión cerrada correctamente', 'success');
              this.router.navigate(['/login']);

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
   * Verificar si el formulario tiene cambios
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
        return 'Formato de teléfono no válido';
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
   * Obtener porcentaje de completitud de tareas
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
}
