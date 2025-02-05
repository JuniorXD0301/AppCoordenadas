import { Injectable } from '@angular/core';
import {
  locationDetector,
  locationDetectorPlugin,
} from 'location-detector/dist/esm';
@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor() { }

  async detectarUbicacionFalsa(): Promise<boolean> {
    try {
      const result = await locationDetector.detectFakeLocation();
      return result.isFake;
    } catch (error) {
      console.error('Error detectando ubicación falsa:', error);
      return false;
    }
  }
}
