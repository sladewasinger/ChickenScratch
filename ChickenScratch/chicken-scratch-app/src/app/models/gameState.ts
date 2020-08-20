import { Player } from "./player";

export interface GameState {
    players: Player[],
    activePlayer: GamePlayer,
    currentWord: string
}

export interface GamePlayer extends Player {
    score: number;
}
