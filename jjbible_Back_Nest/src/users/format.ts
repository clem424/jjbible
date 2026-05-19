import { Utilisateur } from '../entities/utilisateur.entity';

/**
 * Aplatit l'objet Utilisateur (avec sa relation ceinture) en un payload
 * plat utilisable côté frontend Angular. Le format est strictement
 * identique à l'ancienne API Express afin de ne rien casser.
 */
export function formatUser(u: Utilisateur, includeEmail = false) {
  return {
    id: u.id,
    pseudo: u.pseudo,
    bio: u.bio,
    barrettes: u.barrettes,
    date_creation: u.date_creation,
    ceinture_id: u.ceinture?.id ?? null,
    ceinture_nom: u.ceinture?.nom ?? null,
    couleur_hex: u.ceinture?.couleur_hex ?? null,
    couleur_secondaire: u.ceinture?.couleur_secondaire ?? null,
    ...(includeEmail ? { email: u.email } : {}),
  };
}
