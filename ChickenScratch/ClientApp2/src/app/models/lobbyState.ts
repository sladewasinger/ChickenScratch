import { Lobby } from './lobby';
import { Player } from './player';

export interface LobbyState {
    lobbies: Lobby[],
    players: Player[]
}
