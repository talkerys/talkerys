# Talkerys MVP (Next.js + PostgreSQL + Prisma) — Deployable with Docker

Este proyecto es un MVP listo para subir a un VPS/hosting con Docker.
Incluye:
- Registro/Login (email + password)
- Perfil breve (nivel, intereses, objetivos)
- Cafeterías, eventos, mesas
- Reserva usando créditos (packs 1/2/4)
- Pagos por Yape/Plin con subida de comprobante (pendiente/aprobado/rechazado)
- Materiales (general / por evento / por mesa / por usuario)
- Panel Admin (/admin) con autenticación por rol

## Requisitos
- Docker + Docker Compose en tu servidor (VPS recomendado)
- Dominio apuntando al servidor (opcional)

## Quick start (local)
1) Copia `.env.example` a `.env` y ajusta valores.
2) Ejecuta:
```bash
docker compose up -d --build
docker compose exec web npx prisma migrate deploy
docker compose exec web node scripts/seed-admin.mjs
```
3) Abre http://localhost:3000

## Deploy en VPS (resumen)
1) Sube el proyecto al servidor (git clone o subir ZIP).
2) Crea `.env` desde `.env.example`.
3) Levanta:
```bash
docker compose up -d --build
docker compose exec web npx prisma migrate deploy
docker compose exec web node scripts/seed-admin.mjs
```
4) (Recomendado) pon un reverse proxy con TLS (Caddy o Nginx). Ver `deploy/caddy/Caddyfile`.

## Acceso Admin
- URL: `/admin`
- Usuario: el que definas en `.env` (ADMIN_EMAIL)
- Password: el que definas en `.env` (ADMIN_PASSWORD)

> IMPORTANTE: Cambia `JWT_SECRET` por un valor fuerte.

