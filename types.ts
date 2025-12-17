export type Rank = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export interface Athlete {
  id: string;
  name: string;
  team: string;
  points: number;
  avatarUrl: string;
  gender: 'Nam' | 'Nữ';
  matchesPlayed: number;
  wins: number;
}

export interface Match {
  id: string;
  date: string;
  type: 'Don' | 'Doi'; // Đơn or Đôi
  team1Ids: string[]; // Athlete IDs
  team2Ids: string[]; // Athlete IDs
  score1: number;
  score2: number;
  winnerTeam: 1 | 2;
}

export interface TeamStats {
  name: string;
  totalPoints: number;
  memberCount: number;
}
