const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Anpassa canvas till skärmstorlek
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Ladda bilder
const playerImg = new Image();
playerImg.src = "player.png";

const enemyImages = [];
for (let i = 1; i <= 8; i++) {
    const img = new Image();
    img.src = `enemy${i}.png`;
    enemyImages.push(img);
}

// Ljud
const laserSound = new Audio("laser.mp3");
const explosionSound = new Audio("explosion.mp3");
const gameOverSound = new Audio("gameover.mp3");

let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 80, // större för mobilen
    angle: 0
};

let bullets = [];
let enemies = [];
let score = 0;
let hitsTaken = 0;
let gameOver = false;

// Skjuta
window.addEventListener("touchstart", shoot);
window.addEventListener("mousedown", shoot);
function shoot() {
    if (gameOver) return;
    bullets.push({
        x: player.x,
        y: player.y,
        angle: player.angle,
        speed: 10
    });
    laserSound.currentTime = 0;
    laserSound.play();
}

// Rotera spelaren
window.addEventListener("touchmove", rotatePlayer);
window.addEventListener("mousemove", rotatePlayer);
function rotatePlayer(e) {
    let rect = canvas.getBoundingClientRect();
    let mx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    let my = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    player.angle = Math.atan2(my - player.y, mx - player.x);
}

// Skapa fiender
function spawnEnemy() {
    if (gameOver) return;
    const side = Math.floor(Math.random() * 4);
    let x, y;

    if (side === 0) { x = Math.random() * canvas.width; y = -50; }
    if (side === 1) { x = canvas.width + 50; y = Math.random() * canvas.height; }
    if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 50; }
    if (side === 3) { x = -50; y = Math.random() * canvas.height; }

    enemies.push({
        x,
        y,
        speed: 1.8 + score * 0.05,
        img: enemyImages[Math.floor(Math.random() * enemyImages.length)],
        size: 110
    });
}
setInterval(spawnEnemy, 700);

// Rita
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);
        return;
    }

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.drawImage(playerImg, -player.size / 2, -player.size / 2, player.size, player.size);
    ctx.restore();

    bullets.forEach((b) => {
        b.x += Math.cos(b.angle) * b.speed;
        b.y += Math.sin(b.angle) * b.speed;
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    enemies.forEach((e) => {
        let dx = player.x - e.x;
        let dy = player.y - e.y;
        let dist = Math.hypot(dx, dy);

        e.x += (dx / dist) * e.speed;
        e.y += (dy / dist) * e.speed;

        ctx.drawImage(e.img, e.x - e.size / 2, e.y - e.size / 2, e.size, e.size);
    });

    // Kollissioner
    bullets.forEach((b, bi) => {
        enemies.forEach((e, ei) => {
            if (Math.hypot(b.x - e.x, b.y - e.y) < e.size / 2) {
                score++;
                explosionSound.currentTime = 0;
                explosionSound.play();
                enemies.splice(ei, 1);
                bullets.splice(bi, 1);
            }
        });
    });

    enemies.forEach((e, ei) => {
        if (Math.hypot(player.x - e.x, player.y - e.y) < 40) {
            enemies.splice(ei, 1);
            hitsTaken++;
            if (hitsTaken >= 5) {
                gameOver = true;
                gameOverSound.play();
            }
        }
    });

    requestAnimationFrame(draw);
}

draw();
