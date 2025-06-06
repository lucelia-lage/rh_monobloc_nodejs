const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient({});

exports.getHome = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.session.user.id },
            include: {
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
