const express = require("express");
const router = express.Router();
const mainController = require("../controllers/mainController");
const authguard = require("../services/authguard");

router.get("/home", authguard, mainController.getHome);

module.exports = router;



