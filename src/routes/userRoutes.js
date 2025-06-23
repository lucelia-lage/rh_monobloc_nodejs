// Définit les URLs et associe aux controllers
const express = require("express"); // Importation du module express pour créer des routes
const router = express.Router(); // Création d'un routeur pour gérer les routes liées aux utilisateurs
const userController = require("../controllers/userController"); // Importation du contrôleur pour gérer la logique métier des utilisateurs
const upload = require("../services/upload"); // Importation du middleware d'authentification pour protéger les routes

router.get("/register", userController.getRegister); // Route pour afficher la page d'inscription
router.post("/register", userController.postRegister);  // Route pour traiter l'inscription d'un nouvel utilisateur

router.get("/user/updateProfile", userController.getUpdateProfile); // Route pour afficher le formulaire de mise à jour du profil utilisateur
router.post("/user/updateProfile", userController.postUpdateProfile); // Route pour traiter la mise à jour du profil utilisateur

router.get("/login", userController.getLogin);  // Route pour afficher la page de connexion
router.post("/login", userController.postLogin); // Route pour traiter la connexion d'un utilisateur

router.get("/logout", userController.getLogout); // Route pour déconnecter l'utilisateur

module.exports = router; // Exportation du routeur pour l'utiliser dans l'application principale
