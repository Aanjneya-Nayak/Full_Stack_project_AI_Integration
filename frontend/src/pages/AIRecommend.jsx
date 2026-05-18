import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const ANALYSIS_TYPES = [
  { value: "full", label: "Full Analysis", icon: "📊", desc: "Promotion + Training + Feedback" },
  { value: "promotion", label: "Promotion", icon: "🚀", desc: "Who's ready to be promoted?" },
  { value: "training", label: "Training", icon: "📚", desc: "Personalized training suggestions" },
  { value: "ranking", label: "Ranking", icon: "🏆", desc: "Rank employees by performance" },
];

const PROMO_COLORS = {
  "Recommended": { bg: "#e6f4ea", color: "#1e7e34" },
  "Not Recommended": { bg: "#fde8e8", color: "#c0392b" },
  "Under Review": { bg: "#fff3cd", color: "#856404" },
};

const PERF_COLORS = {
  "Excellent": "#28a745",
  "Good": "#17a2b8",
  "Average": "#ffc107",
  "Needs Improvement": "#dc3545",
};

export default function AIRecommend() {
  const [analysisType, setAnalysisType] = useState("full");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(false);
    setResults([]);
    setSummary("");

    try {
      const body = { analysisType };
      if (department.trim()) body.department = department.trim();

      const res = await api.post("/ai/recommend", body);
      setResults(res.data.data || []);
      setSummary(res.data.summary || "");
      setSearched(true);

      if (!res.data.data || res.data.data.length === 0) {
        toast("No employees found for analysis", { icon: "ℹ️" });
      } else {
        toast.success(`AI analyzed ${res.data.data.length} employee(s)`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "AI analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div>
      <div className="page-header">
        <h1>AI Recommendations 🤖</h1>
        <p>OpenRouter AI analyzes employee performance and generates insights</p>
      </div>

      {/* Config Form */}
      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-title">Analysis Configuration</div>
        <form onSubmit={handleSubmit}>
          {/* Analysis type selector */}
          <div className="form-group">
            <label>Analysis Type</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 6 }}>
              {ANALYSIS_TYPES.map((t) => (
                <div
                  key={t.value}
                  onClick={() => setAnalysisType(t.value)}
                  style={{
                    padding: "12px 14px",
                    border: `2px solid ${analysisType === t.value ? "#e94560" : "#e0e0e0"}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    background: analysisType === t.value ? "#fff5f7" : "#fafafa",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: "1.2rem" }}>{t.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#1a1a2e", marginTop: 4 }}>{t.label}</div>
                  <div style={{ fontSize: "0.75rem", color: "#888" }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Filter by Department (optional)</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Leave blank to analyze all employees"
            />
            <div className="form-hint">Leave blank to run analysis on all employees</div>
          </div>

          <button
            type="submit"
            className="btn btn-secondary btn-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: "#fff" }} />
                AI is analyzing...
              </>
            ) : "🤖 Run AI Analysis"}
          </button>
        </form>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🤖</div>
          <p style={{ color: "#666" }}>AI is reading employee profiles and generating insights...</p>
          <p style={{ color: "#aaa", fontSize: "0.82rem", marginTop: 6 }}>This may take 10–20 seconds</p>
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <div>
          {summary && (
            <div className="ai-summary-box">
              <h3>🤖 AI Team Summary</h3>
              <p>{summary}</p>
            </div>
          )}

          {results.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p>No employees found for analysis</p>
            </div>
          ) : (
            results.map((emp, idx) => {
              const promoStyle = PROMO_COLORS[emp.promotionRecommendation] || { bg: "#f5f5f5", color: "#666" };
              const perfColor = PERF_COLORS[emp.performanceLabel] || "#666";

              return (
                <div
                  key={emp._id || idx}
                  className="result-card"
                  style={{ borderLeftColor: perfColor }}
                >
                  <div className="result-card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="result-rank">#{emp.rank || idx + 1}</div>
                      <div className="candidate-avatar" style={{ width: 40, height: 40, fontSize: "0.9rem" }}>
                        {getInitials(emp.name)}
                      </div>
                      <div>
                        <div className="candidate-name">{emp.name}</div>
                        <div className="candidate-email">{emp.email}</div>
                      </div>
                    </div>
                    <div className="result-meta">
                      {emp.performanceLabel && (
                        <span style={{
                          background: `${perfColor}22`,
                          color: perfColor,
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                        }}>
                          {emp.performanceLabel}
                        </span>
                      )}
                      {emp.department && (
                        <span style={{ fontSize: "0.82rem", color: "#666" }}>🏢 {emp.department}</span>
                      )}
                      {emp.performanceScore !== undefined && (
                        <span style={{ fontSize: "0.82rem", color: "#666" }}>📊 {emp.performanceScore}/100</span>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {emp.skills && emp.skills.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div className="skills-label">Skills</div>
                      {emp.skills.map((s, i) => (
                        <span key={i} className="skill-tag skill-tag-default">{s}</span>
                      ))}
                    </div>
                  )}

                  {/* Promotion */}
                  {emp.promotionRecommendation && (
                    <div style={{ marginTop: 12, display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{
                        ...promoStyle,
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}>
                        🚀 {emp.promotionRecommendation}
                      </span>
                      {emp.promotionReason && (
                        <span style={{ fontSize: "0.83rem", color: "#555", lineHeight: 1.5 }}>
                          {emp.promotionReason}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Training suggestions */}
                  {emp.trainingSuggestions && emp.trainingSuggestions.length > 0 && (
                    <div className="ai-explanation" style={{ marginTop: 12 }}>
                      <div className="ai-explanation-label">📚 Training Suggestions</div>
                      <ul style={{ paddingLeft: 18, margin: "6px 0 0", lineHeight: 1.7 }}>
                        {emp.trainingSuggestions.map((s, i) => (
                          <li key={i} style={{ fontSize: "0.85rem", color: "#444" }}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* AI Feedback */}
                  {emp.aiFeedback && (
                    <div className="ai-explanation" style={{ marginTop: 10 }}>
                      <div className="ai-explanation-label">🤖 AI Feedback</div>
                      {emp.aiFeedback}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
