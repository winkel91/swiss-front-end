import { useState } from "react";
import type { RoundResponse, TournamentResponse } from "../api/types";
import { CreateTournamentCard } from "../components/CreateTournamentCard";
import { AddPlayerCard } from "../components/AddPlayerCard";
import { RoundCard } from "../components/RoundCard";
import { StandingsCard } from "../components/StandingsCard";

export function TournamentPage() {
  const [tournament, setTournament] = useState<TournamentResponse | null>(null);
  const [round, setRound] = useState<RoundResponse | null>(null);
  const [standingsRefreshSignal, setStandingsRefreshSignal] = useState(0);

  return (
    <div style={page}>
      <header style={header}>
        <h1 style={{ margin: 0 }}>Swiss Tournament UI</h1>
        <div style={{ opacity: 0.8 }}>
          Backend: <code>{import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"}</code>
        </div>
      </header>

      <div style={grid}>
        <CreateTournamentCard
          onCreated={(t) => {
            setTournament(t);
            setRound(null);
            setStandingsRefreshSignal((x) => x + 1);
          }}
        />

        <section style={cardStyle}>
          <h2 style={{ margin: "0 0 12px 0" }}>Current tournament</h2>
          {!tournament ? (
            <p style={{ margin: 0, opacity: 0.8 }}>Create a tournament to begin.</p>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              <div>
                <strong>{tournament.name}</strong>
              </div>
              <div>
                id: {tournament.id} • totalRounds: {tournament.totalRounds}
              </div>
            </div>
          )}
        </section>

        {tournament && (
          <AddPlayerCard
            tournamentId={tournament.id}
            onPlayerAdded={() => setStandingsRefreshSignal((x) => x + 1)}
          />
        )}

        {tournament && (
          <RoundCard
            tournamentId={tournament.id}
            round={round}
            onRoundGenerated={(r) => {
              setRound(r);
              setStandingsRefreshSignal((x) => x + 1);
            }}
            onResultSubmitted={() => setStandingsRefreshSignal((x) => x + 1)}
          />
        )}

        {tournament && (
          <StandingsCard tournamentId={tournament.id} refreshSignal={standingsRefreshSignal} />
        )}
      </div>
    </div>
  );
}

const page: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: 18,
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: 12,
  marginBottom: 16,
};

const grid: React.CSSProperties = {
  display: "grid",
  gap: 14,
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 16,
  background: "#fff",
};
