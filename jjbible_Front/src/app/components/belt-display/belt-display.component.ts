import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Représentation visuelle d'une ceinture JJB.
 * - mode 'compact' : petite ceinture (16px), pour les listes
 * - mode 'normal' : ceinture standard (28px)
 * - mode 'hero' : grande ceinture avec broderie du pseudo + barrettes (48px)
 */
@Component({
  selector: 'app-belt-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './belt-display.component.html',
  styleUrls: ['./belt-display.component.scss']
})
export class BeltDisplayComponent {
  @Input() primaryColor = '#1E63D6';
  @Input() beltName = 'Bleue';
  @Input() barrettes = 0;
  @Input() size: 'compact' | 'normal' | 'hero' = 'normal';
  @Input() label = '';

  // La barre à l'extrémité est noire (red bar pour la noire, black pour la rouge)
  tipColor(): string {
    const n = this.beltName?.toLowerCase();
    if (n === 'noire') return '#C62828';
    return '#212121';
  }

  barresArray(): number[] {
    const n = Math.max(0, Math.min(4, this.barrettes || 0));
    return Array(n).fill(0);
  }
}
