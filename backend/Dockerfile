FROM node:18-alpine

 

WORKDIR /app

 

# Kopiranje package fajlova

COPY package*.json ./

 

# Instalacija dependencies

RUN npm ci --only=production

 

# Kopiranje ostatka aplikacije

COPY . .

 

# Build TypeScript koda

RUN npm run build

 

# Eksponiranje porta

EXPOSE 5000

 

# Pokretanje aplikacije

CMD ["npm", "start"]