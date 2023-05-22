import { createServer, Server as HttpServer } from 'http';

import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';

import { COMMON_ROOM } from './constants';
import { ClientToServerEvents, GameListData, ServerToClientEvents } from './types';
//import { existsRooms } from './utils';

export class CheckerServer {
    public static readonly PORT: number = 8080;
    private app: express.Application;
    private httpServer: HttpServer;
    private io: Server<ClientToServerEvents, ServerToClientEvents>;
    private port: string | number;
    private openGames: (GameListData & { socketId: string })[] = [];
    private currentOpenGameId = 0;

    constructor() {
        this.app = express();
        this.app.get('/', (req, res) => {
            res.send('<h1>Hello world</h1>');
        });
        this.app.use(cors());
        this.app.options('*', cors());
        this.port = process.env.PORT || CheckerServer.PORT;
        this.httpServer = createServer(this.app);
        this.io = new Server(this.httpServer, {
            cors: {
                origin: 'http://localhost:3000',
            },
            pingInterval: 10000,
            pingTimeout: 5000,
        });
        this.listen();
    }

    private listen(): void {
        this.httpServer.listen(this.port, () => {
            console.log(`Running server on port ${this.port}`);
        });
        this.io.on('connect', (socket) => {
            const socketId = socket.id;
            console.log('Connected client on port %s.', this.port);
            socket.join(COMMON_ROOM);
            socket.emit('openGames', this.openGames);
            socket.on('createGameRequest', (message, callback) => {
                socket.leave(COMMON_ROOM);
                socket.join(String(this.currentOpenGameId));
                callback(this.currentOpenGameId);
                this.openGames.push({
                    id: this.currentOpenGameId,
                    socketId: socketId,
                    userId: message.userId,
                    username: message.username,
                    rating: message.rating,
                });
                socket.to(COMMON_ROOM).emit('openGames', [
                    {
                        id: this.currentOpenGameId,
                        userId: message.userId,
                        username: message.username,
                        rating: message.rating,
                    },
                ]);
                this.currentOpenGameId = this.currentOpenGameId + 1;
            });
            socket.on('joinGame', (message) => {
                socket.leave(COMMON_ROOM);
                socket.join(String(message.gameId));
                this.openGames = this.openGames.filter((game) => game.id !== message.gameId);
                this.io.to(COMMON_ROOM).emit('removeOpenGame', message.gameId);
            });
            socket.on('playerMakeMove',(message) => {
                console.log(message)
            });
            // 
            socket.on('disconnect', () => {
                const openGame = this.openGames.find((game) => game.socketId === socketId);
                if (openGame) {
                    this.openGames = this.openGames.filter((game) => game.socketId !== socketId);
                    this.io.to(COMMON_ROOM).emit('removeOpenGame', openGame.id);
                }
                console.log('Client disconnected');
            });

        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}
