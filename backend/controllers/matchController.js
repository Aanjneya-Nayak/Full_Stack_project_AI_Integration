const Candidate = require("../models/Candidate");

// POST /api/match — Basic skill + experience matching
const shortlistCandidates = async (req, res) => {
  try {
    const { requiredSkills, minExperience, preferredSkills } = req.body;

    if (!requiredSkills || requiredSkills.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "requiredSkills is required" });
    }

    const minExp = minExperience || 0;

    // Normalize input skills to lowercase for case-insensitive matching
    const normalizedRequired = requiredSkills.map((s) => s.toLowerCase().trim());
    const normalizedPreferred = (preferredSkills || []).map((s) =>
      s.toLowerCase().trim()
    );

    // Fetch candidates meeting minimum experience
    const candidates = await Candidate.find({
      experience: { $gte: minExp },
    });

    if (candidates.length === 0) {
      return res.json({
        success: true,
        message: "No candidates meet the minimum experience requirement",
        data: [],
      });
    }

    const results = candidates.map((candidate) => {
      const candidateSkills = candidate.skills.map((s) => s.toLowerCase().trim());

      // Required skill matches
      const matchedRequired = normalizedRequired.filter((skill) =>
        candidateSkills.includes(skill)
      );

      // Preferred skill matches
      const matchedPreferred = normalizedPreferred.filter((skill) =>
        candidateSkills.includes(skill)
      );

      // Core score: required skill overlap (0 to 1)
      const requiredScore =
        normalizedRequired.length > 0
          ? matchedRequired.length / normalizedRequired.length
          : 0;

      // Bonus score from preferred skills (up to 0.2 extra)
      const preferredBonus =
        normalizedPreferred.length > 0
          ? (matchedPreferred.length / normalizedPreferred.length) * 0.2
          : 0;

      const finalScore = Math.min(requiredScore + preferredBonus, 1);

      // Tier classification
      let tier;
      if (requiredScore >= 0.75) tier = "High";
      else if (requiredScore >= 0.4) tier = "Medium";
      else tier = "Low";

      return {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        skills: candidate.skills,
        experience: candidate.experience,
        bio: candidate.bio,
        matchScore: Math.round(finalScore * 100),
        requiredMatchScore: Math.round(requiredScore * 100),
        matchedSkills: matchedRequired,
        matchedPreferredSkills: matchedPreferred,
        tier,
      };
    });

    // Sort: High → Medium → Low, then by score descending
    const tierOrder = { High: 0, Medium: 1, Low: 2 };
    results.sort((a, b) => {
      if (tierOrder[a.tier] !== tierOrder[b.tier]) {
        return tierOrder[a.tier] - tierOrder[b.tier];
      }
      return b.matchScore - a.matchScore;
    });

    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { shortlistCandidates };
