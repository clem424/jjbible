-- Seed des ceintures (a lancer UNE fois, apres le 1er demarrage du backend,
-- quand les tables ont ete creees par TypeORM).
INSERT INTO ceintures (nom, couleur_hex, couleur_secondaire, ordre) VALUES
 ('Blanche', '#FFFFFF', '#E0E0E0', 1),
 ('Bleue',   '#1E63D6', '#0D47A1', 2),
 ('Violette','#6A1B9A', '#4A148C', 3),
 ('Marron',  '#5D4037', '#3E2723', 4),
 ('Noire',   '#212121', '#000000', 5),
 ('Rouge',   '#C62828', '#8E0000', 6);
