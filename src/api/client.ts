import type {
  AddPlayerRequest,
  PlayerResponse,
  CreateTournamentRequest,
  TournamentResponse,
  RoundResponse,
  SetResultRequest,
  MatchResponse,
  StandingResponse,
  ApiErrorResponse,
} from "./types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function parseJsonSafe(res: Response): Promise<unknown | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    const payload = await parseJsonSafe(res);

    // If your @RestControllerAdvice returns { error: "..." }, surface it.
    const msg =
      (payload as ApiErrorResponse | null)?.error ??
      (typeof payload === "string" ? payload : null) ??
      `Request failed: ${res.status} ${res.statusText}`;

    throw new ApiError(msg, res.status, payload);
  }

  // Handle 204 No Content if you add any later
  if (res.status === 204) return undefined as T;

  const data = (await res.json()) as T;
  return data;
}

export const api = {
  createTournament: (body: CreateTournamentRequest) =>
    request<TournamentResponse>("/tournaments", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  addPlayer: (tournamentId: number, body: AddPlayerRequest) =>
    request<PlayerResponse>(`/tournaments/${tournamentId}/players`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  generateNextRound: (tournamentId: number) =>
    request<RoundResponse>(`/tournaments/${tournamentId}/rounds/next`, {
      method: "POST",
    }),

  setResult: (matchId: number, body: SetResultRequest) =>
    request<MatchResponse>(`/matches/${matchId}/result`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  getStandings: (tournamentId: number) =>
    request<StandingResponse[]>(`/tournaments/${tournamentId}/standings`, {
      method: "GET",
    }),

  // If you decide to use GET /standings/{tournamentId} instead:
  // getStandings: (tournamentId: number) =>
  //   request<StandingResponse[]>(`/standings/${tournamentId}`, { method: "GET" }),
};

export type { ApiError };
