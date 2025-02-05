import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController, ToastController } from '@ionic/angular';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import { locationDetector } from 'location-detector/dist/esm';

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
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LocationService } from 'src/services/location.service';

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
    HttpClientModule,
  ],
})
export class HomePage implements OnInit {
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private snackbar: ToastController,
    private http: HttpClient,
    private locationService: LocationService,
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
        const esUbicacionFalsa =
          await this.locationService.detectarUbicacionFalsa();

        if (esUbicacionFalsa) {
          this.mostrarAlerta(
            'Advertencia',
            'Se detectó una ubicación falsa. Acceso denegado.',
          );
          return;
        }

        const coordenadas = await this.getCoordenadasActuales();
        this.mostrarAlerta(
          'Saludo',
          `Hola ${nombre}, tus coordenadas son:<br>
          📍 Latitud: ${coordenadas.latitud}, Longitud: ${coordenadas.longitud}`,
        );
      } catch (error: any) {
        this.mostrarAlerta('Error', error.message);
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
        error,
      );
      return 'denied';
    }
  }

  async getCoordenadasActuales(): Promise<{
    latitud: number;
    longitud: number;
  }> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Verificar ubicación con Google Maps API
      const esUbicacionValida = await this.validarUbicacionReal(lat, lng);

      if (!esUbicacionValida) {
        throw new Error('Ubicación falsa detectada.');
      }

      return { latitud: lat, longitud: lng };
    } catch (error) {
      throw new Error(error.message || 'Error obteniendo ubicación.');
    }
  }

  async validarUbicacionReal(lat: number, lng: number): Promise<boolean> {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBxYn47F0x7C9rVp1tewqNh3AY04VXZN-g`;
      const response: any = await this.http.get(url).toPromise();

      if (!response || response.status !== 'OK') {
        return false; // Ubicación sospechosa
      }

      return true; // Ubicación válida
    } catch (error) {
      console.error('Error validando ubicación con Google:', error);
      return false; // Fallo en la validación
    }
  }

  // Función para mostrar alertas
  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async test(msg: string) {
    await locationDetector.testPluginMethod({ msg: msg }).then((res: any) => {
      alert('Return value is ' + JSON.stringify(res.value));
    });
  }
}
