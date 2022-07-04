import { Player } from "./player";

export interface GameState {
    players: GamePlayer[],
    activePlayer: GamePlayer,
    currentWord: string,
    startOfNewRound: boolean,
    timeOfRoundEnd: Date
}

export interface GamePlayer {
    id: string;
    name: string;
    score: number;
    hasGuessedCorrectly: boolean;
}
