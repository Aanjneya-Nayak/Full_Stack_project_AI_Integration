import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const initialForm = {
  requiredSkillsInput: "",
  preferredSkillsInput: "",
  minExperience: "",
  jobDescription: "",
};

export default function AIShortlist() {
  const [form, setForm] = useState(initialForm);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState("");
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
    setResults([]);
    setSummary("");

    try {
      const res = await api.post("/ai/shortlist", {
        requiredSkills,
        preferredSkills: parseSkills(form.preferredSkillsInput),
        minExperience: form.minExperience ? parseFloat(form.minExperience) : 0,
        jobDescription: form.jobDescription.trim(),
      });

      setResults(res.data.data || []);
      setSummary(res.data.summary || "");
      setSearched(true);

      if (res.data.data?.length === 0) {
        toast("No candidates matched the criteria", { icon: "ℹ️" });
      } else {
        toast.success(`AI ranked ${res.data.data.length} candidate(s)`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "AI shortlisting failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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
        <h1>AI Shortlist 🤖</h1>
        <p>OpenRouter AI analyzes and ranks candidates with explanations</p>
      </div>

      {/* Job Requirement Form */}
      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-title">Job Requirements for AI Analysis</div>
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
            <div className="form-hint">Comma-separated required skills</div>
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

          <div className="form-group">
            <label>Job Description (optional)</label>
            <textarea
              name="jobDescription"
              value={form.jobDescription}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, or any additional context for the AI..."
            />
            <div className="form-hint">
              More context = better AI analysis
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-secondary btn-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: "#fff" }} />
                AI is analyzing candidates...
              </>
            ) : (
              "🤖 Run AI Shortlisting"
            )}
          </button>
        </form>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>🤖</div>
          <p style={{ color: "#666", fontSize: "0.95rem" }}>
            AI is reading candidate profiles and ranking them...
          </p>
          <p style={{ color: "#aaa", fontSize: "0.82rem", marginTop: 6 }}>
            This may take 5–15 seconds
          </p>
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <div>
          {/* AI Summary */}
          {summary && (
            <div className="ai-summary-box">
              <h3>🤖 AI Summary</h3>
              <p>{summary}</p>
            </div>
          )}

          {results.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p>No candidates matched the given criteria</p>
            </div>
          ) : (
            results.map((candidate) => (
              <div
                key={candidate._id || candidate.name}
                className={`result-card border-${(candidate.tier || "low").toLowerCase()}`}
              >
                <div className="result-card-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="result-rank">#{candidate.rank}</div>
                    <div
                      className="candidate-avatar"
                      style={{ width: 40, height: 40, fontSize: "0.9rem" }}
                    >
                      {getInitials(candidate.name)}
                    </div>
                    <div>
                      <div className="candidate-name">{candidate.name}</div>
                      <div className="candidate-email">{candidate.email}</div>
                    </div>
                  </div>
                  <div className="result-meta">
                    <span
                      className={`tier-badge tier-${(candidate.tier || "low").toLowerCase()}`}
                    >
                      {candidate.tier || "N/A"}
                    </span>
                    {candidate.experience !== undefined && (
                      <span style={{ fontSize: "0.82rem", color: "#666" }}>
                        💼 {candidate.experience}yr
                      </span>
                    )}
                  </div>
                </div>

                {candidate.skills && candidate.skills.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div className="skills-label">Skills</div>
                    {candidate.skills.map((skill, i) => (
                      <span key={i} className="skill-tag skill-tag-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {candidate.bio && (
                  <div className="candidate-bio" style={{ marginTop: 10 }}>
                    {candidate.bio}
                  </div>
                )}

                {candidate.aiExplanation && (
                  <div className="ai-explanation">
                    <div className="ai-explanation-label">🤖 AI Analysis</div>
                    {candidate.aiExplanation}
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
