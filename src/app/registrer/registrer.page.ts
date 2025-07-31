import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCheckbox,IonButton, IonIcon, IonLabel, IonItem } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { IonInput } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoFacebook, logoGoogle, callOutline,lockClosedOutline, mailOutline, eyeOffOutline, eyeOutline, personAddOutline, personCircleOutline, personOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-registrer',
  templateUrl: './registrer.page.html',
  styleUrls: ['./registrer.page.scss'],
  standalone: true,
    imports: [IonItem, IonInput, IonLabel, IonCheckbox, IonIcon, IonButton, IonContent, CommonModule, FormsModule]
})
export class RegistrerPage  {


  user: string = '';
  email: string = '';
  password: string = '';
  numero:string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  acceptTerms: boolean = false;

  constructor(
     private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService
  ) {
     addIcons({
      logoFacebook,
      logoGoogle,
      lockClosedOutline,
      mailOutline,
      eyeOffOutline,
      eyeOutline,
      personAddOutline,
      personCircleOutline,
      personOutline,
      checkmarkCircleOutline,
      callOutline
    });
   }

  @ViewChild('passwordInput', { static: false }) passwordInput!: IonInput;
  @ViewChild('confirmPasswordInput', { static: false }) confirmPasswordInput!: IonInput;

  togglePassword() {
    this.showPassword = !this.showPassword;
    const newType = this.showPassword ? 'text' : 'password';
    this.passwordInput.type = newType;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
    const newType = this.showConfirmPassword ? 'text' : 'password';
    this.confirmPasswordInput.type = newType;
  }

  // ✅ FUNCIÓN PRINCIPAL DE REGISTRO MEJORADA
  async onSignup() {
    if (!this.validateForm()) return;

    const loading = await this.loadingController.create({
      message: 'Creando cuenta...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const result = await this.authService.registerUser({
        user: this.user,
        email: this.email,
        password: this.password,
        numero: this.numero
      });

      console.log('Resultado del registro:', result);

      // ✅ VERIFICAR REGISTRO EXITOSO Y GUARDAR DATOS AUTOMÁTICAMENTE
      if (result && result.users && result.token) {
        // 🔐 GUARDAR TOKEN DE AUTENTICACIÓN
        localStorage.setItem('token', result.token);
        console.log('Token guardado:', result.token);

        // 👤 GUARDAR EMAIL DEL USUARIO
        localStorage.setItem('userEmail', this.email);
        console.log('Email guardado:', this.email);

        // 🆔 GUARDAR ID DEL USUARIO (si está disponible)
        if (result.users.id) {
          localStorage.setItem('id', result.users.id.toString());
          console.log('ID guardado:', result.users.id);
        } else if (result.id) {
          localStorage.setItem('id', result.id.toString());
          console.log('ID guardado desde result.id:', result.id);
        }

        // 📝 GUARDAR NOMBRE DE USUARIO (opcional, útil para comentarios)
        localStorage.setItem('userName', result.users.user || this.user);
        console.log('Nombre de usuario guardado:', result.users.user || this.user);

        // ✅ VERIFICAR QUE TODOS LOS DATOS SE GUARDARON CORRECTAMENTE
        console.log('=== VERIFICACIÓN DE DATOS GUARDADOS ===');
        console.log('Token:', localStorage.getItem('token'));
        console.log('Email:', localStorage.getItem('userEmail'));
        console.log('ID:', localStorage.getItem('id'));
        console.log('Nombre:', localStorage.getItem('userName'));

        // 🎉 MOSTRAR MENSAJE DE ÉXITO
        await this.showToast('¡Cuenta creada exitosamente! Ya puedes agregar comentarios.', 'success');

        // 👋 MOSTRAR ALERTA DE BIENVENIDA
        await this.showWelcomeAlert(result.users.user || this.user);

        // 🚀 REDIRIGIR A HOME (usuario ya autenticado automáticamente)
        this.router.navigate(['/tabs/home']);

      } else {
        // ❌ ERROR EN EL REGISTRO
        await this.showAlert('Error de registro', result?.message || 'Error al crear la cuenta');
      }
    } catch (error) {
      console.error('Signup error:', error);
      await this.showAlert('Error', 'Ha ocurrido un error inesperado al crear la cuenta');
    } finally {
      await loading.dismiss();
    }
  }

  private validateForm(): boolean {
    if (!this.user || !this.email || !this.password || !this.confirmPassword) {
      this.showToast('Por favor, completa todos los campos', 'warning');
      return false;
    }

    if (this.user.trim().length < 2) {
      this.showToast('El nombre debe tener al menos 2 caracteres', 'warning');
      return false;
    }

    if (!this.isValidEmail(this.email)) {
      this.showToast('Por favor, ingresa un email válido', 'warning');
      return false;
    }

    if (this.password.length < 6) {
      this.showToast('La contraseña debe tener al menos 6 caracteres', 'warning');
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.showToast('Las contraseñas no coinciden', 'warning');
      return false;
    }

    if (!this.acceptTerms) {
      this.showToast('Debes aceptar los términos y condiciones', 'warning');
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ✅ MENSAJE DE BIENVENIDA MEJORADO
  private async showWelcomeAlert(nombre: string) {
    const alert = await this.alertController.create({
      header: '¡Bienvenido!',
      message: `Hola ${nombre}, tu cuenta ha sido creada exitosamente. Ya estás autenticado y puedes comenzar a usar la aplicación.`,
      buttons: [
        {
          text: 'Comenzar',
          cssClass: 'primary'
        }
      ]
    });

    await alert.present();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  async signupWithGoogle() {
    const loading = await this.loadingController.create({
      message: 'Conectando con Google...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.showToast('Próximamente: Registro con Google', 'primary');
    } catch (error) {
      await this.showAlert('Error', 'No se pudo conectar con Google');
    } finally {
      await loading.dismiss();
    }
  }

  async signupWithFacebook() {
    const loading = await this.loadingController.create({
      message: 'Conectando con Facebook...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.showToast('Próximamente: Registro con Facebook', 'primary');
    } catch (error) {
      await this.showAlert('Error', 'No se pudo conectar con Facebook');
    } finally {
      await loading.dismiss();
    }
  }

  async showTermsAndConditions() {
  const alert = await this.alertController.create({
    header: 'Términos y Condiciones',
    message: `
      GeoTask Manager
      es una aplicación desarrollada con fines académicos que permite gestionar tareas asociadas a ubicaciones geográficas en tiempo real.

      Al utilizar esta aplicación, usted acepta el uso de su ubicación para ofrecer funciones como alertas de proximidad, cálculo de rutas y visualización de tareas en mapas.

      La información proporcionada (nombre, correo, tareas, ubicaciones) será utilizada únicamente para el funcionamiento interno de la app. Sus datos estarán protegidos mediante autenticación segura con JWT y cifrado de contraseñas.

      Esta aplicación requiere conexión a Internet para sincronización, aunque permite funcionamiento básico en modo offline.

      El uso indebido de la app o la alteración del sistema puede conllevar la restricción de acceso.
      
      Gracias por utilizar GeoTask Manager.
    `,
    buttons: [
      {
        text: 'Cerrar',
        role: 'cancel'
      },
      {
        text: 'Aceptar',
        handler: () => {
          this.acceptTerms = true;
        }
      }
    ]
  });

  await alert.present();
}


  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 4000, // Un poco más de tiempo para leer el mensaje
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

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
