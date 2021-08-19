import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

const canvasWidth = 640
const canvasHeight = 480
const avatarWidth = 50
const avatarHeight = 50

let mainAvatar = generateImage("https://preview.redd.it/jnjsxsvlcnn61.png?width=530&format=png&auto=webp&s=6560e8ef523820cffb04d557646169d58d5324aa")
let enemyAvatar = generateImage("https://preview.redd.it/ecmn09nncnn61.png?width=578&format=png&auto=webp&s=668e6eefaf1b661e57e07067dd147be91ed67d1e")
let foodAvatar = generateImage("https://i.redd.it/60isol1tbm561.png")
let background = generateImage("https://w0.peakpx.com/wallpaper/768/215/HD-wallpaper-anime-virtual-youtuber-hololive-hololive-alternative-shirakami-fubuki.jpg")

let players = []
let frame
let food
let rank = "Rank: /"

socket.on("init", (playerList, foodObj) => {
  
  cancelAnimationFrame(frame)
  
  players = [...playerList]
  
  socket.on("move player", (p) => {
    let player = players.find((value) => value.id == p.id)
    player.x = p.x
    player.y = p.y
  })

  socket.on("scored", (scoredId, newFood) => {
    let player = players.find((p) => p.id == scoredId)
    player.score = player.score + 1
    food = newFood
  })
  
  food = foodObj
  draw()

  socket.on("disconnect", (id) => {
    players = players.filter((player) => player.id != id)
  })
})


function draw() {
  context.fillStyle = "antiquewhite"
  context.fillRect(0, 0, canvasWidth, canvasHeight + 30)

  context.drawImage(background, 0, 0, canvasWidth, canvasHeight)
  context.font = "20px cursive"
  context.fillStyle = "gray"
  context.fillText(rank, 50, 502)
  context.fillText("Eat YAGOO", 450, 502)

  players.forEach((player) => {
    if (player.id == socket.id) {
      context.drawImage(mainAvatar, player.x, player.y, avatarWidth, avatarHeight)
    } else {
      context.drawImage(enemyAvatar, player.x, player.y, avatarWidth, avatarHeight)
    }

    let p = new Player(player)
    if (p.collision(food)) {
      context.fillRect(food.x, food.y, avatarWidth, avatarHeight)
      socket.emit("scored", p)
      rank = p.calculateRank(players)
    }

  })

  context.drawImage(foodAvatar, food.x, food.y, avatarWidth, avatarHeight)

  frame = requestAnimationFrame(draw)

}

function generateImage(img) {
  let image = new Image
  image.src = img
  return image
}

function getKey(e) {
  if (e == 37 || e == 65) return "left"
  else if (e == 38 || e == 87) return "up"
  else if (e == 39 || e == 68) return "right"
  else if (e == 40 || e == 83) return "down"
}

document.addEventListener("keydown", (e) => {
  let key = getKey(e.keyCode)
  socket.emit("move player", key)
})
