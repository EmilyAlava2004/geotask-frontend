# GeoTask Manager - Fronted

Aplicación movil desarrollada con Ionic + Angular, enfocada en la gestión inteligente

de tareas basada en la geolocalización. Parte del proyecto, también cuenta con el Backend.

## Características principales

Navegación por pestañas.

Gestión de tareas

Visualización de tareas en el mapa con marcadores

Geolocalización en tiempo real

Notificaciones push

Funcionalidades offline 

## Instalación y Ejecución

1. Clonar el repositorio

   git clone https://github.com/EmilyAlava2004/geotask-frontend.git

   cd geotask-fronted

3. Instalar dependecias

   npm install o npm i

4. Ejecutar en entorno de desarrollador

   ionic serve o ionic s

# Variables de Entorno 

API_URL base del backend (Node.js/Express)

GOOGLE_MAPS_API_KEY Clave de API para Google Maps

# Script 

npm install (instala las dependencias)

ionic serve (Ejecuta en el navegador para desarrollo)

ionic build (Compila la app para producción)

### Notas

Este proyecto está diseñado para integrarse con el backen geotask-backend


## *Arquitectura del Sistema*

mermaid
graph TD

    A[App Frontend - Angular Ionic] -->|API REST| B(Backend Node.js Express)
    
    B --> C[(MySQL)]
    
    B --> D[Servicios de Autenticación JWT]
    
    A --> E[Firebase Auth]
    
    A --> F[Geolocalización nativa Capacitor]
    
    A --> G[Google Maps API]


## *🧩 Diagrama de Arquitectura del Frontend*

mermaid
graph TD

    A[app.component.ts Servidor Principal] --> B[Router]
    
    B --> B1[login/]
    
    B --> B2[home/]
    
    B --> B3[mapa/]
    
    B --> B4[tareas/]
    
    B --> B5[perfil/]
    
    B --> B6[registrer/]
    
    B --> B7[settings/]

    A --> C[Guards]
    C --> C1[AuthGuard]
    C --> C2[RouteGuard]

    A --> D[Interceptors]  
    D --> D1[AuthInterceptor]
    D --> D2[HttpInterceptor]

    B1 --> E1[LoginPage]
    B2 --> E2[HomePage]
    B3 --> E3[MapaPage]
    B4 --> E4[TareasPage]
    B5 --> E5[PerfilPage]
    B6 --> E6[RegisterPage]
    B7 --> E7[SettingsPage]

    E1 --> F1[AuthService]
    E2 --> F1
    E3 --> F2[MapService]
    E4 --> F3[TaskService]
    E5 --> F4[UserService]
    E6 --> F1
    E7 --> F4

    A --> G[Firebase Config]
    A --> H[Environment Config]

    F1 --> I[Firebase Auth]
    F2 --> J[Google Maps API]  
    F3 --> K[Backend API]
    F4 --> K

    K --> L[Base de Datos MySQL Backend]
