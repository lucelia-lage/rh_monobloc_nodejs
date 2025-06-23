const express = require("express"); // Importation du module express
const router = express.Router(); // Création d'un routeur Express pour gérer les routes principales de l'application
const mainController = require("../controllers/mainController"); // Importation du contrôleur principal pour gérer la logique métier des routes principales
const authguard = require("../services/authguard"); // Importation du middleware d'authentification pour protéger les routes

router.get("/home", authguard, mainController.getHome); // Route pour afficher la page d'accueil, protégée par l'authentification

module.exports = router; // Exportation du routeur pour l'utiliser dans l'application principale



