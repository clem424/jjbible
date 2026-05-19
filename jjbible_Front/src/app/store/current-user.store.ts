import { Injectable, signal } from '@angular/core';
import { User } from '@models';
import { UserService } from '@services';
import { ThemeService } from '@services';

/**
 * Service global qui maintient l'état de l'utilisateur connecté.
 * Utilise un signal Angular pour que tous les composants qui en dépendent
 * se mettent à jour automatiquement quand on appelle refresh() ou setUser().
 *
 * Évite d'avoir à recharger la page après un changement de ceinture/barrettes.
 */
@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  user = signal<User | null>(null);

  constructor(
    private userService: UserService,
    private theme: ThemeService
  ) {}

  /** Recharge l'utilisateur depuis l'API et applique le thème */
  refresh() {
    this.userService.getMe().subscribe({
      next: u => this.setUser(u),
      error: () => this.user.set(null)
    });
  }

  /** Met à jour le user et applique le thème associé */
  setUser(u: User | null) {
    this.user.set(u);
    if (u?.couleur_hex) {
      this.theme.applyBeltColor(u.couleur_hex, u.couleur_secondaire || u.couleur_hex);
    }
  }

  clear() {
    this.user.set(null);
    this.theme.reset();
  }
}
