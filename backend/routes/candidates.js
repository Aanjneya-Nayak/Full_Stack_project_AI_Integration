const express = require("express");
const router = express.Router();
const {
  addCandidate,
  getAllCandidates,
  deleteCandidate,
} = require("../controllers/candidateController");

router.post("/", addCandidate);
router.get("/", getAllCandidates);
router.delete("/:id", deleteCandidate);

module.exports = router;
