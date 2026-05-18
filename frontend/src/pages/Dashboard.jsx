import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

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
            ? Math.round(
                employees.reduce((sum, e) => sum + e.performanceScore, 0) /
                  employees.length
              )
            : 0;

        const deptMap = {};
        employees.forEach((e) => {
          deptMap[e.department] = (deptMap[e.department] || 0) + 1;
        });

        const topPerformer = employees[0] || null;

        setStats({
          total: employees.length,
          avgScore,
          departments: Object.keys(deptMap).length,
          topPerformer,
        });
      } catch {
        setStats({ total: 0, avgScore: 0, departments: 0, topPerformer: null });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {user?.name} 👋</h1>
        <p>Here's an overview of your employee analytics</p>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Employees</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.avgScore}</div>
              <div className="stat-label">Avg Performance Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.departments}</div>
              <div className="stat-label">Departments</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">🏆</div>
              <div className="stat-label">
                {stats.topPerformer
                  ? `Top: ${stats.topPerformer.name}`
                  : "No data yet"}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="card" style={{ cursor: "pointer" }} onClick={() => navigate("/employees/add")}>
              <div className="card-title">➕ Add Employee</div>
              <p style={{ color: "#666", fontSize: "0.9rem" }}>
                Register a new employee with their skills and performance data.
              </p>
            </div>
            <div className="card" style={{ cursor: "pointer" }} onClick={() => navigate("/employees")}>
              <div className="card-title">👥 View Employees</div>
              <p style={{ color: "#666", fontSize: "0.9rem" }}>
                Browse, search, and filter all employees.
              </p>
            </div>
            <div className="card" style={{ cursor: "pointer" }} onClick={() => navigate("/ai-recommend")}>
              <div className="card-title">🤖 AI Recommendations</div>
              <p style={{ color: "#666", fontSize: "0.9rem" }}>
                Get AI-powered promotion, training, and ranking insights.
              </p>
            </div>
            <div className="card">
              <div className="card-title">📊 Performance Overview</div>
              <p style={{ color: "#666", fontSize: "0.9rem" }}>
                Average score across all employees: <strong>{stats.avgScore}/100</strong>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
