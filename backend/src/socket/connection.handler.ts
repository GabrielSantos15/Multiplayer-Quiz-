import type { Server, Socket } from "socket.io";

import { players } from "../modules/player/repository.js";
import type { Player } from "../modules/player/types.js";
import { rooms } from "../modules/room/repository.js";
import { destroyRoom, emitRoomUpdate } from "../modules/room/handler.js";

export function registerConnectionHandlers(io: Server, socket: Socket) {
  socket.on("disconnect", () => {
    console.log(`❌ ${socket.id} disconnected`);

    for (const [id, player] of players.entries()) {
      if (player.socketId !== socket.id) {
        continue;
      }

      const updatedPlayer: Player = {
        ...player,
        socketId: undefined,
        online: false,
      };

      players.set(id, updatedPlayer);

      const room = player.roomCode ? rooms.get(player.roomCode) : null;

      if (room) {
        const hasOnlinePlayers = room.players.some((playerId) => {
          const currentPlayer = players.get(playerId);

          return currentPlayer?.online;
        });

        // ninguém mais está conectado
        if (!hasOnlinePlayers) {
          destroyRoom(room.code);

          console.log(`🗑️ Sala ${room.code} encerrada (todos offline)`);

          break;
        }

        // troca host se necessário
        if (room.hostId === player.playerId) {
          const newHost = room.players
            .map((playerId) => players.get(playerId))
            .find((currentPlayer) => currentPlayer?.online);

          if (newHost) {
            room.hostId = newHost.playerId;

            console.log(`👑 Novo host: ${newHost.nickname}`);
          }
        }

        rooms.set(room.code, room);

        emitRoomUpdate(io, room);
      }

      break;
    }
  });
}
