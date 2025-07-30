// task.service.ts - Versión corregida

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Task } from 'src/app/interface/Itask.interface';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/api/tasks';
 private tasksChanged = new BehaviorSubject<void>(undefined);
  tasksChanged$ = this.tasksChanged.asObservable();
  constructor(private http: HttpClient) {}

notifyTasksChanged() {
    this.tasksChanged.next();
  }
  // Obtener todas las tareas del usuario autenticado
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl, {
      headers: this.getHeaders()
    }).pipe(
      tap(tasks => console.log('Tareas obtenidas:', tasks)),
      catchError(this.handleError)
    );
  }
getTasksByUserId(userId: number) {
  return this.http.get<Task[]>(`${this.apiUrl}/user/${userId}`);
}
  // Obtener una tarea por ID
  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Crear una nueva tarea
  createTask(task: Task): Observable<Task> {
    console.log('📤 Enviando tarea al backend:', task);

    // Validar datos antes de enviar
    if (!task.title || !task.description || !task.category || !task.user_id) {
      console.error('❌ Datos de tarea incompletos:', task);
      return throwError(() => ({
        message: 'Datos de tarea incompletos',
        originalError: null
      }));
    }

    return this.http.post<Task>(this.apiUrl, task, {
      headers: this.getHeaders()
    }).pipe(
       tap(response => {
        console.log('✅ Respuesta del servidor:', response);
        this.notifyTasksChanged();
      }),
      catchError(this.handleError)
    );
  }

  // Actualizar una tarea existente
  updateTask(id: number, task: Task): Observable<Task> {
    console.log('📤 Actualizando tarea:', id, task);

    return this.http.put<Task>(`${this.apiUrl}/${id}`, task, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        console.log('✅ Tarea actualizada:', response);
        this.notifyTasksChanged(); // Notificar a suscriptores que hubo cambio
      }),
      catchError(this.handleError)
    );
  }

  // Eliminar una tarea
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Completar una tarea (cambiar status a 'completed')
  completeTask(id: number): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/complete`, {}, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.notifyTasksChanged()),
      catchError(this.handleError)
    );
  }

  // Obtener tareas cercanas por coordenadas
  getNearbyTasks(lat: number, lng: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/nearby?lat=${lat}&lng=${lng}`, {
      headers: this.getHeaders()
    }).pipe(tap(() => this.notifyTasksChanged()),
      catchError(this.handleError)
    );
  }

  // Obtener headers con token de autenticación
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      return headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // Manejo centralizado de errores mejorado
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('❌ Error en TaskService:', error);

    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 0) {
        errorMessage = 'No se puede conectar al servidor. Verifica que el backend esté ejecutándose.';
      } else if (error.status === 401) {
        errorMessage = 'No autorizado. Por favor inicia sesión nuevamente.';
        // Limpiar localStorage si hay error de autenticación
        localStorage.removeItem('token');
        localStorage.removeItem('id');
      } else if (error.status === 400) {
        // Manejar errores de validación específicos
        if (error.error?.errors) {
          const validationErrors = error.error.errors.map((err: any) =>
            `${err.field}: ${err.message}`
          ).join(', ');
          errorMessage = `Error de validación: ${validationErrors}`;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else {
          errorMessage = 'Datos inválidos enviados al servidor';
        }
      } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else {
        errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
      }
    }

    return throwError(() => ({
      message: errorMessage,
      originalError: error,
      status: error.status
    }));
  }
}
