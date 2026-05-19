import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

const API = '/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  token = signal<string | null>(localStorage.getItem('token'));
  userId = signal<number | null>(
    localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null
  );
  pseudo = signal<string | null>(localStorage.getItem('pseudo'));

  constructor(private http: HttpClient) {}

  login(pseudo: string, mot_de_passe: string): Observable<any> {
    return this.http.post<any>(`${API}/auth/login`, { pseudo, mot_de_passe }).pipe(
      tap(res => this.saveSession(res))
    );
  }

  register(pseudo: string, email: string, mot_de_passe: string): Observable<any> {
    return this.http.post<any>(`${API}/auth/register`, { pseudo, email, mot_de_passe }).pipe(
      tap(res => this.saveSession(res))
    );
  }

  private saveSession(res: { token: string; userId: number; pseudo: string }) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('userId', String(res.userId));
    localStorage.setItem('pseudo', res.pseudo);
    this.token.set(res.token);
    this.userId.set(res.userId);
    this.pseudo.set(res.pseudo);
  }

  logout() {
    localStorage.clear();
    this.token.set(null);
    this.userId.set(null);
    this.pseudo.set(null);
  }

  isLoggedIn(): boolean {
    return !!this.token();
  }
}
