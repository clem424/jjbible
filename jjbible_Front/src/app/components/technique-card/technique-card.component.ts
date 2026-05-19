import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Technique, NiveauMaitrise } from '@models';
import { NIVEAU_LABELS, NIVEAU_COLORS, NIVEAU_ICONS } from '@data';
import { SafeUrlPipe } from '@shared';
import { toEmbedUrl } from '@strategies';

@Component({
  selector: 'app-technique-card',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  templateUrl: './technique-card.component.html',
  styleUrls: ['./technique-card.component.scss']
})
export class TechniqueCardComponent {
  @Input() technique!: Technique;
  @Input() canFavori = true;
  @Input() canEditMaitrise = false;
  @Output() toggleFavori = new EventEmitter<Technique>();
  @Output() maitriseChanged = new EventEmitter<{ technique: Technique; niveau: NiveauMaitrise }>();

  showVideo = false;
  niveaux: NiveauMaitrise[] = ['non_maitrise', 'en_cours', 'maitrise'];

  embedUrl(): string | null {
    return toEmbedUrl(this.technique.url_video);
  }

  niveauLabel(n: NiveauMaitrise): string { return NIVEAU_LABELS[n]; }
  niveauColor(n: NiveauMaitrise): string { return NIVEAU_COLORS[n]; }
  niveauIcon(n: NiveauMaitrise): string { return NIVEAU_ICONS[n]; }

  onMaitriseChange(niveau: NiveauMaitrise) {
    if (niveau === this.technique.niveau_maitrise) return;
    this.maitriseChanged.emit({ technique: this.technique, niveau });
  }
}
