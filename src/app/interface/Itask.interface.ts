export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string; // Cambiado de 'date'
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  user_id: number;
  category?: string; // Agregado para mostrar el nombre
  category_id?: number;
  location?: { name: string; address: string }; // Agregado para mostrar ubicación
  location_id?: number;
  distance?: number; // Agregado para mostrar distancia
  createdAt: string;
  updatedAt: string;
}