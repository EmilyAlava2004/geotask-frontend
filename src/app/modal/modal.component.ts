import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonItem,
  IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonDatetime,
  IonModal, IonButtons, IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonChip, IonToast, IonSearchbar, IonList,
  IonCheckbox, ModalController, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  close, checkmarkOutline, locationOutline, timeOutline,
  alertCircleOutline, documentTextOutline, pricetagOutline,
  flagOutline, mapOutline, saveOutline, addOutline
} from 'ionicons/icons';
import { LocationService, Location } from '../services/location.service';
import { TaskService } from '../services/task.service';
import { CategoriasService, Category } from '../services/categorias.service'; // Importar el servicio de categorías
import { Task } from '../interface/Itask.interface';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonItem,
    IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonDatetime,
    IonModal, IonButtons, IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonChip, IonToast, IonSearchbar, IonList, 
    IonCheckbox, IonSpinner
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

  // Categorías cargadas desde la API
  categories: Category[] = [];
  isLoadingCategories = false;
  categoriesError = false;
  
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
    private modalController: ModalController,
    private locationService: LocationService,
    private taskService: TaskService,
    private categoriasService: CategoriasService // Inyectar el servicio
  ) {
    addIcons({
      close, checkmarkOutline, locationOutline, timeOutline,
      alertCircleOutline, documentTextOutline, pricetagOutline,
      flagOutline, mapOutline, saveOutline, addOutline
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
    this.fetchCategories(); // Cargar categorías desde la API
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
  }

  onFormChange() {
    this.validateForm();
  }

  // Método para cargar categorías desde la API
  fetchCategories() {
    this.isLoadingCategories = true;
    this.categoriesError = false;
    
    this.categoriasService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoadingCategories = false;
      },
      error: (error) => {
        console.error('Error al obtener categorías:', error);
        this.categoriesError = true;
        this.isLoadingCategories = false;
        this.showToastMessage('Error al cargar las categorías', 'warning');
        
        // Fallback a categorías predefinidas en caso de error
        this.categories = [
          { id: 1, name: 'Trabajo', icon: 'briefcase-outline', color: 'primary' },
          { id: 2, name: 'Personal', icon: 'person-outline', color: 'secondary' },
          { id: 3, name: 'Urgente', icon: 'alert-outline', color: 'danger' },
          { id: 4, name: 'Mantenimiento', icon: 'construct-outline', color: 'warning' }
        ];
      }
    });
  }

  // Método para recargar categorías
  reloadCategories() {
    this.fetchCategories();
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

  // Método para obtener el ícono de una categoría
  getCategoryIcon(categoryId: number | undefined): string {
    if (!categoryId) return 'pricetag-outline';
    const category = this.categories.find(c => c.id === categoryId);
    return category?.icon || 'pricetag-outline';
  }

  // Método para obtener el color de una categoría
  getCategoryColor(categoryId: number | undefined): string {
    if (!categoryId) return 'medium';
    const category = this.categories.find(c => c.id === categoryId);
    return category?.color || 'medium';
  }

  async createTask() {
    if (!this.isFormValid) {
      this.showToastMessage('Por favor completa todos los campos requeridos', 'danger');
      return;
    }

    try {
      const taskPayload: Task = {
        title: this.taskForm.title.trim(),
        description: this.taskForm.description.trim(),
        date: this.taskForm.dueDate.split('T')[0], // Solo la fecha
        status: this.isEditing && this.task ? this.task.status : 'pending',
        priority: this.taskForm.priority,
        user_id: 1, // TODO: Usar el ID del usuario actual desde un servicio de autenticación
        category_id: this.taskForm.category_id,
        location_id: this.taskForm.location_id
      };

      if (this.isEditing && this.task?.id) {
        // Actualizar tarea existente
        const updatedTask = await this.taskService.updateTask(this.task.id, taskPayload).toPromise();
        this.showToastMessage('Tarea actualizada correctamente', 'success');
        await this.modalController.dismiss({ action: 'updated', task: updatedTask });
      } else {
        // Crear nueva tarea
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