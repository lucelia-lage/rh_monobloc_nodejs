// Définit les URLs et associe aux controllers
const express = require("express"); // Import express pour créer des routes
const router = express.Router(); // Créer un routeur pour gérer les routes liées aux employés
const employeeController = require("../controllers/employeeController"); // Importer le middleware d'authentification pour protéger les routes
const authguard = require("../services/authguard"); // Importer le contrôleur pour gérer la logique métier des employés (authguard: pour vérifier l'authentification des utilisateurs)

router.get("/employee/home", authguard, employeeController.getEmployeeHome); // Route pour afficher la page d'accueil de l'employé

router.get("/employee/addEmployee", authguard, employeeController.getAddEmployee); // Route pour afficher le formulaire d'ajout d'employé
router.post("/employee/addEmployee", authguard, employeeController.postAddEmployee); // Route pour traiter l'ajout d'un nouvel employé

router.get("/employee/updateEmployee/:id", authguard, employeeController.getUpdateEmployee); // Route pour afficher le formulaire de mise à jour d'un employé
router.post("/employee/updateEmployee/:id", authguard, employeeController.postUpdateEmployee); // Route pour traiter la mise à jour d'un employé

router.get("/employee/deleteEmployee/:id", authguard, employeeController.deleteEmployee); // Route pour supprimer un employé

module.exports = router; // Exporter le routeur pour l'utiliser dans l'application principale
