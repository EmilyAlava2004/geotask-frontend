import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonItem,
  IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonDatetime,
  IonModal, IonButtons, IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonChip, IonToast, IonSearchbar, IonList,
  IonCheckbox, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  close, checkmarkOutline, locationOutline, timeOutline,
  alertCircleOutline, documentTextOutline, pricetagOutline,
  flagOutline, mapOutline, saveOutline
} from 'ionicons/icons';
import { LocationService, Location } from '../services/location.service';
import { TaskService } from '../services/task.service';
import { Task } from '../interface/Itask.interface'; // Importar desde la interfaz correcta

// Eliminar la definición duplicada de Task interface ya que se importa

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonItem,
    IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonDatetime,
    IonModal, IonButtons, IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonChip, IonToast, IonSearchbar, IonList, IonCheckbox
  ]
})
export class ModalComponent implements OnInit {
  @Input() task?: Task;
  @Input() isEditing: boolean = false;

  minDate = new Date().toISOString();
  modalTitle = 'Nueva Tarea';
  buttonText = 'Crear Tarea';
  buttonIcon = 'checkmark-outline';

  // Formulario de tarea
  taskForm: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    category_id: number | undefined;
    dueDate: string;
    location_id: number | undefined;
  } = {
    title: '',
    description: '',
    priority: 'medium',
    category_id: undefined,
    dueDate: new Date().toISOString(),
    location_id: undefined
  };

  // Opciones predefinidas (deberías cargarlas desde tu API de categorías)
  categories = [
    { id: 1, name: 'Trabajo' },
    { id: 2, name: 'Personal' },
    { id: 3, name: 'Urgente' },
    { id: 4, name: 'Mantenimiento' }
  ];
  
  priorities = [
    { value: 'low', label: 'Baja', color: 'success' },
    { value: 'medium', label: 'Media', color: 'warning' },
    { value: 'high', label: 'Alta', color: 'danger' }
  ];

  isFormValid = false;
  showToast = false;
  toastMessage = '';
  isSearchingLocation = false;
  locationResults: Location[] = [];
  availableLocations: Location[] = [];
  showLocationSearch = false;
  selectedLocation: Location | null = null;

  constructor(
    private modalController: ModalController,
    private locationService: LocationService,
    private taskService: TaskService
  ) {
    addIcons({
      close, checkmarkOutline, locationOutline, timeOutline,
      alertCircleOutline, documentTextOutline, pricetagOutline,
      flagOutline, mapOutline, saveOutline
    });
  }

  ngOnInit() {
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
        category_id: this.task.category_id || undefined,
        dueDate: this.task.date,
        location_id: this.task.location_id || undefined
      };
      
      // Cargar la ubicación seleccionada si existe
      if (this.task.Location) {
        this.selectedLocation = this.task.Location;
      }
    }
  }

  validateForm() {
    this.isFormValid =
      this.taskForm.title.trim().length > 0 &&
      this.taskForm.description.trim().length > 0 &&
      this.taskForm.category_id !== undefined;
    // Nota: ubicación no es obligatoria según tu modelo
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
      }
    });
  }

  onLocationSearch(event: any) {
    const query = event.detail.value.toLowerCase();
    if (query.length > 2) {
      this.isSearchingLocation = true;
      setTimeout(() => {
        this.locationResults = this.availableLocations.filter(location =>
          (location.name?.toLowerCase().includes(query) ?? false) ||
          (location.address?.toLowerCase().includes(query) ?? false)
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

  getCategoryName(categoryId: number | undefined): string {
    if (!categoryId) return 'Sin categoría';
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Sin categoría';
  }

  async createTask() {
    if (!this.isFormValid) {
      this.showToastMessage('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const taskPayload: Task = {
        title: this.taskForm.title,
        description: this.taskForm.description,
        date: this.taskForm.dueDate.split('T')[0], // Solo la fecha
        status: this.isEditing && this.task ? this.task.status : 'pending',
        priority: this.taskForm.priority,
        user_id: 1, // Asegúrate de usar el ID del usuario actual
        category_id: this.taskForm.category_id,
        location_id: this.taskForm.location_id
      };

      if (this.isEditing && this.task?.id) {
        // Actualizar tarea existente
        await this.taskService.updateTask(this.task.id, taskPayload).toPromise();
        await this.modalController.dismiss({ action: 'updated', task: taskPayload });
      } else {
        // Crear nueva tarea
        const createdTask = await this.taskService.createTask(taskPayload).toPromise();
        await this.modalController.dismiss({ action: 'created', task: createdTask });
      }
      
    } catch (error) {
      console.error('Error al guardar la tarea:', error);
      this.showToastMessage('Error al guardar la tarea. Intenta nuevamente.');
    }
  }

  async cancel() {
    await this.modalController.dismiss();
  }

  private showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
  }

  onToastDidDismiss() {
    this.showToast = false;
  }
}