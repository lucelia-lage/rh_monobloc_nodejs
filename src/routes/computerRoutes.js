// Définit les URLs et associe aux controllers
const express = require("express"); // sert à créer un routeur Express pour gérer les routes liées aux ordinateurs
const router = express.Router(); // Importation du contrôleur pour gérer la logique métier des ordinateurs
const computerController = require("../controllers/computerController"); // Importation du middleware d'authentification pour protéger les routes

router.post("/computer/reportDefective/:id", computerController.reportDefective); // Route pour signaler un ordinateur défectueux
router.post("/computer/resolveDefective/:id", computerController.resolveDefective); // Route pour résoudre un ordinateur défectueux

router.get("/computer/addComputer", computerController.getAddComputer); // Route pour afficher le formulaire d'ajout d'ordinateur
router.post("/computer/addComputer", computerController.postAddComputer); // Route pour traiter l'ajout d'un nouvel ordinateur

router.get("/computer/updateComputer/:id", computerController.getUpdateComputer); // Route pour afficher le formulaire de mise à jour d'un ordinateur
router.post("/computer/updateComputer/:id", computerController.postUpdateComputer); // Route pour traiter la mise à jour d'un ordinateur

router.get("/computer/deleteComputer/:id", computerController.deleteComputer); // Route pour supprimer un ordinateur

module.exports = router; // Exportation du routeur pour l'utiliser dans l'application principale
      
