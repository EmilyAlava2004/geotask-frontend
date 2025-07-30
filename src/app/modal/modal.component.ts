import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonItem,
  IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonDatetime,
  IonButtons, IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonChip, IonToast, IonSearchbar, IonList,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  close, checkmarkOutline, locationOutline, timeOutline,
  alertCircleOutline, documentTextOutline, pricetagOutline,
  flagOutline, mapOutline, saveOutline, addOutline, refreshOutline,
  colorPaletteOutline, createOutline, briefcaseOutline, personOutline,
  libraryOutline, alertOutline, medicalOutline, ellipsisHorizontalOutline
} from 'ionicons/icons';
import { LocationService, Location } from '../services/location.service';
import { TaskService } from '../services/task.service';
import { Task } from '../interface/Itask.interface';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonItem,
    IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonDatetime,
    IonButtons, IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonChip, IonToast, IonSearchbar, IonList,

  ]
})
export class ModalComponent implements OnInit {
  @Input() task?: Task;
  @Input() isEditing: boolean = false;
  @Input() selectedDate?: string;

  minDate = new Date().toISOString();
  modalTitle = 'Nueva Tarea';
  buttonText = 'Crear Tarea';
  buttonIcon = 'checkmark-outline';

  // Formulario de tarea actualizado para usar 'category' en lugar de 'category_id'
  taskForm: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    category: 'Work' | 'Personal' | 'Study' | 'Urgent' | 'Health' | 'other';
    date: string;
    location_id: number | undefined;
  } = {
    title: '',
    description: '',
    priority: 'medium',
    category: 'Work',
    date: new Date().toISOString(),
    location_id: undefined
  };

  // Categorías predefinidas según tu modelo de backend
  categories = [
    {
      value: 'Work',
      label: 'Trabajo',
      icon: 'briefcase-outline',
      color: 'primary'
    },
    {
      value: 'Personal',
      label: 'Personal',
      icon: 'person-outline',
      color: 'secondary'
    },
    {
      value: 'Study',
      label: 'Estudio',
      icon: 'library-outline',
      color: 'tertiary'
    },
    {
      value: 'Urgent',
      label: 'Urgente',
      icon: 'alert-outline',
      color: 'danger'
    },
    {
      value: 'Health',
      label: 'Salud',
      icon: 'medical-outline',
      color: 'success'
    },
    {
      value: 'other',
      label: 'Otro',
      icon: 'ellipsis-horizontal-outline',
      color: 'medium'
    }
  ];

  priorities = [
    { value: 'low', label: 'Baja', color: 'success' },
    { value: 'medium', label: 'Media', color: 'warning' },
    { value: 'high', label: 'Alta', color: 'danger' }
  ];

  isFormValid = false;
  showToast = false;
  toastMessage = '';
  toastColor: 'success' | 'danger' | 'warning' = 'danger';
  isSearchingLocation = false;
  locationResults: Location[] = [];
  availableLocations: Location[] = [];
  showLocationSearch = false;
  selectedLocation: Location | null = null;

  constructor(
    private authService: AuthService,
    private modalController: ModalController,
    private locationService: LocationService,
    private taskService: TaskService
  ) {
    addIcons({
      close, checkmarkOutline, locationOutline, timeOutline,
      alertCircleOutline, documentTextOutline, pricetagOutline,
      flagOutline, mapOutline, saveOutline, addOutline, refreshOutline,
      colorPaletteOutline, createOutline, briefcaseOutline, personOutline,
      libraryOutline, alertOutline, medicalOutline, ellipsisHorizontalOutline
    });
  }
ngOnInit() {
  if (this.selectedDate) {
    this.taskForm.date = this.selectedDate + 'T12:00:00.000Z';
  }

  const idGuardado = localStorage.getItem('ubicacionParaTarea');
  if (idGuardado) {
    this.taskForm.location_id = Number(idGuardado);
    localStorage.removeItem('ubicacionParaTarea'); // Limpiar para no usarlo de nuevo
  }

  if (this.isEditing && this.task) {
    this.modalTitle = 'Editar Tarea';
    this.buttonText = 'Guardar Cambios';
    this.buttonIcon = 'save-outline';
    this.loadTaskData();
  }

  this.validateForm();
  this.fetchLocations();
}
  private loadTaskData() {
    if (this.task) {
      this.taskForm = {
        title: this.task.title,
        description: this.task.description,
        priority: this.task.priority,
        category: this.task.category,
        date: this.task.date + 'T12:00:00.000Z',
        location_id: this.task.location_id || undefined
      };

      if (this.task.Location) {
        this.selectedLocation = this.task.Location;
      }
    }
  }

  validateForm() {
    this.isFormValid =
      this.taskForm.title.trim().length > 0 &&
      this.taskForm.description.trim().length > 0 &&
      this.taskForm.category.length > 0;
  }

  onFormChange() {
    this.validateForm();
  }

  fetchLocations() {
    this.locationService.getLocations().subscribe({
      next: (locations) => {
        this.availableLocations = locations;
      },
      error: (err) => {
        console.error('Error al obtener ubicaciones:', err);
        this.showToastMessage('Error al cargar ubicaciones', 'warning');
      }
    });
  }

  onLocationSearch(event: any) {
    const query = event.detail.value.toLowerCase();
    if (query.length > 2) {
      this.isSearchingLocation = true;
      setTimeout(() => {
        this.locationResults = this.availableLocations.filter(location =>
          (location.name?.toLowerCase().includes(query) ?? false)
        );
        this.isSearchingLocation = false;
      }, 500);
    } else {
      this.locationResults = [];
    }
  }

  selectLocation(location: Location) {
    this.selectedLocation = { ...location };
    this.taskForm.location_id = location.id || undefined;
    this.showLocationSearch = false;
    this.locationResults = [];
    this.validateForm();
  }

  toggleLocationSearch() {
    this.showLocationSearch = !this.showLocationSearch;
    this.locationResults = this.showLocationSearch ? [...this.availableLocations] : [];
  }

  getPriorityColor(priority: string): string {
    const p = this.priorities.find(p => p.value === priority);
    return p ? p.color : 'medium';
  }

  getPriorityLabel(priority: string): string {
    const p = this.priorities.find(p => p.value === priority);
    return p ? p.label : 'Sin definir';
  }

  getCategoryName(category: string): string {
    const cat = this.categories.find(c => c.value === category);
    return cat ? cat.label : 'Sin categoría';
  }

  getCategoryIcon(category: string): string {
    const cat = this.categories.find(c => c.value === category);
    return cat?.icon || 'pricetag-outline';
  }

  getCategoryColor(category: string): string {
    const cat = this.categories.find(c => c.value === category);
    return cat?.color || 'medium';
  }


getPriorityIcon(priority: string): string {
  switch (priority) {
    case 'high':
      return 'arrow-up-circle-outline';
    case 'medium':
      return 'remove-circle-outline';
    case 'low':
      return 'arrow-down-circle-outline';
    default:
      return 'ellipse-outline'; // icono por defecto
  }
}

async createTask() {
  if (!this.isFormValid) {
    this.showToastMessage('Por favor completa todos los campos requeridos', 'danger');
    return;
  }

  const userId = localStorage.getItem('id');
  if (!userId) {
    this.showToastMessage('Usuario no autenticado', 'danger');
    return;
  }

  try {
    const taskPayload: Task = {
      title: this.taskForm.title.trim(),
      description: this.taskForm.description.trim(),
      date: this.taskForm.date.split('T')[0],
      status: this.isEditing && this.task ? this.task.status : 'pending',
      priority: this.taskForm.priority,
      category: this.taskForm.category,
      user_id: Number(userId),  // Aquí pasa el id numérico
      location_id: this.taskForm.location_id
    };

    if (this.isEditing && this.task?.id) {
      const updatedTask = await this.taskService.updateTask(this.task.id, taskPayload).toPromise();
      this.showToastMessage('Tarea actualizada correctamente', 'success');
      await this.modalController.dismiss({ action: 'updated', task: updatedTask });

    } else {
      const createdTask = await this.taskService.createTask(taskPayload).toPromise();
      this.showToastMessage('Tarea creada correctamente', 'success');
      await this.modalController.dismiss({ action: 'created', task: createdTask });
    }

  } catch (error) {
    console.error('Error al guardar la tarea:', error);
    this.showToastMessage('Error al guardar la tarea. Intenta nuevamente.', 'danger');
  }
}

  async cancel() {
    await this.modalController.dismiss();
  }

  private showToastMessage(message: string, color: 'success' | 'danger' | 'warning' = 'danger') {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }

  onToastDidDismiss() {
    this.showToast = false;
  }
}
