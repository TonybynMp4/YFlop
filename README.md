# YFlop
Un clone de X.com (ex Twitter).

Groupe d'Antony, Badis, Chahd & Noé

La Stack:
- Node.js & Express pour le back,
- MySQL pour la BDD,
- Vue.js pour le front,
- & [Uploadthing](https://uploadthing.com) pour la gestion des images.
(Tailwind est importé mais pas utilisé, il est là UNIQUEMENT pour Uploadthing)

# Installation
1. Clone le dépôt : `git clone https://github.com/tonybynmp4/YFlop`
2. Accédez au répertoire : `cd YFlop`
3. Créer la BDD avec `db.sql`
	- Optionnelement ajouter des données avec `sampleData.sql`
4. Créer un fichier `.env` en copiant `.env.example` et en remplissant les variables d'environnement.
5. Lancer le projet: `npm run dev`
	- (`npm start` pour la version de 'production' mais le style est un peu cassé à cause de tailwind qui overwrite le css des fichiers vue..)
6. Accédez à l'application : `http://localhost:5173`