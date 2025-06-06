const express = require("express");
const router = express.Router();
const computerController = require("../controllers/computerController");

router.get("/computer/addComputer", computerController.getAddComputer);
router.post("/computer/addComputer", computerController.postAddComputer);

router.get("/computer/updateComputer/:id", computerController.getUpdateComputer);
router.post("/computer/updateComputer/:id", computerController.postUpdateComputer);

router.get("/computer/deleteComputer/:id", computerController.deleteComputer);

module.exports = router;
