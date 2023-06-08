import { createServer } from 'http';
import { Server } from 'socket.io';
import grpc from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { randomInt } from 'crypto';
import express from "express";
const app = express();

const httpServer = createServer(app); //app

// Listening to the server we created on port 5000.
httpServer.listen(5000);

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
        console.log(waitingSockets);
        const enemy = waitingSockets.find((socket) => socket.socket.id === message.socketId);

        const user_1_is_white = randomInt(2);
        const createGameRequest = {
            userOne: user_1_is_white ? message.userId : enemy?.userId ?? -1,
            userTwo: user_1_is_white ? enemy?.userId ?? -1 : message.userId,
        };
        console.log(createGameRequest);
        gameController.create(createGameRequest, (error, response) => {
            if (error) {
                console.error(error);
            } else {
                console.log(response);
                socket.join(String(response.id));
                enemy.socket.join(String(response.id));
                waitingSockets = waitingSockets.filter((socket) => socket.id !== socketId);
                io.to(String(response.id)).emit('gameStart', response);
                openGames = openGames.filter((game) => game.socketId !== socketId);
                io.to(COMMON_ROOM).emit('removeOpenGame', socketId);
            }
        });
    });
    socket.on('rejoinGame',  (roomId)=>{
        console.log(roomId)
        socket.join(String(roomId))
    })
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
        console.log(createMoveRequest);
        moveController.create(createMoveRequest, (error) => {
            if (error) {
                console.error(error);
            } else {
                socket.to(String(message.gameId)).emit('enemyMove', message);
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
