export interface Ceinture {
  id: number;
  nom: string;
  couleur_hex: string;
  couleur_secondaire: string;
  ordre: number;
}

export type NiveauMaitrise = 'non_maitrise' | 'en_cours' | 'maitrise';

export interface User {
  id: number;
  pseudo: string;
  email?: string;
  bio?: string;
  barrettes?: number;
  ceinture_id?: number | null;
  ceinture_nom?: string | null;
  couleur_hex?: string | null;
  couleur_secondaire?: string | null;
  date_creation?: string;
}

export interface Technique {
  id: number;
  nom: string;
  description?: string | null;
  url_video?: string | null;
  plateforme: 'youtube' | 'tiktok' | 'instagram' | 'autre';
  categorie?: string | null;
  createur_id: number;
  visibilite: 'publique' | 'privee';
  notes_personnelles?: string | null;
  favori?: boolean;
  niveau_maitrise?: NiveauMaitrise;
  date_creation?: string;
}

export interface UserProfile extends User {
  techniques: Technique[];
}

// ---------- Liaisons entre techniques (graphe d'enchaînements) ----------

export type TypeLiaison = 'enchainement' | 'variation' | 'contre' | 'autre';

export interface Liaison {
  id: number;
  source_id: number;
  cible_id: number;
  type: TypeLiaison;
  note?: string | null;
  date_creation?: string;
}

export interface GraphNode {
  id: number;
  nom: string;
  categorie?: string | null;
  niveau_maitrise?: NiveauMaitrise;
  favori?: boolean;
}

export interface GraphEdge {
  id: number;
  source: number;
  cible: number;
  type: TypeLiaison;
  note?: string | null;
}

export interface TechniqueGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
