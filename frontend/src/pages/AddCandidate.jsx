import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const initialForm = {
  name: "",
  email: "",
  skillsInput: "",
  experience: "",
  bio: "",
};

export default function AddCandidate() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const skills = form.skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (skills.length === 0) {
      toast.error("Please enter at least one skill");
      return;
    }

    const experience = parseFloat(form.experience);
    if (isNaN(experience) || experience < 0) {
      toast.error("Please enter a valid experience value");
      return;
    }

    setLoading(true);
    try {
      await api.post("/candidates", {
        name: form.name.trim(),
        email: form.email.trim(),
        skills,
        experience,
        bio: form.bio.trim(),
      });
      toast.success(`${form.name} added successfully!`);
      setForm(initialForm);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add candidate";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Add Candidate</h1>
        <p>Register a new candidate profile in the system</p>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <div className="card-title">Candidate Details</div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
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
                placeholder="e.g. rahul@gmail.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Skills *</label>
            <input
              type="text"
              name="skillsInput"
              value={form.skillsInput}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, MongoDB, AWS"
              required
            />
            <div className="form-hint">Separate skills with commas</div>
          </div>

          {/* Live skill preview */}
          {form.skillsInput && (
            <div style={{ marginBottom: 18, marginTop: -10 }}>
              {form.skillsInput
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s)
                .map((skill, i) => (
                  <span key={i} className="skill-tag skill-tag-default">
                    {skill}
                  </span>
                ))}
            </div>
          )}

          <div className="form-group">
            <label>Experience (years) *</label>
            <input
              type="number"
              name="experience"
              value={form.experience}
              onChange={handleChange}
              placeholder="e.g. 2"
              min="0"
              step="0.5"
              required
            />
          </div>

          <div className="form-group">
            <label>Bio / Projects</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Brief description of projects, achievements, or background..."
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
                Adding...
              </>
            ) : (
              "➕ Add Candidate"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
