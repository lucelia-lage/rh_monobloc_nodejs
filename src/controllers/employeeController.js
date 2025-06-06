const { PrismaClient } = require("../../generated/prisma");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

exports.getAddEmployee = async (req, res) => {
    res.render("pages/employee.twig", { user: req.session.user });
};

exports.postAddEmployee = async (req, res) => {
    try {
        const employee = await prisma.employee.create({
            data: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: await bcrypt.hash(req.body.password, 10),
                age: req.body.age ? parseInt(req.body.age) : null,
                gender: req.body.gender || null, // j'ai mis ça pour éviter les erreurs si le champ est vide
                userId: req.session.user.id
            }
        });
        res.redirect("/home");
    }
    catch (error) {
        res.render("pages/employee.twig", { error, user: req.session.user });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        await prisma.employee.delete({
            where: {
                id: parseInt(req.params.id)
            }
        });
        res.redirect("/home");
    }
    catch (error) {
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

        res.render("pages/employee.twig", { employee, user: req.session.user });
    }
    catch (error) {
        console.log(error);
        res.redirect("/home");
    }
};

exports.postUpdateEmployee = async (req, res) => {
    try {
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
        res.render("pages/employee.twig", { employee, error, user: req.session.user });
    }
};
