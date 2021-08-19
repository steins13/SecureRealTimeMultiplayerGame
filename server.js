const http = require('http')
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

//prepare server
const app = express();
const server = http.createServer(app)
const io = socket(server)

//security
const helmet = require('helmet')
app.use(helmet())
app.use(helmet.noCache())
app.use(function (req, res, next) {
  res.setHeader('X-Powered-By', 'PHP 7.4.3')
  next()
})

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});


// **********************************************

const canvasWidth = 640
const canvasHeight = 480
const avatarWidth = 50
const avatarHeight = 50


let food = {
  x: randomNum(0, canvasWidth - avatarWidth),
  y: randomNum(0, canvasHeight - avatarHeight),
  id: Date.now(),
  value: 1
}

let players = []

io.on("connection", (socket) => {
  console.log("User connected")

  const mainPlayer = {
    x: randomNum(0, canvasWidth - avatarWidth),
    y: randomNum(0, canvasHeight - avatarHeight),
    id: socket.client.id,
    score: 0,
    speed: 10
  }
  players.push(mainPlayer)

  io.emit("init", players, food)

  socket.on("move player", (dir) => {
    let player = players.find((p) => p.id == socket.client.id)
    if (dir == "right") {
      if (player.x + avatarWidth < canvasWidth) {
        player.x = player.x + player.speed
      }
    } else if (dir == "left") {
      if (player.x > 0) {
        player.x = player.x - player.speed
      }
    } else if (dir == "up") {
      if (player.y > 0) {
        player.y = player.y - player.speed
      }
    } else if (dir == "down") {
      if (player.y + avatarHeight < canvasHeight) {
        player.y = player.y + player.speed
      }
    }
    io.emit("move player", player)
  })
  
  socket.on("scored", (scored) => {
    let player = players.find((p) => p.id == scored.id)
    player.score = player.score + 1
    food = newFood()
    io.emit("scored", scored.id, food)
  })


  socket.on("disconnect", () => {
    console.log("User disconnected")
    io.emit("disconnect", socket.client.id)
    players = players.filter((player) => player.id != socket.client.id)
  })

})

function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function newFood() {
  let food = {
    x: randomNum(0, canvasWidth - avatarWidth),
    y: randomNum(0, canvasHeight - avatarHeight),
    id: Date.now(),
    value: 1
  }
  return food
}


// *******************************************

const portNum = process.env.PORT || 3000;

// Set up server and tests
server.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});


module.exports = app; // For testing
