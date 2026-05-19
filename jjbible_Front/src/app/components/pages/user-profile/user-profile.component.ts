import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '@services';
import { UserProfile, Technique } from '@models';
import { TechniqueCardComponent } from '@components';
import { BeltDisplayComponent } from '@components';

interface CategoryGroup {
  name: string;
  techniques: Technique[];
  collapsed: boolean;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, TechniqueCardComponent, BeltDisplayComponent],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  favorites: Technique[] = [];
  groups: CategoryGroup[] = [];

  constructor(private route: ActivatedRoute, private userService: UserService) {}

  ngOnInit() {
    this.route.params.subscribe(p => {
      const id = Number(p['id']);
      this.userService.getProfile(id).subscribe(u => {
        this.profile = u;
        this.favorites = u.techniques.filter(t => t.favori);
        this.buildGroups(u.techniques);
      });
    });
  }

  private buildGroups(techniques: Technique[]) {
    const map = new Map<string, Technique[]>();
    for (const t of techniques) {
      const cat = t.categorie || 'Sans catégorie';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(t);
    }
    this.groups = Array.from(map.entries())
      .map(([name, techs]) => ({
        name,
        techniques: techs.sort((a, b) => a.nom.localeCompare(b.nom)),
        collapsed: false
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
