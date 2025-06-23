require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmailConfiguration = async () => {
  console.log(' Test de configuration email...\n');
  
  // 1. Vérifier les variables d'environnement
  console.log('📋 Variables d\'environnement :');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***masqué***' : 'NON DÉFINI');
  console.log('APP_URL:', process.env.APP_URL);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(' Variables EMAIL_USER ou EMAIL_PASS manquantes !');
    return;
  }
  
  // 2. Créer le transporteur
  console.log(' Création du transporteur...');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  // 3. Tester la connexion
  console.log('Test de connexion...');
  try {
    await transporter.verify();
    console.log('Connexion réussie !');
  } catch (error) {
    console.log('Erreur de connexion:', error.message);
    return;
  }
  
  // 4. Envoyer un email de test
  console.log('Envoi d\'un email de test...');
  try {
    const info = await transporter.sendMail({
      from: {
        name: 'RHelp You Test',
        address: process.env.EMAIL_USER
      },
      to: process.env.EMAIL_USER,
      subject: '🧪 Test de configuration email',
      html: `
        <h2>🎉 Test réussi !</h2>
        <p>Votre configuration email fonctionne correctement.</p>
        <p><strong>Date :</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Serveur :</strong> Gmail</p>
      `,
      text: `
        🎉 Test réussi !
        
        Votre configuration email fonctionne correctement.
        Date : ${new Date().toLocaleString()}
        Serveur : Gmail
      `
    });
    
    console.log('Email de test envoyé avec succès !');
    console.log('Message ID:', info.messageId);
    console.log('Vérifiez votre boite email');
    
  } catch (error) {
    console.log('Erreur lors de l\'envoi:', error.message);
    console.log('Détails de l\'erreur:', error);
  }
};

// Fonction pour tester différents fournisseurs
const testAlternativeProviders = async () => {
  console.log('Test avec d\'autres fournisseurs...');
  
  // Test avec configuration SMTP générique
  const alternativeTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  try {
    await alternativeTransporter.verify();
    console.log('Configuration SMTP alternative réussie !');
  } catch (error) {
    console.log('Configuration SMTP alternative échouée:', error.message);
  }
};

// Exécuter les tests
const runAllTests = async () => {
  console.log('Démarrage des tests email...\n');
  
  await testEmailConfiguration();
  await testAlternativeProviders();
  
  console.log('Tests terminés !');
  console.log('Conseils si ça ne fonctionne pas :');
  console.log('1. Vérifiez que l\'authentification à 2 facteurs est activée sur Gmail');
  console.log('2. Utilisez un "Mot de passe d\'application" et non votre mot de passe Gmail');
  console.log('3. Vérifiez que votre compte Gmail autorise les applications moins sécurisées');
  console.log('4. Essayez avec un autre fournisseur email (Outlook, Yahoo, etc.)');
};

// Lancer les tests
runAllTests().catch(console.error);