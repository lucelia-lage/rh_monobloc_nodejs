const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const authguard = require("../services/authguard");

router.get("/employee/home", authguard, employeeController.getEmployeeHome);

router.get("/employee/addEmployee", authguard, employeeController.getAddEmployee);
router.post("/employee/addEmployee", authguard, employeeController.postAddEmployee);

router.get("/employee/updateEmployee/:id", authguard, employeeController.getUpdateEmployee);
router.post("/employee/updateEmployee/:id", authguard, employeeController.postUpdateEmployee);

router.get("/employee/deleteEmployee/:id", authguard, employeeController.deleteEmployee);

module.exports = router;
