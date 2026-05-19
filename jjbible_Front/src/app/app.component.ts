import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '@services';
import { CurrentUserService } from '@store';
import { BeltDisplayComponent } from '@components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, BeltDisplayComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // Signal réactif depuis le service partagé
  me = computed(() => this.currentUser.user());

  constructor(
    public auth: AuthService,
    public currentUser: CurrentUserService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.currentUser.refresh();
    }
  }

  logout() {
    this.auth.logout();
    this.currentUser.clear();
    this.router.navigate(['/login']);
  }
}
