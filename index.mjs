import { createServer } from 'http';
import { Server } from 'socket.io';
import grpc from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import express from 'express';
const app = express();

const httpServer = createServer(); //app

app.get('/', (req, res) => {
    res.json({ message: 'ok' });
});

// Listening to the server we created on port 5000.
httpServer.listen(5000, 'localhost');

// Create socket.io instance be passing the server we created to the socket library
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
    },
    pingInterval: 10000,
    pingTimeout: 5000,
});

const packageDefinition = loadSync('src/proto/grpc_server.proto');
const { grpc_server } = grpc.loadPackageDefinition(packageDefinition);

const gameController = new grpc_server.GameController('localhost:50051', grpc.credentials.createInsecure());
const moveController = new grpc_server.MoveController('localhost:50051', grpc.credentials.createInsecure());

let openGames = [];
let currentOpenGameId = 0;
let waitingSockets = [];

const COMMON_ROOM = 'common_room';

io.on('connect', (socket) => {
    const socketId = socket.id;
    console.log('Connected client.');
    socket.join(COMMON_ROOM);
    socket.emit('openGames', openGames);
    socket.on('createGameRequest', (message) => {
        socket.leave(COMMON_ROOM);
        waitingSockets.push({ socket: socket, userId: message.userId });
        openGames.push({
            id: currentOpenGameId,
            socketId: socketId,
            userId: message.userId,
            username: message.username,
            rating: message.rating,
        });
        socket.to(COMMON_ROOM).emit('openGames', [
            {
                id: currentOpenGameId,
                socketId: socketId,
                userId: message.userId,
                username: message.username,
                rating: message.rating,
            },
        ]);
        currentOpenGameId = currentOpenGameId + 1;
    });
    socket.on('joinGame', (message) => {
        socket.leave(COMMON_ROOM);
        waitingSockets.push({ socket: socket, userId: message.userId });
        const enemy = waitingSockets.find((socket) => socket.socket.id === message.socketId);

        const user_1_is_white = Math.floor(Math.random() * 2);
        const createGameRequest = {
            userOne: user_1_is_white ? message.userId : enemy?.userId ?? -1,
            userTwo: user_1_is_white ? enemy?.userId ?? -1 : message.userId,
        };
        gameController.create(createGameRequest, (error, response) => {
            if (error) {
                console.error(error);
            } else {
                socket.join(String(response.id));
                enemy.socket.join(String(response.id));
                io.to(String(response.id)).emit('gameStart', response);
                openGames = openGames.filter(
                    (game) => game.userId !== response.userOneInfo.id && game.userId !== response.userTwoInfo.id,
                );
                io.to(COMMON_ROOM).emit('removeOpenGame', socketId);
            }
        });
    });
    socket.on('rejoinGame', (roomId) => {
        socket.join(String(roomId));
    });
    socket.on('playerMove', (message) => {
        const createMoveRequest = {
            game: message.gameId,
            user: message.playerId,
            checkerId: message.checkerId,
            newPositions: message.newPositions,
            isKing: message.isKing,
            isWhite: message.isWhite,
            killed: message.killed,
        };
        moveController.create(createMoveRequest, (error) => {
            if (error) {
                console.error(error);
            } else {
                socket.to(String(message.gameId)).emit('enemyMove', message);
            }
        });
    });
    socket.on('endGameRequest', (message) => {
        const partialUpdateGameRequest = {
            id: message.gameId,
            winner: message.winner,
            userOnePoints: message.userOnePoints,
            userTwoPoints: message.userTwoPoints,
            status: 'FINISHED',
        };
        console.log(partialUpdateGameRequest);
        gameController.partialUpdate(partialUpdateGameRequest, (error, response) => {
            if (error) {
                console.error(error);
            } else {
                console.log(response);
                io.to(String(message.gameId)).emit('gameEnd', {
                    winner: response.winner,
                    openGames: openGames,
                });
                const player_1 = waitingSockets.find((socket) => socket.userId === response.userOneInfo.id);
                player_1.socket.leave(String(message.gameId));
                player_1.socket.join(COMMON_ROOM);
                waitingSockets = waitingSockets.filter((socket) => socket.userId !== player_1.userId);
                const player_2 = waitingSockets.find((socket) => socket.userId === response.userTwoInfo.id);
                player_2.socket.leave(String(message.gameId));
                player_2.socket.join(COMMON_ROOM);
                waitingSockets = waitingSockets.filter((socket) => socket.userId !== player_2.userId);
            }
        });
    });
    socket.on('disconnect', () => {
        const openGame = openGames.find((game) => game.socketId === socketId);
        if (openGame) {
            openGames = openGames.filter((game) => game.socketId !== socketId);
            io.to(COMMON_ROOM).emit('removeOpenGame', openGame.socketId);
        }
        console.log('Client disconnected');
    });
});
