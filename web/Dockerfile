FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
COPY node_modules ./node_modules
COPY .next ./.next
COPY prisma ./prisma
COPY next.config.ts ./
COPY tsconfig.json ./

RUN chmod -R +x node_modules/

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts && npx next start"]
