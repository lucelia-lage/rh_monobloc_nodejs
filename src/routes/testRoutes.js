const express = require("express");
const router = express.Router();
const emailService = require("../services/emailService");

// Route de test pour vérifier la configuration email
// ⚠️ À supprimer en production !
router.get("/test-email", async (req, res) => {
    try {
        // Test de la connexion
        const connectionTest = await emailService.testEmailConnection();
        
        if (!connectionTest) {
            return res.json({
                success: false,
                message: "❌ Configuration email invalide"
            });
        }

        // Test d'envoi d'email
        const testData = {
            companyName: "Entreprise Test",
            siret: "12345678901234",
            directorName: "Jean Dupont"
        };

        const result = await emailService.sendWelcomeEmail(
            "ton_email_de_test@gmail.com", // 👈 Remplace par ton email
            testData
        );

        res.json({
            success: result.success,
            message: result.success ? "✅ Email de test envoyé !" : "❌ Erreur envoi email",
            details: result
        });

    } catch (error) {
        res.json({
            success: false,
            message: "❌ Erreur lors du test",
            error: error.message
        });
    }
});

module.exports = router;