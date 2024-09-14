const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();

const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let players = {};
let currPlayer = "w";

//* Middlewares
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Chess Game" });
});

io.on("connection", function (unique) {
  console.log("connected");

  if (!players.white) {
    players.white = unique.id;
    unique.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = unique.id;
    unique.emit("playerRole", "b");
  } else {
    unique.emit("spectatorRule");
  }


  unique.on("disconnect", function(){
    if(socket.id === players.white){delete players.white}
    else if(socket.id === players.black){delete players.black}
  });

  unique.on("move", function(move){
      try{
        if (chess.turn() === 'w' && unique.id !== players.white) return
        if (chess.turn() === 'b' && unique.id !== players.black) return

        const result = chess.move(move)
        if (result){
          currPlayer = chess.turn();
          io.emit("move", move);
          io.emit("boardState", chess.fen())
        }
        else{
          console.log("Invalid move: ", move);
          unique.emit("invalidMove", move);
        }
      }
      catch(err){
        console.log(err);
        console.log("Invalid Move: ", move)
      }
  })

});

server.listen(3000, "0.0.0.0", () => {
  console.log(`Server Started On http://localhost:3000`);
});
