import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController, ToastController, IonicModule  } from '@ionic/angular';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';


import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonText,
} from '@ionic/angular/standalone';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonInput,
    IonItem,
    FormsModule,
    IonText,
    ReactiveFormsModule,
    CommonModule,
  ],
})
export class HomePage implements OnInit {
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private snackbar: ToastController
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
    });
  }

  async saludar() {
    if (this.form.valid) {
      const nombre = this.form.controls['nombre'].value;

      try {
        // Verificar permisos de geolocalización
        const permiso = await this.getPermisoGeolocalizacion();

        if (permiso === 'denied') {
          const alert = await this.alertController.create({
            header: 'Permiso Requerido',
            message:
              'Es necesario otorgar permisos de ubicación para continuar.',
            buttons: ['OK'],
          });
          await alert.present();
          return;
        }

        // Obtener coordenadas
        const coordenadas = await this.getCoordenadasActuales();

        if (coordenadas.latitud && coordenadas.longitud) {
          const alert = await this.alertController.create({
            header: 'Saludo',
            message: `Hola ${nombre}, estas son tus coordenadas: Latitud: ${coordenadas.latitud}, Longitud: ${coordenadas.longitud}`,
            buttons: ['OK'],
          });
          
          await alert.present();
        } else {
          throw new Error(
            coordenadas.mensaje || 'Error desconocido al obtener coordenadas.'
          );
        }
      } catch (error: any) {
        console.error('Error en la función saludar:', error);
        const alert = await this.alertController.create({
          header: 'Error',
          message:
            'No se pudo obtener la ubicación. Por favor, inténtalo de nuevo.',
          buttons: ['OK'],
        });
        await alert.present();
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  async getPermisoGeolocalizacion(): Promise<string> {
    try {
      const permiso: PermissionStatus = await Geolocation.checkPermissions();
      
      if (permiso.location === 'denied') {
        const solicitud = await Geolocation.requestPermissions();
        return solicitud.location;
      }
      
      return permiso.location;
    } catch (error) {
      console.error(
        'Error al comprobar los permisos de geolocalización:',
        error
      );
      return 'denied';
    }
  }

  async getCoordenadasActuales(): Promise<{
    latitud?: number;
    longitud?: number;
    mensaje?: string;
  }> {
    const tiempoDeEspera = 15000; // 15 segundos

    const tiempoDeEsperaPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject({ message: 'Tiempo de espera agotado' });
      }, tiempoDeEspera);
    });

    try {
      const coordenadas: any = await Promise.race([
        Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          maximumAge: 0,
        }),
        tiempoDeEsperaPromise,
      ]);
      
      return {
        latitud: coordenadas.coords.latitude,
        longitud: coordenadas.coords.longitude,
      };
    } catch (error: any) {
      console.error('Error al obtener las coordenadas:', error);
      // Mostrar un toast cuando ocurra un error
      const toast = await this.snackbar.create({
        message:
          'No se ha podido capturar las coordenadas. Inténtelo nuevamente',
        duration: 5000, // Duración del toast en milisegundos
        position: 'top', // Posición del toast en la pantalla
      });
      toast.present();
      return { mensaje: error.message || 'Error desconocido' };
    }
  }
}
