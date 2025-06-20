const express = require("express")
const userRoutes = require("./src/routes/userRoutes");
const mainRoutes = require("./src/routes/mainRoutes");
const computerRoutes = require("./src/routes/computerRoutes");
const employeeRoutes = require("./src/routes/employeeRoutes");
const testRoutes = require("./src/routes/testRoutes"); // Import de la route de test


const session = require("express-session");
require('dotenv').config()

const app = express();

app.use(testRoutes); // Utilisation de la route de test

app.set("view engine", "twig"); // j'ai dû ajouter cette ligne pour que Twig soit utilisé comme moteur de rendu

app.use(express.static("./public"))
app.use(express.urlencoded({extended:true}))
app.use(session({
    secret: process.env.BCRYPT_SECRET,
    resave: true,
    saveUninitialized: true
}))

app.use(userRoutes)
app.use(mainRoutes)
app.use(computerRoutes)
app.use(employeeRoutes)

app.get("/", (req, res) => {
    if (req.session.user) {
        return res.redirect("/home");
    }
    res.redirect("/login");
});


app.listen(process.env.PORT, ()=>{
    console.log("Écoute sur le port " + process.env.PORT);
})
