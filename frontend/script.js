// frontend/script.js
const socket = io();

const statusDiv = document.getElementById("status");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const grid = 20;
let currentPlayer = "player1";
let snake = {
  x: 160,
  y: 160,
  dx: grid,
  dy: 0,
  cells: [],
  maxCells: 4,
};
let food = {
  x: 320,
  y: 320,
};

// Unirse al juego
socket.emit("joinGame");

socket.on("waiting", (msg) => {
  statusDiv.textContent = msg;
});

socket.on("playerJoined", (msg) => {
  statusDiv.textContent = msg;
});

socket.on("gameStart", (msg) => {
  statusDiv.textContent = msg;
  requestAnimationFrame(loop);
});

socket.on("playerMove", (direction) => {
  switch (direction) {
    case "ArrowUp":
      if (snake.dy === 0) {
        snake.dy = -grid;
        snake.dx = 0;
      }
      break;
    case "ArrowDown":
      if (snake.dy === 0) {
        snake.dy = grid;
        snake.dx = 0;
      }
      break;
    case "ArrowLeft":
      if (snake.dx === 0) {
        snake.dx = -grid;
        snake.dy = 0;
      }
      break;
    case "ArrowRight":
      if (snake.dx === 0) {
        snake.dx = grid;
        snake.dy = 0;
      }
      break;
    default:
      break;
  }
});

socket.on("playerDisconnected", (msg) => {
  statusDiv.textContent = msg;
});

// Manejar eventos de teclado
document.addEventListener("keydown", (e) => {
  socket.emit("move", e.key);
  switch (e.key) {
    case "ArrowUp":
      if (snake.dy === 0) {
        snake.dy = -grid;
        snake.dx = 0;
      }
      break;
    case "ArrowDown":
      if (snake.dy === 0) {
        snake.dy = grid;
        snake.dx = 0;
      }
      break;
    case "ArrowLeft":
      if (snake.dx === 0) {
        snake.dx = -grid;
        snake.dy = 0;
      }
      break;
    case "ArrowRight":
      if (snake.dx === 0) {
        snake.dx = grid;
        snake.dy = 0;
      }
      break;
    default:
      break;
  }
});

// Función principal del juego
function loop() {
  requestAnimationFrame(loop);

  // Mover la serpiente
  snake.x += snake.dx;
  snake.y += snake.dy;

  // Limitar la serpiente dentro del canvas
  if (snake.x < 0) snake.x = canvas.width - grid;
  else if (snake.x >= canvas.width) snake.x = 0;
  if (snake.y < 0) snake.y = canvas.height - grid;
  else if (snake.y >= canvas.height) snake.y = 0;

  // Agregar la nueva posición de la serpiente
  snake.cells.unshift({ x: snake.x, y: snake.y });

  // Limitar el tamaño de la serpiente
  if (snake.cells.length > snake.maxCells) {
    snake.cells.pop();
  }

  // Limpiar el canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dibujar la comida
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, grid - 1, grid - 1);

  // Dibujar la serpiente
  ctx.fillStyle = "green";
  snake.cells.forEach((cell, index) => {
    ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1);

    // Colisión con la comida
    if (cell.x === food.x && cell.y === food.y) {
      snake.maxCells++;
      // Reubicar la comida
      food.x = getRandomInt(0, 19) * grid;
      food.y = getRandomInt(0, 19) * grid;
    }

    // Colisión con sí misma
    for (let i = index + 1; i < snake.cells.length; i++) {
      if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
        snake.x = 160;
        snake.y = 160;
        snake.cells = [];
        snake.maxCells = 4;
        snake.dx = grid;
        snake.dy = 0;

        food.x = getRandomInt(0, 19) * grid;
        food.y = getRandomInt(0, 19) * grid;

        alert("¡Has perdido! Reiniciando el juego...");
      }
    }
  });
}

// Función para obtener un número aleatorio
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
