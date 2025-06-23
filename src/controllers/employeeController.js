const { PrismaClient } = require("../../generated/prisma"); // Importation de PrismaClient pour la gestion de la base de données
const upload = require("../services/upload"); // Importation du middleware d'upload pour gérer les fichiers
const bcrypt = require("bcrypt"); // Importation de bcrypt pour le hashage des mots de passe
const emailService = require("../services/emailService"); // Importation du service d'email pour l'envoi d'emails
const prisma = new PrismaClient({}); // Initialisation de PrismaClient

exports.getEmployeeHome = async (req, res) => { // exports pour controller 
  try {
    const employee = await prisma.employee.findUnique({ // Récupération de l'employé connecté
      where: { id: req.session.user.id }, // on utilise l'id de l'utilisateur connecté
      include: { computers: true } // Inclure les ordinateurs associés à l'employé
    });

    res.render("pages/employeeHome.twig", { // Rendu de la page d'accueil de l'employé
      user: employee,
      computer: employee.computers[0] // un employé est associé à un seul ordinateur
    });
  } catch (error) {
    console.error(" Erreur lors du chargement de l'accueil employé:", error);
    res.render("pages/employeeHome.twig", {
      user: req.session.user, // si l'employé n'est pas trouvé, on redirige vers la page d'accueil
      computer: null // pas d'ordinateur associé
    });
  }
};

exports.getAddEmployee = async (req, res) => { // Récupération de la page d'ajout d'employé
  res.render("pages/employee.twig", {
    user: req.session.user // on passe l'utilisateur connecté pour le formulaire
  });
};

exports.postAddEmployee = [ // Middleware pour gérer l'upload de l'avatar
  upload.single('avatar'), // on utilise multer pour gérer l'upload de fichier
  async (req, res) => {
    try {
      const { firstName, lastName, email, password, age, gender } = req.body; // récupération des données du formulaire
      const hashedPassword = await bcrypt.hash(password, 10); // Hashage du mot de passe
      const avatarPath = req.file ? `/uploads/${req.file.filename}` : null; // Chemin de l'avatar, si uploadé

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
        const companyData = await prisma.user.findUnique({ // Récupération des données de l'entreprise
          where: { id: req.session.user.id } // on utilise l'id de l'utilisateur connecté
        });

        const emailResult = await emailService.sendEmployeeWelcomeEmail( // Envoi de l'email de bienvenue
          email,
          { firstName, lastName, email },
          companyData
        );

        if (emailResult.success) { // Si l'email a été envoyé avec succès
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
      if (error.code === 'P2002') { // Gestion des erreurs Prisma
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
  upload.single('avatar'), // single pour un seul fichier // on utilise multer pour gérer l'upload de fichier
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
