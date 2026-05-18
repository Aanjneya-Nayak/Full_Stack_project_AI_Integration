import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

const initialForm = {
  name: "",
  email: "",
  department: "",
  skillsInput: "",
  performanceScore: "",
  experience: "",
};

export default function AddEmployee() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const skills = form.skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);

    if (skills.length === 0) {
      toast.error("Please enter at least one skill");
      return;
    }

    setLoading(true);
    try {
      await api.post("/employees", {
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        skills,
        performanceScore: parseFloat(form.performanceScore),
        experience: parseFloat(form.experience),
      });
      toast.success(`${form.name} added successfully!`);
      navigate("/employees");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  const scoreVal = parseFloat(form.performanceScore);
  const scoreColor =
    scoreVal >= 80 ? "#28a745" : scoreVal >= 50 ? "#ffc107" : "#dc3545";

  return (
    <div>
      <div className="page-header">
        <h1>Add Employee</h1>
        <p>Register a new employee profile</p>
      </div>

      <div className="card" style={{ maxWidth: 620 }}>
        <div className="card-title">Employee Details</div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Aman Verma"
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. aman@gmail.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Department *</label>
            <input
              type="text"
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="e.g. Development, Marketing, HR"
              required
            />
          </div>

          <div className="form-group">
            <label>Skills *</label>
            <input
              type="text"
              name="skillsInput"
              value={form.skillsInput}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, MongoDB"
              required
            />
            <div className="form-hint">Comma-separated</div>
          </div>

          {form.skillsInput && (
            <div style={{ marginBottom: 16, marginTop: -10 }}>
              {form.skillsInput
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s)
                .map((skill, i) => (
                  <span key={i} className="skill-tag skill-tag-default">{skill}</span>
                ))}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Performance Score (0–100) *</label>
              <input
                type="number"
                name="performanceScore"
                value={form.performanceScore}
                onChange={handleChange}
                placeholder="e.g. 85"
                min="0"
                max="100"
                required
              />
              {form.performanceScore && !isNaN(scoreVal) && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ height: 6, background: "#f0f2f5", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${scoreVal}%`, height: "100%", background: scoreColor, borderRadius: 4, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontSize: "0.78rem", color: scoreColor, fontWeight: 600 }}>
                    {scoreVal >= 80 ? "Excellent" : scoreVal >= 60 ? "Good" : scoreVal >= 40 ? "Average" : "Needs Improvement"}
                  </span>
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Experience (years) *</label>
              <input
                type="number"
                name="experience"
                value={form.experience}
                onChange={handleChange}
                placeholder="e.g. 3"
                min="0"
                step="0.5"
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Adding...</>
              ) : "➕ Add Employee"}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate("/employees")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
