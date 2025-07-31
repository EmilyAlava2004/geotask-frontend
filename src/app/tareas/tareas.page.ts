import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonApp, IonButtons } from '@ionic/angular/standalone';
import {IonMenu, IonMenuButton} from '@ionic/angular/standalone';
import {
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonChip,
  IonBadge,
  IonFab,
  IonFabButton,
  IonItem,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCheckbox,
  IonSelect,
  IonSelectOption,
  IonText,
  IonProgressBar,
  ModalController,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import {
  settingsOutline // <-- Agregar este ícono
} from 'ionicons/icons';
import {
  addIcons
} from 'ionicons';
import { Router } from '@angular/router';

import {
  add,
  locationOutline,
  timeOutline,
  checkmarkCircle,
  alertCircle,
  ellipsisVertical,
  filterOutline,
  searchOutline,
  mapOutline,
  createOutline,
  trashOutline
} from 'ionicons/icons';

// Importar el modal component y servicios
import { ModalComponent } from '../modal/modal.component';
import { TaskService } from '../services/task.service'; // Ajusta la ruta según tu estructura
import { Task } from '../interface/Itask.interface'; // Ajusta la ruta según tu estructura

// Interfaz local para mapeo de datos
interface TaskDisplay {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  date: Date;
  createdAt: Date;
  distance?: number;
}

@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.page.html',
  styleUrls: ['./tareas.page.scss'],
  standalone: true,
  imports: [IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonChip,
    IonBadge,
    IonFab,
    IonFabButton,
    IonItem,
    IonRefresher,
    IonRefresherContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCheckbox,
    IonSelect,
    IonSelectOption,
    IonProgressBar,
  ]
})
export class TareasPage implements OnInit {

  tasks: TaskDisplay[] = [];
  filteredTasks: TaskDisplay[] = [];
  searchTerm: string = '';
  selectedSegment: string = 'all';
  selectedPriority: string = 'all';
  selectedCategory: string = 'all';
  isLoading: boolean = false;
  categories: string[] = [];

  constructor(
     private router: Router,
    private modalController: ModalController,
    private taskService: TaskService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      add,
      locationOutline,
      timeOutline,
      checkmarkCircle,
      alertCircle,
      ellipsisVertical,
      filterOutline,
      searchOutline,
      mapOutline,
      createOutline,
      trashOutline,
      settingsOutline
    });
  }

  ngOnInit() {
    this.loadTasks();

  this.taskService.tasksChanged$.subscribe(() => {
    this.loadTasks();
  });

  }
goToSettings() {
  this.router.navigate(['/settings']);
}
  loadTasks() {
    this.isLoading = true;

    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = this.mapApiTasksToDisplay(tasks);
        this.extractCategories();
        this.filterTasks();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.showErrorToast('Error al cargar las tareas');
        this.isLoading = false;
      }
    });
  }

  // Mapear las tareas de la API al formato que usa el componente
  private mapApiTasksToDisplay(apiTasks: Task[]): TaskDisplay[] {
    return apiTasks.map(task => ({
      id: task.id?.toString() || '',
      title: task.title || 'Sin título',
      description: task.description || 'Sin descripción',
      status: this.mapApiStatusToDisplay(task.status),
      priority: this.mapApiPriorityToDisplay(task.priority),
      category: task.category|| 'Sin categoría',

      location: {
        name: task.location?.name || 'Ubicación no asignada',
        latitude: task.location?.latitude || 0,
        longitude: task.location?.longitude || 0
      },
      date: new Date(task.date || Date.now()),
      createdAt: new Date(task.createdAt || Date.now()),
      distance: this.calculateDistance(task.location?.latitude, task.location?.longitude)
    }));
  }

  // Mapear estados de la API a los estados del display
  private mapApiStatusToDisplay(apiStatus: string): 'pending' | 'in-progress' | 'completed' {
    switch (apiStatus?.toLowerCase()) {
      case 'finalizado':
      case 'completed':
      case 'completado':
        return 'completed';
      case 'en-progreso':
      case 'in-progress':
      case 'progreso':
        return 'in-progress';
      case 'pendiente':
      case 'pending':
      default:
        return 'pending';
    }
  }

  // Mapear prioridades de la API a las prioridades del display
  private mapApiPriorityToDisplay(apiPriority: string): 'low' | 'medium' | 'high' {
    switch (apiPriority?.toLowerCase()) {
      case 'alta':
      case 'high':
        return 'high';
      case 'media':
      case 'medium':
        return 'medium';
      case 'baja':
      case 'low':
      default:
        return 'low';
    }
  }

  // Extraer categorías únicas de las tareas
  private extractCategories() {
    const uniqueCategories = [...new Set(this.tasks.map(task => task.category))];
    this.categories = uniqueCategories.filter(category => category && category !== 'Sin categoría');
  }

  // Calcular distancia (placeholder - necesitarías implementar cálculo real basado en geolocalización)
  private calculateDistance(lat?: number, lng?: number): number | undefined {
    if (!lat || !lng) return undefined;
    // Implementar cálculo real de distancia basado en ubicación actual
    // Por ahora retornamos un valor aleatorio para el ejemplo
    return Math.random() * 20;
  }

  onRefresh(event: any) {
    this.loadTasks();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  filterTasks() {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesSearch =
        (task.title?.toLowerCase() ?? '').includes(this.searchTerm?.toLowerCase() ?? '') ||
        (task.description?.toLowerCase() ?? '').includes(this.searchTerm?.toLowerCase() ?? '');

      const matchesStatus = this.selectedSegment === 'all' || task.status === this.selectedSegment;
      const matchesPriority = this.selectedPriority === 'all' || task.priority === this.selectedPriority;
      const matchesCategory = this.selectedCategory === 'all' || task.category === this.selectedCategory;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value;
    this.filterTasks();
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
    this.filterTasks();
  }

  onPriorityChange(event: any) {
    this.selectedPriority = event.detail.value;
    this.filterTasks();
  }

  onCategoryChange(event: any) {
    this.selectedCategory = event.detail.value;
    this.filterTasks();
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'danger';
      default: return 'medium';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'pending': return 'medium';
      default: return 'medium';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'in-progress': return 'time-outline';
      case 'pending': return 'alert-circle';
      default: return 'alert-circle';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Completada';
      case 'in-progress': return 'En Progreso';
      case 'pending': return 'Pendiente';
      default: return 'Desconocido';
    }
  }

  getPriorityText(priority: string): string {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Sin definir';
    }
  }

  toggleTaskStatus(task: TaskDisplay) {
    // Determinar nuevo estado
    let newStatus: 'pending' | 'in-progress' | 'completed';

if (task.status === 'completed') {
  newStatus = 'pending';
} else if (task.status === 'pending') {
  newStatus = 'in-progress';
} else {
  newStatus = 'completed';
}

task.status = newStatus;


    // Actualizar en la API
    const taskUpdate = {
      ...task,
      status: newStatus
    };

    this.taskService.updateTask(parseInt(task.id), taskUpdate as any).subscribe({
      next: (updatedTask) => {
        this.showSuccessToast('Estado de tarea actualizado');
        this.filterTasks();
      },
      error: (error) => {
        console.error('Error updating task status:', error);
        this.showErrorToast('Error al actualizar el estado de la tarea');
        // Revertir el cambio en la UI
        this.loadTasks();
      }
    });
  }

  viewOnMap(task: TaskDisplay) {
    // Navegar al mapa con la tarea seleccionada
    console.log('Viewing task on map:', task);
    if (task.location) {
      this.router.navigate(['/tabs/mapa'], {
        queryParams: {
          lat: task.location.latitude,
          lng: task.location.longitude,
          taskId: task.id
        }
      });
      } else {
      this.showErrorToast('Ubicación no disponible para esta tarea');
      }

  }

  async editTask(task: TaskDisplay) {
    const modal = await this.modalController.create({
      component: ModalComponent,
      componentProps: {
        task: task,
        isEditing: true
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      // Actualizar la tarea en la API
      this.taskService.updateTask(parseInt(task.id), data).subscribe({
        next: (updatedTask) => {
          this.showSuccessToast('Tarea actualizada correctamente');
          this.loadTasks(); // Recargar todas las tareas
        },
        error: (error) => {
          console.error('Error updating task:', error);
          this.showErrorToast('Error al actualizar la tarea');
        }
      });
    }
  }

  async deleteTask(task: TaskDisplay) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar la tarea "${task.title}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.taskService.deleteTask(parseInt(task.id)).subscribe({
              next: () => {
                this.showSuccessToast('Tarea eliminada correctamente');
                this.loadTasks(); // Recargar las tareas
              },
              error: (error) => {
                console.error('Error deleting task:', error);
                this.showErrorToast('Error al eliminar la tarea');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }
async createNewTask() {
  const modal = await this.modalController.create({
    component: ModalComponent
  });

  await modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (data?.action === 'created') {
    this.showSuccessToast('Tarea creada correctamente');
    this.loadTasks(); // recarga la lista
  }
}


  formatDate(date: string | Date | undefined | null): string {
    if (!date) return 'Fecha no disponible';

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return 'Fecha inválida';

    return parsed.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  }

  isOverdue(dueDate: Date): boolean {
    return new Date() > dueDate;
  }

  // Métodos de utilidad para mostrar mensajes
  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color: 'success'
    });
    await toast.present();
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  }
}
