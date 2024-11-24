 let board;
let boardWidth = 360; // pixels wide and tall
let boardHeight = 640;
let context;

// bird
let birdWidth = 34; // width/height ratio = 408/228 = 17/12
let birdHeight = 23;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

// pipes start
// pipe variables
let pipeArray = []
let pipeWidth = 64;  // width/height ratio = 348/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// physics
let velocityX = -2; // pipes moving left speed
let velocityY = 0; // bird jumping speed
let gravity = 0.4;

let gameOver = false;
let score = 0;


window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); // used for drawing on the board

    // load images
    birdImg = new Image();
    birdImg.src = "flappybird.png";
    birdImg.onload = function () { // makes the bird image into a function and draws it inside
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height)
    }

    topPipeImg = new Image();
    topPipeImg.src = "toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); // 15000 is equal to every 1.5 seconds

    // Event listeners
    document.addEventListener("keydown", moveBird); // For key events (desktop)
    board.addEventListener("touchstart", moveBird); // For touch events (mobile)
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height); // clear the previous canvas

    // bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); // apply gravity to the current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    // pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; // each pipe bottom and top equals out to 0.5, and that will equal out to 1 
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); // removes first element from the array FIFO
    }

    // score board
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    // (0-1) * pipeHeight / 2
    // 0 -> -128 (pipeHeight)
    // 1 -> -128 -256 (pipeHeight / 4 - pipeHeight / 2) = -3/4 pipeHeight

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }

    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe)
}

function moveBird(e) {
    // For keyboard inputs or touch events
    if (e.type === "keydown" && (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX")) {
        velocityY = -6; // jump

        // reset game after game over
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
    else if (e.type === "touchstart") {
        velocityY = -6; // jump for mobile tap
        // reset game after game over
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}
