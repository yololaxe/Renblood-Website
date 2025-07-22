// server.js
const { Server } = require("socket.io");
const io = new Server(3000, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("👤 Un utilisateur connecté");

  socket.on("rollDice", (data) => {
    const min = typeof data.min === "number" ? data.min : 1;
    const max = typeof data.max === "number" ? data.max : 20;
    const mod = typeof data.mod === "number" ? data.mod : 0;

    // générer le résultat
    const result =
      (typeof data.value === "number")
        ? data.value
        : Math.floor(Math.random() * (max - min + 1)) + min + mod;

    // broadcast
    io.emit("diceResult", result);
  });

  socket.on("disconnect", () => {
    console.log("👤 Un utilisateur déconnecté");
  });
});
