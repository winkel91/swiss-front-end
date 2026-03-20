export type CreateTournamentRequest = {
  name: string;
  totalRounds: number;
  matchFormat: "SINGLE_GAME" | "BEST_OF_3";
};

export type TournamentResponse = {
  id: number;
  name: string;
  totalRounds: number;
  matchFormat: "SINGLE_GAME" | "BEST_OF_3";
};

export type AddPlayerRequest = {
  name: string;
};

export type PlayerResponse = {
  id: number;
  name: string;
  score: number;
};

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
  number: number;
  matches: MatchResponse[];
};

export type SetResultRequest = {
  result: string;
};

export type StandingResponse = {
  playerId: number;
  name: string;
  score: number;
  buchholz: number;
  sonnebornBerger: number;
};

export type ApiErrorResponse = {
  error: string;
};
