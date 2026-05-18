const Employee = require("../models/Employee");

// POST /api/employees
const addEmployee = async (req, res, next) => {
  try {
    const { name, email, department, skills, performanceScore, experience } =
      req.body;

    const normalizedSkills = skills.map((s) => s.trim());

    const employee = await Employee.create({
      name,
      email,
      department,
      skills: normalizedSkills,
      performanceScore,
      experience,
    });

    res.status(201).json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

// GET /api/employees
const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find().sort({ performanceScore: -1 });
    res.json({ success: true, count: employees.length, data: employees });
  } catch (err) {
    next(err);
  }
};

// GET /api/employees/search?department=X&skill=Y&minScore=Z
const searchEmployees = async (req, res, next) => {
  try {
    const { department, skill, minScore, maxScore } = req.query;
    const filter = {};

    if (department) {
      filter.department = { $regex: department, $options: "i" };
    }
    if (skill) {
      filter.skills = { $elemMatch: { $regex: skill, $options: "i" } };
    }
    if (minScore !== undefined || maxScore !== undefined) {
      filter.performanceScore = {};
      if (minScore !== undefined) filter.performanceScore.$gte = Number(minScore);
      if (maxScore !== undefined) filter.performanceScore.$lte = Number(maxScore);
    }

    const employees = await Employee.find(filter).sort({ performanceScore: -1 });
    res.json({ success: true, count: employees.length, data: employees });
  } catch (err) {
    next(err);
  }
};

// GET /api/employees/:id
const getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }
    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

// PUT /api/employees/:id
const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }
    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/employees/:id
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }
    res.json({ success: true, message: "Employee deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addEmployee,
  getAllEmployees,
  searchEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
};
