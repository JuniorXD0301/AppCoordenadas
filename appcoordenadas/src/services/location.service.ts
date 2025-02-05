import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  locationDetector,
} from 'location-detector/dist/esm';
@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor() {}

  async detectarUbicacionFalsa(): Promise<boolean> {
    try {
      // Detectamos si estamos en una plataforma nativa (Android/iOS)
      if (
        Capacitor.getPlatform() === 'android' ||
        Capacitor.getPlatform() === 'ios'
      ) {
        // En plataformas nativas, llamamos al método real del plugin
        const result = await locationDetector.detectFakeLocation();
        return result.isFake; // Aquí obtienes el valor real en Android/iOS
      } else {
        // En la web, siempre devuelve false
        console.warn(
          '⚠ Detectando ubicación falsa en la web. Siempre devuelve false.',
        );
        return false;
      }
    } catch (error) {
      console.error('Error detectando ubicación falsa:', error);
      return false; // Devolvemos false en caso de error
    }
  }
}
