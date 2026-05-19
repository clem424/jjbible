# ---------- Etape 1 : build ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- Etape 2 : runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Dependances de production uniquement
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Artefacts compiles
COPY --from=build /app/dist ./dist

# Securite : ne pas tourner en root (l'image node fournit l'user `node`)
USER node

EXPOSE 3000

# Healthcheck : l'endpoint racine renvoie { message: "API JJBible OK" }
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1

CMD ["node", "dist/main.js"]
