import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Slice {
  name: string;
  count: number;
  percent: number;
  color: string;
  pathD: string;
  midAngle: number;
}

/**
 * Camembert SVG pur (sans bibliothèque externe).
 * Génère les chemins SVG via des calculs trigonométriques classiques.
 */
@Component({
  selector: 'app-category-pie',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-pie.component.html',
  styleUrls: ['./category-pie.component.scss']
})
export class CategoryPieComponent implements OnChanges {
  /** Map catégorie → nombre de techniques */
  @Input() data: Record<string, number> = {};

  slices: Slice[] = [];
  total = 0;

  // Palette accessible et harmonieuse (couleurs distinctes)
  private static PALETTE = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
    '#06b6d4', '#a855f7', '#eab308', '#dc2626'
  ];

  ngOnChanges() { this.compute(); }

  private compute() {
    const entries = Object.entries(this.data).filter(([_, v]) => v > 0);
    this.total = entries.reduce((acc, [, v]) => acc + v, 0);

    if (this.total === 0) {
      this.slices = [];
      return;
    }

    // Si une seule catégorie, afficher un cercle complet (cas particulier SVG)
    if (entries.length === 1) {
      const [name, count] = entries[0];
      this.slices = [{
        name,
        count,
        percent: 100,
        color: CategoryPieComponent.PALETTE[0],
        pathD: this.fullCirclePath(100),
        midAngle: 0
      }];
      return;
    }

    let cumul = 0;
    this.slices = entries.map(([name, count], i) => {
      const angle = (count / this.total) * 360;
      const startAngle = cumul;
      const endAngle = cumul + angle;
      const midAngle = (startAngle + endAngle) / 2;
      cumul = endAngle;
      return {
        name,
        count,
        percent: (count / this.total) * 100,
        color: CategoryPieComponent.PALETTE[i % CategoryPieComponent.PALETTE.length],
        pathD: this.arcPath(100, startAngle, endAngle),
        midAngle
      };
    });
  }

  /** Calcule un chemin SVG d'arc circulaire entre deux angles (en degrés) */
  private arcPath(r: number, startDeg: number, endDeg: number): string {
    const start = this.polarToCart(r, startDeg);
    const end = this.polarToCart(r, endDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M 0 0 L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  }

  /** Cas particulier : cercle complet (un seul slice) */
  private fullCirclePath(r: number): string {
    return `M ${r} 0 A ${r} ${r} 0 1 1 ${-r} 0 A ${r} ${r} 0 1 1 ${r} 0 Z`;
  }

  private polarToCart(r: number, angleDeg: number) {
    // Angle 0° = haut du cercle, sens horaire
    const rad = (angleDeg - 90) * (Math.PI / 180);
    return { x: r * Math.cos(rad), y: r * Math.sin(rad) };
  }
}
