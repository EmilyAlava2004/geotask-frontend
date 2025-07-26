import { Component, OnInit } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonApp, 
  IonList, IonIcon, IonItem, IonLabel, IonButton, IonCard, 
  IonCardContent, IonCardHeader, IonCardTitle, IonCheckbox, 
  IonChip, IonAvatar, IonFab, IonFabButton, IonRouterOutlet,
  ModalController, IonSpinner, IonToast } from '@ionic/angular/standalone';
import {
  IonMenu,
  IonMenuButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  homeSharp, trendingUpOutline, mapSharp, settingsSharp,
  checkmarkCircle, time, location, chevronBack, chevronForward,
  calendarClear, add, navigate, personOutline, refreshOutline
} from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskService } from '../services/task.service';
import { Task } from '../interface/Itask.interface';
import { ModalComponent } from '../modal/modal.component';
import {
  settingsOutline // <-- Agregar este ícono
} from 'ionicons/icons';

interface CalendarDay {
  date: number;
  fullDate: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  tasks: Task[];
  taskCount: number;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonToast, IonSpinner, 
    IonFabButton, IonFab,  IonChip, IonCheckbox, IonCardTitle, 
    IonCardHeader, IonCardContent, IonCard, IonButton, IonLabel, IonItem, 
    IonIcon,  IonButtons, IonHeader, IonToolbar, IonTitle, 
    IonContent, IonMenuButton, CommonModule
  ],
})
export class HomePage implements OnInit {
  
  // Propiedades del calendario
  currentDate = new Date();
  selectedDate: string = '';
  currentMonthYear: string = '';
  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  calendarDays: CalendarDay[] = [];
  selectedDayTasks: Task[] = [];
  
  // Estadísticas
  completedTasks = 0;
  pendingTasks = 0;
  nearbyTasks = 0;
  
  // Estado de carga
  isLoading = false;
  tasksFromAPI: Task[] = [];
  
  // Toast para mensajes
  showToast = false;
  toastMessage = '';
  toastColor: 'success' | 'danger' | 'warning' = 'success';

  constructor(
    private router: Router,
    private taskService: TaskService,
    private modalController: ModalController
  ) {
    addIcons({
      homeSharp,
      trendingUpOutline,
      mapSharp,
      settingsSharp,
      checkmarkCircle,
      time,
      location,
      chevronBack,
      chevronForward,
      calendarClear,
      add,
      navigate,
      personOutline,
      refreshOutline,
      settingsOutline
    });
  }

ngOnInit() {
  // Mejor inicialización de la fecha
  const today = new Date();
  this.currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
  
  this.updateCurrentMonthYear();
  this.loadTasksFromAPI();
}
goToSettings() {
  this.router.navigate(['/settings']);
}
updateCurrentMonthYear() {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const monthIndex = this.currentDate.getMonth();
  const year = this.currentDate.getFullYear();
  
  // Validación mejorada
  if (monthIndex >= 0 && monthIndex < 12) {
    this.currentMonthYear = `${months[monthIndex]} ${year}`;
    console.log('Mes actualizado:', this.currentMonthYear); // Debug
  } else {
    console.error('Índice de mes inválido:', monthIndex);
    // Resetear a fecha actual si hay error
    this.currentDate = new Date();
    this.currentDate.setDate(1);
    this.currentMonthYear = `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }
}

previousMonth() {
  console.log('Mes anterior - Fecha actual:', this.currentDate); // Debug
  
  // Crear nueva fecha correctamente
  this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
  
  console.log('Nueva fecha:', this.currentDate); // Debug
  
  this.updateCurrentMonthYear();
  this.generateCalendar();
  this.selectFirstDayOfMonth();
}

nextMonth() {
  console.log('Mes siguiente - Fecha actual:', this.currentDate); // Debug
  
  // Crear nueva fecha correctamente
  this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
  
  console.log('Nueva fecha:', this.currentDate); // Debug
  
  this.updateCurrentMonthYear();
  this.generateCalendar();
  this.selectFirstDayOfMonth();
}

// Método mejorado para generar el calendario
generateCalendar() {
  const year = this.currentDate.getFullYear();
  const month = this.currentDate.getMonth();
  
  console.log('Generando calendario para:', year, month); // Debug
  
  // Verificar que la fecha sea válida
  if (isNaN(year) || month < 0 || month > 11) {
    console.error('Fecha inválida:', year, month);
    return;
  }
  
  // Primer día del mes y último día del mes anterior
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDay.getDay();
  
  this.calendarDays = [];
  
  // Días del mes anterior
  const prevMonth = new Date(year, month - 1, 0);
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const date = prevMonth.getDate() - i;
    const fullDate = new Date(year, month - 1, date);
    this.calendarDays.push(this.createCalendarDay(date, fullDate, false));
  }
  
  // Días del mes actual
  for (let date = 1; date <= lastDay.getDate(); date++) {
    const fullDate = new Date(year, month, date);
    this.calendarDays.push(this.createCalendarDay(date, fullDate, true));
  }
  
  // Días del siguiente mes para completar la semana
  const remainingDays = 42 - this.calendarDays.length;
  for (let date = 1; date <= remainingDays; date++) {
    const fullDate = new Date(year, month + 1, date);
    this.calendarDays.push(this.createCalendarDay(date, fullDate, false));
  }
  
  console.log('Calendario generado con', this.calendarDays.length, 'días'); // Debug
}
  // Cargar tareas desde la API
  loadTasksFromAPI() {
    this.isLoading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasksFromAPI = tasks;
        this.generateCalendar();
        this.updateStatistics();
        this.selectToday();
        this.isLoading = false;
        console.log('Tareas cargadas:', tasks);
      },
      error: (error) => {
        console.error('Error al cargar tareas:', error);
        this.isLoading = false;
        this.showToastMessage('Error al cargar las tareas', 'danger');
        // Generar calendario vacío en caso de error
        this.generateCalendar();
        this.selectToday();
      }
    });
  }


  


  createCalendarDay(date: number, fullDate: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    const isToday = fullDate.toDateString() === today.toDateString();
    
    // Filtrar tareas para esta fecha específica
    const dayTasks = this.tasksFromAPI.filter(task => {
      if (!task.date) return false;
      
      // Convertir la fecha de la tarea a Date object
      const taskDate = new Date(task.date + 'T00:00:00'); // Agregar tiempo para evitar problemas de zona horaria
      const calendarDate = new Date(fullDate.getFullYear(), fullDate.getMonth(), fullDate.getDate());
      
      return taskDate.toDateString() === calendarDate.toDateString();
    });
    
    return {
      date,
      fullDate,
      isCurrentMonth,
      isToday,
      isSelected: false,
      tasks: dayTasks,
      taskCount: dayTasks.length
    };
  }

  selectDay(day: CalendarDay) {
    // Deseleccionar día anterior
    this.calendarDays.forEach(d => d.isSelected = false);
    
    // Seleccionar nuevo día
    day.isSelected = true;
    this.selectedDate = this.formatDate(day.fullDate);
    this.selectedDayTasks = day.tasks;
  }

  selectToday() {
    const today = this.calendarDays.find(day => day.isToday);
    if (today) {
      this.selectDay(today);
    } else {
      // Si no hay "hoy" en el calendario actual, seleccionar el primer día del mes
      this.selectFirstDayOfMonth();
    }
  }

  // Método auxiliar para seleccionar el primer día del mes actual
  private selectFirstDayOfMonth() {
    const firstDayOfMonth = this.calendarDays.find(day => day.isCurrentMonth && day.date === 1);
    if (firstDayOfMonth) {
      this.selectDay(firstDayOfMonth);
    }
  }


  
  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  }

  updateStatistics() {
    this.completedTasks = this.tasksFromAPI.filter(task => task.status === 'completed').length;
    this.pendingTasks = this.tasksFromAPI.filter(task => task.status === 'pending').length;
    
    // Para tareas cercanas, podrías implementar lógica de geolocalización
    // Por ahora, simulamos con tareas que tienen ubicación
    this.nearbyTasks = this.tasksFromAPI.filter(task => 
      task.status === 'pending' && task.location_id
    ).length;
  }

  toggleTaskComplete(task: Task) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    
    this.taskService.updateTask(task.id!, { ...task, status: newStatus }).subscribe({
      next: (updatedTask) => {
        // Actualizar la tarea en el array local
        const index = this.tasksFromAPI.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.tasksFromAPI[index] = updatedTask;
        }
        
        // Regenerar calendario y estadísticas
        this.generateCalendar();
        this.updateStatistics();
        
        // Actualizar tareas del día seleccionado
        const selectedDay = this.calendarDays.find(d => d.isSelected);
        if (selectedDay) {
          this.selectedDayTasks = selectedDay.tasks;
        }
        
        const message = newStatus === 'completed' ? 'Tarea completada' : 'Tarea marcada como pendiente';
        this.showToastMessage(message, 'success');
      },
      error: (error) => {
        console.error('Error al actualizar tarea:', error);
        this.showToastMessage('Error al actualizar la tarea', 'danger');
      }
    });
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'medium';
    }
  }

  getTaskPriorityClass(priority: string): string {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  }

  viewTaskLocation(task: Task) {
    // Navegar al mapa con la ubicación de la tarea
    if (task.Location) {
      this.router.navigate(['/map'], { 
        queryParams: { 
          lat: task.Location.latitude, 
          lng: task.Location.longitude,
          taskId: task.id 
        } 
      });
    } else {
      this.showToastMessage('Esta tarea no tiene ubicación asignada', 'warning');
    }
  }

  // Abrir modal para crear nueva tarea
  async createTask() {
    const selectedDay = this.calendarDays.find(d => d.isSelected);
    const selectedDateISO = selectedDay ? selectedDay.fullDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    const modal = await this.modalController.create({
      component: ModalComponent,
      componentProps: {
        isEditing: false,
        selectedDate: selectedDateISO
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data && (result.data.action === 'created' || result.data.action === 'updated')) {
        // Recargar tareas después de crear/editar
        this.loadTasksFromAPI();
        this.showToastMessage(
          result.data.action === 'created' ? 'Tarea creada exitosamente' : 'Tarea actualizada exitosamente', 
          'success'
        );
      }
    });

    return await modal.present();
  }

  // Abrir modal para editar tarea existente
  async editTask(task: Task, event: Event) {
    event.stopPropagation(); // Prevenir que se active el click del día
    
    const modal = await this.modalController.create({
      component: ModalComponent,
      componentProps: {
        task: task,
        isEditing: true
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data && (result.data.action === 'created' || result.data.action === 'updated')) {
        // Recargar tareas después de crear/editar
        this.loadTasksFromAPI();
        this.showToastMessage(
          result.data.action === 'updated' ? 'Tarea actualizada exitosamente' : 'Tarea creada exitosamente', 
          'success'
        );
      }
    });

    return await modal.present();
  }

  // Mostrar mensaje toast
  private showToastMessage(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }

  onToastDidDismiss() {
    this.showToast = false;
  }
}