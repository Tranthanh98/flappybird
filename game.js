const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
var playSound = new Audio("./assets/touch.wav");

const themes = {
  jack: {
    bird: "assets/jack/bird.png",
    birdDie: "assets/jack/bird-die.png",
    pipe: "assets/jack/pipe.png",
    background: "assets/jack/background.png",
    sound: "assets/jack/sound.mp3",
    trans: {
      gameOver: "Anh có phải đàn ông không",
      score: "Anh chỉ có {0} con thôi",
      highestScore: "Anh từng có {0} con cơ",
      liveScore: "Bỏ {0} CON",
      explain: "Anh chỉ có bằng này con thôi",
    },
  },
  viruss: {
    bird: "assets/viruss/bird.png",
    birdDie: "assets/viruss/bird-die.png",
    pipe: "assets/viruss/pipe.png",
    background: "assets/viruss/background.png",
    decor: "assets/viruss/decor.png",
    sound: "assets/viruss/sound.mp3",
    trans: {
      gameOver: "Em phải tin anh chứ",
      score: "Anh chỉ yêu có {0} em thôi",
      highestScore: "Anh từng hẹn hò {0} em cơ",
      liveScore: "Quen {0} EM",
      explain: "Anh chỉ quen bằng này em thôi",
    },
  },
};

let birdImg = new Image();
let birdDieImg = new Image();
let pipeImg = new Image();
let bgImg = new Image();
let decorImg = new Image();
let endingSound = new Audio("assets/jack/sound.mp3");
let currentTheme = "jack";
let bird, pipes, frame, score, gameOver;
let pipeRadius = 5;
let collisionBuffer = 8; // độ dễ , càng cao thì càng dễ chơi
let radioSize = 1;

document.getElementById("startGame").addEventListener("click", function () {
  currentTheme = document.getElementById("themeSelector").value;
  loadAssets(currentTheme, startGame);
});

function loadAssets(theme, callback) {
  birdImg.src = themes[theme].bird;
  birdDieImg.src = themes[theme].birdDie;
  decorImg.src = themes[theme].decor;
  pipeImg.src = themes[theme].pipe;
  bgImg.src = themes[theme].background;

  endingSound = new Audio(themes[currentTheme].sound);

  let imagesLoaded = 0;
  function checkLoaded() {
    imagesLoaded++;
    if (imagesLoaded === 3) callback(); // Chạy game sau khi load đủ ảnh
  }

  birdImg.onload = checkLoaded;
  pipeImg.onload = checkLoaded;
  bgImg.onload = checkLoaded;
  birdDieImg.onload = checkLoaded;
  decorImg.onload = checkLoaded;

  birdImg.onerror = () => {
    birdImg.src = "";
    checkLoaded();
  }; // Dùng mặc định nếu lỗi
  birdDieImg.onerror = () => {
    birdDieImg.src = "";
    checkLoaded();
  };
  pipeImg.onerror = () => {
    pipeImg.src = "";
    checkLoaded();
  };
  bgImg.onerror = () => {
    bgImg.src = "";
    checkLoaded();
  };
  decorImg.onerror = () => {
    decorImg.src = "";
    checkLoaded();
  };
}

let animationFrameId; // Biến toàn cục để lưu countdown interval

function startCountdown() {
  let countdown = 3;

  function drawCountdown() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.font = "40px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);

    if (countdown > 0) {
      countdown--;
      setTimeout(drawCountdown, 1000); // Đếm ngược mỗi giây
    } else {
      updateGame(); // Bắt đầu game sau khi đếm ngược
    }
  }

  drawCountdown();
}

function startGame() {
  document.getElementById("label-theme").style.display = "none";
  document.getElementById("themeSelector").style.display = "none";
  document.getElementById("startGame").style.display = "none";
  canvas.style.display = "block";
  resetGame();
  drawBackground();
  startCountdown();
}

function resetGame() {
  drawBackground();

  bird = {
    x: 50,
    y: 350,
    width: 60 * radioSize,
    height: 50 * radioSize,
    velocity: 0,
    gravity: 0.5,
  };
  pipes = [];
  frame = 0;
  score = 0;
  gameOver = false;
}

function drawBird() {
  if (gameOver) {
    ctx.drawImage(
      birdDieImg,
      bird.x,
      bird.y - 10,
      (bird.width + 25) * radioSize,
      (bird.height + 22) * radioSize
    );
  } else {
    ctx.drawImage(
      birdImg,
      bird.x,
      bird.y,
      bird.width * radioSize,
      bird.height * radioSize
    );
  }
}

function drawPipes() {
  pipes.forEach((pipe) => {
    // Vẽ thân ống khói với gradient
    let gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
    gradient.addColorStop(0, "#0a0"); // Màu xanh đậm
    gradient.addColorStop(0.6, "#0f0"); // Màu xanh đậm
    gradient.addColorStop(1, "#0a0"); // Màu xanh sáng hơn

    ctx.fillStyle = gradient;
    ctx.strokeStyle = "#060";

    ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, pipe.bottom);
    ctx.strokeRect(pipe.x, pipe.bottomY, pipe.width, pipe.bottom);

    let startY = pipe.bottomY + pipe.width + 10;
    for (let i = 0; i < 2; i++) {
      ctx.drawImage(pipeImg, pipe.x + 5, startY, pipe.width - 10, pipe.width);
      startY += pipe.width + 10;
    }
    if (decorImg.src) {
      ctx.drawImage(decorImg, pipe.x - 8, startY, pipe.width + 16, pipe.bottom);
    }

    ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
    ctx.strokeRect(pipe.x, 0, pipe.width, pipe.top);
    ctx.drawImage(
      pipeImg,
      pipe.x + 5,
      pipe.top - pipe.width - 20,
      pipe.width - 10,
      pipe.width
    );

    // Vẽ phần đầu ống khói với bo tròn góc
    ctx.fillStyle = gradient;
    ctx.strokeStyle = "#060";
    let headHeight = 20;
    let headWidth = pipe.width + 10; // Rộng hơn thân
    let headX = pipe.x - 5;

    // Vẽ phần đầu dưới
    ctx.beginPath();
    ctx.moveTo(headX + 5, pipe.bottomY);
    ctx.arcTo(
      headX + headWidth,
      pipe.bottomY,
      headX + headWidth,
      pipe.bottomY + headHeight,
      pipeRadius
    );
    ctx.arcTo(
      headX + headWidth,
      pipe.bottomY + headHeight,
      headX,
      pipe.bottomY + headHeight,
      pipeRadius
    );
    ctx.arcTo(
      headX,
      pipe.bottomY + headHeight,
      headX,
      pipe.bottomY,
      pipeRadius
    );
    ctx.arcTo(headX, pipe.bottomY, headX + headWidth, pipe.bottomY, pipeRadius);
    ctx.fill();
    ctx.stroke();

    // Vẽ phần đầu trên
    ctx.beginPath();
    ctx.moveTo(headX + 5, pipe.top - headHeight);
    ctx.arcTo(
      headX + headWidth,
      pipe.top - headHeight,
      headX + headWidth,
      pipe.top,
      pipeRadius
    );
    ctx.arcTo(headX + headWidth, pipe.top, headX, pipe.top, pipeRadius);
    ctx.arcTo(headX, pipe.top, headX, pipe.top - headHeight, pipeRadius);
    ctx.arcTo(
      headX,
      pipe.top - headHeight,
      headX + headWidth,
      pipe.top - headHeight,
      pipeRadius
    );
    ctx.fill();
    ctx.stroke();
  });
}

function drawBackground() {
  if (bgImg.src) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "lightblue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function drawGameOverScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // Tạo hiệu ứng nền mờ
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";

  // Hiển thị "Game Over"
  ctx.fillText(
    themes[currentTheme].trans.gameOver,
    canvas.width / 2,
    canvas.height / 2 - 40
  );

  // Hiển thị điểm số
  ctx.font = "25px Arial";
  ctx.fillText(
    themes[currentTheme].trans.score.replace("{0}", score),
    canvas.width / 2,
    canvas.height / 2
  );
  // Hiển thị điểm cao nhất nếu có
  let highScore = localStorage.getItem("highScore") || 0;
  if (score > highScore) {
    localStorage.setItem("highScore", score);
    ctx.fillStyle = "yellow";
    ctx.fillText(
      themes[currentTheme].trans.explain,
      canvas.width / 2,
      canvas.height / 2 + 40
    );
  } else {
    ctx.fillText(
      themes[currentTheme].trans.highestScore.replace("{0}", highScore),
      canvas.width / 2,
      canvas.height / 2 + 40
    );
  }

  const replayButton = document.getElementById("replay");
  replayButton.style.display = "block";
  replayButton.onclick = function () {
    endingSound.pause();
    endingSound.currentTime = 0;
    resetGame();
    startCountdown();
    replayButton.style.display = "none";
  };
}

function drawText(text, x, y) {
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(text, x, y);
}

function stopWhenGameOver() {
  setTimeout(drawGameOverScreen, 2000);
}

function updateGame() {
  if (gameOver) {
    cancelAnimationFrame(animationFrameId);
    endingSound.play();
    stopWhenGameOver();
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bird.velocity += bird.gravity * radioSize;
  bird.y += bird.velocity;
  if (bird.y + bird.height > canvas.height || bird.y < 0) gameOver = true;

  if (frame % Math.floor(100 * radioSize) === 0) {
    let pipeHeight = Math.random() * (canvas.height / 2) * radioSize;
    pipes.push({
      x: canvas.width,
      width: 50 * radioSize,
      top: pipeHeight,
      bottom: (canvas.height - pipeHeight - 150) * radioSize,
      bottomY: (pipeHeight + 150) * radioSize,
    });
  }

  pipes.forEach((pipe) => {
    pipe.x -= 2;
    if (pipe.x + pipe.width < 0) {
      pipes.shift();
      score++;
    }
    if (
      bird.x + bird.width - collisionBuffer > pipe.x &&
      bird.x + collisionBuffer < pipe.x + pipe.width &&
      (bird.y + bird.height - collisionBuffer > pipe.bottomY ||
        bird.y + collisionBuffer < pipe.top)
    ) {
      gameOver = true;
    }
  });

  drawBird();
  drawPipes();
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(
    themes[currentTheme].trans.liveScore.replace("{0}", score),
    50,
    20
  );
  frame++;

  animationFrameId = requestAnimationFrame(updateGame);
}

function handleInput() {
  if (!gameOver) {
    playSound.src && playSound.play();
    bird.velocity = -7 * radioSize;
  }
}

function resizeCanvas() {
  let aspectRatio = 9 / 16; // Tỷ lệ màn hình dọc
  let width = window.innerWidth;
  let height = window.innerHeight;

  if (width / height > aspectRatio) {
    width = height * aspectRatio;
  } else {
    height = width / aspectRatio;
  }

  canvas.width = width - 10;
  canvas.height = height - 10;
  radioSize = Math.max(1, canvas.width / 390);
}

resizeCanvas();

document.addEventListener("keydown", function (event) {
  if (event.code === "Space") {
    handleInput();
  }
});
canvas.addEventListener("click", handleInput);

canvas.addEventListener("touchstart", function (event) {
  event.preventDefault();
  handleInput();
});
