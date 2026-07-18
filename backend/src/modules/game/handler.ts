import type { Server, Socket } from "socket.io";
import { rooms } from "../room/repository.js";
import { players } from "../player/repository.js";
import { games } from "./repository.js";
import type { Game } from "./types.js";
import { RoomStatus, type Room } from "../room/types.js";
import { countOnlinePlayers, emitRoomUpdate } from "../room/handler.js";
import { generateQuiz, sanitizeQuestion } from "./question-generator.js";
import type { Player } from "../player/types.js";

export function registerGameHandlers(io: Server, socket: Socket) {
  socket.on("game:start", (data?: { roomCode?: string; playerId?: string }) => {
    const socketPlayer = Array.from(players.values()).find(
      (player) => player.socketId === socket.id,
    );

    const roomCode = data?.roomCode ?? socketPlayer?.roomCode;
    const playerId = data?.playerId ?? socketPlayer?.playerId;

    if (!roomCode || !playerId) {
      socket.emit("room:error", {
        message: "Dados insuficientes para iniciar a partida.",
      });
      return;
    }

    const room = rooms.get(roomCode);

    if (!room) {
      socket.emit("room:error", { message: "Sala não encontrada." });
      return;
    }

    if (room.hostId !== playerId) {
      socket.emit("room:error", {
        message: "Apenas o host pode iniciar a partida.",
      });
      return;
    }

    if (room.status !== RoomStatus.WAITING) {
      socket.emit("room:error", { message: "A partida já foi iniciada." });
      return;
    }

    room.players.forEach((playerId) => {
      const player = players.get(playerId);
      if (player) {
        players.set(playerId, { ...player, score: 0, correctAnswers: 0 });
      }
    });

    room.status = RoomStatus.PLAYING;
    rooms.set(room.code, room);

    const questions = generateQuiz(room.questionsAmount, room.difficulty);

    const game: Game = {
      roomCode: room.code,
      currentQuestion: 0,
      questions,
      currentTimeout: null,
      resultTimeout: null,
      currentAnswers: new Map(),
      questionStartedAt: 0,
    };

    games.set(room.code, game);

    console.log(`🎮 Jogo iniciado na sala ${room.code}`);

    emitRoomUpdate(io, room);

    sendQuestion(io, room, game);
  });

  socket.on(
    "game:answer",
    (data: {
      roomCode: string;
      playerId: string;
      answer: string;
      questionIndex: number;
    }) => {
      const { roomCode, playerId, answer, questionIndex } = data;

      const room = rooms.get(roomCode);
      const game = games.get(roomCode);

      if (!room || !game) {
        socket.emit("room:error", { message: "Sala ou jogo não encontrado." });
        return;
      }


      if (questionIndex !== game.currentQuestion) return;
      if (game.currentAnswers.has(playerId)) return;
      if (!game.questions[game.currentQuestion].options.includes(answer)) return;

      game.currentAnswers.set(playerId, {
        answer,
        answeredAt: Date.now(),
      });

      const totalPlayers = countOnlinePlayers(room);
      const totalAnswers = game.currentAnswers.size;

      if (totalAnswers >= totalPlayers) {
        if (game.currentTimeout) {
          clearTimeout(game.currentTimeout);
          game.currentTimeout = null;
        }
        advanceQuestion(io, room, game);
      }
    },
  );
}

function sendQuestion(io: Server, room: Room, game: Game) {
    console.log("Enviando pergunta", game.currentQuestion);
  const question = game.questions[game.currentQuestion];
  const publicQuestion = sanitizeQuestion(question);

  game.currentAnswers = new Map();

    game.questionStartedAt = Date.now();

  io.to(room.code).emit("game:question", {
    question: publicQuestion,
    questionIndex: game.currentQuestion,
    totalQuestions: game.questions.length,
    timeLimit: room.questionTime,
  });

  game.currentTimeout = setTimeout(() => {
    advanceQuestion(io, room, game);
  }, room.questionTime * 1000);
}

function advanceQuestion(io: Server, room: Room, game: Game) {
  const question = game.questions[game.currentQuestion];

  // Atualiza a pontuação de quem respondeu
  const totalTimeMs = room.questionTime * 1000;
  const correctAnswers = [];

  for (const [playerId, playerAnswer] of game.currentAnswers.entries()) {
    const isCorrect = playerAnswer.answer === question.answer;
    
    if (isCorrect) {
      correctAnswers.push({
        playerId,
        elapsed: playerAnswer.answeredAt - game.questionStartedAt
      });
    }
  }

  // Ordenar do mais rápido para o mais lento
  correctAnswers.sort((a, b) => a.elapsed - b.elapsed);

  // Distribuir os pontos
  correctAnswers.forEach((answerData, index) => {
    const player = players.get(answerData.playerId);
    if (!player) return;

    let points = 100; // Pontos base

    // --- BÔNUS DE PORCENTAGEM DE TEMPO ---
    const timePercentage = answerData.elapsed / totalTimeMs;

    if (timePercentage <= 0.25) {
      points += 50;
    } else if (timePercentage <= 0.50) {
      points += 30; 
    } else {
      points += 10;
    }

    // --- BÔNUS DE ORDEM DE CHEGADA ---
    if (index === 0) points += 20;
    else if (index === 1) points += 10;
    else if (index === 2) points += 5;

    // Atualiza o estado do jogador
    players.set(answerData.playerId, {
      ...player,
      score: player.score + points,
      correctAnswers: player.correctAnswers + 1,
    });
  });

  rooms.set(room.code, room);

  emitRoomUpdate(io, room);

  // Envia o resultado da pergunta
  io.to(room.code).emit("game:question-result", {
    correctAnswer: question.answer,
  });

  // Espera alguns segundos antes da próxima pergunta
  game.resultTimeout = setTimeout(() => {
    game.currentQuestion++;

    if (game.currentQuestion >= game.questions.length) {
      room.status = RoomStatus.FINISHED;

      rooms.set(room.code, room);

      // io.to(room.code).emit("game:ended");

      games.delete(room.code);

      emitRoomUpdate(io, room);

      return;
    }

    sendQuestion(io, room, game);
  }, 5000);
}

export function syncPlayerWithCurrentQuestion(
  socket: Socket,
  room: Room,
  game: Game,
) {
  const question = game.questions[game.currentQuestion];

  const publicQuestion = sanitizeQuestion(question);

  const elapsed = Date.now() - game.questionStartedAt;

  const remaining = Math.max(
    1,
    Math.ceil(room.questionTime - elapsed / 1000),
  );

  socket.emit("game:question", {
    question: publicQuestion,
    questionIndex: game.currentQuestion,
    totalQuestions: game.questions.length,
    timeLimit: remaining,
  });
}