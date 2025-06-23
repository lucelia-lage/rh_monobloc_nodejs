const { PrismaClient } = require("../../generated/prisma"); // Import PrismaClient pour la gestion de la base de données
const upload = require("../services/upload"); // Import du middleware d'upload
const bcrypt = require("bcrypt"); // Import de bcrypt pour le hashage des mots de passe
const hashPasswordExtension = require("../services/extensions/hashPasswordExtension"); // Import de l'extension pour le hashage des mots de passe
const emailService = require("../services/emailService"); // Import du service d'email

const prisma = new PrismaClient().$extends(hashPasswordExtension); // Initialisation de PrismaClient avec l'extension de hashage des mots de passe

exports.getRegister = async (req, res) => { // Récupération de la page d'inscription
  res.render("pages/register.twig"); // on affiche la page d'inscription
};

exports.postRegister = [
  upload.single('avatar'), // Middleware pour gérer l'upload de l'avatar
  async (req, res) => {
    try {
      const { companyName, siret, email, password, confirmPassword, directorName } = req.body;

      if (password !== confirmPassword) {
        throw { confirmPassword: "Veuillez renseigner des mots de passe identiques" };
      }

      // utilisateur avec email
      const user = await prisma.user.create({ // Création de l'utilisateur
        data: {
          companyName,
          siret,
          email, 
          password, 
          directorName,
          avatar: req.file ? '/uploads/' + req.file.filename : null // Chemin de l'avatar, si uploadé
        }
      });

      console.log("Utilisateur enregistré avec succès");

      try {
        const emailResult = await emailService.sendWelcomeEmail(
          email, 
          {
            companyName,
            siret,
            directorName,
            email
          }
        );

        if (emailResult.success) {
          console.log(' Email de bienvenue envoyé avec succès');
        } else {
          console.error(' Erreur envoi email:', emailResult.error);
          // On continue même si l'email ne marche pas (l'inscription reste valide)
        }
      } catch (emailError) {
        console.error(' Erreur critique email:', emailError);
        // L'inscription reste valide même si l'email ne marche pas
      }

      res.redirect("/login");
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      
      // Gestion des erreurs Prisma
      let customError = error;
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('siret')) {
          customError = { siret: "Ce SIRET existe déjà" };
        } else if (error.meta?.target?.includes('email')) {
          customError = { email: "Cet email existe déjà" };
        }
      }
      
      res.render('pages/register.twig', { 
        error: customError,
        formData: req.body // Conserve les données saisies
      });
    }
  }
];

exports.getLogin = async (req, res) => {
  res.render('pages/login.twig');
};

exports.postLogin = async (req, res) => {
  const { email, password, siret } = req.body;

  try {
    if (siret) {
      const user = await prisma.user.findUnique({
        where: { siret }
      });

      if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = user;
        return res.redirect("/");
      } else {
        throw { siret: "SIRET ou mot de passe incorrect" };
      }
    }

    if (email) {
      // c'est un employé ?
      const employee = await prisma.employee.findUnique({
        where: { email }
      });

      if (employee && await bcrypt.compare(password, employee.password)) {
        req.session.user = { ...employee, role: 'employee' };
        return res.redirect("/employee/home");
      }

      //c'est un chef d'entreprise ?
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = user;
        return res.redirect("/");
      }

      throw { email: "Email ou mot de passe incorrect" };
    }

    throw { general: "Veuillez fournir un SIRET ou un email" };
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.render("pages/login.twig", { error });
  }
};

exports.getUpdateProfile = async (req, res) => {
  if (!req.session.user || req.session.user.role === 'employee') {
    return res.redirect('/login');
  }
  
  res.render("pages/updateProfile.twig", { user: req.session.user });
};

exports.postUpdateProfile = [
  upload.single('avatar'),
  async (req, res) => {
    try {
      const { companyName, email, directorName, password, confirmPassword } = req.body;
      const avatarPath = req.file ? '/uploads/' + req.file.filename : req.body.existingAvatar;

      if (password && password.trim() !== '') {
        if (password !== confirmPassword) {
          throw { confirmPassword: "Les mots de passe ne correspondent pas" };
        }
      }

      const updateData = {
        companyName,
        email,
        directorName,
        avatar: avatarPath
      };

      if (password && password.trim() !== '') { // Si un mot de passe est fourni, on le hash (trim : pour enlever les espaces inutiles)
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.session.user.id },
        data: updateData // on met à jour les données de l'utilisateur
      });

      req.session.user = { ...req.session.user, ...updatedUser };

      console.log("Profil mis à jour avec succès");
      res.redirect("/");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil :", error);
      
      // Gestion des erreurs Prisma
      let customError = error;
      if (error.code === 'P2002') { // Erreur de contrainte d'unicité = ça veut dire que l'email ou le SIRET existe déjà
        if (error.meta?.target?.includes('email')) {
          customError = { email: "Cet email existe déjà" };
        }
      }
      
      res.render('pages/updateProfile.twig', { 
        error: customError, 
        user: req.session.user,
        formData: req.body
      });
    }
  }
];

exports.getLogout = (req, res) => {
  req.session.destroy();
  res.redirect("/login");
};