# Déploiement & hébergement de JJBible

Guide complet pour héberger l'application (API NestJS + front Angular + MySQL),
sur un **serveur classique** ou sur un **Raspberry Pi avec Tailscale**, avec les
**bonnes pratiques** de mise en production.

---

## 1. Architecture

```
                 ┌──────────────────────────────────────┐
   navigateur ──►│  nginx (conteneur frontend, port 80)  │
                 │   • sert le build Angular (statique)  │
                 │   • /api/  ──► proxy vers backend     │
                 └───────────────┬──────────────────────┘
                                 │ (réseau interne docker)
                 ┌───────────────▼──────────┐
                 │  backend NestJS (3000)   │
                 └───────────────┬──────────┘
                                 │ (réseau interne docker)
                 ┌───────────────▼──────────┐
                 │  MySQL (volume persistant)│
                 └──────────────────────────┘
```

Points clés :

- Un seul port est exposé à l'extérieur : **le port HTTP du frontend**.
- Le backend et la base **ne sont jamais accessibles directement** depuis
  l'extérieur (pas de `ports:` publiés pour eux) : c'est volontaire et sain.
- Le frontend appelle `/api/...` ; nginx relaie vers le backend en interne.

---

## 2. Pré-requis

Sur la machine qui héberge (serveur ou Raspberry Pi) :

- **Docker** et **Docker Compose v2**
  ```bash
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER   # puis se reconnecter
  docker compose version
  ```
- Une arborescence ainsi :
  ```
  jjbible/
  ├── docker-compose.yml
  ├── .env
  ├── seed-ceintures.sql
  ├── jjbible_Back_Nest/
  └── jjbible_Front/
  ```

---

## 3. Mise en route (commun à tous les hébergements)

```bash
cd jjbible
cp .env.example .env
nano .env          # mets un DB_PASSWORD fort + un JWT_SECRET aléatoire
```

Génère un vrai secret JWT :

```bash
openssl rand -hex 32
```

Lance la stack :

```bash
docker compose up -d --build
```

Vérifie :

```bash
docker compose ps          # les 3 services "Up" / "healthy"
docker compose logs -f backend
```

### Premier démarrage : seed des ceintures

Au tout premier lancement, `DB_SYNCHRONIZE=true` crée les tables. Une fois le
backend démarré (regarde les logs), insère les ceintures **une seule fois** :

```bash
docker compose exec -T db \
  mysql -uroot -p"$DB_PASSWORD" jjbible < seed-ceintures.sql
```

(`$DB_PASSWORD` doit être la valeur de ton `.env` ; sinon tape-la en clair.)

### Puis durcir la production

Édite `.env` :

```env
DB_SYNCHRONIZE=false
```

et redéploie :

```bash
docker compose up -d --build
```

> Pourquoi : en prod on ne laisse pas l'application modifier le schéma de la
> base toute seule. Quand tu feras évoluer les entités plus tard, l'approche
> propre est d'utiliser les **migrations TypeORM** (`typeorm migration:generate`)
> plutôt que `synchronize`.

L'application est accessible sur `http://<ip-de-la-machine>:<HTTP_PORT>`.

---

## 4. Hébergement sur un serveur (VPS / dédié)

### 4.1 Réseau & pare-feu

N'ouvre que le strict nécessaire :

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

La base et le backend n'ont pas de port public : rien à ouvrir pour eux.

### 4.2 Nom de domaine + HTTPS

Le plus simple est de mettre un reverse-proxy avec HTTPS automatique devant la
stack. Exemple avec **Caddy** (certificats Let's Encrypt automatiques) — un
`Caddyfile` :

```
mondomaine.fr {
    reverse_proxy localhost:80
}
```

```bash
docker run -d --name caddy --restart unless-stopped \
  -p 80:80 -p 443:443 \
  -v $PWD/Caddyfile:/etc/caddy/Caddyfile \
  -v caddy_data:/data \
  caddy:2
```

(Dans ce cas, mets `HTTP_PORT=8080` dans `.env` pour libérer le port 80 au
profit de Caddy, et pointe `reverse_proxy localhost:8080`.)

Alternative classique : nginx hôte + `certbot`.

### 4.3 Démarrage automatique

`restart: unless-stopped` (déjà dans le compose) relance les conteneurs au
reboot tant que le démon Docker démarre au boot :

```bash
sudo systemctl enable docker
```

---

## 5. Hébergement sur Raspberry Pi + Tailscale

### 5.1 Préparer le Pi

- Utilise **Raspberry Pi OS 64 bits** (obligatoire : les images MySQL/Node
  64 bits ne tournent pas sur un OS 32 bits).
- Vérifie : `uname -m` doit renvoyer `aarch64`.
- Toutes les images utilisées (`node:20-alpine`, `nginx:alpine`, `mysql:8.4`)
  sont multi-arch et fonctionnent en `arm64`.

### 5.2 Mémoire : le point sensible

Compiler Angular sur un Pi peut manquer de RAM (surtout Pi 3 / Pi Zero).
Trois options, de la plus simple à la plus robuste :

1. **Augmenter le swap** sur le Pi avant `docker compose build` :
   ```bash
   sudo dphys-swapfile swapoff
   sudo sed -i 's/^CONF_SWAPSIZE=.*/CONF_SWAPSIZE=2048/' /etc/dphys-swapfile
   sudo dphys-swapfile setup && sudo dphys-swapfile swapon
   ```
2. **Construire les images ailleurs** (ton PC) puis les transférer
   (`docker save | ssh ... docker load`), ou via un registre.
3. Sur Pi 4 / Pi 5 (4–8 Go) : en général `docker compose up -d --build`
   passe sans rien faire de spécial.

> MySQL est un peu lourd pour les petits Pi. Si besoin, tu peux remplacer
> `image: mysql:8.4` par `image: mariadb:11` dans `docker-compose.yml`
> (MariaDB est compatible avec le driver MySQL de TypeORM et plus léger sur ARM).

### 5.3 Installer Tailscale sur le Pi

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

Note le nom MagicDNS du Pi (ex. `raspberrypi.ton-tailnet.ts.net`) et son IP
`100.x.y.z` via `tailscale ip -4`.

### 5.4 Accès privé (recommandé) via le tailnet

Lance la stack normalement (`docker compose up -d --build`). Depuis n'importe
quel appareil de ton tailnet, le site est joignable sur :

```
http://raspberrypi.ton-tailnet.ts.net:80
```

Avantage : **rien n'est exposé sur Internet**, seuls tes appareils Tailscale
y accèdent. C'est la configuration la plus sûre.

### 5.5 HTTPS propre avec Tailscale Serve

Pour avoir du HTTPS (cadenas, certificat valide) sans ouvrir de port :

```bash
sudo tailscale serve --bg 80
```

Le site devient accessible en `https://raspberrypi.ton-tailnet.ts.net`
(certificat TLS géré par Tailscale, valable uniquement dans ton tailnet).

### 5.6 Exposer publiquement (optionnel) avec Funnel

Si tu veux que le site soit accessible **depuis Internet** (hors tailnet) :

```bash
sudo tailscale funnel --bg 80
```

À n'utiliser que si tu en as vraiment besoin : ça ouvre ton service au monde.
Garde alors `DB_SYNCHRONIZE=false`, un `JWT_SECRET` fort, et les images à jour.

---

## 6. Bonnes pratiques de production (checklist)

**Secrets & config**
- [ ] `JWT_SECRET` long et aléatoire (`openssl rand -hex 32`), jamais le défaut.
- [ ] Mot de passe MySQL fort.
- [ ] `.env` **non commité** (présent dans `.gitignore`), seul `.env.example` l'est.

**Base de données**
- [ ] `DB_SYNCHRONIZE=false` en production.
- [ ] Aucun port MySQL publié (déjà le cas dans le compose).
- [ ] **Sauvegardes** régulières (voir §7).
- [ ] Volume `db_data` persistant (déjà configuré).

**Conteneurs**
- [ ] Images de base **épinglées** à une version (`mysql:8.4`, `nginx:1.27`,
      `node:20-alpine`) — pas de `latest`.
- [ ] Backend en **multi-stage** + dépendances de prod uniquement + user non-root
      (déjà fait dans le Dockerfile).
- [ ] `restart: unless-stopped` sur tous les services (déjà fait).
- [ ] **Healthchecks** définis (déjà faits) pour redémarrer un service KO.
- [ ] `.dockerignore` présent (déjà fait) pour des images légères.

**Réseau / exposition**
- [ ] Un seul port exposé (le front). Backend + DB internes.
- [ ] Pare-feu actif (`ufw`) sur un serveur public.
- [ ] HTTPS (Caddy/certbot sur serveur, Tailscale Serve sur Pi).

**Exploitation**
- [ ] Logs surveillés : `docker compose logs -f`.
- [ ] Mises à jour : `docker compose pull && docker compose up -d` +
      `apt upgrade` régulier sur l'hôte.
- [ ] (Optionnel) limites de ressources (`deploy.resources.limits`) si la
      machine est petite.

---

## 7. Sauvegarde & restauration

**Sauvegarde** (cron quotidien conseillé) :

```bash
docker compose exec -T db \
  mysqldump -uroot -p"$DB_PASSWORD" jjbible > backup_$(date +%F).sql
```

Exemple de cron (`crontab -e`) — tous les jours à 3 h :

```
0 3 * * * cd /home/pi/jjbible && docker compose exec -T db mysqldump -uroot -p'MOT_DE_PASSE' jjbible > /home/pi/backups/jjbible_$(date +\%F).sql
```

**Restauration** :

```bash
docker compose exec -T db \
  mysql -uroot -p"$DB_PASSWORD" jjbible < backup_2026-05-19.sql
```

---

## 8. Mettre à jour l'application

Après modification du code :

```bash
cd jjbible
git pull              # ou remplace les dossiers jjbible_Back_Nest / jjbible_Front
docker compose up -d --build
docker image prune -f # nettoie les anciennes images
```

---

## 9. Dépannage rapide

| Symptôme | Cause probable | Solution |
|---|---|---|
| `ECONNREFUSED` au démarrage backend | DB pas prête / mauvais host | Le compose attend déjà `db` healthy ; vérifie `DB_HOST=db` |
| Page blanche, 404 sur refresh d'une route | fallback SPA | Déjà géré par `try_files ... /index.html` dans `nginx.conf` |
| `/api/...` renvoie 502 | backend non démarré | `docker compose logs backend` |
| Build Angular tué sur le Pi | manque de RAM | Augmenter le swap (§5.2) ou builder ailleurs |
| Ceintures vides dans l'app | seed non lancé | Rejouer `seed-ceintures.sql` (§3) |
| Connexion impossible en local hors Docker | `localhost` → IPv6 | Utiliser `DB_HOST=127.0.0.1` |

---

## 10. Développement local (rappel, sans Docker)

```bash
# Backend
cd jjbible_Back_Nest
npm install
cp .env.example .env      # DB_HOST=127.0.0.1, DB_SYNCHRONIZE=true
npm run dev               # http://localhost:3000  (Swagger: /docs)

# Frontend
cd jjbible_Front
npm install
npm start                 # http://localhost:4200 (proxy /api -> :3000)
```
