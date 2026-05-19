import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ceinture, User, UserProfile } from '@models';

const API = '/api';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getCeintures(): Observable<Ceinture[]> {
    return this.http.get<Ceinture[]>(`${API}/users/ceintures`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${API}/users/categories`);
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${API}/users/me`);
  }

  updateMe(data: { ceinture_id?: number; bio?: string; barrettes?: number }): Observable<User> {
    return this.http.put<User>(`${API}/users/me`, data);
  }

  search(pseudo: string): Observable<User[]> {
    return this.http.get<User[]>(`${API}/users/search?pseudo=${encodeURIComponent(pseudo)}`);
  }

  getProfile(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${API}/users/${id}`);
  }
}
