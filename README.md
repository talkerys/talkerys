# Talkerys (Railway-ready)

MVP **completo** (Next.js + Prisma + Postgres) con:
- Crear cuenta
- Login
- Sesión por cookie (JWT httpOnly)
- Página protegida `/events`
- CRUD básico de eventos

## Variables (Railway)
En el **servicio** (tu app), agrega:

- `DATABASE_URL` = referencia a tu Postgres  
  (lo normal en Railway es ponerlo como **Variable Reference**, por ejemplo: `${{ Postgres.DATABASE_URL }}`)

- `JWT_SECRET` = un string largo aleatorio (32+ caracteres)

> Railway ya define `PORT` automáticamente.

## Deploy rápido (Railway)
1) Sube este proyecto a GitHub (o súbelo directo desde Railway si usas su import).  
2) En Railway: **New Project → Deploy from GitHub Repo**.  
3) Agrega un **Postgres** en el mismo Environment.  
4) En tu servicio de la app (Talkerys): Variables → agrega `DATABASE_URL` y `JWT_SECRET`.  
5) Deploy.

Cuando abra la URL pública:
- Ve a `/register` para crear cuenta
- Luego `/events`

## Local (opcional)
```bash
npm install
# crea .env con DATABASE_URL y JWT_SECRET
npm run dev
```

## Nota sobre "¿dónde está el QUERY?"
En Railway, el panel del Postgres muestra tablas y un botón **Connect**.
Normalmente el "editor de SQL" no está siempre visible como en Supabase.
Si quieres ejecutar SQL manual, lo más directo es usar **Connect** (psql / cliente) o dejar que Prisma cree las tablas (este proyecto las crea con `prisma db push` al iniciar).
