import { Component, Input, Output, EventEmitter, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, switchMap } from 'rxjs';
import { Technique, Liaison } from '@models';
import { UserService, TechniqueService } from '@services';

type Relation = 'precede' | 'equivaut' | 'suit';

interface LinkRow {
  cibleId: number | null;
  relation: Relation;
}

interface ExistingLink {
  liaisonId: number;
  label: string;
}

@Component({
  selector: 'app-technique-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './technique-form.component.html',
  styleUrls: ['./technique-form.component.scss']
})
export class TechniqueFormComponent implements OnInit, OnChanges {
  @Input() technique: Technique | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  categories: string[] = [];
  data: Partial<Technique> = this.empty();
  error = '';
  saving = false;

  allTechniques: Technique[] = [];
  private nameById = new Map<number, string>();

  // Une ligne = une liaison a creer. L'utilisateur ajoute/supprime des lignes.
  links: LinkRow[] = [];
  // Liaisons deja enregistrees (mode edition)
  existingLinks: ExistingLink[] = [];

  constructor(
    private userService: UserService,
    private techService: TechniqueService
  ) {}

  ngOnInit() {
    this.userService.getCategories().subscribe(c => (this.categories = c));
    this.techService.getMine().subscribe(list => {
      this.allTechniques = list;
      this.nameById = new Map(list.map(t => [t.id, t.nom]));
      this.loadExistingLinks();
    });
    this.resetData();
  }

  ngOnChanges() {
    this.resetData();
    this.links = [];
    this.existingLinks = [];
    if (this.allTechniques.length) this.loadExistingLinks();
  }

  get linkCandidates(): Technique[] {
    const curId = this.technique?.id;
    return this.allTechniques.filter(t => t.id !== curId);
  }

  private resetData() {
    this.data = this.technique ? { ...this.technique } : this.empty();
  }

  private empty(): Partial<Technique> {
    return { nom: '', description: '', url_video: '', categorie: '', visibilite: 'privee' };
  }

  private nom(id: number): string {
    return this.nameById.get(id) || ('Technique #' + id);
  }

  // ---- lignes de liaison (dynamiques) ----
  addLinkRow() {
    this.links.push({ cibleId: null, relation: 'precede' });
  }

  removeLinkRow(i: number) {
    this.links.splice(i, 1);
  }

  // ---- liaisons existantes (edition) ----
  private loadExistingLinks() {
    const id = this.technique?.id;
    if (!id) return;
    this.techService.getLiaisons(id).subscribe(liens => {
      this.existingLinks = liens.map(l => ({
        liaisonId: l.id,
        label: this.describe(l, id)
      }));
    });
  }

  private describe(l: Liaison, curId: number): string {
    if (l.type === 'variation') {
      const other = l.source_id === curId ? l.cible_id : l.source_id;
      return 'equivaut a \u00ab ' + this.nom(other) + ' \u00bb';
    }
    if (l.source_id === curId) return 'precede \u00ab ' + this.nom(l.cible_id) + ' \u00bb';
    return 'suit \u00ab ' + this.nom(l.source_id) + ' \u00bb';
  }

  removeExistingLink(link: ExistingLink) {
    this.techService.deleteLiaison(link.liaisonId).subscribe(() => {
      this.existingLinks = this.existingLinks.filter(e => e !== link);
    });
  }

  // ---- enregistrement : technique puis liaisons ----
  submit() {
    if (!this.data.nom) {
      this.error = 'Le nom est requis';
      return;
    }
    this.saving = true;
    this.error = '';

    const save$ = this.technique?.id
      ? this.techService.update(this.technique.id, this.data)
      : this.techService.create(this.data);

    save$
      .pipe(
        switchMap(savedTech => {
          const id = savedTech.id;
          const rows = this.links.filter(l => l.cibleId != null);
          if (!rows.length) return of([] as unknown[]);
          const calls = rows.map(l => {
            const cible = l.cibleId as number;
            if (l.relation === 'precede') {
              return this.techService.createLiaison(id, cible, 'apres', 'enchainement');
            }
            if (l.relation === 'suit') {
              return this.techService.createLiaison(id, cible, 'avant', 'enchainement');
            }
            return this.techService.createLiaison(id, cible, 'apres', 'variation');
          });
          return forkJoin(calls);
        })
      )
      .subscribe({
        next: () => {
          this.saving = false;
          this.saved.emit();
        },
        error: () => {
          this.saving = false;
          this.error = "Erreur lors de l'enregistrement";
        }
      });
  }

  close() {
    this.closed.emit();
  }
}
