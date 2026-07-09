import type { Server, Socket } from "socket.io";
import { players } from "./repository.js";
import type { Player } from "./types.js";
import { rooms } from "../room/repository.js";
import { emitRoomUpdate } from "../room/handler.js";

export function registerPlayerHandlers(io: Server, socket: Socket) {
  socket.on("player:register", (data: Player) => {
    const oldPlayer = players.get(data.playerId);

    const player: Player = {
      ...oldPlayer,
      ...data,
      socketId: socket.id,
      online: true,
      score: 0
    };

    players.set(player.playerId, player);

    // Reconecta na sala caso exista
    if (player.roomCode) {
      const room = rooms.get(player.roomCode);

      if (room) {
        if (!room.players.includes(player.playerId)) {
          room.players.push(player.playerId);
        }

        socket.join(room.code);

        rooms.set(room.code, room);

        emitRoomUpdate(io, room);

        console.log(`🔄 ${player.nickname} reconectou na sala ${room.code}`);

        return;
      }
    }

    console.log(`👤 ${player.nickname} registrado`);
  });
}
