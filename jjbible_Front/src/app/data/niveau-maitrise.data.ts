import { NiveauMaitrise } from '@models';

// Helpers d'affichage du niveau de maîtrise
export const NIVEAU_LABELS: Record<NiveauMaitrise, string> = {
  non_maitrise: 'Non maîtrisée',
  en_cours: 'En cours',
  maitrise: 'Maîtrisée'
};

export const NIVEAU_COLORS: Record<NiveauMaitrise, string> = {
  non_maitrise: '#9ca3af',
  en_cours: '#f59e0b',
  maitrise: '#10b981'
};

export const NIVEAU_ICONS: Record<NiveauMaitrise, string> = {
  non_maitrise: '○',
  en_cours: '◐',
  maitrise: '●'
};
