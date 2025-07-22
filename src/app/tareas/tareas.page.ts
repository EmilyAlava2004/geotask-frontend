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
  ModalController
} from '@ionic/angular/standalone';
import { 
  addIcons 
} from 'ionicons';
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

// Importar el modal component
import { ModalComponent } from '../modal/modal.component';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  location: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  dueDate: Date;
  createdAt: Date;
  distance?: number;
}

@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.page.html',
  styleUrls: ['./tareas.page.scss'],
  standalone: true,
  imports: [IonButtons, IonApp, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, 
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
    IonMenu, 
    IonMenuButton
  ]
})
export class TareasPage implements OnInit {

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  searchTerm: string = '';
  selectedSegment: string = 'all';
  selectedPriority: string = 'all';
  selectedCategory: string = 'all';
  isLoading: boolean = false;

  // Datos de ejemplo
  mockTasks: Task[] = [
    {
      id: '1',
      title: 'Reunión con cliente',
      description: 'Presentar propuesta del nuevo proyecto',
      status: 'pending',
      priority: 'high',
      category: 'Trabajo',
      location: {
        name: 'Oficina Central',
        address: 'Av. Principal 123, San José',
        latitude: 9.9281,
        longitude: -84.0907
      },
      dueDate: new Date('2025-06-20'),
      createdAt: new Date('2025-06-15'),
      distance: 2.5
    },
    {
      id: '2',
      title: 'Comprar materiales',
      description: 'Comprar materiales para el proyecto de construcción',
      status: 'in-progress',
      priority: 'medium',
      category: 'Personal',
      location: {
        name: 'Ferretería El Martillo',
        address: 'Calle 5, Heredia',
        latitude: 9.9988,
        longitude: -84.1175
      },
      dueDate: new Date('2025-06-18'),
      createdAt: new Date('2025-06-16'),
      distance: 5.2
    },
    {
      id: '3',
      title: 'Inspección de obra',
      description: 'Revisar avances de construcción',
      status: 'completed',
      priority: 'high',
      category: 'Trabajo',
      location: {
        name: 'Sitio de Construcción',
        address: 'Cartago Centro',
        latitude: 9.8644,
        longitude: -83.9194
      },
      dueDate: new Date('2025-06-17'),
      createdAt: new Date('2025-06-14'),
      distance: 15.8
    }
  ];

  categories = ['Trabajo', 'Personal', 'Urgente', 'Mantenimiento'];

  constructor(private modalController: ModalController) {
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
      trashOutline
    });
  }

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.isLoading = true;
    // Simular carga de datos
    setTimeout(() => {
      this.tasks = [...this.mockTasks];
      this.filterTasks();
      this.isLoading = false;
    }, 1000);
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
;
      
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
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
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

  toggleTaskStatus(task: Task) {
    if (task.status === 'completed') {
      task.status = 'pending';
    } else if (task.status === 'pending') {
      task.status = 'in-progress';
    } else {
      task.status = 'completed';
    }
    this.filterTasks();
  }

  viewOnMap(task: Task) {
    // Navegar al mapa con la tarea seleccionada
    console.log('Viewing task on map:', task);
  }

  async editTask(task: Task) {
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
      // Actualizar la tarea existente
      const index = this.tasks.findIndex(t => t.id === task.id);
      if (index !== -1) {
        this.tasks[index] = { ...data };
        this.filterTasks();
      }
    }
  }

  async deleteTask(task: Task) {
    // Aquí podrías agregar un alert de confirmación
    this.tasks = this.tasks.filter(t => t.id !== task.id);
    this.filterTasks();
    console.log('Task deleted:', task);
  }

  async createNewTask() {
    const modal = await this.modalController.create({
      component: ModalComponent
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      // Agregar la nueva tarea
      this.tasks.push(data);
      this.filterTasks();
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
}