const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const themes = {
    theme1: {
        bird: "assets/jack/bird.png",
        pipe: "assets/jack/pipe.png",
        background: "assets/jack/background.png"
    },
    theme2: {
        bird: "assets/viruss/bird.png",
        pipe: "assets/viruss/pipe.png",
        background: "assets/viruss/background.png"
    }
};

let birdImg = new Image();
let pipeImg = new Image();
let bgImg = new Image();
let currentTheme = "theme1";
let bird, pipes, frame, score, gameOver;
let pipeRadius = 5;

document.getElementById("startGame").addEventListener("click", function() {
    currentTheme = document.getElementById("themeSelector").value;
    loadAssets(currentTheme, startGame);
});

function loadAssets(theme, callback) {
    birdImg.src = themes[theme].bird;
    pipeImg.src = themes[theme].pipe;
    bgImg.src = themes[theme].background;

    let imagesLoaded = 0;
    function checkLoaded() {
        imagesLoaded++;
        if (imagesLoaded === 3) callback(); // Chạy game sau khi load đủ ảnh
    }

    birdImg.onload = checkLoaded;
    pipeImg.onload = checkLoaded;
    bgImg.onload = checkLoaded;

    birdImg.onerror = () => { birdImg.src = ""; checkLoaded(); }; // Dùng mặc định nếu lỗi
    pipeImg.onerror = () => { pipeImg.src = ""; checkLoaded(); };
    bgImg.onerror = () => { bgImg.src = ""; checkLoaded(); };
}

let animationFrameId; // Biến toàn cục để lưu countdown interval

function startCountdown() {
    let countdown = 3;

    function drawCountdown() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);

        if (countdown > 0) {
            countdown--;
            setTimeout(drawCountdown, 1000); // Đếm ngược mỗi giây
        } else {
            updateGame() // Bắt đầu game sau khi đếm ngược
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
    
    bird = { x: 50, y: 350, width: 70, height: 50, velocity: 0, gravity: 0.5 };
    pipes = [];
    frame = 0;
    score = 0;
    gameOver = false;
}

function drawBird() {
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Vẽ thân ống khói với gradient
        let gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
        gradient.addColorStop(0, "#0a0"); // Màu xanh đậm
        gradient.addColorStop(0.6, "#0f0"); // Màu xanh đậm
        gradient.addColorStop(1, "#0a0"); // Màu xanh sáng hơn
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = "#060";

        ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, pipe.bottom);
        ctx.strokeRect(pipe.x, pipe.bottomY, pipe.width, pipe.bottom);

        // ctx.fillStyle = gradient;
        // ctx.strokeStyle = "#060";
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
        ctx.strokeRect(pipe.x, 0, pipe.width, pipe.top);
        
        // Vẽ phần đầu ống khói với bo tròn góc
        ctx.fillStyle = gradient;
        ctx.strokeStyle = "#060";
        let headHeight = 20;
        let headWidth = pipe.width + 10; // Rộng hơn thân
        let headX = pipe.x - 5;
        
        // Vẽ phần đầu dưới
        ctx.beginPath();
        ctx.moveTo(headX + 5, pipe.bottomY);
        ctx.arcTo(headX + headWidth, pipe.bottomY, headX + headWidth, pipe.bottomY + headHeight, pipeRadius);
        ctx.arcTo(headX + headWidth, pipe.bottomY + headHeight, headX, pipe.bottomY + headHeight, pipeRadius);
        ctx.arcTo(headX, pipe.bottomY + headHeight, headX, pipe.bottomY, pipeRadius);
        ctx.arcTo(headX, pipe.bottomY, headX + headWidth, pipe.bottomY, pipeRadius);
        ctx.fill();
        ctx.stroke();

        // Vẽ phần đầu trên
        ctx.beginPath();
        ctx.moveTo(headX + 5, pipe.top - headHeight);
        ctx.arcTo(headX + headWidth, pipe.top - headHeight, headX + headWidth, pipe.top, pipeRadius);
        ctx.arcTo(headX + headWidth, pipe.top, headX, pipe.top, pipeRadius);
        ctx.arcTo(headX, pipe.top, headX, pipe.top - headHeight, pipeRadius);
        ctx.arcTo(headX, pipe.top - headHeight, headX + headWidth, pipe.top - headHeight, pipeRadius);
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
    ctx.fillText("Em phải tin anh chứ", canvas.width / 2, canvas.height / 2 - 40);

    // Hiển thị điểm số
    ctx.font = "25px Arial";
    ctx.fillText("Anh chỉ yêu có " + score + " em thôi", canvas.width / 2, canvas.height / 2);

    // Hiển thị điểm cao nhất nếu có
    let highScore = localStorage.getItem("highScore") || 0;
    if (score > highScore) {
        localStorage.setItem("highScore", score);
        ctx.fillStyle = "yellow";
        ctx.fillText("Anh chỉ yêu bằng này em thôi!", canvas.width / 2, canvas.height / 2 + 40);
    } else {
        ctx.fillText("Anh từng hẹn hò " + highScore + " em cơ", canvas.width / 2, canvas.height / 2 + 40);
    }

    const replayButton = document.getElementById("replay");
    replayButton.style.display = "block";
    replayButton.style.top = (canvas.height / 2 + 80) + "px";
    replayButton.style.left = (canvas.width / 2 + 12) + "px";
    replayButton.onclick = function() {
        resetGame();
        startCountdown();
        replayButton.style.display = "none";
    }
}

function drawText(text, x, y) {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(text, x, y);
}


function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        cancelAnimationFrame(animationFrameId);
        drawGameOverScreen(); // Hiển thị màn hình điểm số
        return;
    }

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    if (bird.y + bird.height > canvas.height || bird.y < 0) gameOver = true;

    if (frame % 100 === 0) {
        let pipeHeight = Math.random() * (canvas.height / 2);
        pipes.push({ 
            x: canvas.width, 
            width: 50, 
            top: pipeHeight, 
            bottom: canvas.height - pipeHeight - 150, 
            bottomY: pipeHeight + 150 
        });
    }

    pipes.forEach(pipe => {
        pipe.x -= 2;
        if (pipe.x + pipe.width < 0) {
            pipes.shift();
            score++;
        }
        if (
            bird.x < pipe.x + pipe.width &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.height > pipe.bottomY)
        ) {
            gameOver = true;
        }
    });

    drawBird();
    drawPipes();
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(score + " ems", 50, 20);
    frame++;

    animationFrameId = requestAnimationFrame(updateGame);
}

function handleInput() {
    if (gameOver) {
        resetGame();
    } else {
        bird.velocity = -7;
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

    canvas.width = width -10;
    canvas.height = height - 10;
}

// Gọi khi load trang hoặc thay đổi kích thước màn hình
// window.addEventListener("resize", resizeCanvas);
resizeCanvas();


document.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
        handleInput();
    }
});
canvas.addEventListener("click", handleInput);

canvas.addEventListener("touchstart", function(event) {
    event.preventDefault();
    handleInput();
});
