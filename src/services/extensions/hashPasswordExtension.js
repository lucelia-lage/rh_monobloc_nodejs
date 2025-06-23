const { Prisma } = require("../../../generated/prisma") // Import Prisma pour étendre ses fonctionnalités
const bcrypt = require("bcrypt") // Import de bcrypt pour le hashage des mots de passe

module.exports = Prisma.defineExtension({ // Définition de l'extension Prisma
    name: "yoloHashPassword", // Nom de l'extension
    query: { // Définition des requêtes Prisma étendues
        user: { // Étend les requêtes pour l'entité utilisateur
            create: async ({args, query}) => { // Middleware pour le hashage du mot de passe lors de la création d'un utilisateur
                try {
                    const hash = await bcrypt.hash(args.data.password, 10) // Hashage du mot de passe // args : ça représente les arguments de la requête
                    args.data.password = hash // On remplace le mot de passe en clair par le mot de passe hashé
                    return query(args) // On continue la requête avec les arguments modifiés
                }
                catch(error) {
                    throw error
                }
            },
            update: async ({args, query}) => { // Middleware pour le hashage du mot de passe lors de la mise à jour d'un utilisateur
                try {
                    if (args.data.password) { // Si un mot de passe est fourni dans les données de mise à jour
                        const hash = await bcrypt.hash(args.data.password, 10) // Hashage du mot de passe
                        args.data.password = hash // On remplace le mot de passe en clair par le mot de passe hashé
                    }
                    return query(args) // On continue la requête avec les arguments modifiés
                }
                catch(error) {
                    throw error
                }
            }
        },
        employee: {
            create: async ({args, query}) => { // Middleware pour le hashage du mot de passe lors de la création d'un employé
                try { 
                    const hash = await bcrypt.hash(args.data.password, 10) // Hashage du mot de passe
                    args.data.password = hash // On remplace le mot de passe en clair par le mot de passe hashé
                    return query(args) // On continue la requête avec les arguments modifiés
                }
                catch(error) {
                    throw error
                }
            },
            update: async ({args, query}) => { // Middleware pour le hashage du mot de passe lors de la mise à jour d'un employé
                try {
                    if (args.data.password) { // Si un mot de passe est fourni dans les données de mise à jour
                        const hash = await bcrypt.hash(args.data.password, 10) // Hashage du mot de passe
                        args.data.password = hash // On remplace le mot de passe en clair par le mot de passe hashé
                    }
                    return query(args)
                }
                catch(error) {
                    throw error
                }
            }
        }
    }
})