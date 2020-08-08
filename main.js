// setup canvas

const canvas = document.querySelector('canvas');
const score = document.querySelector('p');
const ctx = canvas.getContext('2d');
const controlMap = {};
const mouseLocation = {};
const touchLocation = {};
let keyboardControl = true;
let mouseControl = false;
let touchControl = false;


let ballsCount = 0;

const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

// function to generate random number

function random(min, max) {
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}

function Shape(x, y, velX, velY) {
  this.x = x;
  this.y = y;
  this.velX = velX;
  this.velY = velY;
  this.exists = true;
}

function Ball(x, y, velX, velY, color, size, exists) {
  Shape.call(this, x, y, velX, velY);
  this.color = color;
  this.size = size;
  if (exists === undefined) {
    this.exists = true;
  } else {
    this.exists = exists;
  }
}

Ball.prototype = Object.create(Shape.prototype);

Object.defineProperty(Ball.prototype, 'constructor', { 
  value: Ball, 
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true 
});

Ball.prototype.draw = function() {
  ctx.beginPath();
  ctx.fillStyle = this.color;
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.fill();
};

Ball.prototype.update = function() {
  if ((this.x + this.size) >= width) {
    this.velX = -(this.velX);
  }

  if ((this.x - this.size) <= 0) {
    this.velX = -(this.velX);
  }

  if ((this.y + this.size) >= height) {
    this.velY = -(this.velY);
  }

  if ((this.y - this.size) <= 0) {
    this.velY = -(this.velY);
  }

  this.x += this.velX;
  this.y += this.velY;
};

Ball.prototype.collisionDetect = function() {
  for (let j = 0; j < balls.length; j++) {
    if (this === balls[j]) continue;
    if (!balls[j].exists) continue;
    const dx = this.x - balls[j].x;
    const dy = this.y - balls[j].y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.size + balls[j].size) {
      balls[j].color = this.color = 'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) +')';
    }
  }
};

function EvilCircle(x, y, velX, velY, exists) {
  Shape.call(this, x, y, velX, velY, exists);
  this.color = 'white';
  this.size = 10;
  this.vel = Math.sqrt(velX*velX + velY*velY);
  this.velX = this.velY = this.vel / Math.sqrt(2);
}

EvilCircle.prototype = Object.create(Shape.prototype);

Object.defineProperty(EvilCircle.prototype, 'constructor', { 
  value: EvilCircle, 
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true 
});

EvilCircle.prototype.draw = function() {
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = this.color;
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.stroke();
};

EvilCircle.prototype.update = function() {
  if ((this.x + this.size) >= width) {
    this.x -= this.size;
  }

  if ((this.x - this.size) <= 0) {
    this.x += this.size;
  }

  if ((this.y + this.size) >= height) {
    this.y -= this.size;
  }

  if ((this.y - this.size) <= 0) {
    this.y += this.size;
  }
  if (keyboardControl) {
    let vel;
    if (Object.keys(controlMap).length == 1) {
      vel = this.vel;
    } else {
      vel = this.velX;
    }
    for (const key in controlMap) {
      if (key === 'a') {
        this.x -= vel;
      } else if (key === 'd') {
        this.x += vel;
      } else if (key === 'w') {
        this.y -= vel;
      } else if (key === 's') {
        this.y += vel;
      }  
    }  
  }
  if (mouseControl || touchControl) {
    if (mouseControl) {
      loc = mouseLocation;
    } else {
      loc = touchLocation;
    }
    let dx = this.x - loc.x;
    let dy = this.y - loc.y;
    const denom = dx*dx + dy*dy
    vx = this.vel * Math.abs(dx) * Math.sqrt(1 / denom);
    vy = this.vel * Math.abs(dy) * Math.sqrt(1 / denom);
    if (dx < 0) {
      this.x += vx;
    } else if (dx > 0) {
      this.x -= vx;
    }
    if (dy < 0) {
      this.y += vy;
    } else if (dy > 0) {
      this.y -= vy;
    }
  }
};

window.onkeydown = window.onkeyup = function(e) {
  e = e || event;
  if (!keyboardControl) {
    keyboardControl = true;
    mouseControl = false;
    touchControl = false;
  }
  if (e.type == 'keydown') {
    controlMap[e.key] = true;
  } else if (e.key in controlMap) {
    delete controlMap[e.key];
  }
};

window.onmousemove = function(e) {
  e = e || event;
  if (!mouseControl) {
    mouseControl = true;
    keyboardControl = false;
    touchControl = false;
  }
  mouseLocation.x = e.clientX;
  mouseLocation.y = e.clientY;
}

function handleTouch(e) {
  e.preventDefault();
  if (!touchControl) {
    touchControl = true;
    mouseControl = false;
    keyboardControl = false;
  }

  var touches = e.changedTouches;

  touchLocation.x = touches[0].pageX;
  touchLocation.y = touches[0].pageY;
}

function handleTouchEnd(e) {
  e = e || event;
  e.preventDefault();
  touchControl = false;
  mouseControl = false;
  keyboardControl = true;
}

canvas.addEventListener('touchstart', handleTouch, false);
canvas.addEventListener('touchmove', handleTouch, false);
canvas.addEventListener('touchend', handleTouchEnd, false);
canvas.addEventListener('touchcancel', handleTouchEnd, false);

EvilCircle.prototype.collisionDetect = function() {
  for (let j = 0; j < balls.length; j++) {
    if (!balls[j].exists) continue;
    const dx = this.x - balls[j].x;
    const dy = this.y - balls[j].y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.size + balls[j].size) {
      ballsCount--;
      balls[j].exists = false;
    }
  }
};

let balls = [];

while (balls.length < 25) {
  let size = random(10,20);
  let ball = new Ball(
    // ball position always drawn at least one ball width
    // away from the edge of the canvas, to avoid drawing errors
    random(0 + size,width - size),
    random(0 + size,height - size),
    random(-7,7),
    random(-7,7),
    'rgb(' + random(0,255) + ',' + random(0,255) + ',' + random(0,255) +')',
    size
  );

  balls.push(ball);
}
ballsCount = balls.length;

let evilCirlce = new EvilCircle(20, 0, 3, 3, true);

function loop(ts) {
  requestAnimationFrame(loop);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(0, 0, width, height);

  evilCirlce.draw();
  evilCirlce.update();
  evilCirlce.collisionDetect();

  for (let i = 0; i < balls.length; i++) {
    if (!balls[i].exists) continue;
    balls[i].draw();
    balls[i].update();
    balls[i].collisionDetect();
  }

  score.innerText = `Ball count: ${ballsCount}`;
}

loop();
