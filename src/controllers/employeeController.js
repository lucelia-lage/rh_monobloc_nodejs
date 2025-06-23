const { PrismaClient } = require("../../generated/prisma");
const upload = require("../services/upload");
const bcrypt = require("bcrypt");
const emailService = require("../services/emailService");
const prisma = new PrismaClient({});

exports.getEmployeeHome = async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.session.user.id },
      include: { computers: true }
    });

    res.render("pages/employeeHome.twig", {
      user: employee,
      computer: employee.computers[0] // un employé est associé à un seul ordinateur
    });
  } catch (error) {
    console.error(" Erreur lors du chargement de l'accueil employé:", error);
    res.render("pages/employeeHome.twig", {
      user: req.session.user,
      computer: null
    });
  }
};

exports.getAddEmployee = async (req, res) => {
  res.render("pages/employee.twig", {
    user: req.session.user
  });
};

exports.postAddEmployee = [
  upload.single('avatar'),
  async (req, res) => {
    try {
      const { firstName, lastName, email, password, age, gender } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;

      const employee = await prisma.employee.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          age: age ? parseInt(age) : null,
          gender,
          userId: req.session.user.id,
          avatar: avatarPath
        }
      });

      console.log(" Employé créé avec succès");

      // Envoi de l'email de bienvenue à l'employé
      try {
        const companyData = await prisma.user.findUnique({
          where: { id: req.session.user.id }
        });

        const emailResult = await emailService.sendEmployeeWelcomeEmail(
          email,
          { firstName, lastName, email },
          companyData
        );

        if (emailResult.success) {
          console.log(' Email de bienvenue employé envoyé avec succès');
        } else {
          console.error(' Erreur envoi email employé:', emailResult.error);
        }
      } catch (emailError) {
        console.error(' Erreur critique email employé:', emailError);
      }

      res.redirect("/home");
    } catch (error) {
      console.error(" Erreur lors de l'ajout de l'employé:", error);

      let customError = error;
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('email')) {
          customError = { email: "Cet email existe déjà" };
        }
      }

      res.render('pages/employee.twig', {
        error: customError,
        formData: req.body,
        user: req.session.user
      });
    }
  }
];

exports.getUpdateEmployee = async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!employee) {
      return res.redirect("/home");
    }

    res.render("pages/employee.twig", {
      employee,
      user: req.session.user
    });
  } catch (error) {
    console.error(" Erreur lors du chargement de l'employé:", error);
    res.redirect("/home");
  }
};

exports.postUpdateEmployee = [
  upload.single('avatar'),
  async (req, res) => {
    try {
      const { firstName, lastName, email, password, age, gender } = req.body;
      const avatarPath = req.file ? '/uploads/' + req.file.filename : req.body.existingAvatar;

      const updateData = {
        firstName,
        lastName,
        email,
        age: age ? parseInt(age) : null,
        gender,
        avatar: avatarPath
      };

      if (password && password.trim() !== '') {
        updateData.password = await bcrypt.hash(password, 10);
      }

      await prisma.employee.update({
        where: { id: parseInt(req.params.id) },
        data: updateData
      });

      console.log(" Employé mis à jour avec succès");
      res.redirect("/home");
    } catch (error) {
      console.error(" Erreur lors de la modification de l'employé:", error);

      let customError = error;
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('email')) {
          customError = { email: "Cet email existe déjà" };
        }
      }

      res.render('pages/employee.twig', {
        error: customError,
        formData: req.body,
        user: req.session.user
      });
    }
  }
];

exports.deleteEmployee = async (req, res) => {
  try {
    // L'employé a un ordinateur assigné ?
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
      where: { id: parseInt(req.params.id) }
    });

    console.log(" Employé supprimé avec succès");
    res.redirect("/home");
  } catch (error) {
    console.error(" Erreur lors de la suppression de l'employé:", error);
    res.redirect("/home");
  }
};
