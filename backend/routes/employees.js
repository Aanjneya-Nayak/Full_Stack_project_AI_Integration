const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  addEmployee,
  getAllEmployees,
  searchEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const employeeValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("department").trim().notEmpty().withMessage("Department is required"),
  body("skills")
    .isArray({ min: 1 })
    .withMessage("At least one skill is required"),
  body("performanceScore")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Performance score must be between 0 and 100"),
  body("experience")
    .isFloat({ min: 0 })
    .withMessage("Experience must be a non-negative number"),
];

// All routes are protected
router.use(protect);

router.get("/search", searchEmployees);
router.get("/", getAllEmployees);
router.post("/", employeeValidation, validate, addEmployee);
router.get("/:id", getEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;
