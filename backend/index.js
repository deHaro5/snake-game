// backend/index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 5000;

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Manejar conexiones de Socket.io
io.on("connection", (socket) => {
  console.log("Un jugador se ha conectado:", socket.id);

  // Asignar al jugador a una sala
  socket.on("joinGame", () => {
    const rooms = Array.from(io.sockets.adapter.rooms.keys());
    let joined = false;

    // Buscar una sala con un solo jugador
    for (let room of rooms) {
      if (io.sockets.adapter.rooms.get(room).size === 1) {
        socket.join(room);
        socket
          .to(room)
          .emit(
            "playerJoined",
            "Otro jugador se ha unido. ¡Comienza el juego!"
          );
        socket.emit("gameStart", "¡Comienza el juego!");
        joined = true;
        break;
      }
    }

    // Si no hay salas disponibles, crear una nueva
    if (!joined) {
      const room = socket.id;
      socket.join(room);
      socket.emit("waiting", "Esperando a otro jugador para unirse...");
    }
  });

  // Manejar movimientos del jugador
  socket.on("move", (direction) => {
    // Emitir el movimiento a todos los jugadores en la misma sala
    const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
    rooms.forEach((room) => {
      socket.to(room).emit("playerMove", direction);
    });
  });

  // Manejar desconexiones
  socket.on("disconnect", () => {
    console.log("Un jugador se ha desconectado:", socket.id);
    // Notificar a los jugadores en la misma sala
    const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
    rooms.forEach((room) => {
      socket
        .to(room)
        .emit("playerDisconnected", "El otro jugador se ha desconectado.");
    });
  });
});

// Iniciar el servidor
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
