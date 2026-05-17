import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function CandidateList() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await api.get("/candidates");
      setCandidates(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/candidates/${id}`);
      toast.success(`${name} removed`);
      setCandidates((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error("Failed to delete candidate");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
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
        <h1>All Candidates</h1>
        <p>Browse and manage all registered candidates</p>
      </div>

      {/* Stats + Search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <div className="stat-card" style={{ padding: "12px 20px", minWidth: 100 }}>
            <div className="stat-value" style={{ fontSize: "1.5rem" }}>{candidates.length}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
        <input
          type="text"
          placeholder="🔍  Search by name, email, or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px 16px",
            border: "1.5px solid #e0e0e0",
            borderRadius: 8,
            fontSize: "0.9rem",
            width: 300,
            outline: "none",
          }}
        />
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
          Loading candidates...
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <p>{search ? "No candidates match your search" : "No candidates added yet"}</p>
        </div>
      ) : (
        <div className="candidates-grid">
          {filtered.map((candidate) => (
            <div key={candidate._id} className="candidate-card">
              <div className="candidate-card-header">
                <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div className="candidate-avatar">{getInitials(candidate.name)}</div>
                  <div className="candidate-info">
                    <div className="candidate-name">{candidate.name}</div>
                    <div className="candidate-email">{candidate.email}</div>
                  </div>
                </div>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(candidate._id, candidate.name)}
                  disabled={deletingId === candidate._id}
                >
                  {deletingId === candidate._id ? "..." : "🗑"}
                </button>
              </div>

              <div className="candidate-exp">
                💼 {candidate.experience} year{candidate.experience !== 1 ? "s" : ""} experience
              </div>

              {candidate.bio && (
                <div className="candidate-bio">"{candidate.bio}"</div>
              )}

              <div className="skills-section">
                <div className="skills-label">Skills</div>
                {candidate.skills.map((skill, i) => (
                  <span key={i} className="skill-tag skill-tag-default">
                    {skill}
                  </span>
                ))}
              </div>

              <div style={{ marginTop: 12, fontSize: "0.75rem", color: "#bbb" }}>
                Added {new Date(candidate.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
