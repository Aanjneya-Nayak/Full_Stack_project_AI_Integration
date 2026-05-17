const Candidate = require("../models/Candidate");

// POST /api/candidates — Add a new candidate
const addCandidate = async (req, res) => {
  try {
    const { name, email, skills, experience, bio } = req.body;

    // Normalize skills to trimmed, lowercase for consistent matching
    const normalizedSkills = skills.map((s) => s.trim());

    const candidate = new Candidate({
      name,
      email,
      skills: normalizedSkills,
      experience,
      bio: bio || "",
    });

    const saved = await candidate.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/candidates — Get all candidates
const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json({ success: true, count: candidates.length, data: candidates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/candidates/:id — Delete a candidate
const deleteCandidate = async (req, res) => {
  try {
    const deleted = await Candidate.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found" });
    }
    res.json({ success: true, message: "Candidate deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { addCandidate, getAllCandidates, deleteCandidate };
