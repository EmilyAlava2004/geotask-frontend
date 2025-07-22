// src/app/interface/Itask.interface.ts

export interface Task {
  id?: number;
  title: string;
  description: string;
  date: string; // DATEONLY en el backend
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  user_id: number;
  category_id?: number | undefined;
  location_id?: number | undefined;
  createdAt?: string;
  updatedAt?: string;
  
  // Relaciones incluidas por el backend
  User?: {
    id: number;
    name: string;
    email: string;
  };
  Category?: {
    id: number;
    name: string;
  };
  Location?: {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
}

// Para el servicio de ubicaciones
export interface Location {
  id?: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}