import { useState } from "react";
import type { TournamentResponse } from "../api/types";
import { api } from "../api/client";

export function CreateTournamentCard(props: {
  onCreated: (t: TournamentResponse) => void;
}) {
  const [name, setName] = useState("Dev Tournament");
  const [totalRounds, setTotalRounds] = useState(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const t = await api.createTournament({ name, totalRounds });
      props.onCreated(t);
    } catch (e: any) {
      setError(e?.message ?? "Failed to create tournament");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={cardStyle}>
      <h2 style={h2}>Create tournament</h2>

      <div style={row}>
        <label style={label}>
          Name
          <input
            style={input}
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            placeholder="Tournament name"
          />
        </label>

        <label style={label}>
          Total rounds
          <input
            style={input}
            type="number"
            min={1}
            value={totalRounds}
            onChange={(ev) => setTotalRounds(Number(ev.target.value))}
          />
        </label>
      </div>

      <button style={button} disabled={busy} onClick={submit}>
        {busy ? "Creating..." : "Create"}
      </button>

      {error && <p style={errorStyle}>{error}</p>}
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 16,
  background: "#fff",
};

const h2: React.CSSProperties = { margin: "0 0 12px 0" };

const row: React.CSSProperties = { display: "flex", gap: 12, flexWrap: "wrap" };

const label: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };

const input: React.CSSProperties = { padding: 8, borderRadius: 8, border: "1px solid #ccc" };

const button: React.CSSProperties = {
  marginTop: 12,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #333",
  background: "#f5f5f5",
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = { marginTop: 10, color: "crimson" };
