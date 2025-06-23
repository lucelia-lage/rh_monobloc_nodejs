// Logique métier pour chaque entité 
const { PrismaClient } = require("../../generated/prisma"); // Importation de PrismaClient pour la gestion de la base de données
const prisma = new PrismaClient(); // Initialisation de PrismaClient

exports.getAddComputer = async (req, res) => {
    const employees = await prisma.employee.findMany({ // récupère les employés de l'utilisateur connecté
        where: { userId: req.session.user.id } // pour lister les employés dans le formulaire d'ajout d'ordinateur
    });

    res.render("pages/computer.twig", { user: req.session.user, employees }); // affiche le formulaire d'ajout d'ordinateur
};

exports.postAddComputer = async (req, res) => { // req : contient les données du formulaire d'ajout d'ordinateur / res : pour envoyer la réponse au client
    try {
        // employé a déjà un ordinateur assigné ?
        if (req.body.employeeId) { // si un employé est sélectionné dans le formulaire
            const existingComputer = await prisma.computer.findUnique({ // vérifie si cet employé a déjà un ordinateur assigné
                where: { employeeId: parseInt(req.body.employeeId) } // recherche un ordinateur avec l'ID de l'employé sélectionné
            });
            
            if (existingComputer) { // si un ordinateur est trouvé pour cet employé
                throw { employeeId: "Cet employé a déjà un ordinateur assigné" }; // lance une erreur personnalisée
            }
        }

        // adresse MAC existe déjà ?
        const existingMac = await prisma.computer.findUnique({
            where: { macAddress: req.body.macAddress } // vérifie si l'adresse MAC existe déjà dans la base de données
        });
        
        if (existingMac) { // si une adresse MAC est trouvée
            throw { macAddress: "Cette adresse MAC existe déjà" }; // erreur personalisée
        }

        await prisma.computer.create({ // crée un nouvel ordinateur avec les données du formulaire
            data: { // données à insérer dans la base de données
                macAddress: req.body.macAddress, // req.body contient les données du formulaire
                userId: req.session.user.id, 
                employeeId: req.body.employeeId ? parseInt(req.body.employeeId) : null // si un employé est sélectionné, on l'associe à l'ordinateur, sinon on met null
            }
        });
        res.redirect("/home"); // redirige vers la page d'accueil après l'ajout de l'ordinateur
    }
    catch (error) {
        console.log(error); 
        const employees = await prisma.employee.findMany({ // récupère les employés de l'utilisateur connecté pour les afficher dans le formulaire d'ajout d'ordinateur
            where: { userId: req.session.user.id } // pour lister les employés dans le formulaire d'ajout d'ordinateur // session : contient l'utilisateur connecté
        });
        
        // gestion d'erreurs de base de données Prisma : 
        let customError = error;
        if (error.code === 'P2002') { // code d'erreur = ça veut dire qu'une valeur unique est déjà utilisée
            if (error.meta?.target?.includes('macAddress')) { // si l'erreur concerne l'adresse MAC
                customError = { macAddress: "Cette adresse MAC existe déjà" }; // cette erreur sera affichée dans le formulaire
            } else if (error.meta?.target?.includes('employeeId')) { // si l'erreur concerne l'ID de l'employé
                customError = { employeeId: "Cet employé a déjà un ordinateur assigné" }; // cette erreur sera affichée dans le formulaire
            }
        }
        
        res.render("pages/computer.twig", { // renvoie le formulaire d'ajout d'ordinateur avec les erreurs et les données saisies
            error: customError, // erreur personnalisée à afficher dans le formulaire
            user: req.session.user, // utilisateur connecté
            employees, // liste des employés pour le formulaire
            formData: req.body // conserve les données saisies
        });
    }
};

exports.deleteComputer = async (req, res) => {
    try { // supprime l'ordinateur avec l'ID spécifié dans l'URL
        await prisma.computer.delete({ // supprime l'ordinateur de la base de données
            where: {
                id: parseInt(req.params.id) // parseInt : convertit l'ID de l'ordinateur en entier
            }
        });
        res.redirect("/home"); // redirige vers la page d'accueil après la suppression de l'ordinateur
    }
    catch (error) {
        console.log(error); 
        res.redirect("/home"); // en cas d'erreur, redirige vers la page d'accueil
    }
};

exports.getUpdateComputer = async (req, res) => { // exports : permet d'exporter la fonction pour qu'elle soit accessible dans d'autres fichiers
    try {
        const computer = await prisma.computer.findUnique({ // récupère l'ordinateur avec l'ID spécifié dans l'URL
            where: { // 
                id: parseInt(req.params.id) // req.params.id : ID de l'ordinateur passé dans l'URL
            },
            include: { employee: true } // inclut les informations de l'employé associé à l'ordinateur
        });

        const employees = await prisma.employee.findMany({ // récupère les employés de l'utilisateur connecté
            where: { userId: req.session.user.id } // pour lister les employés dans le formulaire de modification d'ordinateur
        });

        res.render("pages/computer.twig", { computer, user: req.session.user, employees }); // affiche le formulaire de modification d'ordinateur avec les données de l'ordinateur et les employés
    }
    catch (error) {
        console.log(error);
        res.redirect("/home"); // en cas d'erreur, redirige vers la page d'accueil
    }
};

exports.postUpdateComputer = async (req, res) => {
    try {
        // employé a déjà un ordinateur assigné (sauf celui en cours de modification) ?
        if (req.body.employeeId) {
            const existingComputer = await prisma.computer.findUnique({ // vérifie si un ordinateur existe déjà pour cet employé
                where: { employeeId: parseInt(req.body.employeeId) } // recherche un ordinateur avec l'ID de l'employé sélectionné
            });
            
            if (existingComputer && existingComputer.id !== parseInt(req.params.id)) { 
                throw { employeeId: "Cet employé a déjà un ordinateur assigné" };
            }
        }

        // adresse MAC existe déjà (sauf pour cet ordinateur) ?
        const existingMac = await prisma.computer.findUnique({
            where: { macAddress: req.body.macAddress }
        });
        
        if (existingMac && existingMac.id !== parseInt(req.params.id)) { // si une adresse MAC est trouvée et qu'elle n'est pas celle de l'ordinateur en cours de modification
            throw { macAddress: "Cette adresse MAC existe déjà" }; // lance une erreur personnalisée
        }

        await prisma.computer.update({ // met à jour l'ordinateur avec les données du formulaire
            where: {
                id: parseInt(req.params.id) // req.params.id : ID de l'ordinateur passé dans l'URL
            },
            data: {
                macAddress: req.body.macAddress,
                employeeId: req.body.employeeId ? parseInt(req.body.employeeId) : null // si un employé est sélectionné, on l'associe à l'ordinateur, sinon on met null
            }
        });
        res.redirect("/home");
    } catch (error) {
        console.log(error);
        const computer = await prisma.computer.findUnique({ // récupère l'ordinateur en cours de modification pour afficher ses données dans le formulaire
            where: {
                id: parseInt(req.params.id) // parsent : convertit l'ID de l'ordinateur en entier // req.params.id : ID de l'ordinateur passé dans l'URL
            },
            include: { employee: true } // inclut les informations de l'employé associé à l'ordinateur
        });
        const employees = await prisma.employee.findMany({ // récupère les employés de l'utilisateur connecté pour les afficher dans le formulaire de modification d'ordinateur
            where: { userId: req.session.user.id } // pour lister les employés dans le formulaire de modification d'ordinateur
        });
        
        // gestions des erreurs de base de données Prisma
        let customError = error; // erreur personnalisée à afficher dans le formulaire
        if (error.code === 'P2002') { // code d'erreur = ça veut dire qu'une valeur unique est déjà utilisée
            if (error.meta?.target?.includes('macAddress')) { // si l'erreur concerne l'adresse MAC
                customError = { macAddress: "Cette adresse MAC existe déjà" }; // cette erreur sera affichée dans le formulaire
            } else if (error.meta?.target?.includes('employeeId')) { // si l'erreur concerne l'ID de l'employé // meta et target : propriétés de l'erreur Prisma
                customError = { employeeId: "Cet employé a déjà un ordinateur assigné" };
            }
        }
        
        res.render("pages/computer.twig", {  // renvoie le formulaire de modification d'ordinateur avec les erreurs et les données saisies
            computer, // ordinateur en cours de modification
            error: customError, // erreur personnalisée à afficher dans le formulaire
            user: req.session.user, // utilisateur connecté
            employees, // liste des employés pour le formulaire de modification d'ordinateur
            formData: req.body // conserve les données saisies
        });
    }
};

exports.reportDefective = async (req, res) => { // export la fonction pour qu'elle soit accessible dans d'autres fichiers // req : contient les données du formulaire de déclaration de panne / res : pour envoyer la réponse au client
    try {
        const computerId = parseInt(req.params.id); // req.params.id : ID de l'ordinateur passé dans l'URL
        const reportedBy = req.session.user.role === 'employee' ? 'employee' : 'user'; // détermine qui signale la panne (employé ou utilisateur)
        
        await prisma.computer.update({ // met à jour l'ordinateur pour indiquer qu'il est en panne
            where: { id: computerId },
            data: {
                isDefective: true,
                defectiveAt: new Date(),
                defectiveReportedBy: reportedBy
            }
        });
        
        console.log(" Panne déclarée avec succès");
        
        //selon le type d'utilisateur, rediriger vers la bonne page : 
        if (req.session.user.role === 'employee') {
            res.redirect("/employee/home");
        } else {
            res.redirect("/home");
        }
    } catch (error) {
        console.error(" Erreur lors de la déclaration de panne:", error);
        res.redirect("/home");
    }
};

exports.resolveDefective = async (req, res) => { // export la fonction pour qu'elle soit accessible dans d'autres fichiers // req : contient les données du formulaire de résolution de panne / res : pour envoyer la réponse au client
    try {
        const computerId = parseInt(req.params.id);
        
        await prisma.computer.update({
            where: { id: computerId },
            data: {
                isDefective: false,
                defectiveAt: null,
                defectiveReportedBy: null
            }
        });
        
        console.log(" Panne résolue avec succès");
        res.redirect("/home");
    } catch (error) {
        console.error(" Erreur lors de la résolution de panne:", error);
        res.redirect("/home");
    }
};