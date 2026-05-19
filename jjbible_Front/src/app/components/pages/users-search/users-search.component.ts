import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '@services';
import { User } from '@models';
import { BeltDisplayComponent } from '@components';

@Component({
  selector: 'app-users-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BeltDisplayComponent],
  templateUrl: './users-search.component.html',
  styleUrls: ['./users-search.component.scss']
})
export class UsersSearchComponent {
  query = '';
  results: User[] = [];

  constructor(private userService: UserService) {}

  onSearch() {
    if (this.query.trim().length < 1) {
      this.results = [];
      return;
    }
    this.userService.search(this.query).subscribe(r => this.results = r);
  }
}
