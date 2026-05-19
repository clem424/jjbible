import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@services';
import { CurrentUserService } from '@store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  mode: 'login' | 'register' = 'login';
  pseudo = '';
  email = '';
  motDePasse = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private currentUser: CurrentUserService,
    private router: Router
  ) {}

  submit() {
    this.error = '';
    if (!this.pseudo || !this.motDePasse || (this.mode === 'register' && !this.email)) {
      this.error = 'Remplis tous les champs';
      return;
    }
    this.loading = true;
    const obs = this.mode === 'login'
      ? this.auth.login(this.pseudo, this.motDePasse)
      : this.auth.register(this.pseudo, this.email, this.motDePasse);

    obs.subscribe({
      next: () => {
        this.currentUser.refresh();
        this.router.navigate(['/techniques']);
      },
      error: err => {
        this.error = err.error?.message || 'Erreur';
        this.loading = false;
      }
    });
  }
}
