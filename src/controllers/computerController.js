const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();

exports.getAddComputer = async (req, res) => {
    const employees = await prisma.employee.findMany({
        where: { userId: req.session.user.id }
    });

    res.render("pages/computer.twig", { user: req.session.user, employees });
};

exports.postAddComputer = async (req, res) => {
    try {
        // employé a déjà un ordinateur assigné ?
        if (req.body.employeeId) {
            const existingComputer = await prisma.computer.findUnique({
                where: { employeeId: parseInt(req.body.employeeId) }
            });
            
            if (existingComputer) {
                throw { employeeId: "Cet employé a déjà un ordinateur assigné" };
            }
        }

        // adresse MAC existe déjà ?
        const existingMac = await prisma.computer.findUnique({
            where: { macAddress: req.body.macAddress }
        });
        
        if (existingMac) {
            throw { macAddress: "Cette adresse MAC existe déjà" };
        }

        await prisma.computer.create({
            data: {
                macAddress: req.body.macAddress,
                userId: req.session.user.id,
                employeeId: req.body.employeeId ? parseInt(req.body.employeeId) : null
            }
        });
        res.redirect("/home");
    }
    catch (error) {
        console.log(error);
        const employees = await prisma.employee.findMany({
            where: { userId: req.session.user.id }
        });
        
        // gestion d'erreurs de base de données Prisma : 
        let customError = error;
        if (error.code === 'P2002') {
            if (error.meta?.target?.includes('macAddress')) {
                customError = { macAddress: "Cette adresse MAC existe déjà" };
            } else if (error.meta?.target?.includes('employeeId')) {
                customError = { employeeId: "Cet employé a déjà un ordinateur assigné" };
            }
        }
        
        res.render("pages/computer.twig", { 
            error: customError, 
            user: req.session.user, 
            employees,
            formData: req.body // conserve les données saisies
        });
    }
};

exports.deleteComputer = async (req, res) => {
    try {
        await prisma.computer.delete({
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

exports.getUpdateComputer = async (req, res) => {
    try {
        const computer = await prisma.computer.findUnique({
            where: {
                id: parseInt(req.params.id)
            },
            include: { employee: true }
        });

        const employees = await prisma.employee.findMany({
            where: { userId: req.session.user.id }
        });

        res.render("pages/computer.twig", { computer, user: req.session.user, employees });
    }
    catch (error) {
        console.log(error);
        res.redirect("/home");
    }
};

exports.postUpdateComputer = async (req, res) => {
    try {
        // employé a déjà un ordinateur assigné (sauf celui en cours de modification) ?
        if (req.body.employeeId) {
            const existingComputer = await prisma.computer.findUnique({
                where: { employeeId: parseInt(req.body.employeeId) }
            });
            
            if (existingComputer && existingComputer.id !== parseInt(req.params.id)) {
                throw { employeeId: "Cet employé a déjà un ordinateur assigné" };
            }
        }

        // adresse MAC existe déjà (sauf pour cet ordinateur) ?
        const existingMac = await prisma.computer.findUnique({
            where: { macAddress: req.body.macAddress }
        });
        
        if (existingMac && existingMac.id !== parseInt(req.params.id)) {
            throw { macAddress: "Cette adresse MAC existe déjà" };
        }

        await prisma.computer.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                macAddress: req.body.macAddress,
                employeeId: req.body.employeeId ? parseInt(req.body.employeeId) : null
            }
        });
        res.redirect("/home");
    } catch (error) {
        console.log(error);
        const computer = await prisma.computer.findUnique({
            where: {
                id: parseInt(req.params.id)
            },
            include: { employee: true }
        });
        const employees = await prisma.employee.findMany({
            where: { userId: req.session.user.id }
        });
        
        // gestions des erreurs de base de données Prisma
        let customError = error;
        if (error.code === 'P2002') {
            if (error.meta?.target?.includes('macAddress')) {
                customError = { macAddress: "Cette adresse MAC existe déjà" };
            } else if (error.meta?.target?.includes('employeeId')) {
                customError = { employeeId: "Cet employé a déjà un ordinateur assigné" };
            }
        }
        
        res.render("pages/computer.twig", { 
            computer, 
            error: customError, 
            user: req.session.user, 
            employees,
            formData: req.body // conserve les données saisies
        });
    }
};

exports.reportDefective = async (req, res) => {
    try {
        const computerId = parseInt(req.params.id);
        const reportedBy = req.session.user.role === 'employee' ? 'employee' : 'user';
        
        await prisma.computer.update({
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

exports.resolveDefective = async (req, res) => {
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