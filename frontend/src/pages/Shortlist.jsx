import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const initialForm = {
  requiredSkillsInput: "",
  preferredSkillsInput: "",
  minExperience: "",
};

function ScoreBar({ score }) {
  const colorClass =
    score >= 75 ? "score-high" : score >= 40 ? "score-medium" : "score-low";
  return (
    <div className="score-bar-container">
      <div className="score-bar-label">
        <span>Match Score</span>
        <span style={{ fontWeight: 700 }}>{score}%</span>
      </div>
      <div className="score-bar-track">
        <div
          className={`score-bar-fill ${colorClass}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function Shortlist() {
  const [form, setForm] = useState(initialForm);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const parseSkills = (input) =>
    input
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredSkills = parseSkills(form.requiredSkillsInput);
    if (requiredSkills.length === 0) {
      toast.error("Please enter at least one required skill");
      return;
    }

    setLoading(true);
    setSearched(false);
    try {
      const res = await api.post("/match", {
        requiredSkills,
        preferredSkills: parseSkills(form.preferredSkillsInput),
        minExperience: form.minExperience ? parseFloat(form.minExperience) : 0,
      });
      setResults(res.data.data);
      setSearched(true);
      if (res.data.data.length === 0) {
        toast("No candidates matched the criteria", { icon: "ℹ️" });
      } else {
        toast.success(`Found ${res.data.data.length} candidate(s)`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Shortlisting failed");
    } finally {
      setLoading(false);
    }
  };

  const tierCounts = results.reduce(
    (acc, r) => {
      acc[r.tier] = (acc[r.tier] || 0) + 1;
      return acc;
    },
    {}
  );

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div>
      <div className="page-header">
        <h1>Basic Shortlist</h1>
        <p>Filter and rank candidates by skill overlap and experience</p>
      </div>

      {/* Job Requirement Form */}
      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-title">Job Requirements</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Required Skills *</label>
            <input
              type="text"
              name="requiredSkillsInput"
              value={form.requiredSkillsInput}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, MongoDB"
              required
            />
            <div className="form-hint">Comma-separated. These are mandatory skills.</div>
          </div>

          {form.requiredSkillsInput && (
            <div style={{ marginBottom: 16, marginTop: -8 }}>
              {parseSkills(form.requiredSkillsInput).map((s, i) => (
                <span key={i} className="skill-tag" style={{ background: "#fde8e8", color: "#c0392b" }}>
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="form-group">
            <label>Preferred Skills</label>
            <input
              type="text"
              name="preferredSkillsInput"
              value={form.preferredSkillsInput}
              onChange={handleChange}
              placeholder="e.g. AWS, Docker, TypeScript"
            />
            <div className="form-hint">Optional. Adds a bonus to the match score.</div>
          </div>

          <div className="form-group">
            <label>Minimum Experience (years)</label>
            <input
              type="number"
              name="minExperience"
              value={form.minExperience}
              onChange={handleChange}
              placeholder="e.g. 1"
              min="0"
              step="0.5"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Matching...
              </>
            ) : (
              "🎯 Find Matching Candidates"
            )}
          </button>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div>
          {results.length > 0 && (
            <div className="stats-row" style={{ marginBottom: 20 }}>
              <div className="stat-card">
                <div className="stat-value" style={{ fontSize: "1.5rem" }}>{results.length}</div>
                <div className="stat-label">Total Matched</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ fontSize: "1.5rem", color: "#28a745" }}>{tierCounts.High || 0}</div>
                <div className="stat-label">High Match</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ fontSize: "1.5rem", color: "#ffc107" }}>{tierCounts.Medium || 0}</div>
                <div className="stat-label">Medium Match</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ fontSize: "1.5rem", color: "#dc3545" }}>{tierCounts.Low || 0}</div>
                <div className="stat-label">Low Match</div>
              </div>
            </div>
          )}

          {results.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p>No candidates matched the given criteria</p>
            </div>
          ) : (
            results.map((candidate, index) => (
              <div
                key={candidate._id}
                className={`result-card border-${candidate.tier.toLowerCase()}`}
              >
                <div className="result-card-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="result-rank">#{index + 1}</div>
                    <div className="candidate-avatar" style={{ width: 40, height: 40, fontSize: "0.9rem" }}>
                      {getInitials(candidate.name)}
                    </div>
                    <div>
                      <div className="candidate-name">{candidate.name}</div>
                      <div className="candidate-email">{candidate.email}</div>
                    </div>
                  </div>
                  <div className="result-meta">
                    <span className={`tier-badge tier-${candidate.tier.toLowerCase()}`}>
                      {candidate.tier}
                    </span>
                    <span style={{ fontSize: "0.82rem", color: "#666" }}>
                      💼 {candidate.experience}yr
                    </span>
                  </div>
                </div>

                <ScoreBar score={candidate.matchScore} />

                <div style={{ marginTop: 12 }}>
                  <div className="skills-label">Skills</div>
                  {candidate.skills.map((skill, i) => {
                    const isMatched = candidate.matchedSkills
                      .map((s) => s.toLowerCase())
                      .includes(skill.toLowerCase());
                    const isPreferred = candidate.matchedPreferredSkills
                      .map((s) => s.toLowerCase())
                      .includes(skill.toLowerCase());
                    return (
                      <span
                        key={i}
                        className={`skill-tag ${
                          isMatched
                            ? "skill-tag-matched"
                            : isPreferred
                            ? "skill-tag-default"
                            : "skill-tag-unmatched"
                        }`}
                      >
                        {isMatched && "✓ "}
                        {skill}
                      </span>
                    );
                  })}
                </div>

                {candidate.bio && (
                  <div className="candidate-bio" style={{ marginTop: 10 }}>
                    {candidate.bio}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
