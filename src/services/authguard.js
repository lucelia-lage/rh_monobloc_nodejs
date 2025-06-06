const authguard = async(req, res, next) => {
    try{
        if(req.session.user){
            return next();
        }
        else throw ("Utilisateur non connecté")
    }
    catch(error){
        res.redirect("/login")
    }
}

module.exports = authguard