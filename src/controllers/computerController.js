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
        res.render("pages/computer.twig", { error, user: req.session.user, employees });
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
            }
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
            }
        });
        const employees = await prisma.employee.findMany({
            where: { userId: req.session.user.id }
        });
        res.render("pages/computer.twig", { computer, error, user: req.session.user, employees });
    }
};
