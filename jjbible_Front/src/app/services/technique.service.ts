import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Technique, NiveauMaitrise, TechniqueGraph, Liaison, TypeLiaison } from '@models';

const API = '/api';

@Injectable({ providedIn: 'root' })
export class TechniqueService {
  constructor(private http: HttpClient) {}

  getMine(): Observable<Technique[]> {
    return this.http.get<Technique[]>(`${API}/techniques/me`);
  }

  search(q: string, scope: 'all' | 'mine' | 'public' = 'all'): Observable<Technique[]> {
    return this.http.get<Technique[]>(
      `${API}/techniques/search?q=${encodeURIComponent(q)}&scope=${scope}`
    );
  }

  create(data: Partial<Technique>): Observable<Technique> {
    return this.http.post<Technique>(`${API}/techniques`, data);
  }

  addToPokedex(id: number): Observable<any> {
    return this.http.post(`${API}/techniques/${id}/add`, {});
  }

  removeFromPokedex(id: number): Observable<any> {
    return this.http.delete(`${API}/techniques/${id}/remove`);
  }

  toggleFavori(id: number): Observable<{ favori: boolean }> {
    return this.http.patch<{ favori: boolean }>(`${API}/techniques/${id}/favori`, {});
  }

  setMaitrise(id: number, niveau: NiveauMaitrise): Observable<{ niveau_maitrise: NiveauMaitrise }> {
    return this.http.patch<{ niveau_maitrise: NiveauMaitrise }>(
      `${API}/techniques/${id}/maitrise`,
      { niveau_maitrise: niveau }
    );
  }

  update(id: number, data: Partial<Technique>): Observable<Technique> {
    return this.http.put<Technique>(`${API}/techniques/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${API}/techniques/${id}`);
  }

  // ---------- Liaisons / graphe ----------

  /** Graphe complet (points + liaisons) de l'utilisateur connecté */
  getGraph(): Observable<TechniqueGraph> {
    return this.http.get<TechniqueGraph>(`${API}/techniques/graph`);
  }

  /** Liaisons d'une technique donnée */
  getLiaisons(id: number): Observable<Liaison[]> {
    return this.http.get<Liaison[]>(`${API}/techniques/${id}/liaisons`);
  }

  /**
   * Crée une liaison depuis la technique `id` vers `cibleId`.
   * sens = 'apres'  → la cible s'enchaîne après `id`
   * sens = 'avant'  → la cible est avant `id`
   */
  createLiaison(
    id: number,
    cibleId: number,
    sens: 'avant' | 'apres',
    type: TypeLiaison = 'enchainement',
    note?: string
  ): Observable<Liaison> {
    return this.http.post<Liaison>(`${API}/techniques/${id}/liaisons`, {
      technique_cible_id: cibleId,
      sens,
      type,
      note
    });
  }

  deleteLiaison(liaisonId: number): Observable<any> {
    return this.http.delete(`${API}/techniques/liaisons/${liaisonId}`);
  }
}
