// dice-server.js
const { Server } = require("socket.io");

const io = new Server(3000, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("👤 Un utilisateur connecté");

  socket.on("rollDice", () => {
    const result = Math.floor(Math.random() * 20) + 1;
    io.emit("diceResult", result);
  });

  socket.on("disconnect", () => {
    console.log("👤 Un utilisateur déconnecté");
  });
});
