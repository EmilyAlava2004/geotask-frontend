import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCheckbox, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonLabel, IonItem } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { IonInput } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {  logoFacebook, 
  logoGoogle,
  lockClosedOutline, 
  mailOutline, 
  eyeOffOutline, 
  eyeOutline,  // ← AGREGAR ESTE ICONO
  logInOutline, 
  personCircleOutline  } from 'ionicons/icons'; // Importar icono de Facebook
import { AuthService } from '../services/auth.service'; // Asegúrate de tener un servicio de autenticación
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonItem,HttpClientModule,IonInput, IonLabel,IonCheckbox, IonIcon, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,]
})
export class LoginPage {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  rememberMe: boolean = false;
  isLoading: boolean = false;


  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService // Asegúrate de tener un servicio de autenticación
  ) {
     addIcons({'logo-facebook': logoFacebook,
      'logo-google': logoGoogle,
      'lock-closed-outline': lockClosedOutline,
      'mail-outline': mailOutline,
      'eye-off-outline': eyeOffOutline,
      'eye-outline': eyeOutline,  // ← IMPORTANTE: Registrar ambos iconos del ojo
      'log-in-outline': logInOutline,
      'person-circle-outline': personCircleOutline}); // Añadir iconos de Ionicons
  }
 @ViewChild('passwordInput', { static: false }) passwordInput!: IonInput;
 ngOnInit() {

  }

   // ✅ CARGAR CREDENCIALES GUARDADAS
  private loadSavedCredentials() {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
  }

  // ✅ ALTERNAR VISIBILIDAD DE CONTRASEÑA
  togglePassword() {
    this.showPassword = !this.showPassword;
    const newType = this.showPassword ? 'text' : 'password';
    if (this.passwordInput) {
      this.passwordInput.type = newType;
    }
  }
 // Alternar visibilidad de contraseña
 
  // Función principal de login
  // 🔧 MÉTODO CORREGIDO para el login
async onLogin() {
    if (!this.validateForm()) return;

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const result = await this.authService.authenticateUser(this.email, this.password);

      if (result.success) {
        await this.showToast('¡Bienvenido! Sesión iniciada correctamente', 'success');

        // ✅ GUARDAR CREDENCIALES SI SE SELECCIONÓ RECORDAR
        if (this.rememberMe) {
          localStorage.setItem('savedEmail', this.email);
        } else {
          localStorage.removeItem('savedEmail');
        }

        // ✅ GUARDAR DATOS DE SESIÓN
        if (result.token) {
          localStorage.setItem('token', result.token);
          console.log('Token guardado correctamente');
        }

        localStorage.setItem('userEmail', this.email);

        if (result.id) {
          localStorage.setItem('id', result.id.toString());
          console.log('ID guardado:', result.id);
        } else {
          console.warn('⚠️ No se recibió ID del usuario');
          await this.showAlert('Advertencia', 'Algunos datos del usuario no están completos. La aplicación podría tener funcionalidad limitada.');
        }

        // ✅ LIMPIAR FORMULARIO
        this.clearForm();
        
        // ✅ NAVEGAR A HOME
        this.router.navigate(['/tabs/home'], { replaceUrl: true });
        
      } else {
        await this.showAlert('Error de autenticación', result.message || 'Credenciales incorrectas');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Ha ocurrido un error inesperado';
      
      if (error?.status === 0) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error?.status === 401) {
        errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
      } else if (error?.status >= 500) {
        errorMessage = 'Error del servidor. Intenta más tarde.';
      }
      
      await this.showAlert('Error', errorMessage);
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }
// ✅ LIMPIAR FORMULARIO
  private clearForm() {
    if (!this.rememberMe) {
      this.email = '';
    }
    this.password = '';
    this.showPassword = false;
  }
  // Validar formulario
  private validateForm(): boolean {
    if (!this.email || !this.password) {
      this.showToast('Por favor, completa todos los campos', 'warning');
      return false;
    }

    if (!this.isValidEmail(this.email)) {
      this.showToast('Por favor, ingresa credenciales válidas', 'warning');
      return false;
    }

    if (this.password.length < 6) {
      this.showToast('La contraseña debe tener al menos 6 caracteres', 'warning');
      return false;
    }

    return true;
  }

  // Validar formato de email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Simular autenticación (reemplazar con tu lógica real)
  private async authenticateUser(email: string, password: string): Promise<boolean> {
  try {
    const response = await this.authService.authenticateUser(email, password);
    console.log('Respuesta del backend:', response);

    // Aquí puedes guardar el token si lo devuelve tu backend
    // localStorage.setItem('token', response.token);

    return true;
  } catch (error) {
    console.error('Error en login:', error);
    return false;
  }
}

  // Guardar credenciales para recordar sesión
  private saveUserCredentials() {
    // Implementar lógica de almacenamiento seguro
    // localStorage.setItem('userEmail', this.email);
    // Nota: Nunca guardes contraseñas en texto plano
    console.log('Guardando credenciales para recordar sesión');
  }

  // Recuperar contraseña
  async forgotPassword() {
    const alert = await this.alertController.create({
      header: 'Recuperar Contraseña',
      message: 'Ingresa tu email para recibir instrucciones de recuperación',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'tu@email.com',
          value: this.email
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar',
          handler: async (data) => {
         if (data.email && this.isValidEmail(data.email)) {
         // Implementar lógica de recuperación
         await this.showToast('Instrucciones enviadas a tu email', 'success');
         return true; // <- Añadido
         } else {
         await this.showToast('Por favor, ingresa credenciales válidas', 'warning');
         return false;
         }
         }
        }
      ]
    });

    await alert.present();
  }

  // Ir a registro
  goToSignup() {
    this.router.navigate(['/registrer']);
  }

  // Login con Google
  async loginWithGoogle() {
    const loading = await this.loadingController.create({
      message: 'Conectando con Google...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Implementar lógica de Google Sign-In
      // const result = await this.googleAuth.signIn();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
      
      await this.showToast('Próximamente: Login con Google', 'primary');
    } catch (error) {
      await this.showAlert('Error', 'No se pudo conectar con Google');
    } finally {
      await loading.dismiss();
    }
  }

  // Login con Facebook
  async loginWithFacebook() {
    const loading = await this.loadingController.create({
      message: 'Conectando con Facebook...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Implementar lógica de Facebook Login
      // const result = await this.facebookAuth.login();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
      
      await this.showToast('Próximamente: Login con Facebook', 'primary');
    } catch (error) {
      await this.showAlert('Error', 'No se pudo conectar con Facebook');
    } finally {
      await loading.dismiss();
    }
  }

  // Mostrar toast
  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  // Mostrar alerta
  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
  
}