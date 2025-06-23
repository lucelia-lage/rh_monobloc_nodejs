// Logique métier pour chaque entité 
const { PrismaClient } = require("../../generated/prisma"); // Import PrismaClient
const prisma = new PrismaClient({}); // Initialize PrismaClient

exports.getHome = async (req, res) => { // ça c'est la route pour la page d'accueil
    try {
        const user = await prisma.user.findUnique({ // Récupération de l'utilisateur connecté
            where: { id: req.session.user.id },
            include: { // Inclure les ordinateurs et employés associés
                employees: true,
                computers: {
                    include: { employee: true }
                }
            }
        });
        res.render("pages/home.twig", {
            user,
            computers: user.computers,
            employees: user.employees,
        });
    } catch (error) {
        res.render("pages/home.twig", {
            user: req.session.user,
            employees: [],
            computers: []
        });
    }
};
