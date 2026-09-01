# Dockerfile

# ---------- Étape 1 : dépendances + build ----------
FROM node:22-slim AS builder

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

# ---------- Étape 2 : image de production ----------
FROM node:22-slim AS production

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Crée un utilisateur non privilégié dédié à l'application
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/false --create-home nestjs

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Donne la propriété des fichiers copiés au nouvel utilisateur
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]