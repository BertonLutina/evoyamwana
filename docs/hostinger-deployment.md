# Déploiement Hostinger — État actuel (2026-07-01)

Ce document décrit exactement ce qui a été fait pour déployer EVOYAMWANA sur le VPS Hostinger, et comment continuer à partir d'ici. Il remplace (en pratique) le déploiement Netlify décrit dans `netlify-deployment.md` — Netlify n'a pas été supprimé, mais l'app tourne maintenant en production sur le VPS.

## Vue d'ensemble

```
evoyamwana.com / www.evoyamwana.com  →  Traefik (HTTPS, Let's Encrypt)  →  container evoyamwana-web (nginx, build React statique)
api.evoyamwana.com                   →  Traefik (HTTPS, Let's Encrypt)  →  container evoyamwana-api (Node/Express, port 4000)
evoyamwana-api                       →  container postgresql-5yar-postgresql-1 (Postgres 17, réseau docker postgresql-5yar_default)
```

## Infrastructure

- **VPS Hostinger** : `srv1797721`, IP publique `31.97.53.228`, Ubuntu 24.04, 2 vCPU / 8 Go RAM / 96 Go disque.
- **Accès** :
  - Terminal navigateur : hPanel → VPS → Docker Manager → bouton "Terminal" (en haut à droite) = shell root complet sur le VPS (pas juste un container).
  - SSH direct : `ssh hostinger` depuis le Mac, une fois `~/.ssh/config` et `~/.ssh/hostinger` (clé privée ed25519, sans passphrase) correctement en place. Clé publique déjà installée dans `/root/.ssh/authorized_keys` sur le VPS.
- **Docker Manager** contenait déjà avant ce déploiement :
  - Projet `postgresql-5yar` : Postgres 17, container `postgresql-5yar-postgresql-1`, réseau `postgresql-5yar_default`, port publié `32768→5432`. Base `evoyamwana` et utilisateur `creaafde` existaient déjà dedans (créés lors d'un essai précédent).
    - `POSTGRES_USER=creaafde`
    - `POSTGRES_PASSWORD=Lutina17Berton04!!`
    - `POSTGRES_DB=evoyamwana`
  - Projet `traefik` : container `traefik-traefik-1`, `network_mode: host`, écoute 80/443, provider Docker (lit `docker.sock` en lecture seule), `providers.docker.exposedbydefault=false`, resolver ACME nommé `letsencrypt` (email `admin@srv1797721.hstgr.cloud`). Tout container avec les bons labels `traefik.*` est automatiquement routé et reçoit un certificat Let's Encrypt.

## Ce qui a été ajouté

Tout le code déployé vit sur le VPS dans `/root/evoyamwana/` (pas un clone git — voir "Limitation actuelle" plus bas) :

```
/root/evoyamwana/
  apps/api/          (copié depuis le repo local, Dockerfile ajouté ici)
  apps/web/          (copié depuis le repo local, Dockerfile + nginx.conf ajoutés ici)
  packages/shared/
  package.json, package-lock.json, netlify.toml
  docker-compose.yml (nouveau, décrit ci-dessous)
```

### `apps/api/Dockerfile`
Image `node:20-bookworm-slim`. Installe `openssl` (nécessaire pour que Prisma détecte la bonne version d'OpenSSL — sans ça il télécharge le mauvais moteur et l'API crashe au démarrage). Build : `npm install` → build `@evoyamwana/shared` → `prisma generate` → build `@evoyamwana/api`. Démarre avec `node dist/server.js` sur le port 4000.

`apps/api/prisma/schema.prisma` a été modifié sur le VPS (pas dans le repo local pour l'instant) :
```
binaryTargets = ["native", "debian-openssl-3.0.x", "debian-openssl-1.1.x"]
```
(remplace l'ancien `["native", "rhel-openssl-3.0.x"]` qui ne correspondait pas à l'image Debian utilisée).

### `apps/web/Dockerfile`
Build multi-stage : `node:20-bookworm-slim` pour build Vite (avec `VITE_API_URL=https://api.evoyamwana.com` écrit dans `.env.production` au build), puis `nginx:alpine` pour servir `dist/` avec `apps/web/nginx.conf` (fallback SPA `try_files $uri /index.html`).

### `docker-compose.yml` (à la racine de `/root/evoyamwana/`)
Deux services :
- **api** : rejoint le réseau externe `postgresql-5yar_default` pour parler à Postgres par nom de container. Variables d'env : `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN=1d`, `CORS_ORIGIN=https://evoyamwana.com,https://www.evoyamwana.com`. Volume `evoyamwana_uploads:/repo/apps/api/uploads` pour la persistance des fichiers uploadés. Labels Traefik pour `api.evoyamwana.com`.
- **web** : labels Traefik pour `evoyamwana.com` et `www.evoyamwana.com`.

`JWT_SECRET` actuel : `U3mlJG9wJO8Imzg8nl5uKZAF80BYucWrZzDuxBwIQlI=` (généré aléatoirement, stocké uniquement dans le `docker-compose.yml` sur le VPS).

## Base de données

Toutes les migrations Prisma ont été appliquées avec succès sur la base `evoyamwana` (`prisma migrate deploy`). Le seed de données de démo n'a **pas** été exécuté (base vide, prête pour de vraies données).

Un compte **super_admin** a été créé directement via Prisma :
- Email : `creaafde@gmail.com` (stocké en minuscules — le login normalise toujours l'email en minuscules donc la casse tapée n'a pas d'importance)
- Mot de passe : `iXdN3iJKYXVk5H28pTs4`

## DNS (Gandi)

Zone `evoyamwana.com` modifiée directement via l'éditeur de zone avancé de Gandi :
- `@ A 31.97.53.228` (remplace l'ancienne IP `217.70.184.38`)
- `www A 31.97.53.228` (l'ancien `www CNAME webredir.vip.gandi.net` a été supprimé car il entrait en conflit)
- `api A 31.97.53.228` (nouveau)
- Tous les enregistrements mail existants (MX, SPF, DKIM `gm1/gm2/gm3._domainkey`, `webmail` CNAME) ont été laissés intacts.

## Accès SSH

`~/.ssh/config` sur le Mac doit contenir :
```
Host hostinger
    HostName 31.97.53.228
    User root
    IdentityFile ~/.ssh/hostinger
```
La clé privée doit être dans `~/.ssh/hostinger` avec permissions `600`. Pas de passphrase, pas de mot de passe root — l'authentification par mot de passe existe côté serveur mais aucun mot de passe root n'est connu/configuré par nous ; il ne faut jamais essayer de le deviner, juste s'assurer que la clé est bien prise en compte (`ssh -v hostinger` pour diagnostiquer).

## Comment continuer / commandes utiles

Une fois connecté (`ssh hostinger` ou terminal navigateur Hostinger) :

```bash
cd /root/evoyamwana

# voir l'état des containers de l'app
docker compose ps

# logs
docker compose logs -f api
docker compose logs -f web

# redémarrer après un changement de code (voir limitation ci-dessous)
docker compose build api        # ou web
docker compose up -d api        # ou web

# migrations après un changement de schema.prisma
docker exec evoyamwana-api npx prisma migrate deploy --schema=/repo/apps/api/prisma/schema.prisma

# vérifier Traefik / certificats
docker logs traefik-traefik-1 --tail 50
```

## Limitation actuelle (important)

Il n'y a **pas de dépôt git distant** pour ce projet, donc le code sur le VPS (`/root/evoyamwana/`) est une copie statique envoyée manuellement (via upload) au moment du déploiement — il ne se met pas à jour tout seul si tu modifies le code en local. Pour livrer une nouvelle version :

1. Soit on remet en place le même mécanisme de transfert (zip → upload → téléchargement sur le VPS → rebuild).
2. Soit — recommandé pour la suite — on met en place un vrai dépôt git (GitHub/GitLab) et un `git pull` + `docker compose build` sur le VPS. Dis-moi si tu veux que je configure ça, ça rendra les prochains déploiements beaucoup plus simples et rapides.

## Netlify

La config Netlify (`netlify.toml`, `docs/netlify-deployment.md`) existe toujours dans le repo mais n'est plus utilisée comme cible de prod principale — le VPS Hostinger est maintenant la source de vérité pour `evoyamwana.com`.
