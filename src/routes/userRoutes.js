const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../services/upload");

router.get("/register", userController.getRegister);
router.post("/register", userController.postRegister);

router.get("/user/updateProfile", userController.getUpdateProfile);
router.post("/user/updateProfile", userController.postUpdateProfile);

router.get("/login", userController.getLogin);
router.post("/login", userController.postLogin);

router.get("/logout", userController.getLogout);

module.exports = router;
