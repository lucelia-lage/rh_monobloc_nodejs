const authguard = async(req, res, next) => { // Middleware pour protéger les routes // Vérifie si l'utilisateur est connecté
    try{
        if(req.session.user){ // Si l'utilisateur est connecté, on continue
            return next(); // on appelle la fonction next() pour passer à la route suivante
        }
        else throw ("Utilisateur non connecté")
    }
    catch(error){
        res.redirect("/login")
    }
}

module.exports = authguard