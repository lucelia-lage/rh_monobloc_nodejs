const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const authguard = require("../services/authguard");

router.get("/employee/home", authguard, employeeController.getEmployeeHome);

router.get("/employee/addEmployee", employeeController.getAddEmployee);
router.post("/employee/addEmployee", employeeController.postAddEmployee);

router.get("/employee/updateEmployee/:id", employeeController.getUpdateEmployee);
router.post("/employee/updateEmployee/:id", employeeController.postUpdateEmployee);

router.get("/employee/deleteEmployee/:id", employeeController.deleteEmployee);

module.exports = router;
