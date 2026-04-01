import React, { useState, useEffect, useRef } from "react";

const API_BASE = "/api";

async function errorFromResponse(res) {
  try {
    const body = await res.json();
    if (body && typeof body.error === "string") return body.error;
  } catch {
    // not json
  }
  return res.statusText || "Request failed";
}

const api = {
  checkSymptoms: async (data) => {
    const res = await fetch(`${API_BASE}/check-symptoms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await errorFromResponse(res));
    return res.json();
  },
  getHistory: async () => {
    const res = await fetch(`${API_BASE}/history`);
    if (!res.ok) throw new Error(await errorFromResponse(res));
    return res.json();
  },
  deleteQuery: async (id) => {
    const res = await fetch(`${API_BASE}/history/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await errorFromResponse(res));
    return res.json();
  },
};

const SEVERITY = {
  Mild: { color: "#22c55e", bg: "#f0fdf4", icon: "●" },
  Moderate: { color: "#f59e0b", bg: "#fffbeb", icon: "●" },
  Serious: { color: "#ef4444", bg: "#fef2f2", icon: "●" },
  Emergency: { color: "#dc2626", bg: "#fef2f2", icon: "◉" },
};

const LIKELIHOOD = {
  High: { color: "#0ea5e9", weight: 700 },
  Medium: { color: "#8b5cf6", weight: 600 },
  Low: { color: "#94a3b8", weight: 500 },
};

const styles = {
  global: `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'DM Sans', sans-serif;
      background: #f8fafb;
      color: #1a2332;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    ::selection { background: #0ea5e930; }
    input, textarea, select, button { font-family: inherit; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `,
};

function DisclaimerBanner() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #fef3c7, #fde68a)",
        border: "1px solid #f59e0b40",
        borderRadius: 12,
        padding: "14px 20px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 28,
        animation: "fadeIn 0.4s ease",
      }}
    >
      <span style={{ fontSize: 20, lineHeight: 1.4 }}>⚠️</span>
      <p style={{ fontSize: 13, color: "#92400e", fontWeight: 500, lineHeight: 1.6 }}>
        <strong>Educational Tool Only</strong> — This symptom checker is for informational
        purposes only and does not provide medical advice, diagnosis, or treatment. Always
        consult a qualified healthcare professional for medical concerns.
      </p>
    </div>
  );
}

function SymptomForm({ onSubmit, loading }) {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [duration, setDuration] = useState("");
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    onSubmit({ symptoms, age, gender, duration });
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: 10,
    fontSize: 14,
    color: "#1a2332",
    background: "#fff",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#475569",
    marginBottom: 6,
    letterSpacing: "0.02em",
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>
          Describe your symptoms <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <textarea
          ref={textareaRef}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="e.g., I have a persistent headache for the past 3 days, along with mild fever and fatigue..."
          rows={4}
          required
          style={{
            ...inputStyle,
            resize: "vertical",
            minHeight: 100,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#0ea5e9";
            e.target.style.boxShadow = "0 0 0 3px #0ea5e915";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e2e8f0";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <label style={labelStyle}>Age</label>
          <input
            type="text"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g., 30"
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = "#0ea5e9";
              e.target.style.boxShadow = "0 0 0 3px #0ea5e915";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
        <div>
          <label style={labelStyle}>Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
            onFocus={(e) => {
              e.target.style.borderColor = "#0ea5e9";
              e.target.style.boxShadow = "0 0 0 3px #0ea5e915";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.boxShadow = "none";
            }}
          >
            <option value="">Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Duration</label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 3 days"
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = "#0ea5e9";
              e.target.style.boxShadow = "0 0 0 3px #0ea5e915";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !symptoms.trim()}
        style={{
          width: "100%",
          padding: "14px 24px",
          background: loading
            ? "#94a3b8"
            : "linear-gradient(135deg, #0ea5e9, #0284c7)",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          letterSpacing: "0.01em",
          boxShadow: loading ? "none" : "0 4px 14px #0ea5e930",
        }}
        onMouseEnter={(e) => {
          if (!loading) e.target.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "translateY(0)";
        }}
      >
        {loading ? (
          <>
            <span
              style={{
                width: 18,
                height: 18,
                border: "2.5px solid #fff4",
                borderTopColor: "#fff",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
                display: "inline-block",
              }}
            />
            Analyzing Symptoms...
          </>
        ) : (
          <>🔍 Analyze Symptoms</>
        )}
      </button>
    </form>
  );
}

function ConditionCard({ condition, index }) {
  const severity = SEVERITY[condition.severity] || SEVERITY.Mild;
  const likelihood = LIKELIHOOD[condition.likelihood] || LIKELIHOOD.Medium;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        padding: 20,
        animation: `slideUp 0.4s ease ${index * 0.1}s both`,
        transition: "box-shadow 0.2s, transform 0.2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 24px #0001";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
          gap: 12,
        }}
      >
        <h3
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 18,
            color: "#1a2332",
            lineHeight: 1.3,
          }}
        >
          {condition.name}
        </h3>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              background: severity.bg,
              color: severity.color,
              letterSpacing: "0.03em",
            }}
          >
            {severity.icon} {condition.severity}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: likelihood.weight,
              background: `${likelihood.color}12`,
              color: likelihood.color,
              letterSpacing: "0.03em",
            }}
          >
            {condition.likelihood} Likelihood
          </span>
        </div>
      </div>

      <p style={{ fontSize: 14, color: "#64748b", marginBottom: 10, lineHeight: 1.6 }}>
        {condition.description}
      </p>

      <div
        style={{
          background: "#f8fafc",
          borderRadius: 8,
          padding: "10px 14px",
          borderLeft: `3px solid ${severity.color}`,
        }}
      >
        <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          <strong style={{ color: "#334155" }}>Why this matches:</strong>{" "}
          {condition.matchReason}
        </p>
      </div>
    </div>
  );
}

function ResultsPanel({ result }) {
  if (!result) return null;

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      {/* Disclaimer */}
      <div
        style={{
          background: "linear-gradient(135deg, #fee2e2, #fecaca)",
          border: "1px solid #fca5a540",
          borderRadius: 12,
          padding: "14px 18px",
          marginBottom: 24,
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: 18 }}>🩺</span>
        <p style={{ fontSize: 13, color: "#991b1b", lineHeight: 1.6, fontWeight: 500 }}>
          {result.disclaimer}
        </p>
      </div>

      {/* Summary */}
      {result.summary && (
        <div
          style={{
            background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
            borderRadius: 14,
            padding: 20,
            marginBottom: 24,
            border: "1px solid #93c5fd30",
          }}
        >
          <h3
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 17,
              color: "#1e40af",
              marginBottom: 8,
            }}
          >
            Assessment Summary
          </h3>
          <p style={{ fontSize: 14, color: "#1e3a5f", lineHeight: 1.7 }}>
            {result.summary}
          </p>
        </div>
      )}

      {/* Conditions */}
      {result.conditions && result.conditions.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 18,
              color: "#1a2332",
              marginBottom: 14,
            }}
          >
            Possible Conditions
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {result.conditions.map((c, i) => (
              <ConditionCard key={i} condition={c} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 14,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <h3
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 17,
              color: "#1a2332",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>✅</span> Recommended Next Steps
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {result.recommendations.map((rec, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "8px 12px",
                  background: "#f0fdf4",
                  borderRadius: 8,
                  animation: `slideUp 0.3s ease ${i * 0.05}s both`,
                }}
              >
                <span
                  style={{
                    color: "#22c55e",
                    fontWeight: 700,
                    fontSize: 13,
                    minWidth: 20,
                    textAlign: "center",
                    lineHeight: "22px",
                  }}
                >
                  {i + 1}
                </span>
                <p style={{ fontSize: 14, color: "#166534", lineHeight: 1.6 }}>{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Red Flags */}
      {result.redFlags && result.redFlags.length > 0 && (
        <div
          style={{
            background: "#fff",
            border: "2px solid #fca5a540",
            borderRadius: 14,
            padding: 20,
          }}
        >
          <h3
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 17,
              color: "#dc2626",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>🚨</span> Red Flags — Seek Immediate Care If
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {result.redFlags.map((flag, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "8px 12px",
                  background: "#fef2f2",
                  borderRadius: 8,
                }}
              >
                <span style={{ color: "#ef4444", fontSize: 14, lineHeight: "22px" }}>
                  ⚡
                </span>
                <p style={{ fontSize: 14, color: "#991b1b", lineHeight: 1.6 }}>{flag}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryPanel({ history, onSelect, onDelete, onClose }) {
  if (!history || history.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>📋</p>
        <p style={{ fontSize: 14 }}>No past queries yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {history.map((item) => (
        <div
          key={item.id}
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: "14px 16px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={() => onSelect(item)}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#0ea5e9";
            e.currentTarget.style.boxShadow = "0 2px 8px #0ea5e915";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1a2332",
                  marginBottom: 4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.symptoms}
              </p>
              <p style={{ fontSize: 12, color: "#94a3b8" }}>
                {new Date(item.created_at).toLocaleString()}
                {item.age && ` · Age ${item.age}`}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              style={{
                background: "none",
                border: "none",
                color: "#cbd5e1",
                cursor: "pointer",
                fontSize: 16,
                padding: 4,
                borderRadius: 6,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#ef4444")}
              onMouseLeave={(e) => (e.target.style.color = "#cbd5e1")}
              title="Delete"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("checker");
  const resultsRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await api.getHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.checkSymptoms(formData);
      setResult(data);
      fetchHistory();
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : "Unable to analyze symptoms. Is the backend running? Check the terminal.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleHistorySelect = (item) => {
    setResult(item.response);
    setActiveTab("checker");
  };

  const handleHistoryDelete = async (id) => {
    try {
      await api.deleteQuery(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  return (
    <>
      <style>{styles.global}</style>

      {/* Header */}
      <header
        style={{
          background: "linear-gradient(135deg, #0c4a6e, #0369a1, #0ea5e9)",
          padding: "0",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 4px 20px #0001",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "18px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                fontSize: 28,
                lineHeight: 1,
                filter: "drop-shadow(0 2px 4px #0003)",
              }}
            >
              🏥
            </span>
            <div>
              <h1
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 22,
                  color: "#fff",
                  lineHeight: 1.2,
                }}
              >
                Symptom Checker
              </h1>
              <p
                style={{
                  fontSize: 12,
                  color: "#bae6fd",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                }}
              >
                EDUCATIONAL TOOL ONLY
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              background: "#0c4a6e80",
              borderRadius: 10,
              padding: 3,
            }}
          >
            {["checker", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 18px",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: activeTab === tab ? "#fff" : "transparent",
                  color: activeTab === tab ? "#0369a1" : "#bae6fd",
                }}
              >
                {tab === "checker" ? "🔍 Checker" : `📋 History (${history.length})`}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 60px" }}>
        {activeTab === "checker" ? (
          <>
            <DisclaimerBanner />

            {/* Input Card */}
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: 28,
                boxShadow: "0 1px 3px #0001, 0 4px 16px #0001",
                marginBottom: 32,
                border: "1px solid #e2e8f0",
              }}
            >
              <h2
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 22,
                  color: "#1a2332",
                  marginBottom: 6,
                }}
              >
                What symptoms are you experiencing?
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "#94a3b8",
                  marginBottom: 22,
                  lineHeight: 1.5,
                }}
              >
                Describe your symptoms in detail for a more accurate educational analysis.
              </p>
              <SymptomForm onSubmit={handleSubmit} loading={loading} />
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 12,
                  padding: "14px 18px",
                  marginBottom: 24,
                  color: "#dc2626",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                ❌ {error}
              </div>
            )}

            {/* Loading Skeleton */}
            {loading && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  padding: 28,
                  border: "1px solid #e2e8f0",
                }}
              >
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: 20,
                      background: "#e2e8f0",
                      borderRadius: 6,
                      marginBottom: 14,
                      animation: "pulse 1.5s ease-in-out infinite",
                      width: `${100 - i * 15}%`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Results */}
            {result && !loading && (
              <div
                ref={resultsRef}
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  padding: 28,
                  boxShadow: "0 1px 3px #0001, 0 4px 16px #0001",
                  border: "1px solid #e2e8f0",
                }}
              >
                <ResultsPanel result={result} />
              </div>
            )}
          </>
        ) : (
          /* History Tab */
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: 28,
              boxShadow: "0 1px 3px #0001, 0 4px 16px #0001",
              border: "1px solid #e2e8f0",
            }}
          >
            <h2
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 22,
                color: "#1a2332",
                marginBottom: 18,
              }}
            >
              Query History
            </h2>
            <HistoryPanel
              history={history}
              onSelect={handleHistorySelect}
              onDelete={handleHistoryDelete}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "20px 24px",
          color: "#94a3b8",
          fontSize: 12,
          borderTop: "1px solid #e2e8f0",
          background: "#fff",
        }}
      >
        <p>
          ⚕️ This tool is for <strong>educational purposes only</strong>. It does not
          replace professional medical advice, diagnosis, or treatment.
        </p>
      </footer>
    </>
  );
}
