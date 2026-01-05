const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export type ApiErrorResponse = { error: string };

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });

  // Try to parse JSON for both success and error
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg =
      (data && (data as ApiErrorResponse).error) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

// DTOs (based on what you shared)
export type TournamentResponse = { id: number; name: string; totalRounds: number };
export type CreateTournamentRequest = { name: string; totalRounds: number };

export type MatchResponse = {
  id: number;
  player1Id: number | null;
  player1Name: string | null;
  player2Id: number | null;
  player2Name: string | null;
  result: string | null;
};

export type RoundResponse = {
  roundId: number;
  roundNumber: number;
  matches: MatchResponse[];
};

export type StandingResponse = {
  playerId: number;
  name: string;
  score: number;
  buchholz: number;
  sonnebornBerger: number;
};

// Endpoints (from your controllers)
export function createTournament(req: CreateTournamentRequest) {
  return http<TournamentResponse>("/tournaments", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export function generateNextRound(tournamentId: number) {
  return http<RoundResponse>(`/tournaments/${tournamentId}/rounds/next`, {
    method: "POST",
  });
}

export function getStandings(tournamentId: number) {
  return http<StandingResponse[]>(`/tournaments/${tournamentId}/standings`);
}
