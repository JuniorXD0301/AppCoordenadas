import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController } from '@ionic/angular';
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
import { Plugins } from '@capacitor/core';

const { Geolocation } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
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
  constructor(private fb: FormBuilder, private alertController: AlertController) {}

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
        const position = await Geolocation['getCurrentPosition']();
        const coords = `Latitud: ${position.coords.latitude}, Longitud: ${position.coords.longitude}`;
        const alert = await this.alertController.create({
          header: 'Saludo',
          message: `Hola ${nombre}, estas son tus coordenadas: ${coords}`,
          buttons: ['OK']
        });
        await alert.present();
      } catch (error) {
        console.error('Error al obtener las coordenadas', error);
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Error al obtener las coordenadas',
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      this.form.markAllAsTouched();
    }
  }
}
