// Donut Escape Game Engine
class DonutEscapeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.distance = 0;
        this.gameSpeed = 2;
        this.selectedCostume = 'default';
        
        // Game dimensions
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.laneWidth = this.canvas.width / 3;
        this.lanes = [
            this.laneWidth * 0.5,
            this.laneWidth * 1.5,
            this.laneWidth * 2.5
        ];
        
        // Initialize game objects
        this.player = new Player(this.lanes[1], this.canvas.height - 150);
        this.obstacles = [];
        this.collectibles = [];
        this.powerUps = [];
        this.particles = [];
        this.backgroundObjects = [];
        
        // Game timers
        this.obstacleTimer = 0;
        this.collectibleTimer = 0;
        this.powerUpTimer = 0;
        this.difficultyTimer = 0;
        
        // Initialize everything
        this.initializeEventListeners();
        this.initializeBackground();
        this.gameLoop();
    }
    
    initializeEventListeners() {
        // Menu buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('costumeBtn').addEventListener('click', () => this.showCostumeMenu());
        document.getElementById('backToMenuBtn').addEventListener('click', () => this.showMainMenu());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('mainMenuBtn').addEventListener('click', () => this.showMainMenu());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('backToMainBtn').addEventListener('click', () => this.showMainMenu());
        
        // Costume selection
        document.querySelectorAll('.costume-card').forEach(card => {
            card.addEventListener('click', () => this.selectCostume(card.dataset.costume));
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    handleKeyDown(e) {
        if (this.gameState !== 'playing') return;
        
        switch(e.code) {
            case 'ArrowLeft':
                this.player.moveLeft();
                break;
            case 'ArrowRight':
                this.player.moveRight();
                break;
            case 'Space':
                e.preventDefault();
                this.player.jump();
                break;
            case 'ArrowDown':
                this.player.roll();
                break;
            case 'Escape':
                this.pauseGame();
                break;
        }
    }
    
    handleKeyUp(e) {
        if (this.gameState !== 'playing') return;
        
        switch(e.code) {
            case 'ArrowDown':
                this.player.stopRolling();
                break;
        }
    }
    
    selectCostume(costume) {
        this.selectedCostume = costume;
        this.player.costume = costume;
        
        // Update UI
        document.querySelectorAll('.costume-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`[data-costume="${costume}"]`).classList.add('active');
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
    }
    
    showMainMenu() {
        this.gameState = 'menu';
        this.showScreen('mainMenu');
    }
    
    showCostumeMenu() {
        this.showScreen('costumeMenu');
    }
    
    startGame() {
        this.gameState = 'playing';
        this.showScreen('gameScreen');
        this.resetGame();
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showScreen('pauseMenu');
        }
    }
    
    resumeGame() {
        this.gameState = 'playing';
        this.showScreen('gameScreen');
    }
    
    restartGame() {
        this.resetGame();
        this.gameState = 'playing';
        this.showScreen('gameScreen');
    }
    
    resetGame() {
        this.score = 0;
        this.distance = 0;
        this.gameSpeed = 2;
        this.obstacles = [];
        this.collectibles = [];
        this.powerUps = [];
        this.particles = [];
        this.player.reset(this.lanes[1], this.canvas.height - 150);
        this.obstacleTimer = 0;
        this.collectibleTimer = 0;
        this.powerUpTimer = 0;
        this.difficultyTimer = 0;
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalDistance').textContent = Math.floor(this.distance);
        this.showScreen('gameOverScreen');
    }
    
    initializeBackground() {
        // Create parallax background objects
        for (let i = 0; i < 20; i++) {
            this.backgroundObjects.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                speed: Math.random() * 2 + 1,
                size: Math.random() * 30 + 10,
                type: Math.random() > 0.5 ? 'building' : 'cloud'
            });
        }
    }
    
    spawnObstacle() {
        const lane = Math.floor(Math.random() * 3);
        const obstacleTypes = ['manhole', 'trashbin', 'puddle', 'feet', 'cone', 'car'];
        const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        
        this.obstacles.push(new Obstacle(this.lanes[lane], -50, type));
    }
    
    spawnCollectible() {
        const lane = Math.floor(Math.random() * 3);
        const collectibleTypes = ['coin', 'strawberry', 'chocolate'];
        const type = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];
        
        this.collectibles.push(new Collectible(this.lanes[lane], -50, type));
    }
    
    spawnPowerUp() {
        const lane = Math.floor(Math.random() * 3);
        const powerUpTypes = ['skateboard', 'glaze'];
        const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        this.powerUps.push(new PowerUp(this.lanes[lane], -50, type));
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Update distance and score
        this.distance += this.gameSpeed * 0.1;
        this.score += Math.floor(this.gameSpeed * 0.1);
        
        // Update UI
        document.getElementById('score').textContent = this.score;
        document.getElementById('distance').textContent = Math.floor(this.distance);
        
        // Increase difficulty over time
        this.difficultyTimer++;
        if (this.difficultyTimer % 600 === 0) { // Every 10 seconds
            this.gameSpeed += 0.5;
        }
        
        // Spawn objects
        this.obstacleTimer++;
        if (this.obstacleTimer > 120 - (this.gameSpeed * 10)) {
            this.spawnObstacle();
            this.obstacleTimer = 0;
        }
        
        this.collectibleTimer++;
        if (this.collectibleTimer > 180) {
            this.spawnCollectible();
            this.collectibleTimer = 0;
        }
        
        this.powerUpTimer++;
        if (this.powerUpTimer > 600) {
            this.spawnPowerUp();
            this.powerUpTimer = 0;
        }
        
        // Update player
        this.player.update();
        
        // Update obstacles
        this.obstacles.forEach(obstacle => obstacle.update(this.gameSpeed));
        this.obstacles = this.obstacles.filter(obstacle => obstacle.y < this.canvas.height + 50);
        
        // Update collectibles
        this.collectibles.forEach(collectible => collectible.update(this.gameSpeed));
        this.collectibles = this.collectibles.filter(collectible => collectible.y < this.canvas.height + 50);
        
        // Update power-ups
        this.powerUps.forEach(powerUp => powerUp.update(this.gameSpeed));
        this.powerUps = this.powerUps.filter(powerUp => powerUp.y < this.canvas.height + 50);
        
        // Update particles
        this.particles.forEach(particle => particle.update());
        this.particles = this.particles.filter(particle => particle.life > 0);
        
        // Update background
        this.backgroundObjects.forEach(obj => {
            obj.y += obj.speed;
            if (obj.y > this.canvas.height + 50) {
                obj.y = -50;
                obj.x = Math.random() * this.canvas.width;
            }
        });
        
        // Check collisions
        this.checkCollisions();
    }
    
    checkCollisions() {
        // Check obstacle collisions
        this.obstacles.forEach((obstacle, index) => {
            if (this.player.collidesWith(obstacle)) {
                if (!this.player.isInvulnerable) {
                    this.gameOver();
                }
                this.obstacles.splice(index, 1);
            }
        });
        
        // Check collectible collisions
        this.collectibles.forEach((collectible, index) => {
            if (this.player.collidesWith(collectible)) {
                this.score += collectible.points;
                this.createParticleEffect(collectible.x, collectible.y, collectible.type);
                this.collectibles.splice(index, 1);
            }
        });
        
        // Check power-up collisions
        this.powerUps.forEach((powerUp, index) => {
            if (this.player.collidesWith(powerUp)) {
                this.player.activatePowerUp(powerUp.type);
                this.createParticleEffect(powerUp.x, powerUp.y, 'powerup');
                this.powerUps.splice(index, 1);
            }
        });
    }
    
    createParticleEffect(x, y, type) {
        const colors = {
            coin: '#FFD700',
            strawberry: '#FF6B6B',
            chocolate: '#8B4513',
            powerup: '#FF00FF'
        };
        
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(x, y, colors[type] || '#FFFFFF'));
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw lane lines
        this.drawLanes();
        
        // Draw background objects
        this.backgroundObjects.forEach(obj => this.drawBackgroundObject(obj));
        
        // Draw game objects
        this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
        this.collectibles.forEach(collectible => collectible.draw(this.ctx));
        this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));
        this.particles.forEach(particle => particle.draw(this.ctx));
        
        // Draw player
        this.player.draw(this.ctx);
        
        // Draw speed indicator
        this.drawSpeedIndicator();
    }
    
    drawBackground() {
        // Sky
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.3, '#87CEEB');
        gradient.addColorStop(0.3, '#90EE90');
        gradient.addColorStop(1, '#228B22');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawLanes() {
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([10, 20]);
        
        for (let i = 1; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.laneWidth * i, 0);
            this.ctx.lineTo(this.laneWidth * i, this.canvas.height);
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
    }
    
    drawBackgroundObject(obj) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = obj.type === 'building' ? '#666666' : '#FFFFFF';
        
        if (obj.type === 'building') {
            this.ctx.fillRect(obj.x, obj.y, obj.size, obj.size * 2);
        } else {
            this.ctx.beginPath();
            this.ctx.arc(obj.x, obj.y, obj.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    drawSpeedIndicator() {
        const speedBarWidth = 200;
        const speedBarHeight = 20;
        const x = this.canvas.width - speedBarWidth - 20;
        const y = this.canvas.height - speedBarHeight - 20;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(x, y, speedBarWidth, speedBarHeight);
        
        // Speed bar
        const speedPercent = Math.min(this.gameSpeed / 10, 1);
        this.ctx.fillStyle = `hsl(${120 - (speedPercent * 120)}, 100%, 50%)`;
        this.ctx.fillRect(x, y, speedBarWidth * speedPercent, speedBarHeight);
        
        // Label
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('SPEED', x, y - 5);
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Player class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.targetX = x;
        this.currentLane = 1;
        this.isJumping = false;
        this.isRolling = false;
        this.jumpSpeed = 0;
        this.onGround = true;
        this.costume = 'default';
        this.isInvulnerable = false;
        this.powerUpTimer = 0;
        this.activePowerUp = null;
        this.animationFrame = 0;
    }
    
    moveLeft() {
        if (this.currentLane > 0) {
            this.currentLane--;
            this.targetX = game.lanes[this.currentLane];
        }
    }
    
    moveRight() {
        if (this.currentLane < 2) {
            this.currentLane++;
            this.targetX = game.lanes[this.currentLane];
        }
    }
    
    jump() {
        if (this.onGround && !this.isRolling) {
            this.isJumping = true;
            this.jumpSpeed = -15;
            this.onGround = false;
        }
    }
    
    roll() {
        if (this.onGround && !this.isJumping) {
            this.isRolling = true;
            this.height = 20;
        }
    }
    
    stopRolling() {
        this.isRolling = false;
        this.height = 40;
    }
    
    activatePowerUp(type) {
        this.activePowerUp = type;
        this.powerUpTimer = 300; // 5 seconds at 60fps
        
        if (type === 'glaze') {
            this.isInvulnerable = true;
        }
    }
    
    update() {
        // Smooth lane movement
        this.x += (this.targetX - this.x) * 0.2;
        
        // Jump physics
        if (this.isJumping) {
            this.y += this.jumpSpeed;
            this.jumpSpeed += 0.8; // gravity
            
            if (this.y >= game.canvas.height - 150) {
                this.y = game.canvas.height - 150;
                this.isJumping = false;
                this.onGround = true;
                this.jumpSpeed = 0;
            }
        }
        
        // Power-up timer
        if (this.powerUpTimer > 0) {
            this.powerUpTimer--;
            if (this.powerUpTimer === 0) {
                this.activePowerUp = null;
                this.isInvulnerable = false;
            }
        }
        
        // Animation
        this.animationFrame++;
    }
    
    draw(ctx) {
        ctx.save();
        
        // Power-up effects
        if (this.isInvulnerable) {
            ctx.globalAlpha = 0.7;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00FFFF';
        }
        
        // Draw player based on costume
        this.drawCostume(ctx);
        
        ctx.restore();
    }
    
    drawCostume(ctx) {
        const costumeSprites = {
            default: '🍩',
            cop: '👮‍♂️',
            rockstar: '🎸',
            alien: '👾'
        };
        
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(costumeSprites[this.costume] || '🍩', this.x, this.y + 30);
        
        // Add rolling animation
        if (this.isRolling) {
            ctx.save();
            ctx.translate(this.x, this.y + 20);
            ctx.rotate((this.animationFrame * 0.3) % (Math.PI * 2));
            ctx.fillText(costumeSprites[this.costume] || '🍩', 0, 0);
            ctx.restore();
        }
    }
    
    collidesWith(other) {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }
    
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.currentLane = 1;
        this.isJumping = false;
        this.isRolling = false;
        this.jumpSpeed = 0;
        this.onGround = true;
        this.isInvulnerable = false;
        this.powerUpTimer = 0;
        this.activePowerUp = null;
        this.animationFrame = 0;
        this.height = 40;
    }
}

// Obstacle class
class Obstacle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 40;
        this.height = 40;
        this.animationFrame = 0;
    }
    
    update(speed) {
        this.y += speed;
        this.animationFrame++;
    }
    
    draw(ctx) {
        const obstacleSprites = {
            manhole: '🕳️',
            trashbin: '🗑️',
            puddle: '💧',
            feet: '👣',
            cone: '🚧',
            car: '🚕'
        };
        
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(obstacleSprites[this.type] || '❌', this.x, this.y + 30);
    }
}

// Collectible class
class Collectible {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 30;
        this.height = 30;
        this.points = type === 'coin' ? 100 : 50;
        this.animationFrame = 0;
    }
    
    update(speed) {
        this.y += speed;
        this.animationFrame++;
    }
    
    draw(ctx) {
        const collectibleSprites = {
            coin: '🪙',
            strawberry: '🍓',
            chocolate: '🍫'
        };
        
        // Glow effect
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FFD700';
        
        // Floating animation
        const floatOffset = Math.sin(this.animationFrame * 0.1) * 5;
        
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(collectibleSprites[this.type] || '⭐', this.x, this.y + 20 + floatOffset);
        
        ctx.restore();
    }
}

// PowerUp class
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 35;
        this.height = 35;
        this.animationFrame = 0;
    }
    
    update(speed) {
        this.y += speed;
        this.animationFrame++;
    }
    
    draw(ctx) {
        const powerUpSprites = {
            skateboard: '🛹',
            glaze: '✨'
        };
        
        // Power-up glow
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FF00FF';
        
        // Pulsing animation
        const scale = 1 + Math.sin(this.animationFrame * 0.2) * 0.2;
        ctx.font = `${35 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(powerUpSprites[this.type] || '⚡', this.x, this.y + 25);
        
        ctx.restore();
    }
}

// Particle class
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.color = color;
        this.life = 30;
        this.maxLife = 30;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.3; // gravity
        this.life--;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Initialize game when page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new DonutEscapeGame();
});