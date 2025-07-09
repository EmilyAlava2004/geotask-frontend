import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError, firstValueFrom } from 'rxjs';
import { RegisterData, AuthResponse } from '../interface/auth.interfaces'; // Ajusta el path si está en otra carpeta

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  async authenticateUser(
    email: string,
    password: string
  ): Promise<{ success: boolean; token?: string; id?: string; message?: string }> {
    try {
      const response: any = await firstValueFrom(
        this.http.post(`${this.API_URL}/login`, {
          email: email.toLowerCase().trim(),
          password: password.trim()
        }).pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('HTTP Error:', error);
            return throwError(() => error);
          })
        )
      );

      console.log('✅ Respuesta completa del login:', response);

      if (response?.success && response?.token) {
        let userId: string | null = null;

        if (response.dataUser?.id) userId = response.dataUser.id.toString();
        else if (response.users?.id) userId = response.users.id.toString();
        else if (response.id) userId = response.id.toString();

        if (userId) {
          return {
            success: true,
            token: response.token,
            id: userId,
            message: response.message || 'Login exitoso'
          };
        }

        return {
          success: true,
          token: response.token,
          message: 'Login exitoso pero falta información del usuario'
        };
      }

      return {
        success: false,
        message: response?.message || 'No se recibió token del servidor'
      };

    } catch (error: any) {
      console.error('❌ Error en authenticateUser:', error);

      if (error?.status === 400 || error?.status === 401) {
        return { success: false, message: error.error?.message || 'Credenciales inválidas' };
      } else if (error?.status === 0) {
        return { success: false, message: 'Error de conexión. Verifica que el servidor esté ejecutándose.' };
      } else if (error?.status >= 500) {
        return { success: false, message: 'Error del servidor. Intenta más tarde.' };
      }

      return { success: false, message: 'Error de red o servidor no disponible' };
    }
  }

  async registerUser(userData: RegisterData): Promise<AuthResponse> {
    try {
      if (!userData.user?.trim() || !userData.email?.trim() ||
          !userData.password?.trim() || !userData.numero?.trim()) {
        return { success: false, message: 'Todos los campos son obligatorios' };
      }

      if (userData.user.trim().length < 2) {
        return { success: false, message: 'El nombre debe tener al menos 2 caracteres' };
      }

      if (userData.password.length < 6) {
        return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
      }

      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

      const cleanData = {
        user: userData.user.trim(),
        email: userData.email.toLowerCase().trim(),
        password: userData.password.trim(),
        numero: userData.numero.trim()
      };

      console.log('📤 Enviando datos de registro:', { ...cleanData, password: '***' });

      const response: any = await firstValueFrom(
        this.http.post(`${this.API_URL}/register`, cleanData, { headers }).pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('HTTP Error en registro:', error);
            return throwError(() => error);
          })
        )
      );

      console.log('✅ Respuesta completa del registro:', response);

      if (response?.success && response?.token) {
        const userInfo = response.users || response.dataUser || {
          user: cleanData.user,
          email: cleanData.email,
          numero: cleanData.numero,
          id: response.id || null
        };

        return {
          success: true,
          token: response.token,
          users: userInfo,
          dataUser: userInfo,
          message: response.message || 'Registro exitoso'
        };
      } else if (response?.token) {
        return {
          success: true,
          token: response.token,
          users: {
            user: cleanData.user,
            email: cleanData.email,
            numero: cleanData.numero,
            id: response.id || response.users?.id || null
          },
          message: response.message || 'Registro exitoso'
        };
      }

      return {
        success: false,
        message: response?.message || 'Error en el registro - no se recibió token'
      };

    } catch (error: any) {
      console.error('❌ Error en registerUser:', error);

      if (error.status === 409) {
        return { success: false, message: 'El email ya está registrado' };
      } else if (error.status === 400) {
        return { success: false, message: error.error?.message || 'Datos inválidos. Verifica tu información.' };
      } else if (error.status === 0) {
        return { success: false, message: 'Error de conexión. Verifica que el servidor esté ejecutándose en http://localhost:3000' };
      } else if (error.status >= 500) {
        return { success: false, message: 'Error interno del servidor. Intenta más tarde.' };
      }

      return { success: false, message: error.error?.message || 'Error desconocido al registrar usuario' };
    }
  }

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ exists: boolean }>(`${this.API_URL}/usuarios/check-email/${email}`)
      );
      return response?.exists || false;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }

  getCurrentUserData() {
    return {
      token: localStorage.getItem('token'),
      email: localStorage.getItem('userEmail'),
      id: localStorage.getItem('id'),
      userName: localStorage.getItem('userName'),
      numero: localStorage.getItem('numero'),
    };
  }

  clearUserData() {
    const keys = ['token', 'userEmail', 'id', 'userName', 'numero'];
    keys.forEach(key => localStorage.removeItem(key));
    console.log('🧹 Datos de usuario eliminados del almacenamiento');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('id');
    const isAuth = !!(token && userId);
    console.log('🔐 Estado de autenticación:', isAuth);
    return isAuth;
  }

  isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  async refreshToken(): Promise<{ success: boolean; token?: string; message?: string }> {
    try {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) return { success: false, message: 'No token available' };

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${currentToken}`
      });

      const response: any = await firstValueFrom(
        this.http.post(`${this.API_URL}/refresh`, {}, { headers })
      );

      if (response?.success && response?.token) {
        localStorage.setItem('token', response.token);
        return { success: true, token: response.token };
      }

      return { success: false, message: 'Failed to refresh token' };
    } catch (error) {
      console.error('Error refreshing token:', error);
      return { success: false, message: 'Error refreshing token' };
    }
  }
}
