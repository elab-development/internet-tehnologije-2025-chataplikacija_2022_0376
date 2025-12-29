# 1. Build faza
FROM node:20-alpine AS builder

WORKDIR /app

# Kopiranje package fajlova
COPY package*.json ./

# Instalacija dependencies
RUN npm ci

# Kopiranje ostatka aplikacije
COPY . .

# Build Next.js aplikacije
RUN npm run build

# 2. Production faza
FROM node:20-alpine

WORKDIR /app

# Kopiranje potrebnih fajlova iz builder faze
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Eksponiranje porta
EXPOSE 3000

# Pokretanje aplikacije
CMD ["npm", "start"]