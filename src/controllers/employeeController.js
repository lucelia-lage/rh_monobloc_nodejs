const { PrismaClient } = require("../../generated/prisma");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

exports.getAddEmployee = async (req, res) => {
    res.render("pages/employee.twig", { user: req.session.user });
};

exports.postAddEmployee = async (req, res) => {
    try {
        // Vérifications avant création
        if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password) {
            throw { 
                general: "Tous les champs obligatoires doivent être remplis",
                firstName: !req.body.firstName ? "Le prénom est requis" : null,
                lastName: !req.body.lastName ? "Le nom est requis" : null,
                email: !req.body.email ? "L'email est requis" : null,
                password: !req.body.password ? "Le mot de passe est requis" : null
            };
        }

        //email existe déjà ?
        const existingEmployee = await prisma.employee.findUnique({
            where: { email: req.body.email }
        });
        
        if (existingEmployee) {
            throw { email: "Cet email est déjà utilisé par un autre employé" };
        }

        const employee = await prisma.employee.create({
            data: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: await bcrypt.hash(req.body.password, 10),
                age: req.body.age ? parseInt(req.body.age) : null,
                gender: req.body.gender || null,
                userId: req.session.user.id
            }
        });
        res.redirect("/home");
    }
    catch (error) {
        console.log(error);
        
        // Gérer les erreurs de base de données Prisma
        let customError = error;
        if (error.code === 'P2002') {
            if (error.meta?.target?.includes('email')) {
                customError = { email: "Cet email est déjà utilisé par un autre employé" };
            }
        }
        
        res.render("pages/employee.twig", { 
            error: customError, 
            user: req.session.user,
            formData: req.body // conserve les données saisies
        });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        //employé a un ordinateur assigné ?
        const employeeWithComputer = await prisma.employee.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { computers: true }
        });

        if (employeeWithComputer && employeeWithComputer.computers.length > 0) {
            // Détacher les ordinateurs avant suppression
            await prisma.computer.updateMany({
                where: { employeeId: parseInt(req.params.id) },
                data: { employeeId: null }
            });
        }

        await prisma.employee.delete({
            where: {
                id: parseInt(req.params.id)
            }
        });
        res.redirect("/home");
    }
    catch (error) {
        console.log(error);
        res.redirect("/home");
    }
};

exports.getUpdateEmployee = async (req, res) => {
    try {
        const employee = await prisma.employee.findUnique({
            where: {
                id: parseInt(req.params.id)
            }
        });

        if (!employee) {
            return res.redirect("/home");
        }

        res.render("pages/employee.twig", { employee, user: req.session.user });
    }
    catch (error) {
        console.log(error);
        res.redirect("/home");
    }
};

exports.postUpdateEmployee = async (req, res) => {
    try {
        // Vérifications avant mise à jour
        if (!req.body.firstName || !req.body.lastName || !req.body.email) {
            throw { 
                general: "Les champs obligatoires doivent être remplis",
                firstName: !req.body.firstName ? "Le prénom est requis" : null,
                lastName: !req.body.lastName ? "Le nom est requis" : null,
                email: !req.body.email ? "L'email est requis" : null
            };
        }

        // email existe déjà pour un autre employé ?
        const existingEmployee = await prisma.employee.findUnique({
            where: { email: req.body.email }
        });
        
        if (existingEmployee && existingEmployee.id !== parseInt(req.params.id)) {
            throw { email: "Cet email est déjà utilisé par un autre employé" };
        }

        const updateData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            age: req.body.age ? parseInt(req.body.age) : null,
            gender: req.body.gender || null
        };

        if (req.body.password) {
            updateData.password = await bcrypt.hash(req.body.password, 10);
        }

        await prisma.employee.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: updateData
        });

        res.redirect("/home");
    } catch (error) {
        console.log(error);
        const employee = await prisma.employee.findUnique({
            where: {
                id: parseInt(req.params.id)
            }
        });
        
        // Gérer les erreurs de base de données Prisma
        let customError = error;
        if (error.code === 'P2002') {
            if (error.meta?.target?.includes('email')) {
                customError = { email: "Cet email est déjà utilisé par un autre employé" };
            }
        }
        
        res.render("pages/employee.twig", { 
            employee, 
            error: customError, 
            user: req.session.user,
            formData: req.body // conserve les données saisies
        });
    }
};