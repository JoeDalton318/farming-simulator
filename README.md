# 🚜 Farming Simulator — Simulation de Gestion Agricole

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Un simulateur de gestion agricole moderne, modulaire et extensible, basé sur Node.js, Express, Sequelize et PostgreSQL.

---

## 🧩 Fonctionnalités principales

- **Gestion complète des champs** : cycle de vie (labour, semis, fertilisation, récolte), rendement, historique
- **Gestion du matériel agricole** : réservation, disponibilité, maintenance (Object Pool)
- **Stockage centralisé** : 100 000 L, entrepôt dédié pour produits transformés (50 000 L)
- **Usines de transformation** : multiplicateurs de valeur, recettes complexes, gestion des intrants/sorties
- **Gestion animale** : vaches, moutons, poules, production de lait, laine, œufs, fumier, gestion de la santé
- **Gestion de l’eau** : réservoirs, consommation, recharge automatique
- **Serres agricoles** : production automatisée de fraises
- **Gestion du fertilisant** : production, consommation, impact sur le rendement
- **API RESTful versionnée** : endpoints clairs pour chaque entité
- **Orchestration avancée** : coordination globale via un Mediator/Facade

---

## 🏗️ Architecture & Patterns

- **MVC** (Modèles, Contrôleurs, Services)
- **State Pattern** : cycle de vie des champs
- **Factory/Abstract Factory** : création d’usines et d’équipements
- **Object Pool** : gestion de la disponibilité des équipements
- **Command Pattern** : encapsulation des actions sur les champs
- **Strategy/Chain of Responsibility** : transformation en usine
- **Singleton/Observer** : gestion centralisée et notification du stockage
- **Mediator/Facade** : coordination globale (FarmCoordinator)

---

## 📦 Installation & Lancement

1. **Cloner le dépôt**
```bash
git clone https://github.com/JoeDalton318/farming-simulator.git
cd farming-simulator
```
2. **Configurer l’environnement**
- Créez un fichier `.env` à partir de `.env.example` (si besoin)
- Vérifiez les variables de connexion PostgreSQL

3. **Démarrer avec Docker**
```bash
docker-compose up -d
```

4. **Initialiser la base et les données**
```bash
cd Backend
npm install
npm run init-farm
```

5. **Lancer l’API**
```bash
npm run dev
# ou
npm start
```

L’API sera disponible sur [http://localhost:3000](http://localhost:3000)

---

## 🗂️ Structure du projet

```
Backend/
  src/
    controllers/   # Logique des endpoints
    models/        # Modèles Sequelize
    routes/        # Endpoints RESTful
    services/      # Logique métier, patterns
    middleware/    # Middlewares Express
    scripts/       # Scripts d’initialisation
    utils/         # Helpers divers
    config/        # Configuration
  test/            # Tests unitaires
  Dockerfile       # Image backend
  package.json     # Dépendances et scripts
```

---

## 🔗 Endpoints principaux (API REST)

- `/api/v1/farm` : gestion des fermes
- `/api/v1/field` : gestion des champs
- `/api/v1/equipment` : gestion du matériel
- `/api/v1/storage` : gestion du stockage
- `/api/v1/factory` : gestion des usines
- `/api/v1/animal` : gestion des animaux
- `/api/v1/water` : gestion de l’eau
- `/api/v1/greenhouse` : gestion des serres
- `/health` : healthcheck

Voir chaque fichier dans `src/routes/` pour le détail des endpoints et paramètres.

---

## 🆕 Nouveautés & Patchs

- **Animaux** : gestion avancée, production, santé, mort
- **Eau** : réservoirs, consommation, recharge automatique
- **Serres** : production automatisée de fraises
- **Entrepôt** : stockage dédié pour produits transformés
- **Fertilisant** : production, consommation, impact sur le rendement
- **Nouvelles usines** : laiterie, chocolaterie, usine de fumier, etc.
- **Recettes complexes** : gestion des intrants multiples, multiplicateurs

---

## 🧪 Tests & Qualité

- Tests unitaires disponibles dans `Backend/test/`
- Lancer les tests :
```bash
npm test
```
- Linting & formatage :
```bash
npm run lint
npm run prettier
```

---

## 📚 Documentation technique

- [docs/Farming_Sim.md](docs/Farming_Sim.md) : cahier des charges complet
- [docs/patch.md](docs/patch.md) : nouveautés, patchs et extensions
- [docs/Farming_Sim.pdf](docs/Farming_Sim.pdf) : version PDF

---

## 💡 Exemples d’utilisation avancée

- Orchestration complète d’une récolte : voir `FarmCoordinator`
- Notifications temps réel sur le stockage : observer `StorageService`
- Extension facile des usines : ajouter une stratégie dans `factoryService.js`

---

## 🛠️ Stack technique
- Node.js, Express, Sequelize
- PostgreSQL
- Docker
- Insomnia/Postman pour les tests API

---

## 📝 Licence

MIT — voir le fichier LICENSE
