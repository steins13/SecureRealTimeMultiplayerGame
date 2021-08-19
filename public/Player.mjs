const avatarWidth = 50
const avatarHeight = 50

class Player {
  constructor({x, y, score, id, speed}) {
    this.x = x
    this.y = y
    this.score = score
    this.id = id
    this.speed = speed
  }

  movePlayer(dir, speed) {
    if (dir == "right") {
      this.x = this.x + speed
    } else if (dir == "left") {
      this.x = this.x - speed
    } else if (dir == "up") {
      this.y = this.y - speed
    } else if (dir == "down") {
      this.y = this.y + speed
    }
  }

  collision(item) {
    if (this.y + avatarHeight >= item.y && this.y <= item.y + avatarHeight && this.x + avatarWidth >= item.x && this.x <= item.x + avatarWidth) {
      return true
    } 
  }

  calculateRank(arr) {
    function compare( a, b ) {
      if ( a.score < b.score ){
        return -1;
      }
      if ( a.score > b.score ){
        return 1;
      }
      return 0;
    }

    let newArr = arr.sort(compare).reverse()
    for (let i = 0; i <= newArr.length - 1; i++) {
      if (newArr[i].id == this.id) {
        return "Rank: " + (i + 1).toString() + "/" + newArr.length.toString()
      }
    }

  }
}

export default Player;
