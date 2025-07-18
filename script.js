function goTo(page) {
    alert("Go to " + page + " (this would change screen in real version)");
}

// Background animation canvas
const canvas = document.getElementById("background-animation");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let dots = [];
for (let i = 0; i < 100; i++) {
    dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3 + 1,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
    });
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff55";
        ctx.fill();
        dot.x += dot.dx;
        dot.y += dot.dy;
        if (dot.x < 0 || dot.x > canvas.width) dot.dx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.dy *= -1;
    }
    requestAnimationFrame(animate);
}
animate();