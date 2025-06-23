// app.js : Point d'entrée principal, démarre le serveur
const express = require("express") // Importation du module express pour créer des routes // = La fondation de ton serveur web
const userRoutes = require("./src/routes/userRoutes"); // Importation des routes liées aux utilisateurs
const mainRoutes = require("./src/routes/mainRoutes"); // Importation des routes principales de l'application
const computerRoutes = require("./src/routes/computerRoutes"); // Importation des routes liées aux ordinateurs
const employeeRoutes = require("./src/routes/employeeRoutes"); // Importation des routes liées aux employés
const testRoutes = require("./src/routes/testRoutes"); // la route de test mail


const session = require("express-session"); // Importation du middleware de session pour gérer les sessions utilisateur
require('dotenv').config() // Chargement des variables d'environnement depuis le fichier .env

const app = express(); // Création de l'application Express

app.use(testRoutes); // Utilisation des routes de test pour les fonctionnalités de test

app.set("view engine", "twig"); // j'ai dû ajouter cette ligne pour que Twig soit utilisé comme moteur de rendu

app.use(express.static("./public")) // Configuration du dossier public pour les fichiers statiques (CSS, JS, images, etc.)
app.use(express.urlencoded({extended:true})) // Middleware pour parser les données des formulaires (application/x-www-form-urlencoded) : ça veut dire que les données des formulaires seront accessibles dans req.body
app.use(session({ // Configuration de la session pour stocker les informations de session utilisateur
    secret: process.env.BCRYPT_SECRET, // Clé secrète pour signer les cookies de session
    resave: true, // Indique si la session doit être sauvegardée même si elle n'a pas été modifiée
    saveUninitialized: true // Indique si une session non initialisée doit être sauvegardée
}))

app.use(userRoutes) // Utilisation des routes liées aux utilisateurs
app.use(mainRoutes) // Utilisation des routes principales de l'application
app.use(computerRoutes) // Utilisation des routes liées aux ordinateurs
app.use(employeeRoutes) // Utilisation des routes liées aux employés

app.get("/", (req, res) => { // Route racine de l'application
    if (req.session.user) { // Vérifie si l'utilisateur est connecté
        return res.redirect("/home"); // Redirige vers la page d'accueil si l'utilisateur est connecté
    }
    res.redirect("/login"); // Redirige vers la page de connexion si l'utilisateur n'est pas connecté
});


app.listen(process.env.PORT, ()=>{ // Démarrage du serveur sur le port défini dans les variables d'environnement
    console.log("Écoute sur le port " + process.env.PORT); // Affiche un message dans la console pour indiquer que le serveur est en écoute
})
