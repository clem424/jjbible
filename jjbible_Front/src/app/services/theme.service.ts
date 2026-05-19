import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  // Calcule la luminance pour choisir le texte (blanc/noir) sur la ceinture
  private getLuminance(hex: string): number {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16) / 255;
    const g = parseInt(c.substring(2, 4), 16) / 255;
    const b = parseInt(c.substring(4, 6), 16) / 255;
    const lum = (v: number) => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    return 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
  }

  applyBeltColor(primary: string, secondary: string) {
    const root = document.documentElement;
    root.style.setProperty('--belt-primary', primary);
    root.style.setProperty('--belt-secondary', secondary || primary);
    const textColor = this.getLuminance(primary) > 0.55 ? '#1a1a1a' : '#ffffff';
    root.style.setProperty('--belt-text-on-belt', textColor);
  }

  reset() {
    this.applyBeltColor('#1E63D6', '#0D47A1');
  }
}
