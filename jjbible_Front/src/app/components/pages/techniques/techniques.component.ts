import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TechniqueService } from '@services';
import { AuthService } from '@services';
import { Technique, NiveauMaitrise } from '@models';
import { TechniqueCardComponent } from '@components';
import { TechniqueFormComponent } from '@components';

interface CategoryGroup {
  name: string;
  techniques: Technique[];
  collapsed: boolean;
}

@Component({
  selector: 'app-techniques',
  standalone: true,
  imports: [CommonModule, FormsModule, TechniqueCardComponent, TechniqueFormComponent],
  templateUrl: './techniques.component.html',
  styleUrls: ['./techniques.component.scss']
})
export class TechniquesComponent implements OnInit {
  myTechniques: Technique[] = [];
  groups: CategoryGroup[] = [];
  searchResults: Technique[] = [];
  query = '';
  scope: 'all' | 'mine' | 'public' = 'mine';

  formOpen = false;
  editing: Technique | null = null;

  collapsedState: Record<string, boolean> = {};

  constructor(private techService: TechniqueService, public auth: AuthService) {}

  ngOnInit() { this.loadMine(); }

  loadMine() {
    this.techService.getMine().subscribe(t => {
      this.myTechniques = t;
      this.rebuildGroups();
    });
  }

  rebuildGroups() {
    const map = new Map<string, Technique[]>();
    for (const t of this.myTechniques) {
      const cat = t.categorie || 'Sans catégorie';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(t);
    }
    this.groups = Array.from(map.entries())
      .map(([name, techs]) => ({
        name,
        techniques: techs.sort((a, b) => {
          if (!!b.favori !== !!a.favori) return (b.favori ? 1 : 0) - (a.favori ? 1 : 0);
          return a.nom.localeCompare(b.nom);
        }),
        collapsed: this.collapsedState[name] ?? false
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  toggleCollapse(g: CategoryGroup) {
    g.collapsed = !g.collapsed;
    this.collapsedState[g.name] = g.collapsed;
  }

  get filteredGroups(): CategoryGroup[] {
    if (!this.query.trim()) return this.groups;
    const q = this.query.toLowerCase();
    return this.groups
      .map(g => ({
        ...g,
        techniques: g.techniques.filter(t =>
          t.nom.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          (t.categorie || '').toLowerCase().includes(q)
        )
      }))
      .filter(g => g.techniques.length > 0);
  }

  setScope(s: 'all' | 'mine' | 'public') {
    this.scope = s;
    this.onSearch();
  }

  onSearch() {
    if (this.scope === 'mine' || !this.query.trim()) {
      this.searchResults = [];
      return;
    }
    this.techService.search(this.query, this.scope).subscribe(r => this.searchResults = r);
  }

  isInMine(id: number): boolean {
    return this.myTechniques.some(t => t.id === id);
  }

  openCreate() {
    this.editing = null;
    this.formOpen = true;
  }

  openEdit(t: Technique) {
    this.editing = t;
    this.formOpen = true;
  }

  closeForm() {
    this.formOpen = false;
    this.editing = null;
  }

  onSave() {
    this.closeForm();
    this.loadMine();
  }

  toggleFavori(t: Technique) {
    this.techService.toggleFavori(t.id).subscribe(res => {
      t.favori = res.favori;
      this.rebuildGroups();
    });
  }

  onMaitriseChanged(event: { technique: Technique; niveau: NiveauMaitrise }) {
    this.techService.setMaitrise(event.technique.id, event.niveau).subscribe(res => {
      event.technique.niveau_maitrise = res.niveau_maitrise;
    });
  }

  addToPokedex(t: Technique) {
    this.techService.addToPokedex(t.id).subscribe(() => this.loadMine());
  }

  removeFromPokedex(t: Technique) {
    if (!confirm(`Retirer "${t.nom}" de ton pokédex ?`)) return;
    this.techService.removeFromPokedex(t.id).subscribe(() => this.loadMine());
  }

  deleteTechnique(t: Technique) {
    if (!confirm(`Supprimer définitivement "${t.nom}" ?`)) return;
    this.techService.delete(t.id).subscribe(() => this.loadMine());
  }
}
