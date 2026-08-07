FROM postgres:16-alpine AS builder

WORKDIR /app

ENV PRISMA_HIDE_UPDATE_MESSAGE=true
ENV CHECKPOINT_DISABLE=1
ENV PATH="/app/node_bin/bin:${PATH}"

COPY package*.json ./
COPY prisma ./prisma/
COPY node_bin ./node_bin

COPY . .

RUN chmod -R +x ./node_bin/bin ./node_modules/.bin ./node_modules/@esbuild ./node_modules/@next ./node_modules/@prisma
RUN ./node_bin/bin/node ./node_modules/.bin/next build

FROM postgres:16-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV PATH="/app/node_bin/bin:${PATH}"

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_bin ./node_bin
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tsconfig.json ./

RUN chmod -R +x ./node_bin/bin ./node_modules/.bin ./node_modules/@esbuild ./node_modules/@next ./node_modules/@prisma

EXPOSE 3000

CMD ["sh", "-c", "./node_bin/bin/node ./node_modules/.bin/prisma db push --accept-data-loss && ./node_bin/bin/node ./node_modules/.bin/tsx prisma/seed.ts && ./node_bin/bin/node ./node_modules/.bin/next start"]
