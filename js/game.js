// Donut Escape 3D Game Engine - Subway Surfers Style
class DonutEscapeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.distance = 0;
        this.gameSpeed = 4;
        this.selectedCostume = 'default';
        
        // 3D perspective settings
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.vanishingPointX = this.canvas.width / 2;
        this.vanishingPointY = this.canvas.height * 0.3;
        this.cameraZ = 100;
        
        // Lane system for 3D
        this.laneCount = 3;
        this.laneWidth = 100;
        this.lanes = [-1, 0, 1]; // left, center, right
        
        // Initialize game objects
        this.player = new Player3D(0, 0, 0); // center lane, ground level, at camera
        this.obstacles = [];
        this.collectibles = [];
        this.powerUps = [];
        this.particles = [];
        this.movingObstacles = [];
        
        // Game timers
        this.obstacleTimer = 0;
        this.collectibleTimer = 0;
        this.powerUpTimer = 0;
        this.movingObstacleTimer = 0;
        this.difficultyTimer = 0;
        this.pauseTimer = 0;
        this.isPaused = false;
        
        // Initialize everything
        this.initializeEventListeners();
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
                if (!this.isPaused) {
                    this.isPaused = true;
                    this.pauseTimer = 120; // 2 seconds at 60fps
                }
                break;
            case 'ArrowUp':
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
        this.gameSpeed = 4;
        this.obstacles = [];
        this.collectibles = [];
        this.powerUps = [];
        this.particles = [];
        this.movingObstacles = [];
        this.player.reset();
        this.obstacleTimer = 0;
        this.collectibleTimer = 0;
        this.powerUpTimer = 0;
        this.movingObstacleTimer = 0;
        this.difficultyTimer = 0;
        this.pauseTimer = 0;
        this.isPaused = false;
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalDistance').textContent = Math.floor(this.distance);
        this.showScreen('gameOverScreen');
    }
    
    // Convert 3D coordinates to 2D screen coordinates
    project3D(x, y, z) {
        const scale = this.cameraZ / (this.cameraZ + z);
        const screenX = this.vanishingPointX + (x * scale);
        const screenY = this.vanishingPointY + (y * scale);
        return { x: screenX, y: screenY, scale: scale };
    }
    
    spawnStaticObstacle() {
        const lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];
        const obstacleTypes = ['manhole', 'trashbin', 'puddle', 'cone'];
        const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        const z = 800; // Spawn far away
        
        this.obstacles.push(new Obstacle3D(lane * this.laneWidth, 0, z, type));
    }
    
    spawnMovingObstacle() {
        const type = Math.random() > 0.5 ? 'car' : 'feet';
        const z = 600;
        const startX = type === 'car' ? -400 : -200;
        const endX = type === 'car' ? 400 : 200;
        
        this.movingObstacles.push(new MovingObstacle3D(startX, 0, z, type, endX));
    }
    
    spawnCollectible() {
        const lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];
        const collectibleTypes = ['coin', 'strawberry', 'chocolate'];
        const type = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];
        const z = 700;
        
        this.collectibles.push(new Collectible3D(lane * this.laneWidth, -20, z, type));
    }
    
    spawnPowerUp() {
        const lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];
        const powerUpTypes = ['skateboard', 'glaze'];
        const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        const z = 650;
        
        this.powerUps.push(new PowerUp3D(lane * this.laneWidth, -15, z, type));
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Handle pause timer
        if (this.isPaused) {
            this.pauseTimer--;
            if (this.pauseTimer <= 0) {
                this.isPaused = false;
            }
            return; // Don't update anything else while paused
        }
        
        // Update distance and score
        this.distance += this.gameSpeed * 0.1;
        this.score += Math.floor(this.gameSpeed * 0.1);
        
        // Update UI
        document.getElementById('score').textContent = this.score;
        document.getElementById('distance').textContent = Math.floor(this.distance);
        
        // Increase difficulty over time
        this.difficultyTimer++;
        if (this.difficultyTimer % 600 === 0) {
            this.gameSpeed += 0.5;
        }
        
        // Spawn objects
        this.obstacleTimer++;
        if (this.obstacleTimer > 90 - (this.gameSpeed * 5)) {
            this.spawnStaticObstacle();
            this.obstacleTimer = 0;
        }
        
        this.movingObstacleTimer++;
        if (this.movingObstacleTimer > 200) {
            this.spawnMovingObstacle();
            this.movingObstacleTimer = 0;
        }
        
        this.collectibleTimer++;
        if (this.collectibleTimer > 150) {
            this.spawnCollectible();
            this.collectibleTimer = 0;
        }
        
        // Update player
        this.player.update();
        
        // Update obstacles - move them toward camera
        this.obstacles.forEach(obstacle => obstacle.update(this.gameSpeed));
        this.obstacles = this.obstacles.filter(obstacle => obstacle.z > -100);
        
        // Update moving obstacles
        this.movingObstacles.forEach(obstacle => obstacle.update(this.gameSpeed));
        this.movingObstacles = this.movingObstacles.filter(obstacle => obstacle.z > -100 && !obstacle.isOffScreen);
        
        // Update collectibles
        this.collectibles.forEach(collectible => collectible.update(this.gameSpeed));
        this.collectibles = this.collectibles.filter(collectible => collectible.z > -100);
        
        // Update power-ups
        this.powerUps.forEach(powerUp => powerUp.update(this.gameSpeed));
        this.powerUps = this.powerUps.filter(powerUp => powerUp.z > -100);
        
        // Update particles
        this.particles.forEach(particle => particle.update());
        this.particles = this.particles.filter(particle => particle.life > 0);
        
        // Check collisions
        this.checkCollisions();
    }
    
    checkCollisions() {
        const playerLane = this.player.lane;
        const playerX = playerLane * this.laneWidth;
        
        // Check static obstacle collisions
        this.obstacles.forEach((obstacle, index) => {
            if (obstacle.z < 50 && obstacle.z > -50) { // Near player depth
                const distance = Math.abs(obstacle.x - playerX);
                if (distance < 50 && !this.player.isInvulnerable) {
                    // Check if player can avoid obstacle
                    let canAvoid = false;
                    if (obstacle.canJumpOver && this.player.isJumping) {
                        canAvoid = true;
                    } else if (obstacle.canRollUnder && this.player.isRolling) {
                        canAvoid = true;
                    }
                    
                    if (!canAvoid) {
                        this.gameOver();
                    }
                }
            }
        });
        
        // Check moving obstacle collisions (cars cannot be avoided by jumping/rolling)
        this.movingObstacles.forEach((obstacle, index) => {
            if (obstacle.z < 50 && obstacle.z > -50) {
                const distance = Math.abs(obstacle.x - playerX);
                if (distance < 80 && !this.player.isInvulnerable) {
                    this.gameOver();
                }
            }
        });
        
        // Check collectible collisions
        this.collectibles.forEach((collectible, index) => {
            if (collectible.z < 50 && collectible.z > -50) {
                const distance = Math.abs(collectible.x - playerX);
                if (distance < 40) {
                    this.score += collectible.points;
                    this.createParticleEffect(collectible.x, collectible.y, collectible.z, collectible.type);
                    this.collectibles.splice(index, 1);
                }
            }
        });
        
        // Check power-up collisions
        this.powerUps.forEach((powerUp, index) => {
            if (powerUp.z < 50 && powerUp.z > -50) {
                const distance = Math.abs(powerUp.x - playerX);
                if (distance < 40) {
                    this.player.activatePowerUp(powerUp.type);
                    this.createParticleEffect(powerUp.x, powerUp.y, powerUp.z, 'powerup');
                    this.powerUps.splice(index, 1);
                }
            }
        });
    }
    
    createParticleEffect(x, y, z, type) {
        const colors = {
            coin: '#FFD700',
            strawberry: '#FF6B6B',
            chocolate: '#8B4513',
            powerup: '#FF00FF'
        };
        
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle3D(x, y, z, colors[type] || '#FFFFFF'));
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw 3D background
        this.drawBackground3D();
        
        // Draw 3D lane lines
        this.drawLanes3D();
        
        // Collect all 3D objects and sort by depth (z-coordinate)
        const allObjects = [];
        
        // Add obstacles
        this.obstacles.forEach(obstacle => {
            allObjects.push({ obj: obstacle, type: 'obstacle', z: obstacle.z });
        });
        
        // Add moving obstacles
        this.movingObstacles.forEach(obstacle => {
            allObjects.push({ obj: obstacle, type: 'movingObstacle', z: obstacle.z });
        });
        
        // Add collectibles
        this.collectibles.forEach(collectible => {
            allObjects.push({ obj: collectible, type: 'collectible', z: collectible.z });
        });
        
        // Add power-ups
        this.powerUps.forEach(powerUp => {
            allObjects.push({ obj: powerUp, type: 'powerUp', z: powerUp.z });
        });
        
        // Add player
        allObjects.push({ obj: this.player, type: 'player', z: this.player.z });
        
        // Sort by z-coordinate (furthest first)
        allObjects.sort((a, b) => b.z - a.z);
        
        // Draw all objects in depth order
        allObjects.forEach(item => {
            item.obj.draw(this.ctx, this);
        });
        
        // Draw particles last
        this.particles.forEach(particle => particle.draw(this.ctx, this));
        
        // Draw pause indicator
        if (this.isPaused) {
            this.drawPauseIndicator();
        }
    }
    
    drawBackground3D() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.4, '#87CEEB');
        gradient.addColorStop(0.4, '#D3D3D3');
        gradient.addColorStop(1, '#A9A9A9');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw perspective sidewalk
        this.drawPerspectiveSidewalk();
    }
    
    drawPerspectiveSidewalk() {
        // Draw sidewalk perspective lines
        for (let z = 0; z < 1000; z += 50) {
            const proj = this.project3D(0, 0, z);
            const leftProj = this.project3D(-200, 0, z);
            const rightProj = this.project3D(200, 0, z);
            
            this.ctx.strokeStyle = `rgba(128, 128, 128, ${1 - z/1000})`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(leftProj.x, proj.y);
            this.ctx.lineTo(rightProj.x, proj.y);
            this.ctx.stroke();
        }
    }
    
    drawLanes3D() {
        // Draw perspective lane dividers
        for (let i = -1; i <= 1; i++) {
            if (i === 0) continue; // Skip center
            
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([10, 20]);
            
            this.ctx.beginPath();
            const nearProj = this.project3D(i * this.laneWidth + this.laneWidth/2, 0, -50);
            const farProj = this.project3D(i * this.laneWidth + this.laneWidth/2, 0, 800);
            this.ctx.moveTo(nearProj.x, nearProj.y);
            this.ctx.lineTo(farProj.x, farProj.y);
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
    }
    
    drawPauseIndicator() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width/2, this.canvas.height/2);
        
        this.ctx.font = '24px Arial';
        const remaining = Math.ceil(this.pauseTimer / 60);
        this.ctx.fillText(`Resuming in ${remaining}s`, this.canvas.width/2, this.canvas.height/2 + 50);
        this.ctx.restore();
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 3D Player class
class Player3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.lane = 0; // -1, 0, 1 for left, center, right
        this.targetLane = 0;
        this.isJumping = false;
        this.isRolling = false;
        this.jumpHeight = 0;
        this.jumpSpeed = 0;
        this.onGround = true;
        this.costume = 'default';
        this.isInvulnerable = false;
        this.powerUpTimer = 0;
        this.activePowerUp = null;
        this.animationFrame = 0;
    }
    
    moveLeft() {
        if (this.lane > -1) {
            this.lane--;
            this.targetLane = this.lane;
        }
    }
    
    moveRight() {
        if (this.lane < 1) {
            this.lane++;
            this.targetLane = this.lane;
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
        }
    }
    
    stopRolling() {
        this.isRolling = false;
    }
    
    activatePowerUp(type) {
        this.activePowerUp = type;
        this.powerUpTimer = 300;
        
        if (type === 'glaze') {
            this.isInvulnerable = true;
        }
    }
    
    update() {
        // Smooth lane transition
        const targetX = this.targetLane * 100;
        this.x += (targetX - this.x) * 0.2;
        
        // Jump physics
        if (this.isJumping) {
            this.jumpHeight += this.jumpSpeed;
            this.jumpSpeed += 0.8; // gravity
            
            if (this.jumpHeight >= 0) {
                this.jumpHeight = 0;
                this.isJumping = false;
                this.onGround = true;
                this.jumpSpeed = 0;
            }
        }
        
        // Update y position based on jump height and rolling
        this.y = -this.jumpHeight + (this.isRolling ? 20 : 0);
        
        // Power-up timer
        if (this.powerUpTimer > 0) {
            this.powerUpTimer--;
            if (this.powerUpTimer === 0) {
                this.activePowerUp = null;
                this.isInvulnerable = false;
            }
        }
        
        this.animationFrame++;
    }
    
    draw(ctx, game) {
        const proj = game.project3D(this.x, this.y, this.z);
        
        ctx.save();
        
        // Power-up effects
        if (this.isInvulnerable) {
            ctx.globalAlpha = 0.7;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00FFFF';
        }
        
        // Draw costume
        this.drawCostume(ctx, proj);
        
        ctx.restore();
    }
    
    drawCostume(ctx, proj) {
        ctx.font = `${40 * proj.scale}px Arial`;
        ctx.textAlign = 'center';
        
        // Always draw the donut base
        ctx.fillText('🍩', proj.x, proj.y);
        
        // Add costume on top of donut
        const costumeSprites = {
            default: '',
            cop: '👕',
            rockstar: '🎸',
            alien: '👽'
        };
        
        if (this.costume !== 'default' && costumeSprites[this.costume]) {
            ctx.font = `${20 * proj.scale}px Arial`;
            ctx.fillText(costumeSprites[this.costume], proj.x, proj.y - 15 * proj.scale);
        }
    }
    
    reset() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.lane = 0;
        this.targetLane = 0;
        this.isJumping = false;
        this.isRolling = false;
        this.jumpHeight = 0;
        this.jumpSpeed = 0;
        this.onGround = true;
        this.isInvulnerable = false;
        this.powerUpTimer = 0;
        this.activePowerUp = null;
        this.animationFrame = 0;
    }
}

// 3D Obstacle class
class Obstacle3D {
    constructor(x, y, z, type) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = type;
        this.canJumpOver = ['manhole', 'puddle', 'cone'].includes(type);
        this.canRollUnder = ['feet'].includes(type);
        this.animationFrame = 0;
    }
    
    update(speed) {
        this.z -= speed;
        this.animationFrame++;
    }
    
    draw(ctx, game) {
        const proj = game.project3D(this.x, this.y, this.z);
        
        const obstacleSprites = {
            manhole: '🕳️',
            trashbin: '🗑️',
            puddle: '💧',
            cone: '🚧'
        };
        
        ctx.font = `${60 * proj.scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(obstacleSprites[this.type] || '❌', proj.x, proj.y);
    }
}

// 3D Moving Obstacle class
class MovingObstacle3D {
    constructor(x, y, z, type, endX) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = type;
        this.startX = x;
        this.endX = endX;
        this.speed = type === 'car' ? 3 : 1.5;
        this.animationFrame = 0;
        this.isOffScreen = false;
    }
    
    update(gameSpeed) {
        this.z -= gameSpeed;
        this.x += this.speed;
        this.animationFrame++;
        
        if (this.x > this.endX) {
            this.isOffScreen = true;
        }
    }
    
    draw(ctx, game) {
        const proj = game.project3D(this.x, this.y, this.z);
        
        let sprite;
        if (this.type === 'car') {
            const carAnimation = ['🚕', '🚖', '🚗', '🚙'];
            sprite = carAnimation[Math.floor(this.animationFrame / 15) % carAnimation.length];
        } else { // feet
            const feetAnimation = ['👟', '👠', '🥿', '👢'];
            sprite = feetAnimation[Math.floor(this.animationFrame / 10) % feetAnimation.length];
        }
        
        ctx.font = `${(this.type === 'car' ? 80 : 40) * proj.scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(sprite, proj.x, proj.y);
    }
}

// 3D Collectible class
class Collectible3D {
    constructor(x, y, z, type) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = type;
        this.points = type === 'coin' ? 100 : 50;
        this.animationFrame = 0;
    }
    
    update(speed) {
        this.z -= speed;
        this.animationFrame++;
    }
    
    draw(ctx, game) {
        const proj = game.project3D(this.x, this.y, this.z);
        
        const collectibleSprites = {
            coin: '🪙',
            strawberry: '🍓',
            chocolate: '🍫'
        };
        
        // Glow effect
        ctx.save();
        ctx.shadowBlur = 15 * proj.scale;
        ctx.shadowColor = '#FFD700';
        
        // Floating animation
        const floatOffset = Math.sin(this.animationFrame * 0.1) * 5 * proj.scale;
        
        ctx.font = `${30 * proj.scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(collectibleSprites[this.type] || '⭐', proj.x, proj.y + floatOffset);
        
        ctx.restore();
    }
}

// 3D PowerUp class
class PowerUp3D {
    constructor(x, y, z, type) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = type;
        this.animationFrame = 0;
    }
    
    update(speed) {
        this.z -= speed;
        this.animationFrame++;
    }
    
    draw(ctx, game) {
        const proj = game.project3D(this.x, this.y, this.z);
        
        const powerUpSprites = {
            skateboard: '🛹',
            glaze: '✨'
        };
        
        // Power-up glow
        ctx.save();
        ctx.shadowBlur = 20 * proj.scale;
        ctx.shadowColor = '#FF00FF';
        
        // Pulsing animation
        const scale = (1 + Math.sin(this.animationFrame * 0.2) * 0.2) * proj.scale;
        ctx.font = `${35 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(powerUpSprites[this.type] || '⚡', proj.x, proj.y);
        
        ctx.restore();
    }
}

// 3D Particle class
class Particle3D {
    constructor(x, y, z, color) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.vz = (Math.random() - 0.5) * 5;
        this.color = color;
        this.life = 30;
        this.maxLife = 30;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;
        this.vy += 0.3; // gravity
        this.life--;
    }
    
    draw(ctx, game) {
        const proj = game.project3D(this.x, this.y, this.z);
        
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 3 * proj.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Initialize game when page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new DonutEscapeGame();
});