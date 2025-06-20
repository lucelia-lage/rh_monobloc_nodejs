const nodemailer = require('nodemailer');

// Configuration du transporteur d'emails
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Fonction pour envoyer l'email de bienvenue au chef d'entreprise
const sendWelcomeEmail = async (userEmail, userData) => {
  try {
    const transporter = createTransporter();
    
    // Configuration de l'email
    const mailOptions = {
      from: {
        name: 'RHelp You',
        address: process.env.EMAIL_USER
      },
      to: userEmail,
      subject: '🎉 Bienvenue sur RHelp You !',
      html: generateWelcomeEmailHTML(userData),
      text: generateWelcomeEmailText(userData)
    };
    
    // Envoi de l'email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email envoyé avec succès:', info.messageId);
    return { 
      success: true, 
      messageId: info.messageId 
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Fonction pour envoyer l'email de bienvenue aux employés
const sendEmployeeWelcomeEmail = async (employeeEmail, employeeData, companyData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'RHelp You',
        address: process.env.EMAIL_USER
      },
      to: employeeEmail,
      subject: '👋 Bienvenue dans l\'équipe !',
      html: generateEmployeeWelcomeEmailHTML(employeeData, companyData),
      text: generateEmployeeWelcomeEmailText(employeeData, companyData)
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email employé envoyé avec succès:', info.messageId);
    return { 
      success: true, 
      messageId: info.messageId 
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email employé:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Génération du contenu HTML de l'email pour chef d'entreprise
const generateWelcomeEmailHTML = (userData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
        }
        .header { 
          background-color: #2d7d86; 
          color: white; 
          padding: 20px; 
          text-align: center; 
          border-radius: 8px 8px 0 0; 
        }
        .content { 
          background-color: #f9f9f9; 
          padding: 30px; 
          border-radius: 0 0 8px 8px; 
        }
        .info-box { 
          background-color: white; 
          padding: 20px; 
          border-left: 4px solid #2d7d86; 
          margin: 20px 0; 
        }
        .button { 
          display: inline-block; 
          background-color: #2d7d86; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 4px; 
          margin: 20px 0; 
        }
        .footer { 
          text-align: center; 
          font-size: 12px; 
          color: #666; 
          margin-top: 30px; 
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Bienvenue sur RHelp You !</h1>
      </div>
      <div class="content">
        <h2>Bonjour ${userData.directorName || 'Cher dirigeant'} !</h2>
        <p>Félicitations ! Votre compte RHelp You a été créé avec succès.</p>
        
        <div class="info-box">
          <h3>📋 Récapitulatif de votre compte :</h3>
          <ul>
            <li><strong>Entreprise :</strong> ${userData.companyName}</li>
            <li><strong>SIRET :</strong> ${userData.siret}</li>
            <li><strong>Email :</strong> ${userData.email}</li>
            ${userData.directorName ? `<li><strong>Directeur :</strong> ${userData.directorName}</li>` : ''}
          </ul>
        </div>
        
        <p>Vous pouvez maintenant :</p>
        <ul>
          <li>➕ Ajouter vos employés</li>
          <li>💻 Gérer les ordinateurs de votre entreprise</li>
          <li>🔗 Assigner les ordinateurs à vos employés</li>
          <li>📊 Suivre l'équipement de votre entreprise</li>
        </ul>
        
        <center>
          <a href="${process.env.APP_URL || 'http://localhost:3000'}/login" class="button">
            🚀 Accéder à mon compte
          </a>
        </center>
        
        <p><strong>💡 Conseils pour bien commencer :</strong></p>
        <ol>
          <li>Connectez-vous avec votre SIRET et votre mot de passe</li>
          <li>Ajoutez vos premiers employés</li>
          <li>Enregistrez les ordinateurs de votre entreprise</li>
          <li>Assignez les ordinateurs à vos employés</li>
        </ol>
        
        <p>Si vous avez des questions, n'hésitez pas à nous contacter !</p>
        <p>Cordialement,<br>L'équipe RHelp You 💼</p>
      </div>
      <div class="footer">
        <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
        <p>© 2025 RHelp You - Gestion RH simplifiée</p>
      </div>
    </body>
    </html>
  `;
};

// Génération du contenu HTML de l'email pour employé
const generateEmployeeWelcomeEmailHTML = (employeeData, companyData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
        }
        .header { 
          background-color: #2d7d86; 
          color: white; 
          padding: 20px; 
          text-align: center; 
          border-radius: 8px 8px 0 0; 
        }
        .content { 
          background-color: #f9f9f9; 
          padding: 30px; 
          border-radius: 0 0 8px 8px; 
        }
        .info-box { 
          background-color: white; 
          padding: 20px; 
          border-left: 4px solid #2d7d86; 
          margin: 20px 0; 
        }
        .button { 
          display: inline-block; 
          background-color: #2d7d86; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 4px; 
          margin: 20px 0; 
        }
        .footer { 
          text-align: center; 
          font-size: 12px; 
          color: #666; 
          margin-top: 30px; 
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>👋 Bienvenue dans l'équipe !</h1>
      </div>
      <div class="content">
        <h2>Bonjour ${employeeData.firstName} ${employeeData.lastName} !</h2>
        <p>Félicitations ! Votre compte employé a été créé avec succès.</p>
        
        <div class="info-box">
          <h3>👤 Vos informations :</h3>
          <ul>
            <li><strong>Nom :</strong> ${employeeData.firstName} ${employeeData.lastName}</li>
            <li><strong>Email :</strong> ${employeeData.email}</li>
            <li><strong>Entreprise :</strong> ${companyData.companyName}</li>
          </ul>
        </div>
        
        <p>En tant qu'employé, vous pouvez :</p>
        <ul>
          <li>🔍 Consulter les informations de votre ordinateur assigné</li>
          <li>👤 Voir votre profil employé</li>
          <li>📧 Recevoir des notifications importantes</li>
        </ul>
        
        <center>
          <a href="${process.env.APP_URL || 'http://localhost:3000'}/login" class="button">
            🚀 Accéder à mon espace
          </a>
        </center>
        
        <p><strong>💡 Pour vous connecter :</strong></p>
        <ul>
          <li>Utilisez votre email : <strong>${employeeData.email}</strong></li>
          <li>Utilisez le mot de passe que vous avez défini</li>
        </ul>
        
        <p>Si vous avez des questions, contactez votre responsable RH !</p>
        <p>Cordialement,<br>L'équipe RHelp You 💼</p>
      </div>
      <div class="footer">
        <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
        <p>© 2025 RHelp You - Gestion RH simplifiée</p>
      </div>
    </body>
    </html>
  `;
};

// Version texte de l'email chef d'entreprise
const generateWelcomeEmailText = (userData) => {
  return `
🎉 Bienvenue sur RHelp You !

Bonjour ${userData.directorName || 'Cher dirigeant'} !

Félicitations ! Votre compte RHelp You a été créé avec succès.

📋 Récapitulatif de votre compte :
- Entreprise : ${userData.companyName}
- SIRET : ${userData.siret}
- Email : ${userData.email}
${userData.directorName ? `- Directeur : ${userData.directorName}` : ''}

Vous pouvez maintenant :
➕ Ajouter vos employés
💻 Gérer les ordinateurs de votre entreprise
🔗 Assigner les ordinateurs à vos employés
📊 Suivre l'équipement de votre entreprise

Accédez à votre compte : ${process.env.APP_URL || 'http://localhost:3000'}/login

💡 Conseils pour bien commencer :
1. Connectez-vous avec votre SIRET et votre mot de passe
2. Ajoutez vos premiers employés
3. Enregistrez les ordinateurs de votre entreprise
4. Assignez les ordinateurs à vos employés

Si vous avez des questions, n'hésitez pas à nous contacter !

Cordialement,
L'équipe RHelp You 💼

---
Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
© 2025 RHelp You - Gestion RH simplifiée
  `.trim();
};

// Version texte de l'email employé
const generateEmployeeWelcomeEmailText = (employeeData, companyData) => {
  return `
👋 Bienvenue dans l'équipe !

Bonjour ${employeeData.firstName} ${employeeData.lastName} !

Félicitations ! Votre compte employé a été créé avec succès.

👤 Vos informations :
- Nom : ${employeeData.firstName} ${employeeData.lastName}
- Email : ${employeeData.email}
- Entreprise : ${companyData.companyName}

En tant qu'employé, vous pouvez :
🔍 Consulter les informations de votre ordinateur assigné
👤 Voir votre profil employé
📧 Recevoir des notifications importantes

Accédez à votre espace : ${process.env.APP_URL || 'http://localhost:3000'}/login

💡 Pour vous connecter :
- Utilisez votre email : ${employeeData.email}
- Utilisez le mot de passe que vous avez défini

Si vous avez des questions, contactez votre responsable RH !

Cordialement,
L'équipe RHelp You 💼

---
Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
© 2025 RHelp You - Gestion RH simplifiée
  `.trim();
};

// Fonction utilitaire pour tester la connexion email
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Configuration email valide');
    return true;
  } catch (error) {
    console.error('❌ Erreur de configuration email:', error);
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendEmployeeWelcomeEmail,
  testEmailConnection
};