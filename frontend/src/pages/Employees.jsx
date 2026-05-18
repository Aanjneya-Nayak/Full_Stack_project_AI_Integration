import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  // Filters
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxScore, setMaxScore] = useState("");

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (deptFilter) params.append("department", deptFilter);
      if (minScore) params.append("minScore", minScore);
      if (maxScore) params.append("maxScore", maxScore);

      const url = params.toString()
        ? `/employees/search?${params}`
        : "/employees";
      const res = await api.get(url);
      setEmployees(res.data.data);
    } catch {
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/employees/${id}`);
      toast.success(`${name} removed`);
      setEmployees((prev) => prev.filter((e) => e._id !== id));
    } catch {
      toast.error("Failed to delete employee");
    } finally {
      setDeletingId(null);
    }
  };

  const getInitials = (name) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const getScoreColor = (score) =>
    score >= 80 ? "#28a745" : score >= 60 ? "#ffc107" : score >= 40 ? "#fd7e14" : "#dc3545";

  const getScoreLabel = (score) =>
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Average" : "Needs Improvement";

  // Client-side name search on top of server-side filters
  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );

  // Unique departments for quick filter buttons
  const departments = [...new Set(employees.map((e) => e.department))];

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>Employees</h1>
          <p>Manage and view all employee profiles</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/employees/add")}>
          ➕ Add Employee
        </button>
      </div>

      {/* Search & Filter */}
      <div className="card">
        <div className="card-title">🔍 Search & Filter</div>
        <form onSubmit={handleSearch}>
          <div className="form-row">
            <div className="form-group">
              <label>Search by Name / Email</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to search..."
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                placeholder="e.g. Development"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Min Score</label>
              <input
                type="number"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                placeholder="0"
                min="0"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>Max Score</label>
              <input
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                placeholder="100"
                min="0"
                max="100"
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button type="submit" className="btn btn-primary">Apply Filters</button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setDeptFilter("");
                setMinScore("");
                setMaxScore("");
                setSearch("");
                setTimeout(fetchEmployees, 0);
              }}
            >
              Clear
            </button>
            {departments.map((d) => (
              <button
                key={d}
                type="button"
                className="btn"
                style={{
                  background: deptFilter === d ? "#1a1a2e" : "#f0f2f5",
                  color: deptFilter === d ? "#fff" : "#444",
                  padding: "6px 14px",
                  fontSize: "0.82rem",
                }}
                onClick={() => {
                  setDeptFilter(d);
                  setTimeout(fetchEmployees, 0);
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div className="stat-card" style={{ padding: "12px 20px" }}>
          <div className="stat-value" style={{ fontSize: "1.4rem" }}>{filtered.length}</div>
          <div className="stat-label">Showing</div>
        </div>
        <div className="stat-card" style={{ padding: "12px 20px" }}>
          <div className="stat-value" style={{ fontSize: "1.4rem", color: "#28a745" }}>
            {filtered.filter((e) => e.performanceScore >= 80).length}
          </div>
          <div className="stat-label">Excellent</div>
        </div>
        <div className="stat-card" style={{ padding: "12px 20px" }}>
          <div className="stat-value" style={{ fontSize: "1.4rem", color: "#ffc107" }}>
            {filtered.filter((e) => e.performanceScore >= 60 && e.performanceScore < 80).length}
          </div>
          <div className="stat-label">Good</div>
        </div>
        <div className="stat-card" style={{ padding: "12px 20px" }}>
          <div className="stat-value" style={{ fontSize: "1.4rem", color: "#dc3545" }}>
            {filtered.filter((e) => e.performanceScore < 60).length}
          </div>
          <div className="stat-label">Needs Attention</div>
        </div>
      </div>

      {/* Employee List */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <p>No employees found</p>
        </div>
      ) : (
        <div className="candidates-grid">
          {filtered.map((emp) => (
            <div key={emp._id} className="candidate-card">
              <div className="candidate-card-header">
                <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div className="candidate-avatar">{getInitials(emp.name)}</div>
                  <div className="candidate-info">
                    <div className="candidate-name">{emp.name}</div>
                    <div className="candidate-email">{emp.email}</div>
                  </div>
                </div>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(emp._id, emp.name)}
                  disabled={deletingId === emp._id}
                >
                  {deletingId === emp._id ? "..." : "🗑"}
                </button>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <span className="skill-tag" style={{ background: "#e8f4fd", color: "#1a73e8" }}>
                  🏢 {emp.department}
                </span>
                <span className="skill-tag" style={{ background: "#f0f2f5", color: "#555" }}>
                  💼 {emp.experience}yr
                </span>
              </div>

              {/* Score bar */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: 4 }}>
                  <span style={{ color: "#666" }}>Performance</span>
                  <span style={{ fontWeight: 700, color: getScoreColor(emp.performanceScore) }}>
                    {emp.performanceScore}/100 · {getScoreLabel(emp.performanceScore)}
                  </span>
                </div>
                <div style={{ height: 8, background: "#f0f2f5", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    width: `${emp.performanceScore}%`,
                    height: "100%",
                    background: getScoreColor(emp.performanceScore),
                    borderRadius: 4,
                  }} />
                </div>
              </div>

              <div className="skills-section">
                <div className="skills-label">Skills</div>
                {emp.skills.map((s, i) => (
                  <span key={i} className="skill-tag skill-tag-default">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
