// src/App.jsx
import React, { useState, useEffect } from "react";
import "./App.css";

/* =========================
   Helpers and small chart components
   ========================= */

function smoothArray(arr, windowSize = 3) {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    let start = Math.max(0, i - Math.floor(windowSize / 2));
    let end = Math.min(arr.length - 1, i + Math.floor(windowSize / 2));
    let sum = 0;
    let count = 0;
    for (let j = start; j <= end; j++) {
      sum += arr[j];
      count++;
    }
    out.push(sum / count);
  }
  return out;
}

function LineChart({ data = [], width = 720, height = 140 }) {
  const padding = 18;
  if (!data || data.length === 0) return null;

  const max = Math.max(...data) * 1.05;
  const min = Math.min(...data) * 0.95;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = padding + ((max - v) / (max - min || 1)) * (height - padding * 2);
    return [x, y];
  });

  let pathD = "";
  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i];
    if (i === 0) pathD += `M ${x} ${y}`;
    else {
      const [px, py] = points[i - 1];
      const cx = (px + x) / 2;
      const cy = (py + y) / 2;
      pathD += ` Q ${px} ${py} ${cx} ${cy}`;
      if (i === points.length - 1) pathD += ` T ${x} ${y}`;
    }
  }

  const areaD =
    `M ${points[0][0]} ${height - padding} ` +
    points.map((p) => `L ${p[0]} ${p[1]}`).join(" ") +
    ` L ${points[points.length - 1][0]} ${height - padding} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} aria-hidden>
      <defs>
        <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#8FC7D4" stopOpacity="0.22" />
          <stop offset="1" stopColor="#8FC7D4" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      <path d={areaD} fill="url(#areaGrad)" stroke="none" />
      <path d={pathD} stroke="#2C5E62" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === points.length - 1 ? 4.5 : 2.5} fill={i === points.length - 1 ? "#E89D52" : "#2C5E62"} />
      ))}

      <text x={padding} y={height - 2} fontSize="10" fill="#58717A">-30d</text>
      <text x={width / 2 - 14} y={height - 2} fontSize="10" fill="#58717A">-15d</text>
      <text x={width - padding - 34} y={height - 2} fontSize="10" fill="#58717A">Today</text>
    </svg>
  );
}

/* =========================
   Welfare Officer Dashboard (inline)
   ========================= */

function WelfareOfficerDashboardInline({ sampleData }) {
  const personnelTotal = sampleData?.total || 248;
  const low = sampleData?.low || 181;
  const moderate = sampleData?.moderate || 49;
  const elevated = sampleData?.elevated || 18;

  const trend = sampleData?.trend || (() => {
    const arr = [];
    for (let i = 0; i < 30; i++) {
      const base = 30 + Math.sin(i / 3) * 4 + i * 0.6;
      arr.push(Math.round(base * 10) / 10);
    }
    return arr;
  })();

  const priorityList = sampleData?.priority || [
    { id: "P1042", risk: "Moderate", reason: "Deployment duration" },
    { id: "P1087", risk: "Elevated", reason: "Night-duty frequency" },
    { id: "P1121", risk: "Elevated", reason: "Workload variation" },
    { id: "P1154", risk: "Moderate", reason: "Leave gap" },
  ];

  const explainable = sampleData?.factors || [
    { name: "Prolonged deployment", impact: "+18%" },
    { name: "Night-duty frequency", impact: "+14%" },
    { name: "Workload variation", impact: "+12%" },
  ];

  return (
    <div className="dashboard" style={{ paddingTop: 24 }}>
      <div className="dashboard-heading" style={{ alignItems: "flex-start", gap: 12 }}>
        <div>
          <h1>Welfare Intelligence Dashboard</h1>
          <p style={{ marginTop: 6, color: "var(--muted)" }}>
            Overview for Welfare Officers — monitor trends, prioritize human review, and act confidentially.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div className="status-badge" style={{ padding: "8px 12px" }}>
            <span /> Role: Welfare Officer
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginTop: 18 }}>
        <div className="stat-card">
          <span>Total Personnel</span>
          <strong>{personnelTotal}</strong>
          <small>Monitored profiles</small>
        </div>

        <div className="stat-card">
          <span>Low Risk</span>
          <strong>{low}</strong>
          <small>{Math.round((low / personnelTotal) * 100)}% of personnel</small>
        </div>

        <div className="stat-card">
          <span>Moderate Risk</span>
          <strong>{moderate}</strong>
          <small>Attention recommended</small>
        </div>

        <div className="stat-card high-risk">
          <span>Elevated Risk</span>
          <strong>{elevated}</strong>
          <small>Priority attention</small>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: 22 }}>
        <div className="dashboard-card" style={{ padding: 18 }}>
          <div className="card-header">
            <div>
              <small>RISK TREND</small>
              <h2>Risk Trend (Last 30 days)</h2>
            </div>
            <div className="card-label">Overview</div>
          </div>

          <div style={{ marginTop: 8 }}>
            <LineChart data={trend} width={560} height={140} />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 14, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>Risk Distribution (Current)</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div className="bar-info">
                    <div>Low</div>
                    <div><strong>{Math.round((low / personnelTotal) * 100)}%</strong></div>
                  </div>
                  <div className="bar"><div className="bar-fill low" style={{ width: `${Math.round((low / personnelTotal) * 100)}%` }} /></div>
                </div>

                <div style={{ flex: 1 }}>
                  <div className="bar-info">
                    <div>Moderate</div>
                    <div><strong>{Math.round((moderate / personnelTotal) * 100)}%</strong></div>
                  </div>
                  <div className="bar"><div className="bar-fill moderate" style={{ width: `${Math.round((moderate / personnelTotal) * 100)}%` }} /></div>
                </div>

                <div style={{ flex: 1 }}>
                  <div className="bar-info">
                    <div>Elevated</div>
                    <div><strong>{Math.round((elevated / personnelTotal) * 100)}%</strong></div>
                  </div>
                  <div className="bar"><div className="bar-fill elevated" style={{ width: `${Math.round((elevated / personnelTotal) * 100)}%` }} /></div>
                </div>
              </div>
            </div>

            <div style={{ width: 160 }}>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>Quick actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                <button className="primary-button">Schedule Check-in</button>
                <button className="secondary-button">Review Support Options</button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="dashboard-card" style={{ padding: 18 }}>
            <div className="card-header">
              <div>
                <small>PRIORITY ATTENTION</small>
                <h2>Human Review</h2>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              {priorityList.map((p) => (
                <div key={p.id} className="person-row" style={{ padding: "10px 0" }}>
                  <div className="person-id">{p.id}</div>
                  <div style={{ color: "var(--muted)" }}>{p.reason}</div>
                  <div className={`risk ${p.risk.toLowerCase() === "elevated" ? "elevated" : "moderate"}`}>{p.risk}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card ai-card" style={{ padding: 18 }}>
            <div className="card-header">
              <div>
                <small>WHY IS RISK CHANGING</small>
                <h2>Explainable AI</h2>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              {explainable.map((f, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(44,94,98,0.08)" }}>
                  <div style={{ color: "var(--muted)" }}>{f.name}</div>
                  <div style={{ fontWeight: 800, color: "var(--blue)" }}>{f.impact}</div>
                </div>
              ))}

              <div style={{ marginTop: 12 }}>
                <h3 style={{ margin: "8px 0" }}>Recommended Next Step</h3>
                <p style={{ color: "var(--muted)", marginTop: 6 }}>
                  Human-led welfare intervention. Prioritize elevated cases for confidential outreach and schedule follow-ups.
                </p>

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button className="primary-button">Schedule Check-in</button>
                  <button className="secondary-button">Review Support Options</button>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              <strong>Privacy note</strong>
              <p style={{ marginTop: 8 }}>
                Data is anonymized and access is role-based. AI predictions are advisory and do not replace professional assessment or make punitive decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Login / Signup modal (dashboard-only)
   ========================= */

function LoginSignup({ onClose, onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function doLogin(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill email and password");
      return;
    }
    const role = form.email.includes("officer") ? "officer" : form.email.includes("commander") ? "commander" : form.role || "user";
    onLogin({ name: form.name || form.email.split("@")[0], email: form.email, role });
    onClose();
  }

  function doSignup(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Please complete all fields");
      return;
    }
    onLogin({ name: form.name, email: form.email, role: form.role || "user" });
    onClose();
  }

  return (
    <div className="dashboard" style={{ paddingTop: 18 }}>
      <div className="dashboard-card" style={{ maxWidth: 520, margin: "0 auto", padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>{mode === "login" ? "Login" : "Sign up"}</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="secondary-button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
              {mode === "login" ? "Switch to Sign up" : "Switch to Login"}
            </button>
            <button className="secondary-button" onClick={onClose}>Close</button>
          </div>
        </div>

        <form onSubmit={mode === "login" ? doLogin : doSignup} style={{ marginTop: 12 }}>
          {mode === "signup" && (
            <>
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </>
          )}

          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />

          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required />

          {mode === "signup" && (
            <>
              <label>Role (demo)</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="user">Personnel</option>
                <option value="officer">Welfare Officer</option>
                <option value="commander">Commander</option>
              </select>
            </>
          )}

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button className="primary-button" type="submit">{mode === "login" ? "Login" : "Create account"}</button>
            <button type="button" className="secondary-button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
              {mode === "login" ? "Sign up" : "Login"}
            </button>
          </div>

          {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}

/* =========================
   Main App
   ========================= */

export default function App() {
  const [showDashboard, setShowDashboard] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  // UI state: which dashboard tab to show
  // "overview" = general preview, "enter" = Enter Platform cards, "welfare" = welfare dashboard
  const [dashboardTab, setDashboardTab] = useState("overview");
  // When user clicks a role card inside Enter Platform, store selection
  const [platformSelection, setPlatformSelection] = useState(null);

  // realistic 30-day projection (deterministic)
  const raw = (() => {
    const arr = [];
    const seed = 12345;
    let rnd = seed;
    function rand() {
      rnd = (rnd * 9301 + 49297) % 233280;
      return rnd / 233280;
    }
    for (let i = 0; i < 30; i++) {
      const weekly = Math.sin((i / 7) * Math.PI * 2) * 3;
      const trend = i * 0.45;
      const noise = (rand() - 0.5) * 4;
      const value = 45 + weekly + trend + noise;
      arr.push(Math.round(value * 10) / 10);
    }
    return arr;
  })();

  const projection = smoothArray(raw, 5).map((v) => Math.round(v * 10) / 10);

  const topFactors = [
    { name: "Prolonged deployment", impact: "+18%" },
    { name: "Sleep disruption", impact: "+12%" },
    { name: "Reduced social interaction", impact: "+9%" },
  ];

  // Demo priority/explainable lists used by WelfareOfficerDashboardInline
  window.priorityList = window.priorityList || [
    { id: "P1042", risk: "Moderate", reason: "Deployment duration" },
    { id: "P1087", risk: "Elevated", reason: "Night-duty frequency" },
    { id: "P1121", risk: "Elevated", reason: "Workload variation" },
    { id: "P1154", risk: "Moderate", reason: "Leave gap" },
  ];
  window.explainable = window.explainable || [
    { name: "Prolonged deployment", impact: "+18%" },
    { name: "Night-duty frequency", impact: "+14%" },
    { name: "Workload variation", impact: "+12%" },
  ];

  useEffect(() => {
    // If logged-in officer, default to welfare tab
    if (authUser && authUser.role === "officer") {
      setDashboardTab("welfare");
      setPlatformSelection(null);
    }
  }, [authUser]);

  function handleLogin(user) {
    setAuthUser(user);
  }

  function handleLogout() {
    setAuthUser(null);
    // return to overview on logout
    setDashboardTab("overview");
    setPlatformSelection(null);
  }

  /* ---------- Dashboard view (Overview + Enter Platform + Welfare) ---------- */
  if (showDashboard) {
    return (
      <div className="app">
        <div className="dashboard-screen">
          <nav className="dashboard-nav">
            <div className="logo">
              <img src="/ManRaksha_logo.png" alt="ManRaksha logo" />
              <span>ManRaksha</span>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="dashboard-title">Risk Intelligence</div>

              <a
                className="secondary-button"
                href="https://manraksha-app.vercel.app/"
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "none", display: "inline-block" }}
              >
                Explore Platform
              </a>

              {!authUser ? (
                <button className="primary-button" onClick={() => setShowAuth(true)}>Login / Sign up</button>
              ) : (
                <>
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>{authUser.name} ({authUser.role})</div>
                  <button className="secondary-button" onClick={handleLogout}>Logout</button>
                </>
              )}

              <button
                className="secondary-button"
                onClick={() => setShowDashboard(false)}
                aria-label="Back to landing"
              >
                Back
              </button>
            </div>
          </nav>

          {/* Tabs: Overview | Enter Platform */}
          <div style={{ width: "90%", maxWidth: 1200, margin: "18px auto 0", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className={dashboardTab === "overview" ? "primary-button" : "secondary-button"}
                onClick={() => { setDashboardTab("overview"); setPlatformSelection(null); }}
              >
                Overview
              </button>

              <button
                className={dashboardTab === "enter" ? "primary-button" : "secondary-button"}
                onClick={() => { setDashboardTab("enter"); setPlatformSelection(null); }}
              >
                Enter Platform
              </button>
            </div>

            <div style={{ marginLeft: "auto", color: "var(--muted)" }}>
              {dashboardTab === "overview" ? "General risk overview" : "Choose a role to enter the platform"}
            </div>
          </div>

          {/* Tab content */}
          <div style={{ marginTop: 12 }}>
            {dashboardTab === "enter" ? (
              // Enter Platform: show three role cards; clicking Welfare Officer opens welfare dashboard
              <div className="dashboard" style={{ paddingTop: 12 }}>
                <div style={{ width: "90%", maxWidth: 1200, margin: "0 auto 18px" }}>
                  <h1 style={{ margin: "8px 0 6px" }}>Enter Platform</h1>
                  <p style={{ margin: 0, color: "var(--muted)" }}>Select your role to continue into the platform</p>
                </div>

                <div style={{ width: "90%", maxWidth: 1200, margin: "18px auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
                  {/* Personnel card */}
                  <div className="role-card" style={{ padding: 22 }}>
                    <div className="role-icon" style={{ background: "#F3E8FF", color: "#6B2FA3" }}>👤</div>
                    <h2 style={{ marginTop: 12 }}>Personnel</h2>
                    <p style={{ color: "var(--muted)" }}>
                      Access personal wellness insights, self-assessments, support resources and wellbeing guidance.
                    </p>
                    <div style={{ marginTop: 12 }}>
                      <button className="primary-button" onClick={() => { setPlatformSelection("personnel"); }}>
                        Continue →
                      </button>
                    </div>
                  </div>

                  {/* Welfare Officer card */}
                  <div className="role-card" style={{ padding: 22 }}>
                    <div className="role-icon" style={{ background: "#E8F7FB", color: "#1E6B73" }}>🛡️</div>
                    <h2 style={{ marginTop: 12 }}>Welfare Officer</h2>
                    <p style={{ color: "var(--muted)" }}>
                      Monitor welfare indicators, understand risk factors and support early human-led intervention.
                    </p>
                    <div style={{ marginTop: 12 }}>
                      <button className="primary-button" onClick={() => { setPlatformSelection("welfare"); setDashboardTab("enter"); }}>
                        Continue →
                      </button>
                    </div>
                  </div>

                  {/* Administrator card */}
                  <div className="role-card" style={{ padding: 22 }}>
                    <div className="role-icon" style={{ background: "#FFF6E8", color: "#A85F2E" }}>📊</div>
                    <h2 style={{ marginTop: 12 }}>Administrator</h2>
                    <p style={{ color: "var(--muted)" }}>
                      View aggregate welfare trends, workload patterns and system-level analytics.
                    </p>
                    <div style={{ marginTop: 12 }}>
                      <button className="primary-button" onClick={() => { setPlatformSelection("admin"); }}>
                        Continue →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Platform selection result area */}
                <div style={{ width: "90%", maxWidth: 1200, margin: "18px auto" }}>
                  {platformSelection === "welfare" ? (
                    // Show Welfare Officer dashboard inside Enter Platform flow
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h2 style={{ margin: 0 }}>Welfare Officer — Workspace</h2>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="secondary-button" onClick={() => setPlatformSelection(null)}>Back to roles</button>
                        </div>
                      </div>

                      <WelfareOfficerDashboardInline />
                    </div>
                  ) : platformSelection === "personnel" ? (
                    <div className="dashboard-card" style={{ padding: 18 }}>
                      <h3>Personnel portal</h3>
                      <p style={{ color: "var(--muted)" }}>Personal wellness insights and self-reporting tools will appear here.</p>
                    </div>
                  ) : platformSelection === "admin" ? (
                    <div className="dashboard-card" style={{ padding: 18 }}>
                      <h3>Administrator portal</h3>
                      <p style={{ color: "var(--muted)" }}>System-level analytics and workload dashboards will appear here.</p>
                    </div>
                  ) : (
                    <div className="dashboard-card" style={{ padding: 18 }}>
                      <p style={{ color: "var(--muted)" }}>Choose a role card above to enter the platform.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : dashboardTab === "welfare" ? (
              // Direct Welfare Officer tab (full page)
              <div style={{ marginTop: 12 }}>
                <WelfareOfficerDashboardInline />
              </div>
            ) : (
              // Overview tab (general preview)
              <div className="dashboard" style={{ paddingTop: 12 }}>
                <div style={{ width: "90%", maxWidth: 1200, margin: "0 auto 18px" }}>
                  <h1 style={{ margin: "8px 0 6px" }}>Welcome to ManRaksha</h1>
                  <p style={{ margin: 0, color: "var(--muted)" }}>AI-driven welfare intelligence for proactive, confidential support</p>
                </div>

                <div className="dashboard-heading" style={{ marginTop: 12 }}>
                  <div>
                    <h2 style={{ margin: 0, color: "var(--muted)", fontSize: 16 }}>Live risk projection and contributing factors</h2>
                  </div>

                  <div className="status-badge">
                    <span /> Live Preview
                  </div>
                </div>

                <div className="dashboard-grid">
                  <div className="dashboard-card" style={{ padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <small>30 DAY PROJECTION</small>
                        <h2 style={{ marginTop: 6 }}>Risk Projection (30 days)</h2>
                        <div style={{ marginTop: 6, background: "rgba(255,255,255,0.9)", padding: "8px 12px", borderRadius: 10, display: "inline-block", border: "1px solid rgba(44,94,98,0.08)" }}>
                          <strong style={{ display: "block", fontSize: 14 }}>Current Risk</strong>
                          <span style={{ color: "var(--muted)", fontSize: 13 }}>Aggregated risk score based on recent signals</span>
                        </div>
                      </div>

                      <div className="risk-card" style={{ alignItems: "center", padding: "10px 14px" }}>
                        <div>
                          <small>CURRENT PROJECTION</small>
                          <strong style={{ fontSize: 28 }}>{projection[projection.length - 1]}%</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <LineChart data={projection} />
                    </div>

                    <div className="chart-labels" style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 13, color: "var(--muted)" }}>Lower risk</div>
                      <div style={{ fontSize: 13, color: "var(--muted)" }}>Higher risk</div>
                    </div>
                  </div>

                  <div className="dashboard-card ai-card" style={{ padding: 18 }}>
                    <div className="card-header">
                      <div>
                        <small>TOP CONTRIBUTING FACTORS</small>
                        <h2 style={{ marginTop: 6 }}>Top factors</h2>
                      </div>
                    </div>

                    <div className="factors" style={{ marginTop: 8 }}>
                      {topFactors.map((f, idx) => (
                        <div key={idx} className="factor" style={{ padding: "8px 0" }}>
                          <div style={{ fontWeight: 700 }}>{f.name}</div>
                          <div style={{ color: "var(--blue)", fontWeight: 800 }}>{f.impact}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <h3 style={{ margin: "8px 0" }}>AI Insight</h3>
                      <p className="ai-description" style={{ marginTop: 6 }}>
                        The model indicates a steady upward trend in aggregated risk driven primarily by prolonged deployments and sleep disruption signals.
                        Recommend confidential outreach for flagged personnel and anonymized case review by authorized welfare officers.
                      </p>

                      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        <button className="primary-button">Open recommended actions</button>
                        <button className="secondary-button">Export anonymized summary</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* =========================
                    REPLACED: Recommended action (Overview)
                    New highlighted recommended actions matching theme
                    ========================= */}
                <div style={{ marginTop: 22 }}>
                  <div className="dashboard-card action-card" style={{ padding: 18, alignItems: "flex-start", display: "flex", gap: 18 }}>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ margin: "0 0 8px 0" }}>Recommended action</h2>
                      <p className="action-card p" style={{ marginTop: 0, color: "var(--muted)" }}>
                        Prioritize confidential outreach to personnel with elevated risk. Use role-based access to view case details. Ensure all exports are anonymized.
                      </p>

                      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                        {/* Rec item helper inline styles to avoid needing CSS edits */}
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 10, borderRadius: 12, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(44,94,98,0.06)" }}>
                          <div style={{ width: 12, height: 12, borderRadius: 12, background: "linear-gradient(180deg,#FBE38E,#FFD66A)", boxShadow: "0 4px 12px rgba(44,94,98,0.06)", marginTop: 6 }} />
                          <div>
                            <strong style={{ color: "var(--text)", display: "block", fontSize: 15 }}>Prioritize Rest & Sleep</strong>
                            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Encourage rest plans and monitor sleep disruption signals</div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 10, borderRadius: 12, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(44,94,98,0.06)" }}>
                          <div style={{ width: 12, height: 12, borderRadius: 12, background: "linear-gradient(180deg,#DCEFF3,#8FC7D4)", boxShadow: "0 4px 12px rgba(44,94,98,0.06)", marginTop: 6 }} />
                          <div>
                            <strong style={{ color: "var(--text)", display: "block", fontSize: 15 }}>Review Workload</strong>
                            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Assess task distribution and reduce acute workload spikes</div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 10, borderRadius: 12, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(44,94,98,0.06)" }}>
                          <div style={{ width: 12, height: 12, borderRadius: 12, background: "linear-gradient(180deg,#FFF6E8,#F7E0C2)", boxShadow: "0 4px 12px rgba(44,94,98,0.06)", marginTop: 6 }} />
                          <div>
                            <strong style={{ color: "var(--text)", display: "block", fontSize: 15 }}>Explore Support Options</strong>
                            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Share available counselling and peer-support resources</div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 10, borderRadius: 12, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(44,94,98,0.06)" }}>
                          <div style={{ width: 12, height: 12, borderRadius: 12, background: "linear-gradient(180deg,#EAF3F4,#CFEFF2)", boxShadow: "0 4px 12px rgba(44,94,98,0.06)", marginTop: 6 }} />
                          <div>
                            <strong style={{ color: "var(--text)", display: "block", fontSize: 15 }}>Complete a Wellbeing Check-in</strong>
                            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Quick self-report to capture current state and flags</div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 10, borderRadius: 12, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(44,94,98,0.06)" }}>
                          <div style={{ width: 12, height: 12, borderRadius: 12, background: "linear-gradient(180deg,#FFEFE6,#FFD6B8)", boxShadow: "0 4px 12px rgba(44,94,98,0.06)", marginTop: 6 }} />
                          <div>
                            <strong style={{ color: "var(--text)", display: "block", fontSize: 15 }}>Talk to a Support Professional</strong>
                            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Offer confidential referral to trained welfare staff</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                      <button className="primary-button">Create case</button>
                      <button className="secondary-button">Anonymize & Export</button>
                    </div>
                  </div>
                </div>

                <footer style={{ marginTop: 28 }}>
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>
                    © ManRaksha — Risk intelligence for proactive welfare
                  </div>
                  <div>
                    <a
                      href="https://manraksha-app.vercel.app/"
                      target="_blank"
                      rel="noreferrer"
                      className="secondary-button"
                      style={{ textDecoration: "none" }}
                    >
                      Open live demo
                    </a>
                  </div>
                </footer>

                {showAuth && <LoginSignup onClose={() => setShowAuth(false)} onLogin={handleLogin} />}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* LANDING / PLATFORM SCREEN (no auth buttons here) */
  return (
    <div className="app">
      <div className="platform-screen">
        <nav className="navbar">
          <div className="logo">
            <img src="/ManRaksha_logo.png" alt="ManRaksha logo" />
            <span>ManRaksha</span>
          </div>

          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#about">About</a>
            <a href="https://manraksha-app.vercel.app/" target="_blank" rel="noreferrer">Explore Platform</a>
          </div>

          <div>
            <button className="nav-button" onClick={() => setShowDashboard(true)}>
              Open Dashboard
            </button>
          </div>
        </nav>

        <section className="hero">
          <div className="hero-content" style={{ padding: "80px 6%" }}>
            <h1>
              AI-POWERED <span>Detect. Support Privately. Protect Always.</span>
            </h1>
            <p>
              ManRaksha uses predictive AI to identify changing welfare patterns
              and support early, human-led intervention for uniformed personnel.
            </p>

            <div className="hero-buttons">
              <button className="primary-button" onClick={() => setShowDashboard(true)}>
                Try Dashboard
              </button>
              <a
                href="https://manraksha-app.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="secondary-button"
                style={{ textDecoration: "none", display: "inline-block" }}
              >
                Explore Platform
              </a>
            </div>

            <div className="trust-line">
              Trusted by organizations focused on personnel welfare
            </div>
          </div>
        </section>

        <section id="how" className="problem-section">
          <h2>Risk Intelligence <span>and Platform</span></h2>
          <p>
            The platform identifies trends and risk factors while preserving dignity,
            confidentiality, and data protection. For a live reference, open the deployed
            demo via the Explore Platform link.
          </p>
        </section>

        <section id="about" className="about-section">
          <h2>Preliminary Scope</h2>
          <p>
            Predictive analytics, mobile self-reporting, role-based dashboards,
            anonymized datasets, and secure integrations for HRMS and personnel systems.
          </p>
        </section>
      </div>
    </div>
  );
}
