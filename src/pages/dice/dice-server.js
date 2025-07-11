const { Server } = require("socket.io");

const io = new Server(3000, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("👤 Un utilisateur connecté");

  socket.on("rollDice", (data) => {
    // Si l'admin envoie déjà une valeur, on la reprend ;
    // sinon on génère un d20 classique
    const result =
      data && typeof data.value === "number"
        ? data.value
        : Math.floor(Math.random() * 20) + 1;

    io.emit("diceResult", result);
  });

  socket.on("disconnect", () => {
    console.log("👤 Un utilisateur déconnecté");
  });
});
