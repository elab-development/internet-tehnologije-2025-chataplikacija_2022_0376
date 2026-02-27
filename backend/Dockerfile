# Koristi verziju 20 koja odgovara tvom kodu
FROM node:20-alpine

WORKDIR /app

# Kopiranje package fajlova
COPY package*.json ./

# Instalacija svih dependencies (uključujući TS kompajler)
RUN npm ci

# Kopiranje ostatka aplikacije
COPY . .

# Build TypeScript koda
RUN npm run build


# Eksponiranje porta
EXPOSE 5000

# Pokretanje aplikacije
CMD ["npm", "start"]
