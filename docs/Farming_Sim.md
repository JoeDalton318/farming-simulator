# 🧑‍🌾 Projet : Simulation de Gestion Agricole (Farm Simulator)

## 🎯 Objectif

Vous devez concevoir et implémenter un système de simulation de gestion agricole.  
Ce simulateur doit modéliser le fonctionnement dʼune ferme moderne, incluant la gestion des champs, des cultures, des machines, du stockage, et des usines de transformation.

---

## 🏗 Contraintes Générales

- Toutes les unités sont exprimées en litres (L).
- 1 L de production vaut 1 pièce dʼor (1 or).
- Une ferme peut contenir plusieurs champs, numérotés de 0 à 99.
- Chaque champ fait 1 hectare (ha).
- Capacité de stockage totale : **100 000 L**.
- Si le stockage est plein, les récoltes doivent être mises en pause jusquʼà libération dʼespace.
- Vous pouvez implémenter le système dans le langage ou la plateforme de votre choix.

---

## 🌾 I. Gestion des Champs

Chaque champ possède :

- Un numéro (1 à 99)
- Un état parmi : `récolté`, `labouré`, `semé`, `fertilisé`, `prêt à récolter`
- Une culture (type) assignée une fois semé jusquʼà récolte
- Un lot optionnel pour regrouper plusieurs champs

---

## 🚜 II. Matériel Agricole Disponible

**Véhicules communs :**

- Tracteurs : 5 unités
- Remorques standard : 3 unités
- Moissonneuses-batteuses : 2 unités
- Charrues (plows) : 2 unités
- Fertilisateurs : 2 unités
- Semeuses (planters) : 2 unités

**Matériel spécialisé (1 unité chacun) :**

- Moissonneuses : raisin, olive, pomme de terre, betterave, coton, canne à sucre, arbre, épinard, haricot vert, pois, légumes
- Planteuses : arbre, pomme de terre, canne à sucre, légumes (fold planter)
- Remorque semi : 1 unité

---

## 🌱 III. Cultures Disponibles

Vous devez choisir **10 cultures** à prendre en charge dans votre système (parmi la liste ci-dessous).

| Culture                         | Matériel requis                                                               | Rendement (L/hectare) |
| ------------------------------- | ----------------------------------------------------------------------------- | --------------------- |
| Blé, Orge, Avoine, Canola, Soja | Tracteur, Semeuse, Moissonneuse, Remorque                                     | 1000                  |
| Raisin                          | Tracteur, Semeuse, Moissonneuse à raisin                                      | 1500                  |
| Olive                           | Tracteur, Planteuse à arbre, Moissonneuse à olive, Remorque                   | 1500                  |
| Pomme de terre                  | Tracteur, Planteuse à pomme de terre, Moissonneuse à pomme de terre, Remorque | 5000                  |
| Betterave                       | Tracteur, Semeuse, Moissonneuse à betterave, Remorque                         | 3500                  |
| Coton                           | Tracteur, Semeuse, Moissonneuse à coton, Remorque semi                        | 750                   |
| Maïs, Tournesol                 | Tracteur, Semeuse, Moissonneuse, Remorque                                     | 3000                  |
| Canne à sucre                   | Tracteur, Planteuse à canne, Moissonneuse à canne, Remorque                   | 5000                  |
| Peuplier                        | Tracteur, Planteuse à arbre, Moissonneuse à arbre, Remorque                   | 1500                  |
| Légumes                         | Tracteur, Planteuse légumes, Moissonneuse à légumes, Remorque                 | 2500                  |
| Epinard                         | Tracteur, Semeuse, Moissonneuse à épinard, Remorque                           | 3000                  |
| Pois                            | Tracteur, Semeuse, Moissonneuse à pois, Remorque                              | 7500                  |
| Haricots verts                  | Tracteur, Semeuse, Moissonneuse à haricots, Remorque                          | 7500                  |

---

## 🏭 IV. Usines de Transformation

Certaines cultures peuvent être transformées en produits de plus grande valeur.  
Une unité dʼusine peut transformer X litres dʼentrée en Y litres de sortie selon un facteur de multiplication de valeur.

| Usine               | Intrants requis                           | Résultat  | Multiplicateur |
| ------------------- | ----------------------------------------- | --------- | -------------- |
| Moulin à huile      | tournesol, olive, canola, riz             | Huile     | x2             |
| Scierie             | peuplier                                  | Planches  | x2             |
| Fabrique de wagons  | Planches                                  | Wagons    | x4             |
| Usine de jouets     | Planches                                  | Jouets    | x3             |
| Moulin à grains     | blé, orge, sorgho                         | Farine    | x2             |
| Raffinerie de sucre | betterave, canne à sucre                  | Sucre     | x2             |
| Filature            | coton                                     | Tissu     | x2             |
| Atelier de couture  | Tissu                                     | Vêtements | x2             |
| Boulangerie         | sucre + farine (quantités égales)         | Gâteau    | x6             |
| Usine de chips      | pomme de terre + huile (quantités égales) | Chips     | x6             |
| Cave à vin          | raisin                                    | Vin       | x2             |

---

## 🧠 V. Travaux Demandés

Votre projet devra inclure les éléments suivants :

1. **Modélisation complète** des entités du système (champs, cultures, machines, stockage, usines...).
2. **Interface ou API** permettant de manipuler la ferme : actions disponibles (labourer, semer, fertiliser, récolter, transporter, transformer...).
3. **Système de gestion des ressources** : vérification de la disponibilité du matériel, du stockage, des cycles de production.
4. **Suivi de la production et des revenus.**
5. **Gestion du stockage** : blocage de la récolte si lʼespace est insuffisant.
6. **Implémentation des règles de transformation** avec les multiplicateurs.
7. _(Facultatif)_ Interface visuelle ou rapport textuel simulant une journée agricole.

---

### Cycle de vie d’un champ

Chaque champ suit les étapes suivantes :  
`récolté` → `labouré` → `semé` → `fertilisé` → `prêt à récolter`

- Les actions **récolte, labourage, semis et fertilisation** prennent chacune 30 secondes.
- Une fois semé, un champ devient éligible à la récolte après 2 minutes.
- L'action **fertiliser** augmente le rendement du champ de 50 %.
- Les champs récoltés envoient automatiquement leur production dans le stockage.
- Les usines récupèrent les ingrédients uniquement depuis le stockage : il nʼest pas possible de déposer directement les récoltes des champs dans les usines.
- Les usines déposent également leurs produits finis dans le stockage.
- La capacité de traitement des usines est de **100 L par seconde**.
- Vous pouvez consulter la liste des items présents dans le stockage, et les supprimer ou les vendre.
- Les usines consomment directement depuis le stockage.

> ⚠️ **Attention** : si le stockage est plein, les usines ne peuvent pas y déposer leur production et se mettent en pause automatiquement.
