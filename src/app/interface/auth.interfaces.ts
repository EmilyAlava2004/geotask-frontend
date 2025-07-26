export interface RegisterData {
  user: string;
  email: string;
  password: string;
  numero: string;
}

export interface AuthResponse {
  success?: boolean;
  users?: {
    id?: string | number;
    user: string;
    email: string;
    numero?: string;
    [key: string]: any;
  };
  dataUser?: {
    id?: string | number;
    user: string;
    email: string;
    numero?: string;
  };
  token?: string;
  message?: string;
  id?: string | number;
}
