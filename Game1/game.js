document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const startGameButton = document.getElementById("startGameButton");
    const pauseButton = document.getElementById("pauseButton");
    const resumeButton = document.getElementById("resumeButton");
    const restartButton = document.getElementById("restartButton");
    const quitButton = document.getElementById("quitButton");
    const gameMusic = document.getElementById("gameMusic");
    const testAudioButton = document.getElementById("testAudioButton");
    const volumeSlider = document.getElementById("volumeSlider");

    canvas.width = window.innerWidth < 500 ? window.innerWidth - 20 : 500;
    canvas.height = window.innerHeight < 600 ? window.innerHeight - 20 : 600;

    let gunX = canvas.width / 2 - 25;
    let bullets = [];
    let fallingObjects = [];
    let score = 0;
    let level = 1;
    let objectSpeed = 2;
    const bulletSpeed = 5;
    let gameOver = false;
    let gamePaused = false;
    let animationFrameId;
    let gameQuitted = false;

    resumeButton.style.display = 'none';
    pauseButton.style.display = 'none';
    restartButton.style.display = 'none';
    quitButton.style.display = 'none';

    canvas.addEventListener("mousemove", (event) => {
        if (gameOver || gamePaused || gameQuitted) return;
        const rect = canvas.getBoundingClientRect();
        gunX = event.clientX - rect.left - 25;
        if (gunX < 0) gunX = 0;
        if (gunX > canvas.width - 50) gunX = canvas.width - 50;
    });

    canvas.addEventListener("touchmove", (event) => {
        if (gameOver || gamePaused || gameQuitted) return;
        const touch = event.touches[0];
        const rect = canvas.getBoundingClientRect();
        gunX = touch.clientX - rect.left - 25;
        if (gunX < 0) gunX = 0;
        if (gunX > canvas.width - 50) gunX = canvas.width - 50;
        event.preventDefault();
    });

    canvas.addEventListener("touchstart", () => {
        if (!gameOver && !gamePaused && !gameQuitted) {
            bullets.push({ x: gunX + 20, y: canvas.height - 60, width: 5, height: 10 });
        }
    });

    function spawnFallingObject() {
        if (gameOver || gamePaused || gameQuitted) return;
        let x = Math.random() * (canvas.width - 30);
        fallingObjects.push({ x, y: 0, width: 30, height: 30 });
    }

    let bulletInterval = setInterval(() => {
        if (!gameOver && !gamePaused && !gameQuitted) {
            bullets.push({ x: gunX + 20, y: canvas.height - 60, width: 5, height: 10 });
        }
    }, 500);

    function endGame() {
        gameOver = true;
        clearInterval(bulletInterval);
        cancelAnimationFrame(animationFrameId);
        gameMusic.pause();
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over!", canvas.width / 2 - 80, canvas.height / 2 - 20);
        ctx.font = "20px Arial";
        ctx.fillText("Restarting in 5s...", canvas.width / 2 - 90, canvas.height / 2 + 20);
        setTimeout(restartGame, 5000);
    }

    function restartGame() {
        gameOver = false;
        score = 0;
        level = 1;
        objectSpeed = 2;
        bullets = [];
        fallingObjects = [];
        gamePaused = false;
        gameMusic.currentTime = 0;
        gameMusic.play();
        clearInterval(bulletInterval);
        bulletInterval = setInterval(() => {
            if (!gameOver && !gamePaused && !gameQuitted) {
                bullets.push({ x: gunX + 20, y: canvas.height - 60, width: 5, height: 10 });
            }
        }, 500);
        update();
    }

    function update() {
        if (gameOver || gamePaused || gameQuitted) {
            animationFrameId = requestAnimationFrame(update);
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "red";
        ctx.fillRect(gunX, canvas.height - 50, 50, 20);
        ctx.fillStyle = "yellow";
        bullets.forEach((bullet, index) => {
            bullet.y -= bulletSpeed;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            if (bullet.y < 0) bullets.splice(index, 1);
        });
        ctx.fillStyle = "white";
        fallingObjects.forEach((object, objIndex) => {
            object.y += objectSpeed;
            ctx.fillRect(object.x, object.y, object.width, object.height);
            if (object.y + object.height >= canvas.height) {
                endGame();
            }
            bullets.forEach((bullet, bulletIndex) => {
                if (bullet.x < object.x + object.width && bullet.x + bullet.width > object.x && bullet.y < object.y + object.height && bullet.y + bullet.height > object.y) {
                    bullets.splice(bulletIndex, 1);
                    fallingObjects.splice(objIndex, 1);
                    score += 5;
                    if (score % 20 === 0) {
                        level++;
                        objectSpeed += 0.5;
                    }
                }
            });
        });
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("Score: " + score, 10, 30);
        ctx.fillText("Level: " + level, 10, 60);
        animationFrameId = requestAnimationFrame(update);
    }

    setInterval(spawnFallingObject, 2000);

    startGameButton.addEventListener("click", () => {
        gameMusic.play();
        startGameButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
        restartButton.style.display = 'inline-block';
        quitButton.style.display = 'inline-block';
        update();
    });

    pauseButton.addEventListener("click", () => {
        if (!gameOver && !gameQuitted) {
            gamePaused = true;
            gameMusic.pause();
            pauseButton.style.display = 'none';
            resumeButton.style.display = 'inline-block';
        }
    });

    resumeButton.addEventListener("click", () => {
        gamePaused = false;
        gameMusic.play();
        pauseButton.style.display = 'inline-block';
        resumeButton.style.display = 'none';
        update();
    });

    restartButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to restart?")) {
            score = 0;
            level = 1;
            restartGame();
        }
    });

    quitButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to quit?")) {
            gameQuitted = true;
            clearInterval(bulletInterval);
            cancelAnimationFrame(animationFrameId);
            gameMusic.pause();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "red";
            ctx.font = "30px Arial";
            ctx.fillText("Game Quitted", canvas.width / 2 - 80, canvas.height / 2 - 20);
        }
    });

    testAudioButton.addEventListener("click", () => {
        gameMusic.play();
    });

    volumeSlider.addEventListener("input", () => {
        gameMusic.volume = volumeSlider.value / 100;
    });
});