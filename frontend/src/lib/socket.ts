import { io, Socket } from 'socket.io-client';

 

let socket: Socket | null = null;

 

export const initializeSocket = (token: string): Socket => {

  if (!socket) {

    socket = io(process.env.NEXT_PUBLIC_WS_URL!, {

      auth: {

        token,

      },

    });

  }

  return socket;

};

 

export const getSocket = (): Socket | null => {

  return socket;

};

 

export const disconnectSocket = (): void => {

  if (socket) {

    socket.disconnect();

    socket = null;

  }
};