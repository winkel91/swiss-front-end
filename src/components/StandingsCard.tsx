import { useEffect, useState } from "react";
import type { StandingResponse } from "../api/types";
import { api } from "../api/client";

export function StandingsCard(props: { tournamentId: number; refreshSignal: number }) {
  const [rows, setRows] = useState<StandingResponse[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    setBusy(true);
    try {
      const data = await api.getStandings(props.tournamentId);
      setRows(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load standings");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.tournamentId, props.refreshSignal]);

  return (
    <section style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2 style={h2}>Standings</h2>
        <button style={button} onClick={load} disabled={busy}>
          {busy ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && <p style={errorStyle}>{error}</p>}

      {!rows ? (
        <p style={{ marginTop: 10, opacity: 0.8 }}>No standings loaded yet.</p>
      ) : rows.length === 0 ? (
        <p style={{ marginTop: 10, opacity: 0.8 }}>No players yet.</p>
      ) : (
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>#</th>
                <th style={th}>Player</th>
                <th style={th}>Score</th>
                <th style={th}>Buchholz</th>
                <th style={th}>Sonneborn-Berger</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.playerId}>
                  <td style={td}>{idx + 1}</td>
                  <td style={td}>
                    {r.name} <span style={{ opacity: 0.6 }}>({r.playerId})</span>
                  </td>
                  <td style={td}>{r.score}</td>
                  <td style={td}>{r.buchholz}</td>
                  <td style={td}>{r.sonnebornBerger}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 16,
  background: "#fff",
};

const h2: React.CSSProperties = { margin: 0 };

const button: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #333",
  background: "#f5f5f5",
  cursor: "pointer",
};

const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse" };
const th: React.CSSProperties = { textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 6px" };
const td: React.CSSProperties = { borderBottom: "1px solid #f0f0f0", padding: "8px 6px" };
const errorStyle: React.CSSProperties = { marginTop: 10, color: "crimson" };
