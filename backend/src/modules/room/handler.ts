import type { Server, Socket } from "socket.io";
import { RoomStatus, type CreateRoomPayload, type Room } from "./types.js";
import { players } from "../player/repository.js";
import { generateRoomCode } from "../../utils/generate-room-code.js";
import { rooms } from "./repository.js";
import { games } from "../game/repository.js";

export function emitRoomUpdate(io: Server, room: Room) {
  io.to(room.code).emit("room:update", {
    ...room,
    players: getRoomPlayers(room),
  });
}

export function countOnlinePlayers(room: Room): number {
  return room.players.filter((playerId) => {
    const player = players.get(playerId);
    return player?.online;
  }).length;
}

export function getRoomPlayers(room: Room) {
  return room.players.map((id) => players.get(id)).filter(Boolean);
}

export function registerRoomHandlers(io: Server, socket: Socket) {
  socket.on("room:create", (data: CreateRoomPayload) => {
    const host = players.get(data.hostId);

    if (!host) {
      socket.emit("room:error", {
        message: "Jogador não encontrado.",
      });

      return;
    }

    // Remove da sala atual se estiver em alguma
    if (host.roomCode) {
      const oldRoom = rooms.get(host.roomCode);

      if (oldRoom) {
        removePlayerFromRoom(io, oldRoom, host.playerId);
        socket.leave(oldRoom.code);
      }
    }

    const room: Room = {
      code: generateRoomCode(),
      hostId: host.playerId,

      category: data.category,
      difficulty: data.difficulty,

      isPublic: data.isPublic,

      questionsAmount: data.questionsAmount,
      questionTime: data.questionTime,

      status: RoomStatus.WAITING,

      players: [host.playerId],
    };

    rooms.set(room.code, room);

    players.set(host.playerId, {
      ...host,
      roomCode: room.code,
      socketId: socket.id,
      online: true,
    });

    socket.join(room.code);

    console.log(`🏠 Sala ${room.code} criada por ${host.nickname}`);

    emitRoomUpdate(io, room);

    socket.emit("room:created", room);
  });

  socket.on("room:join", (data: { roomCode: string; playerId: string }) => {
    const room = rooms.get(data.roomCode);

    const player = players.get(data.playerId);

    if (!room) {
      socket.emit("room:error", {
        message: "Sala não encontrada.",
      });

      return;
    }

    if (!player) {
      socket.emit("room:error", {
        message: "Jogador não encontrado.",
      });

      return;
    }

    if (player.roomCode && player.roomCode !== room.code) {
      const oldRoom = rooms.get(player.roomCode);

      if (oldRoom) {
        removePlayerFromRoom(io, oldRoom, player.playerId);

        socket.leave(oldRoom.code);
      }
    }

    if (room.players.length >= 10 && !room.players.includes(player.playerId)) {
      socket.emit("room:error", {
        message: "Sala cheia.",
      });

      return;
    }

    if (!room.players.includes(player.playerId)) {
      room.players.push(player.playerId);
    }

    players.set(player.playerId, {
      ...player,
      roomCode: room.code,
      socketId: socket.id,
      online: true,
    });

    rooms.set(room.code, room);

    socket.join(room.code);

    console.log(`🚪 ${player.nickname} entrou na sala ${room.code}`);

    emitRoomUpdate(io, room);

    socket.emit("room:joined", room);
  });

  socket.on("room:restart", (data) => {
    const room = rooms.get(data.roomCode);

    if (!room) return;

    if (room.status !== RoomStatus.FINISHED) {
      socket.emit("room:error", {
        message: "A partida ainda não terminou.",
      });

      return;
    }

    if (room.hostId !== data.playerId) {
      socket.emit("room:error", {
        message: "Somente o host pode reiniciar.",
      });
      return;
    }
    const game = games.get(data.roomCode);

    if (game?.currentTimeout) clearTimeout(game.currentTimeout);
    if (game?.resultTimeout) clearTimeout(game.resultTimeout);
    games.delete(room.code);

    room.status = RoomStatus.WAITING;

    room.players.forEach((id) => {
      const player = players.get(id);

      if (!player) return;
      players.set(id, {
        ...player,
        score: 0,
        correctAnswers: 0,
      });
    });

    rooms.set(room.code, room);

    io.to(room.code).emit("room:restart");
    emitRoomUpdate(io, room);
  });
}

export function removePlayerFromRoom(io: Server, room: Room, playerId: string) {
  room.players = room.players.filter((id) => id !== playerId);

  // ninguém ficou na sala
  if (room.players.length === 0) {
    destroyRoom(room.code);

    console.log(`🗑️ Sala ${room.code} removida`);

    return;
  }

  // saiu o host
  if (room.hostId === playerId) {
    const newHost = room.players
      .map((id) => players.get(id))
      .find((player) => player?.online);

    if (newHost) {
      room.hostId = newHost.playerId;

      console.log(`👑 Novo host: ${newHost.nickname}`);
    }
  }

  rooms.set(room.code, room);

  emitRoomUpdate(io, room);
}

export function destroyRoom(roomCode: string) {
  const room = rooms.get(roomCode);

  if (!room) return;

  const game = games.get(roomCode);

  if (game?.currentTimeout) clearTimeout(game.currentTimeout);
  if (game?.resultTimeout) clearTimeout(game.resultTimeout);

  for (const playerId of room.players) {
    players.delete(playerId);
  }
  games.delete(roomCode);
  rooms.delete(roomCode);
}
