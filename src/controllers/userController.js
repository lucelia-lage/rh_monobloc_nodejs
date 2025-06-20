const { PrismaClient } = require("../../generated/prisma");
const upload = require("../services/upload");
const bcrypt = require("bcrypt");
const hashPasswordExtension = require("../services/extensions/hashPasswordExtension");
const emailService = require("../services/emailService");

const prisma = new PrismaClient().$extends(hashPasswordExtension);

exports.getRegister = async (req, res) => {
  res.render("pages/register.twig");
};

exports.postRegister = [
  upload.single('avatar'),
  async (req, res) => {
    try {
      const { companyName, siret, email, password, confirmPassword, directorName } = req.body;

      if (password !== confirmPassword) {
        throw { confirmPassword: "Veuillez renseigner des mots de passe identiques" };
      }

      // Création de l'utilisateur avec email
      const user = await prisma.user.create({
        data: {
          companyName,
          siret,
          email, // 🆕 Ajout du champ email
          password, // L'extension se charge du hachage
          directorName,
          avatar: req.file ? '/uploads/' + req.file.filename : null
        }
      });

      console.log("Utilisateur enregistré avec succès");

      // 🎯 ENVOI DE L'EMAIL DE BIENVENUE
      try {
        const emailResult = await emailService.sendWelcomeEmail(
          email, // 🆕 Utilisation du vrai email de l'utilisateur
          {
            companyName,
            siret,
            directorName,
            email
          }
        );

        if (emailResult.success) {
          console.log('✅ Email de bienvenue envoyé avec succès');
        } else {
          console.error('❌ Erreur envoi email:', emailResult.error);
          // On continue même si l'email échoue (l'inscription reste valide)
        }
      } catch (emailError) {
        console.error('❌ Erreur critique email:', emailError);
        // L'inscription reste valide même si l'email échoue
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
      // Vérifier d'abord si c'est un employé
      const employee = await prisma.employee.findUnique({
        where: { email }
      });

      if (employee && await bcrypt.compare(password, employee.password)) {
        req.session.user = { ...employee, role: 'employee' };
        return res.redirect("/employee/home");
      }

      // 🆕 Vérifier si c'est un chef d'entreprise
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
        email, // 🆕 Mise à jour de l'email
        directorName,
        avatar: avatarPath
      };

      if (password && password.trim() !== '') {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.session.user.id },
        data: updateData
      });

      req.session.user = { ...req.session.user, ...updatedUser };

      console.log("Profil mis à jour avec succès");
      res.redirect("/");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil :", error);
      
      // Gestion des erreurs Prisma
      let customError = error;
      if (error.code === 'P2002') {
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