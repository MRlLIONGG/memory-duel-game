const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 600;

let score = 0;
let missed = 0;
const maxMissed = 5;

// Player
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 50,
    size: 50,
    speed: 6
};

// Stars
const stars = [];

function createStar() {
    stars.push({
        x: Math.random() * (canvas.width - 20),
        y: -20,
        size: 20,
        speed: 2 + Math.random() * 3
    });
}

function drawPlayer() {
    ctx.shadowColor = "#00ffea";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#00ffea";
    ctx.beginPath();
    ctx.arc(player.x + player.size/2, player.y + player.size/2, player.size/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawStar(star) {
    ctx.shadowColor = "#ffdd57";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#ffdd57";
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move stars
    for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        star.y += star.speed;

        // Catch star
        if (
            star.y + star.size > player.y &&
            star.x > player.x &&
            star.x < player.x + player.size
        ) {
            stars.splice(i, 1);
            score++;
            document.getElementById("score").innerText = `Score: ${score}`;
            continue;
        }

        // Missed star
        if (star.y > canvas.height) {
            stars.splice(i, 1);
            missed++;
            if (missed >= maxMissed) {
                alert(`Game Over! Your score: ${score}`);
                document.location.reload();
            }
        }
    }

    // Draw
    drawPlayer();
    stars.forEach(drawStar);

    requestAnimationFrame(update);
}

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && player.x > 0) player.x -= player.speed;
    if (e.key === "ArrowRight" && player.x + player.size < canvas.width) player.x += player.speed;
});

// Star creation loop
setInterval(createStar, 500);

update();
