import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '@services';
import { CurrentUserService } from '@store';
import { TechniqueService } from '@services';
import { Ceinture, User, Technique } from '@models';
import { BeltDisplayComponent } from '@components';
import { TechniqueCardComponent } from '@components';
import { CategoryPieComponent } from '@components';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, BeltDisplayComponent, TechniqueCardComponent, CategoryPieComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  ceintures: Ceinture[] = [];
  allTechniques: Technique[] = [];
  favorites: Technique[] = [];
  categoryStats: Record<string, number> = {};
  stats: Record<string, number> = {};
  totalTechniques = 0;
  bio = '';
  saving = false;

  constructor(
    private userService: UserService,
    private currentUser: CurrentUserService,
    private techService: TechniqueService
  ) {}

  // Getter qui lit le signal du service partagé
  get me(): User | null { return this.currentUser.user(); }

  ngOnInit() {
    this.userService.getCeintures().subscribe(c => this.ceintures = c);
    if (this.me) this.bio = this.me.bio || '';
    this.loadTechniques();
  }

  loadTechniques() {
    this.techService.getMine().subscribe(list => {
      this.allTechniques = list;
      this.totalTechniques = list.length;
      this.favorites = list.filter(t => t.favori);
      this.computeStats();
    });
  }

  computeStats() {
    this.categoryStats = {};
    for (const t of this.allTechniques) {
      const cat = t.categorie || 'Sans catégorie';
      this.categoryStats[cat] = (this.categoryStats[cat] || 0) + 1;
    }
    this.stats = { non_maitrise: 0, en_cours: 0, maitrise: 0 };
    for (const t of this.allTechniques) {
      const n = t.niveau_maitrise || 'non_maitrise';
      this.stats[n] = (this.stats[n] || 0) + 1;
    }
  }

  selectBelt(c: Ceinture) {
    this.userService.updateMe({ ceinture_id: c.id }).subscribe(u => {
      // Met à jour le service global → l'app entière (header inclus) se rafraîchit
      this.currentUser.setUser(u);
    });
  }

  setBarrettes(n: number) {
    this.userService.updateMe({ barrettes: n }).subscribe(u => {
      this.currentUser.setUser(u);
    });
  }

  saveBio() {
    this.saving = true;
    this.userService.updateMe({ bio: this.bio }).subscribe({
      next: u => { this.currentUser.setUser(u); this.saving = false; },
      error: () => this.saving = false
    });
  }

  onToggleFavori(t: Technique) {
    this.techService.toggleFavori(t.id).subscribe(() => this.loadTechniques());
  }
}
