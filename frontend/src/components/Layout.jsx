import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const navItems = [
  { path: "/", icon: "🏠", label: "Dashboard" },
  { path: "/employees", icon: "👥", label: "Employees" },
  { path: "/employees/add", icon: "➕", label: "Add Employee" },
  { path: "/ai-recommend", icon: "🤖", label: "AI Recommendations" },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const currentPage = navItems.find((n) => isActive(n.path));

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div>
            <h2>Employee Analytics</h2>
            <span>AI Performance System</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${isActive(item.path) ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {/* Top bar */}
        <div style={{
          background: "#fff",
          padding: "14px 32px",
          borderBottom: "1px solid #eaecf0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#1a1a2e" }}>
              {currentPage?.icon} {currentPage?.label || "Dashboard"}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 1 }}>
              Employee Performance Analytics System
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              background: "linear-gradient(135deg, #e94560, #c0392b)",
              color: "#fff",
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: "0.72rem",
              fontWeight: 600,
              textTransform: "capitalize",
            }}>
              {user?.role}
            </span>
            <div style={{
              width: 32, height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #e94560, #764ba2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: "0.82rem",
            }}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: "28px 32px" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
