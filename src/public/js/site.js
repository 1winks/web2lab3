const BALL_SPEED = 5;
const BROJ_CIGLI = 50;

// funkcija za odabir smjera na početku
function getStartingDirection() {
  return Math.random() < 0.5 ? 1 : -1;
}

// učitavanje najboljeg rezultata iz localStoragea
let highScore = 0;
function loadBestScore() {
  const saved = localStorage.getItem("bestScore");
  highScore = saved ? Number(saved) : 0;
}
function saveBestScore(currentScore) {
  if (currentScore > highScore) {
    highScore = currentScore;
    localStorage.setItem("bestScore", highScore);
  }
}

// detekcija sudara između loptice i drugog objekta(palica ili cigla) 
function bounceFromRect(ball, rect) {
  const dx = ball.x - rect.x;
  const px = (ball.width / 2 + rect.width / 2) - Math.abs(dx);
  const dy = ball.y - rect.y;
  const py = (ball.height / 2 + rect.height / 2) - Math.abs(dy);
  if (px <= 0 || py <= 0) return false;
  if (Math.abs(px - py) < 4) {
    ball.speedMultiplier *= 1.02;
    console.log("CORNER HIT! SPEED UP:", ball.speedMultiplier);
    ball.speed_x = dx > 0 ? BALL_SPEED : -BALL_SPEED;
    ball.speed_y = dy > 0 ? BALL_SPEED : -BALL_SPEED;
    return true;
  }
  if (px < py) {
    ball.speed_x = dx > 0 ? BALL_SPEED : -BALL_SPEED;
  } else {
    ball.speed_y = dy > 0 ? BALL_SPEED : -BALL_SPEED;
  }
  return true;
}

/* klasa za glavni objekt u igri, update() ju crta na temelju newPos() izračuna
  newPos računa promjenu u 3 scenarija: sudar sa zidom, palicom i ciglom */
class Loptica {
  constructor(width, height, x, y, ctx, myGameHitterPiece, myGameArea) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.context = ctx;
    this.speedMultiplier = 1;
    this.speed_x = getStartingDirection()*BALL_SPEED;
    this.speed_y = -BALL_SPEED;
    this.palica = myGameHitterPiece;
    this.myGameArea = myGameArea;
  }
  update() {
    this.context.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = "white";
    this.context.translate(this.x, this.y);
    this.context.fillStyle = "white";
    this.context.fillRect(this.width / -2, this.height / -2, this.width, this.height);
    this.context.restore();
  }
  newPos() {
    if (this.x - this.width / 2 < 0)
      this.speed_x = BALL_SPEED;
    else if ((this.x + this.width / 2) >= this.context.canvas.width)
      this.speed_x = -BALL_SPEED;
    if (this.y - this.height / 2 < 0)
      this.speed_y = BALL_SPEED;
    else if ((this.y + this.height / 2) >= this.context.canvas.height)
      this.myGameArea.stop();
    bounceFromRect(this, this.palica);
    for (const brick of ciglaArea.cigle) {
      if (!brick.hit && bounceFromRect(this, brick)) {
        brick.hit = true;
        gameScore++;
        saveBestScore(gameScore);
      }
    }
    this.x += this.speed_x * this.speedMultiplier;
    this.y += this.speed_y * this.speedMultiplier;
  } 
}

// klasa za korisničku palicu, update() ju crta na temelju newPos() izračuna, kretanje <- -> strelicama 
class Palica {
  constructor(width, height, x, y, ctx) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.context = ctx;
    this.speed = BALL_SPEED*2;
    this.moveDirection = 0; // -1 lijevo, 0 stoji, 1 desno
  }
  update() {
    this.context.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = "lightgray";
    this.context.translate(this.x, this.y);
    this.context.fillStyle = "lightgray";
    this.context.fillRect(this.width / -2, this.height / -2, this.width, this.height);
    this.context.restore();
  }
  newPos() {
    this.x += this.moveDirection * this.speed;
    if(this.x - this.width / 2 < 0) {
      this.x = this.width / 2;
    }
    if(this.x + this.width / 2 > this.context.canvas.width) {
      this.x = this.context.canvas.width - this.width / 2;
    }
  }
}

// klasa za individualne cigle, update() ju crta ako nije pogođena(this.hit)
class Cigla {
  constructor(width, height, x, y, ctx, color) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.context = ctx;
    this.color = color;
    this.hit = false;
  }
  update() {
    if (this.hit) return;
    this.context.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    this.context.translate(this.x, this.y);
    this.context.fillStyle = this.color;
    this.context.fillRect(this.width / -2, this.height / -2, this.width, this.height);
    this.context.restore();
  }
}

/* klasa koja pohranjuje sve cigle i operacije nad njima,
  fillCigle() radi početnu ispunu, updateCigle poziva update() nad kolekcijom */
class CiglaArea {
  constructor(ctx) {
    this.context = ctx;
    this.cigle = [];
    this.fillCigle();
  }
  fillCigle() {
    let color;
    let xCoord = 90;
    let yCoord = 150;
    for (let i=0; i<BROJ_CIGLI; i++) {
      if(i<10) {
        color = `rgb(153, 51, 0)`;
      } else if(i<20) {
        color = `rgb(255, 0, 0)`;
      } else if(i<30) {
        color = `rgb(255, 153, 204)`;
      } else if(i<40) {
        color = `rgb(0, 255, 0)`;
      } else {
        color = `rgb(255, 255, 153)`;
      }
      let novaCigla = new Cigla(60, 20, xCoord, yCoord, this.context, color);
      this.cigle[i] = novaCigla;
      if((i+1)%10===0) {
        xCoord = 90;
        yCoord = yCoord + 20 + 20;
      } else {
        xCoord = xCoord + 60 + 30;
      }
    }
  }
  updateCigle() {
    this.cigle.forEach(cigla => {
      cigla.update();
    });
  }
}

/* klasa za upravljanje generalnim područjem igre, prima context glavnog canvasa
  start() zapocinje igru, stop() ju zaustavlja prilikom gubitka,
  won() prilikom pobjede, clear() pomoćna funkcija za brisanje canvasa */
class MyGameArea {
  constructor(ctx) {
    this.context = ctx;
  }
  start() {
    this.frameNo = 0;
    this.interval = setInterval(updateGameArea, 20);
  }
  stop() {
    clearInterval(this.interval);
    gameStarted = false;
    gameScore = 0;
    this.clear();
    writeGameOver();
  }
  won() {
    clearInterval(this.interval);
    gameStarted = false;
    gameScore = 0;
    this.clear();
    writeGameWon();
  }
  clear() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
  }
}

// ova se funkcija izvodi u intervalima (start() u MyGameArea), poziva ispis ostalih objekata
function updateGameArea() {
  myGameArea.clear();
  myGamePiece.newPos();
  myGamePiece.update();
  myGameHitterPiece.newPos();
  myGameHitterPiece.update();
  ciglaArea.updateCigle();
  writeGameScore();
  writeHighScore();
  if(gameScore===BROJ_CIGLI) {
    myGameArea.won();
  }
}

// pomoćne funkcije za ispis teksta
function writeTitle() {
  ctx.font = "bold 36px Helvetica";
  ctx.fillStyle  = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("BREAKOUT", 500, 400);
  const metrics = ctx.measureText("BREAKOUT");
  const textHeight = (metrics.actualBoundingBoxAscent && metrics.actualBoundingBoxDescent) 
    ? metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent : 36;
  const secondTextY = 400 + textHeight + 10;
  ctx.font = "italic bold 18px Helvetica";
  ctx.fillStyle  = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Press SPACE to begin", 500, secondTextY);
}
function writeGameOver() {
  ctx.font = "bold 40px Helvetica";
  ctx.fillStyle  = "yellow";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("GAME OVER", 500, 400);
}
function writeGameWon() {
  ctx.font = "bold 40px Helvetica";
  ctx.fillStyle  = "yellow";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("GAME WON", 500, 400);
}
function writeGameScore() {
  ctx.font = "20px Helvetica";
  ctx.fillStyle  = "white";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`Trenutni broj bodova: ${gameScore}`, 20, 20);
}
function writeHighScore() {
  ctx.font = "20px Helvetica";
  ctx.fillStyle  = "white";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(`Maksimalan broj bodova: ${highScore}`, 900, 20);
} 

// ostatak inicijalizacije
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
let gameStarted = false;
let gameScore = 0;
var myGamePiece;
var myGameHitterPiece;
var myGameArea;
var ciglaArea;
loadBestScore();
writeTitle();

/* event listeneri za tipke: Space za početak igre,
  Escape za izlaz iz igre, <- i -> za pomicanje palicom */
document.addEventListener("keydown", function(event) {
  if (event.code === "Space" && !gameStarted) {
    gameStarted = true;
    ctx.clearRect(0, 0, c.width, c.height);
    myGameArea = new MyGameArea(ctx);
    myGameHitterPiece = new Palica(150, 30, 500, 650, ctx);
    myGamePiece = new Loptica(30, 30, 500, 600, ctx, myGameHitterPiece, myGameArea);
    ciglaArea = new CiglaArea(ctx);
    myGameArea.start();
  }
});
document.addEventListener("keydown", function(event) {
  if (event.code === "Escape" && gameStarted) {
    myGameArea.stop();
  }
});
document.addEventListener("keydown", function(event) {
  if(event.code === "ArrowLeft") {
    myGameHitterPiece.moveDirection = -1;
  } else if(event.code === "ArrowRight") {
    myGameHitterPiece.moveDirection = 1;
  }
});
document.addEventListener("keyup", function(event) {
  if(event.code === "ArrowLeft" || event.code === "ArrowRight") {
    myGameHitterPiece.moveDirection = 0;
  }
});