import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const quickActions = [
  {
    path: "/employees/add",
    icon: "➕",
    title: "Add Employee",
    desc: "Register a new employee with skills and performance data.",
    color: "#e94560",
    bg: "linear-gradient(135deg, #fff5f7, #ffe4e9)",
  },
  {
    path: "/employees",
    icon: "👥",
    title: "View Employees",
    desc: "Browse, search, and filter all employee profiles.",
    color: "#1d4ed8",
    bg: "linear-gradient(135deg, #eff6ff, #dbeafe)",
  },
  {
    path: "/ai-recommend",
    icon: "🤖",
    title: "AI Recommendations",
    desc: "Get AI-powered promotion, training, and ranking insights.",
    color: "#7c3aed",
    bg: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/employees");
        const employees = res.data.data;
        const avgScore =
          employees.length > 0
            ? Math.round(employees.reduce((sum, e) => sum + e.performanceScore, 0) / employees.length)
            : 0;
        const deptMap = {};
        employees.forEach((e) => { deptMap[e.department] = (deptMap[e.department] || 0) + 1; });
        setStats({
          total: employees.length,
          avgScore,
          departments: Object.keys(deptMap).length,
          topPerformer: employees[0] || null,
        });
      } catch {
        setStats({ total: 0, avgScore: 0, departments: 0, topPerformer: null });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statItems = stats
    ? [
        { value: stats.total, label: "Total Employees", icon: "👥", color: "#1d4ed8" },
        { value: stats.avgScore, label: "Avg Performance", icon: "📊", color: "#e94560" },
        { value: stats.departments, label: "Departments", icon: "🏢", color: "#7c3aed" },
        {
          value: stats.topPerformer ? stats.topPerformer.name.split(" ")[0] : "—",
          label: "Top Performer",
          icon: "🏆",
          color: "#d97706",
        },
      ]
    : [];

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
          <p>Here's what's happening with your team today</p>
        </div>
        <span style={{
          background: "linear-gradient(135deg, #e94560, #c0392b)",
          color: "#fff",
          padding: "6px 16px",
          borderRadius: 20,
          fontSize: "0.78rem",
          fontWeight: 600,
          textTransform: "capitalize",
        }}>
          {user?.role}
        </span>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="stats-row">
            {statItems.map((s, i) => (
              <div key={i} className="stat-card">
                <div style={{ fontSize: "1.6rem", marginBottom: 6 }}>{s.icon}</div>
                <div className="stat-value" style={{ color: s.color, fontSize: "1.7rem" }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: 10 }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#374151", marginBottom: 16 }}>Quick Actions</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              {quickActions.map((action) => (
                <div
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  style={{
                    background: action.bg,
                    border: `1px solid ${action.color}22`,
                    borderRadius: 14,
                    padding: "22px 20px",
                    cursor: "pointer",
                    transition: "transform 0.18s, box-shadow 0.18s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                >
                  <div style={{ fontSize: "1.6rem", marginBottom: 10 }}>{action.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: "0.97rem", color: "#1a1a2e", marginBottom: 6 }}>{action.title}</div>
                  <div style={{ fontSize: "0.83rem", color: "#6b7280", lineHeight: 1.5 }}>{action.desc}</div>
                  <div style={{ marginTop: 14, fontSize: "0.8rem", fontWeight: 600, color: action.color }}>
                    Open →
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance bar */}
          {stats.total > 0 && (
            <div className="card" style={{ marginTop: 8 }}>
              <div className="card-title">📈 Team Performance Overview</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "#6b7280", marginBottom: 6 }}>
                    <span>Average Score</span>
                    <span style={{ fontWeight: 700, color: stats.avgScore >= 70 ? "#15803d" : stats.avgScore >= 50 ? "#d97706" : "#dc2626" }}>
                      {stats.avgScore} / 100
                    </span>
                  </div>
                  <div style={{ height: 10, background: "#f3f4f6", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{
                      width: `${stats.avgScore}%`,
                      height: "100%",
                      borderRadius: 6,
                      background: stats.avgScore >= 70
                        ? "linear-gradient(90deg, #22c55e, #16a34a)"
                        : stats.avgScore >= 50
                        ? "linear-gradient(90deg, #f59e0b, #d97706)"
                        : "linear-gradient(90deg, #ef4444, #dc2626)",
                      transition: "width 0.8s ease",
                    }} />
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a1a2e" }}>{stats.total}</div>
                  <div style={{ fontSize: "0.72rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>Employees</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
