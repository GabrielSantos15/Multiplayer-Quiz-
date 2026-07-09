export interface Player {
  playerId: string;
  socketId: string | undefined;
  nickname: string;
  avatarSeed: string;
  online: boolean;
  roomCode?: string;
  score: number;
  correctAnswers: number;
}