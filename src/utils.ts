import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

import { ClientToServerEvents, ServerToClientEvents } from './types';

export const existsGameRooms = (
    sockets: Map<string, Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, any>>,
): string[] => {
    const createdRooms: string[] = [];
    sockets.forEach((socket, socketId) =>
        Array.from(socket.rooms).forEach((room) => socketId !== room && createdRooms.push(room)),
    );
    return createdRooms;
};
