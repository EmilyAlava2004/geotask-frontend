// src/app/interface/Itask.interface.ts - Versión mejorada

export interface Task {
  id?: number;
  title: string;
  description: string;
  date: string; // Formato YYYY-MM-DD (DATEONLY en el backend)
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  category: 'Work' | 'Personal' | 'Study' | 'Urgent' | 'Health' | 'other';
  user_id: number;
  location_id?: number | null; // Cambiado de undefined a null
  createdAt?: string;
  updatedAt?: string;

  // Relaciones incluidas por el backend
  User?: {
    id: number;
    name: string;
    email: string;
  };
  location?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    geofence_radius?: number;
  };
}

// Para el servicio de ubicaciones
export interface Location {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  geofence_radius?: number;
}

// Interface para el payload de creación/actualización de tareas
export interface TaskPayload {
  title: string;
  description: string;
  date: string;
  status?: 'pending' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  category: 'Work' | 'Personal' | 'Study' | 'Urgent' | 'Health' | 'other';
  user_id: number;
  location_id?: number | null;
}
