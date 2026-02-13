# talkerys-clean

## Local
1) Copia `.env.example` a `.env` y llena `DATABASE_URL` y `JWT_SECRET`
2) `npm install`
3) `npx prisma migrate dev --name init`
4) (Opcional) crea un usuario con Prisma Studio: `npx prisma studio`
   - para hash rápido: `node -e "console.log(require('bcryptjs').hashSync('123456',10))"`
5) `npm run dev`

## Railway
- Crea Postgres y copia `DATABASE_URL`
- Define `JWT_SECRET`
- Deploy

> Las páginas están en modo dinámico para no ejecutar DB durante el build.
