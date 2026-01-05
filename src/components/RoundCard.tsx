import { useState } from "react";
import type { MatchResponse, RoundResponse } from "../api/types";
import { api } from "../api/client";

const RESULT_OPTIONS = [
  { value: "1-0", label: "1-0 (Player 1 wins)" },
  { value: "0-1", label: "0-1 (Player 2 wins)" },
  { value: "0.5-0.5", label: "0.5-0.5 (Draw)" },
  { value: "BYE", label: "BYE" },
];

export function RoundCard(props: {
  tournamentId: number;
  round: RoundResponse | null;
  onRoundGenerated: (r: RoundResponse) => void;
  onResultSubmitted?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateNext() {
    setError(null);
    setBusy(true);
    try {
      const r = await api.generateNextRound(props.tournamentId);
      props.onRoundGenerated(r);
    } catch (e: any) {
      setError(e?.message ?? "Failed to generate next round");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={cardStyle}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <h2 style={h2}>Round</h2>
        <button style={button} disabled={busy} onClick={generateNext}>
          {busy ? "Generating..." : "Generate next round"}
        </button>
      </div>

      {error && <p style={errorStyle}>{error}</p>}

      {!props.round ? (
        <p style={{ marginTop: 10, opacity: 0.8 }}>
          No round loaded yet. Generate the first round when players are ready.
        </p>
      ) : (
        <div style={{ marginTop: 12 }}>
          <p style={{ margin: "0 0 10px 0" }}>
            <strong>Round #{props.round.roundNumber}</strong> (id: {props.round.roundId})
          </p>
          <div style={{ display: "grid", gap: 10 }}>
            {props.round.matches.map((m) => (
              <MatchRow key={m.id} match={m} onResultSubmitted={props.onResultSubmitted} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function MatchRow(props: { match: MatchResponse; onResultSubmitted?: () => void }) {
  const [result, setResult] = useState(props.match.result ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setMsg(null);
    if (!result) {
      setMsg("Pick a result first.");
      return;
    }
    setBusy(true);
    try {
      await api.setResult(props.match.id, { result });
      setMsg("Saved.");
      props.onResultSubmitted?.();
    } catch (e: any) {
      setMsg(e?.message ?? "Failed.");
    } finally {
      setBusy(false);
      setTimeout(() => setMsg(null), 2500);
    }
  }

  const p1 = props.match.player1Name ?? "(BYE)";
  const p2 = props.match.player2Name ?? "(BYE)";

  return (
    <div style={matchStyle}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>
          {p1} vs {p2}
        </div>
        <div style={{ opacity: 0.75, fontSize: 13 }}>
          matchId: {props.match.id} {props.match.result ? `• current: ${props.match.result}` : ""}
        </div>
      </div>

      <select style={select} value={result} onChange={(ev) => setResult(ev.target.value)}>
        <option value="">Select...</option>
        {RESULT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <button style={button} disabled={busy} onClick={submit}>
        {busy ? "Saving..." : "Submit"}
      </button>

      {msg && <span style={{ marginLeft: 8, fontSize: 13, opacity: 0.85 }}>{msg}</span>}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 16,
  background: "#fff",
};

const matchStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: 10,
  borderRadius: 10,
  border: "1px solid #eee",
  background: "#fafafa",
  flexWrap: "wrap",
};

const h2: React.CSSProperties = { margin: 0 };

const select: React.CSSProperties = { padding: 8, borderRadius: 8, border: "1px solid #ccc" };

const button: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #333",
  background: "#f5f5f5",
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = { marginTop: 10, color: "crimson" };
