import { Player } from "./player";

export interface Lobby {
    id: string;
    key: string;
    name: string;
    players: Player[];
}
