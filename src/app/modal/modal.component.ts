import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonModal,
  IonButtons,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  IonToast,
  IonSearchbar,
  IonList,
  IonCheckbox,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  close,
  checkmarkOutline,
  locationOutline,
  timeOutline,
  alertCircleOutline,
  documentTextOutline,
  pricetagOutline,
  flagOutline,
  mapOutline,
  saveOutline
} from 'ionicons/icons';

export interface Task {
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
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonModal,
    IonButtons,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonChip,
    IonToast,
    IonSearchbar,
    IonList,
    IonCheckbox
  ]
})
export class ModalComponent implements OnInit {
  @Input() task?: Task; // Para editar tareas existentes
  @Input() isEditing: boolean = false; // Para saber si estamos editando

  minDate = new Date().toISOString();
  modalTitle = 'Nueva Tarea';
  buttonText = 'Crear Tarea';
  buttonIcon = 'checkmark-outline';

  // Formulario de tarea
  taskForm = {
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    dueDate: new Date().toISOString(),
    location: {
      name: '',
      address: '',
      latitude: 0,
      longitude: 0
    }
  };

  // Opciones disponibles
  categories = ['Trabajo', 'Personal', 'Urgente', 'Mantenimiento'];
  priorities = [
    { value: 'low', label: 'Baja', color: 'success' },
    { value: 'medium', label: 'Media', color: 'warning' },
    { value: 'high', label: 'Alta', color: 'danger' }
  ];

  // Estados del componente
  isFormValid = false;
  showToast = false;
  toastMessage = '';
  isSearchingLocation = false;
  locationResults: any[] = [];
  showLocationSearch = false;

  // Ubicaciones predefinidas para el ejemplo
  predefinedLocations = [
    {
      name: 'Oficina Central',
      address: 'Av. Principal 123, San José',
      latitude: 9.9281,
      longitude: -84.0907
    },
    {
      name: 'Ferretería El Martillo',
      address: 'Calle 5, Heredia',
      latitude: 9.9988,
      longitude: -84.1175
    },
    {
      name: 'Centro Comercial',
      address: 'Mall San Pedro, San José',
      latitude: 9.9349,
      longitude: -84.0528
    },
    {
      name: 'Universidad Nacional',
      address: 'Heredia Centro',
      latitude: 9.9988,
      longitude: -84.1175
    },
    {
      name: 'Hospital San Juan de Dios',
      address: 'San José Centro',
      latitude: 9.9326,
      longitude: -84.0787
    }
  ];

  constructor(private modalController: ModalController) {
    addIcons({
      close,
      checkmarkOutline,
      locationOutline,
      timeOutline,
      alertCircleOutline,
      documentTextOutline,
      pricetagOutline,
      flagOutline,
      mapOutline,
      saveOutline
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
  }

  private loadTaskData() {
    if (this.task) {
      this.taskForm = {
        title: this.task.title,
        description: this.task.description,
        priority: this.task.priority,
        category: this.task.category,
        dueDate: this.task.dueDate.toISOString(),
        location: { ...this.task.location }
      };
    }
  }

  validateForm() {
    this.isFormValid = 
      this.taskForm.title.trim().length > 0 &&
      this.taskForm.description.trim().length > 0 &&
      this.taskForm.category.length > 0 &&
      this.taskForm.location.name.length > 0;
  }

  onFormChange() {
    this.validateForm();
  }

  onLocationSearch(event: any) {
    const query = event.detail.value.toLowerCase();
    if (query.length > 2) {
      this.isSearchingLocation = true;
      // Simular búsqueda de ubicaciones
      setTimeout(() => {
        this.locationResults = this.predefinedLocations.filter(location =>
          location.name.toLowerCase().includes(query) ||
          location.address.toLowerCase().includes(query)
        );
        this.isSearchingLocation = false;
      }, 500);
    } else {
      this.locationResults = [];
    }
  }

  selectLocation(location: any) {
    this.taskForm.location = { ...location };
    this.showLocationSearch = false;
    this.locationResults = [];
    this.validateForm();
  }

  toggleLocationSearch() {
    this.showLocationSearch = !this.showLocationSearch;
    if (this.showLocationSearch) {
      this.locationResults = [...this.predefinedLocations];
    } else {
      this.locationResults = [];
    }
  }

  getPriorityColor(priority: string): string {
    const p = this.priorities.find(p => p.value === priority);
    return p ? p.color : 'medium';
  }

  getPriorityLabel(priority: string): string {
    const p = this.priorities.find(p => p.value === priority);
    return p ? p.label : 'Sin definir';
  }

  async createTask() {
    if (!this.isFormValid) {
      this.showToastMessage('Por favor completa todos los campos requeridos');
      return;
    }

    const taskData: Task = {
      id: this.isEditing && this.task ? this.task.id : Date.now().toString(),
      title: this.taskForm.title,
      description: this.taskForm.description,
      status: this.isEditing && this.task ? this.task.status : 'pending',
      priority: this.taskForm.priority as 'low' | 'medium' | 'high',
      category: this.taskForm.category,
      location: this.taskForm.location,
      dueDate: new Date(this.taskForm.dueDate),
      createdAt: this.isEditing && this.task ? this.task.createdAt : new Date(),
      distance: this.isEditing && this.task ? this.task.distance : Math.random() * 10
    };

    // Cerrar modal y enviar la tarea
    await this.modalController.dismiss(taskData);
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