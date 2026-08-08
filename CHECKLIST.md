# Checklist de adaptación a Cospace

Pasos recomendados para desplegar este repositorio en Cospace (o cualquier entorno gestionado):

1. Secrets & env
   - Añadir en el gestor de secretos de Cospace (o variables del entorno):
     - POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
     - DATABASE_URL (o construirla desde las anteriores)
     - JWT_SECRET
     - SEED_OWNER_WALLET (dirección pública del owner para seed)
   - NO dejar claves privadas ni contraseñas en el repositorio ni en README.md. Elimina o reescribe las entradas del README que exponen private keys.

2. Docker / Compose
   - Usar `docker-compose.cospace.yml` para despliegues locales o adaptar al manifiesto/nativo de Cospace.
   - Construir la imagen con `web/Dockerfile.cospace` en CI o registry.

3. Base de datos
   - Ejecutar migraciones o `npx prisma db push` en el entorno de despliegue (antes de run):
     - `npx prisma migrate deploy` (si usas migrations) o `npx prisma db push`.
   - Ejecutar seed idempotente: `npx tsx web/prisma/seed.cospace.ts` o configurarlo como job.

4. Seguridad y prácticas
   - Mover todas las credenciales del README a secrets y eliminar claves privadas del repo.
   - Configurar límites de recursos y healthchecks (ya incluidos en docker-compose.cospace.yml).
   - Añadir monitoring/logging y backups periódicos para la base de datos.

5. CI/CD
   - Configurar un workflow que construya la imagen y la publique en un registry privado.
   - Durante despliegue, ejecutar `prisma generate` y la seed idempotente.

6. Testing & QA
   - Ejecutar `forge test` (contracts) y `npm run test` (playwright) en pipelines.

Notas:
- `web/prisma/seed.cospace.ts` evita escribir private keys en la DB y no borra datos existentes.
- Revisa `ANVIL_ACCOUNTS.md` y elimina claves privadas antes de exponer documentación públicamente.
