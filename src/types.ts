export interface CreateGameRequest {
    userId: number;
    username: string;
    rating: number;
}

export interface JoinGameRequest {
    gameId: number;
}

export interface MakeMoveRequest {
    game: number;
    user: number;
    checker_id: number;
    new_positions: string[];
    is_king: boolean;
    is_white: boolean;
}

export interface OpenGamesProps {
    id: number;
    socketId: string;
    userId: number;
    username: string;
    rating: number;
}

export interface GameListData {
    id: number;
    userId: number;
    username: string;
    rating: number;
}

export interface ClientToServerEvents {
    createGameRequest: (message: CreateGameRequest, callback: (gameId: number) => void) => void;
    joinGame: (message: JoinGameRequest) => void;
    playerMakeMove: (message: MakeMoveRequest) => void;
}

export interface ServerToClientEvents {
    openGames: (data: GameListData[]) => void;
    removeOpenGame: (gameIds: number) => void;
}
