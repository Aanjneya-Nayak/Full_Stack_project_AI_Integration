import React, { useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AddCandidate from "./pages/AddCandidate";
import CandidateList from "./pages/CandidateList";
import Shortlist from "./pages/Shortlist";
import AIShortlist from "./pages/AIShortlist";

const navItems = [
  { path: "/", icon: "🏠", label: "Dashboard" },
  { path: "/add", icon: "➕", label: "Add Candidate" },
  { path: "/candidates", icon: "👥", label: "All Candidates" },
  { path: "/shortlist", icon: "🎯", label: "Shortlist" },
  { path: "/ai-shortlist", icon: "🤖", label: "AI Shortlist" },
];

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>Candidate Shortlisting</h2>
          <span>Recruitment System</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddCandidate />} />
          <Route path="/candidates" element={<CandidateList />} />
          <Route path="/shortlist" element={<Shortlist />} />
          <Route path="/ai-shortlist" element={<AIShortlist />} />
        </Routes>
      </main>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="page-header">
        <h1>Welcome 👋</h1>
        <p>Candidate Profile Shortlisting System powered by AI</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">🎯</div>
          <div className="stat-label">Smart Matching</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">🤖</div>
          <div className="stat-label">AI Powered</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">⚡</div>
          <div className="stat-label">Fast Results</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">📊</div>
          <div className="stat-label">Ranked Output</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="card" style={{ cursor: "pointer" }} onClick={() => navigate("/add")}>
          <div className="card-title">➕ Add Candidate</div>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>
            Register a new candidate with their skills, experience, and bio.
          </p>
        </div>
        <div className="card" style={{ cursor: "pointer" }} onClick={() => navigate("/candidates")}>
          <div className="card-title">👥 View All Candidates</div>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>
            Browse all registered candidates in the system.
          </p>
        </div>
        <div className="card" style={{ cursor: "pointer" }} onClick={() => navigate("/shortlist")}>
          <div className="card-title">🎯 Basic Shortlist</div>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>
            Filter and rank candidates by skill overlap and experience.
          </p>
        </div>
        <div className="card" style={{ cursor: "pointer" }} onClick={() => navigate("/ai-shortlist")}>
          <div className="card-title">🤖 AI Shortlist</div>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>
            Use OpenRouter AI to intelligently rank and explain candidate fit.
          </p>
        </div>
      </div>
    </div>
  );
}
