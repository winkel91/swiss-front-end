import { useState } from "react";
import { api } from "../api/client";
import type { PlayerResponse } from "../api/types";

export function AddPlayerCard(props: {
  tournamentId: number;
  onPlayerAdded?: (p: PlayerResponse) => void;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!name.trim()) {
      setError("Player name must not be blank");
      return;
    }
    setBusy(true);
    try {
      const p = await api.addPlayer(props.tournamentId, { name: name.trim() });
      setName("");
      props.onPlayerAdded?.(p);
    } catch (e: any) {
      setError(e?.message ?? "Failed to add player");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={cardStyle}>
      <h2 style={h2}>Add player</h2>
      <div style={row}>
        <input
          style={{ ...input, minWidth: 240 }}
          value={name}
          onChange={(ev) => setName(ev.target.value)}
          placeholder="Player name"
        />
        <button style={button} disabled={busy} onClick={submit}>
          {busy ? "Adding..." : "Add"}
        </button>
      </div>
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
const row: React.CSSProperties = { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" };
const input: React.CSSProperties = { padding: 8, borderRadius: 8, border: "1px solid #ccc" };

const button: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #333",
  background: "#f5f5f5",
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = { marginTop: 10, color: "crimson" };
