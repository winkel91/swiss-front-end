import { useMemo, useState } from "react";
import {
  createTournament,
  generateNextRound,
  getStandings,
  RoundResponse,
  StandingResponse,
  TournamentResponse,
} from "./api";
import "./app.css";

type View = "create" | "tournament";

export default function App() {
  const [view, setView] = useState<View>("create");

  const [tournament, setTournament] = useState<TournamentResponse | null>(null);
  const [lastRound, setLastRound] = useState<RoundResponse | null>(null);
  const [standings, setStandings] = useState<StandingResponse[] | null>(null);

  const [name, setName] = useState("My Tournament");
  const [totalRounds, setTotalRounds] = useState(5);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => {
    if (!tournament) return "Swiss Tournament";
    return `${tournament.name} (ID: ${tournament.id})`;
  }, [tournament]);

  async function onCreate() {
    setError(null);
    setBusy(true);
    try {
      const t = await createTournament({ name, totalRounds });
      setTournament(t);
      setView("tournament");
      setLastRound(null);
      setStandings(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to create tournament");
    } finally {
      setBusy(false);
    }
  }

  async function onNextRound() {
    if (!tournament) return;
    setError(null);
    setBusy(true);
    try {
      const r = await generateNextRound(tournament.id);
      setLastRound(r);
      // Often helpful to refresh standings after a new round is created
      const s = await getStandings(tournament.id);
      setStandings(s);
    } catch (e: any) {
      setError(e?.message ?? "Failed to generate next round");
    } finally {
      setBusy(false);
    }
  }

  async function onRefreshStandings() {
    if (!tournament) return;
    setError(null);
    setBusy(true);
    try {
      const s = await getStandings(tournament.id);
      setStandings(s);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load standings");
    } finally {
      setBusy(false);
    }
  }

  function onReset() {
    setTournament(null);
    setLastRound(null);
    setStandings(null);
    setView("create");
    setError(null);
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>{title}</h1>
          <p className="muted">
            Backend: <code>{import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"}</code>
          </p>
        </div>
        <div className="row">
          {tournament && (
            <button className="btn" onClick={onReset} disabled={busy}>
              New Tournament
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {view === "create" && (
        <section className="card">
          <h2>Create tournament</h2>

          <div className="form">
            <label>
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tournament name"
              />
            </label>

            <label>
              Total rounds
              <input
                type="number"
                value={totalRounds}
                min={1}
                onChange={(e) => setTotalRounds(Number(e.target.value))}
              />
            </label>

            <button className="btn primary" onClick={onCreate} disabled={busy}>
              {busy ? "Creating..." : "Create"}
            </button>
          </div>

          <p className="muted">
            Next steps: once created, you can generate rounds and view standings.
            We will add “Players” and “Submit result” once we confirm those endpoints.
          </p>
        </section>
      )}

      {view === "tournament" && tournament && (
        <div className="grid">
          <section className="card">
            <h2>Actions</h2>
            <div className="row">
              <button className="btn primary" onClick={onNextRound} disabled={busy}>
                {busy ? "Working..." : "Generate next round"}
              </button>
              <button className="btn" onClick={onRefreshStandings} disabled={busy}>
                Refresh standings
              </button>
            </div>

            <div className="muted" style={{ marginTop: 12 }}>
              <div>
                <strong>ID:</strong> {tournament.id}
              </div>
              <div>
                <strong>Total rounds:</strong> {tournament.totalRounds}
              </div>
            </div>
          </section>

          <section className="card">
            <h2>Last generated round</h2>
            {!lastRound ? (
              <p className="muted">No round generated yet.</p>
            ) : (
              <>
                <p className="muted">
                  Round #{lastRound.roundNumber} (roundId: {lastRound.roundId})
                </p>
                <div className="table">
                  <div className="thead">
                    <div>Board</div>
                    <div>Player 1</div>
                    <div>Player 2</div>
                    <div>Result</div>
                  </div>
                  {lastRound.matches.map((m, idx) => (
                    <div className="trow" key={m.id}>
                      <div>{idx + 1}</div>
                      <div>{m.player1Name ?? "BYE"}</div>
                      <div>{m.player2Name ?? "BYE"}</div>
                      <div>{m.result ?? "-"}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="card" style={{ gridColumn: "1 / -1" }}>
            <h2>Standings</h2>
            {!standings ? (
              <p className="muted">No standings loaded yet.</p>
            ) : standings.length === 0 ? (
              <p className="muted">No players yet.</p>
            ) : (
              <div className="table">
                <div className="thead">
                  <div>#</div>
                  <div>Player</div>
                  <div>Score</div>
                  <div>Buchholz</div>
                  <div>Sonneborn-Berger</div>
                </div>
                {standings.map((s, i) => (
                  <div className="trow" key={s.playerId}>
                    <div>{i + 1}</div>
                    <div>{s.name}</div>
                    <div>{s.score}</div>
                    <div>{s.buchholz}</div>
                    <div>{s.sonnebornBerger}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
