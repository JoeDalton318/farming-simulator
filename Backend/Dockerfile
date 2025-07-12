# Utilise une image Node.js officielle
FROM node:22-alpine

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --production

# Copier le reste du code
COPY . .

# Exposer le port utilisé par l'app
EXPOSE 3000

# Définir les variables d'environnement par défaut (peuvent être surchargées par docker-compose)
ENV DB_HOST=pgpool \
    DB_PORT=5432 \
    DB_USER=postgres \
    DB_PASSWORD=postgrespass \
    DB_NAME=farming_sim \
    NODE_ENV=production

# Lancer l'application (adapter si le point d'entrée change)
CMD ["node", "src/app.js"]
