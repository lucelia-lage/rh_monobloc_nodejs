const multer = require('multer'); // Importation de Multer pour gérer l'upload de fichiers : middleware pour gérer l'upload de fichiers dans Express

// Config du stockage
const storage = multer.diskStorage({ // diskStorage permet de stocker les fichiers sur le disque
  destination: function (req, file, cb) { // Définition du dossier de destination
    cb(null, 'public/uploads/'); // On stocke les fichiers dans le dossier public/uploads
  },
  filename: function (req, file, cb) { // Définition du nom du fichier
    cb(null, Date.now() + '-' + file.originalname); // On ajoute un timestamp pour éviter les conflits de noms : ça veut dire que le nom du fichier sera unique
  }
});

// Initialisation de Multer : 
const upload = multer({ storage: storage }); // On utilise le stockage défini précédemment

module.exports = upload; // Exportation de l'instance de Multer pour l'utiliser dans les routes

