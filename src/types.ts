export interface CreateGameRequest {
    userId: number;
    username: string;
    rating: number;
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
    socketId: string;
    username: string;
    rating: number;
}

export interface MoveProps {
    gameId: number;
    playerId: number;
    checkerId: number;
    startPosition: string;
    newPositions: string[];
    isKing: boolean;
    isWhite: boolean;
    killed: number[];
}

export interface UserInfo {
    id: number;
    email: string;
    username: string;
}

export enum GameStatus {
    CREATED = 'CREATED',
    IN_PROCESS = 'IN_PROCESS',
    FINISHED = 'FINISHED',
}

export interface GameStartProps {
    id: number;
    user_1_info: UserInfo;
    user_2_info: UserInfo;
    start_at: string;
    user_1_turn: boolean;
    status: GameStatus;
}

export interface ClientToServerEvents {
    createGameRequest: (message: CreateGameRequest, callback: (gameId: number) => void) => void;
    joinGame: (socketId: string) => void;
    playerMove: (data: MoveProps) => void;
}

export interface ServerToClientEvents {
    openGames: (data: GameListData[]) => void;
    removeOpenGame: (socketId: string) => void;
    gameStart: (data: GameStartProps) => void;
    enemyMove: (data: MoveProps) => void;
}
