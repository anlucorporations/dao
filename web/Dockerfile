FROM node:20-alpine AS builder

WORKDIR /app

ENV PRISMA_HIDE_UPDATE_MESSAGE=true
ENV CHECKPOINT_DISABLE=1

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --no-audit --no-fund

COPY . .

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tsconfig.json ./

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && npx tsx prisma/seed.ts && npm run start"]
