// Donut Escape - True 3D First-Person Runner
class DonutEscapeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu';
        this.score = 0;
        this.distance = 0;
        this.gameSpeed = 4;
        this.selectedCostume = 'default';
        
        // Currency system
        this.coins = parseInt(localStorage.getItem('donut_coins') || '0');
        this.strawberries = parseInt(localStorage.getItem('donut_strawberries') || '0');
        this.chocolates = parseInt(localStorage.getItem('donut_chocolates') || '0');
        this.donutLetters = ['D', 'O', 'N', 'U', 'T'];
        this.collectedLetters = JSON.parse(localStorage.getItem('donut_letters') || '[]');
        this.unlockedCostumes = JSON.parse(localStorage.getItem('donut_costumes') || '["default"]');
        
        // True 3D settings (no perspective distortion)
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.viewDistance = 1000;
        this.groundLevel = this.canvas.height - 100;
        this.cameraHeight = 50; // Height of donut's eyes
        this.firstPersonMode = false;
        this.gameStartTime = 0;
        
        // Lane system (3 lanes, each 150 pixels wide)
        this.laneWidth = 150;
        this.lanes = [-this.laneWidth, 0, this.laneWidth]; // left, center, right
        
        // Initialize game objects
        this.player = new Player3D(0, this.groundLevel, 0);
        this.obstacles = [];
        this.collectibles = [];
        this.powerUps = [];
        this.particles = [];
        this.movingObstacles = [];
        this.sprinkles = [];
        this.letterCollectibles = [];
        
        // Game timers
        this.obstacleTimer = 0;
        this.collectibleTimer = 0;
        this.powerUpTimer = 0;
        this.movingObstacleTimer = 0;
        this.letterTimer = 0;
        this.difficultyTimer = 0;
        this.pauseTimer = 0;
        this.isPaused = false;
        
        // Initialize everything
        this.initializeEventListeners();
        this.updateCurrencyDisplay();
        this.updateLetterProgress();
        this.updateCostumeMenu();
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
            card.addEventListener('click', () => this.handleCostumeClick(card));
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    handleCostumeClick(card) {
        const costume = card.dataset.costume;
        const cost = parseInt(card.dataset.cost);
        
        if (this.unlockedCostumes.includes(costume)) {
            this.selectCostume(costume);
        } else {
            if (this.canAffordCostume(cost)) {
                this.purchaseCostume(costume, cost);
            }
        }
    }
    
    canAffordCostume(cost) {
        const coinCost = cost;
        const strawberryCost = Math.floor(cost / 2);
        const chocolateCost = Math.floor(cost / 2);
        
        return this.coins >= coinCost && 
               this.strawberries >= strawberryCost && 
               this.chocolates >= chocolateCost;
    }
    
    purchaseCostume(costume, cost) {
        const coinCost = cost;
        const strawberryCost = Math.floor(cost / 2);
        const chocolateCost = Math.floor(cost / 2);
        
        this.coins -= coinCost;
        this.strawberries -= strawberryCost;
        this.chocolates -= chocolateCost;
        
        this.unlockedCostumes.push(costume);
        this.saveCurrency();
        this.updateCurrencyDisplay();
        this.updateCostumeMenu();
        this.selectCostume(costume);
    }
    
    updateCostumeMenu() {
        document.querySelectorAll('.costume-card').forEach(card => {
            const costume = card.dataset.costume;
            if (this.unlockedCostumes.includes(costume)) {
                card.classList.remove('locked');
                card.classList.add('unlocked');
            }
        });
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
                    this.pauseTimer = 120;
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
        this.updateCostumeMenu();
        this.showScreen('costumeMenu');
    }
    
    startGame() {
        this.gameState = 'playing';
        this.showScreen('gameScreen');
        this.resetGame();
        this.gameStartTime = Date.now();
        this.firstPersonMode = false; // Start showing the donut
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
        this.gameStartTime = Date.now();
        this.firstPersonMode = false;
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
        this.sprinkles = [];
        this.letterCollectibles = [];
        this.player.reset();
        this.obstacleTimer = 0;
        this.collectibleTimer = 0;
        this.powerUpTimer = 0;
        this.movingObstacleTimer = 0;
        this.letterTimer = 0;
        this.difficultyTimer = 0;
        this.pauseTimer = 0;
        this.isPaused = false;
        this.collectedLetters = [];
    }
    
    gameOver() {
        this.saveCurrency();
        this.updateCurrencyDisplay();
        
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalDistance').textContent = Math.floor(this.distance);
        this.showScreen('gameOverScreen');
    }
    
    // True 3D projection without perspective distortion
    project3D(x, y, z) {
        // Simple orthographic projection
        const screenX = this.canvas.width / 2 + x;
        const screenY = y - (z * 0.3); // Slight depth effect for visibility
        return { x: screenX, y: screenY, scale: Math.max(0.1, 1 - (z / this.viewDistance)) };
    }
    
    spawnStaticObstacle() {
        const lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];
        const obstacleTypes = ['cone', 'manhole', 'puddle', 'fork', 'spoon'];
        const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        const z = this.viewDistance;
        
        this.obstacles.push(new Obstacle3D(lane, this.groundLevel, z, type));
    }
    
    spawnMovingObstacle() {
        const type = Math.random() > 0.5 ? 'car' : 'feet';
        const z = this.viewDistance * 0.8;
        const startX = type === 'car' ? -400 : -200;
        const endX = type === 'car' ? 400 : 200;
        
        this.movingObstacles.push(new MovingObstacle3D(startX, this.groundLevel, z, type, endX));
    }
    
    spawnCollectible() {
        const lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];
        const collectibleTypes = ['coin', 'strawberry', 'chocolate'];
        const type = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];
        const z = this.viewDistance * 0.9;
        
        this.collectibles.push(new Collectible3D(lane, this.groundLevel - 30, z, type));
    }
    
    spawnLetter() {
        const lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];
        const availableLetters = this.donutLetters.filter(letter => 
            !this.collectedLetters.includes(letter)
        );
        
        if (availableLetters.length > 0) {
            const letter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
            const z = this.viewDistance * 0.95;
            this.letterCollectibles.push(new LetterCollectible3D(lane, this.groundLevel - 20, z, letter));
        }
    }
    
    spawnPowerUp() {
        const lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];
        const powerUpTypes = ['icing_gun', 'honey_cluster', 'glaze'];
        const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        const z = this.viewDistance * 0.85;
        
        this.powerUps.push(new PowerUp3D(lane, this.groundLevel - 25, z, type));
    }
    
    addSprinkle() {
        if (!this.firstPersonMode) {
            // Add sprinkles behind the visible donut
            this.sprinkles.push(new Sprinkle3D(
                this.player.x + (Math.random() - 0.5) * 30,
                this.player.y + Math.random() * 10,
                this.player.z - 20
            ));
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Switch to first-person view after 3 seconds
        if (!this.firstPersonMode && Date.now() - this.gameStartTime > 3000) {
            this.firstPersonMode = true;
        }
        
        // Handle pause timer
        if (this.isPaused) {
            this.pauseTimer--;
            if (this.pauseTimer <= 0) {
                this.isPaused = false;
            }
            return;
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
        if (this.collectibleTimer > 120) {
            this.spawnCollectible();
            this.collectibleTimer = 0;
        }
        
        this.letterTimer++;
        if (this.letterTimer > 300) {
            this.spawnLetter();
            this.letterTimer = 0;
        }
        
        if (Math.random() < 0.005) {
            this.spawnPowerUp();
        }
        
        // Add sprinkles
        if (Math.random() < 0.3) {
            this.addSprinkle();
        }
        
        // Update player
        this.player.update();
        
        // Update all objects - move them toward player
        this.obstacles.forEach(obstacle => obstacle.update(this.gameSpeed));
        this.obstacles = this.obstacles.filter(obstacle => obstacle.z > -100);
        
        this.movingObstacles.forEach(obstacle => obstacle.update(this.gameSpeed));
        this.movingObstacles = this.movingObstacles.filter(obstacle => obstacle.z > -100 && !obstacle.isOffScreen);
        
        this.collectibles.forEach(collectible => collectible.update(this.gameSpeed));
        this.collectibles = this.collectibles.filter(collectible => collectible.z > -100);
        
        this.letterCollectibles.forEach(letter => letter.update(this.gameSpeed));
        this.letterCollectibles = this.letterCollectibles.filter(letter => letter.z > -100);
        
        this.powerUps.forEach(powerUp => powerUp.update(this.gameSpeed));
        this.powerUps = this.powerUps.filter(powerUp => powerUp.z > -100);
        
        this.particles.forEach(particle => particle.update());
        this.particles = this.particles.filter(particle => particle.life > 0);
        
        this.sprinkles.forEach(sprinkle => sprinkle.update(this.gameSpeed));
        this.sprinkles = this.sprinkles.filter(sprinkle => sprinkle.z > -100 && sprinkle.life > 0);
        
        this.checkCollisions();
    }
    
    checkCollisions() {
        const playerX = this.player.x;
        
        // Check static obstacle collisions
        this.obstacles.forEach((obstacle, index) => {
            if (obstacle.z < 50 && obstacle.z > -50) {
                const distance = Math.abs(obstacle.x - playerX);
                if (distance < 60 && !this.player.isInvulnerable) {
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
        
        // Check moving obstacle collisions
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
                if (distance < 50) {
                    this.score += collectible.points;
                    this.addCurrency(collectible.type, 1);
                    this.createParticleEffect(collectible.x, collectible.y, collectible.z, collectible.type);
                    this.collectibles.splice(index, 1);
                }
            }
        });
        
        // Check letter collisions
        this.letterCollectibles.forEach((letter, index) => {
            if (letter.z < 50 && letter.z > -50) {
                const distance = Math.abs(letter.x - playerX);
                if (distance < 50) {
                    this.collectedLetters.push(letter.letter);
                    this.checkDonutComplete();
                    this.updateLetterProgress();
                    this.createParticleEffect(letter.x, letter.y, letter.z, 'letter');
                    this.letterCollectibles.splice(index, 1);
                }
            }
        });
        
        // Check power-up collisions
        this.powerUps.forEach((powerUp, index) => {
            if (powerUp.z < 50 && powerUp.z > -50) {
                const distance = Math.abs(powerUp.x - playerX);
                if (distance < 50) {
                    this.player.activatePowerUp(powerUp.type);
                    if (powerUp.type === 'icing_gun') {
                        this.activateIcingGun();
                    }
                    this.createParticleEffect(powerUp.x, powerUp.y, powerUp.z, 'powerup');
                    this.powerUps.splice(index, 1);
                }
            }
        });
    }
    
    activateIcingGun() {
        this.collectibles.forEach((collectible, index) => {
            if (collectible.z < 200 && collectible.z > -50) {
                this.addCurrency(collectible.type, 1);
                this.createParticleEffect(collectible.x, collectible.y, collectible.z, collectible.type);
                this.collectibles.splice(index, 1);
            }
        });
    }
    
    checkDonutComplete() {
        if (this.collectedLetters.length === 5) {
            this.addCurrency('coin', 100);
            this.addCurrency('strawberry', 100);
            this.addCurrency('chocolate', 100);
            this.collectedLetters = [];
        }
    }
    
    addCurrency(type, amount) {
        switch(type) {
            case 'coin':
                this.coins += amount;
                break;
            case 'strawberry':
                this.strawberries += amount;
                break;
            case 'chocolate':
                this.chocolates += amount;
                break;
        }
        this.updateCurrencyDisplay();
    }
    
    updateCurrencyDisplay() {
        document.getElementById('coins').textContent = `🪙 ${this.coins}`;
        document.getElementById('strawberries').textContent = `🍓 ${this.strawberries}`;
        document.getElementById('chocolates').textContent = `🍫 ${this.chocolates}`;
    }
    
    updateLetterProgress() {
        const progress = this.donutLetters.map(letter => 
            this.collectedLetters.includes(letter) ? letter : '-'
        ).join('');
        document.getElementById('letterProgress').textContent = progress;
    }
    
    saveCurrency() {
        localStorage.setItem('donut_coins', this.coins.toString());
        localStorage.setItem('donut_strawberries', this.strawberries.toString());
        localStorage.setItem('donut_chocolates', this.chocolates.toString());
        localStorage.setItem('donut_costumes', JSON.stringify(this.unlockedCostumes));
    }
    
    createParticleEffect(x, y, z, type) {
        const colors = {
            coin: '#FFD700',
            strawberry: '#FF6B6B',
            chocolate: '#8B4513',
            letter: '#FF00FF',
            powerup: '#00FFFF'
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
        
        // Collect all 3D objects and sort by depth
        const allObjects = [];
        
        // Add all objects
        this.obstacles.forEach(obstacle => {
            allObjects.push({ obj: obstacle, type: 'obstacle', z: obstacle.z });
        });
        
        this.movingObstacles.forEach(obstacle => {
            allObjects.push({ obj: obstacle, type: 'movingObstacle', z: obstacle.z });
        });
        
        this.collectibles.forEach(collectible => {
            allObjects.push({ obj: collectible, type: 'collectible', z: collectible.z });
        });
        
        this.letterCollectibles.forEach(letter => {
            allObjects.push({ obj: letter, type: 'letter', z: letter.z });
        });
        
        this.powerUps.forEach(powerUp => {
            allObjects.push({ obj: powerUp, type: 'powerUp', z: powerUp.z });
        });
        
        this.sprinkles.forEach(sprinkle => {
            allObjects.push({ obj: sprinkle, type: 'sprinkle', z: sprinkle.z });
        });
        
        // Add player only if not in first-person mode
        if (!this.firstPersonMode) {
            allObjects.push({ obj: this.player, type: 'player', z: this.player.z });
        }
        
        // Sort by z-coordinate (furthest first)
        allObjects.sort((a, b) => b.z - a.z);
        
        // Draw all objects in depth order
        allObjects.forEach(item => {
            item.obj.draw(this.ctx, this);
        });
        
        // Draw particles last
        this.particles.forEach(particle => particle.draw(this.ctx, this));
        
        // Draw mode indicator
        if (!this.firstPersonMode && this.gameState === 'playing') {
            this.drawModeIndicator();
        }
        
        // Draw pause indicator
        if (this.isPaused) {
            this.drawPauseIndicator();
        }
    }
    
    drawBackground3D() {
        // Simple sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.6, '#87CEEB');
        gradient.addColorStop(0.6, '#D3D3D3');
        gradient.addColorStop(1, '#A9A9A9');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw simple ground
        this.ctx.fillStyle = '#808080';
        this.ctx.fillRect(0, this.groundLevel, this.canvas.width, this.canvas.height - this.groundLevel);
    }
    
    drawModeIndicator() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Switching to first-person view...', this.canvas.width/2, 50);
        this.ctx.restore();
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

// 3D Player class positioned at bottom
class Player3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.lane = 1; // 0, 1, 2 for left, center, right
        this.targetX = x;
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
        if (this.lane > 0) {
            this.lane--;
            this.targetX = game.lanes[this.lane];
        }
    }
    
    moveRight() {
        if (this.lane < 2) {
            this.lane++;
            this.targetX = game.lanes[this.lane];
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
        this.x += (this.targetX - this.x) * 0.2;
        
        // Jump physics
        if (this.isJumping) {
            this.jumpHeight += this.jumpSpeed;
            this.jumpSpeed += 0.8;
            
            if (this.jumpHeight >= 0) {
                this.jumpHeight = 0;
                this.isJumping = false;
                this.onGround = true;
                this.jumpSpeed = 0;
            }
        }
        
        // Update y position
        this.y = game.groundLevel - this.jumpHeight + (this.isRolling ? 20 : 0);
        
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
        ctx.font = `${60 * proj.scale}px Arial`; // Bigger donut
        ctx.textAlign = 'center';
        
        // Always draw the donut base
        ctx.fillText('🍩', proj.x, proj.y);
        
        // Add costume accessories
        const costumeSprites = {
            default: '',
            police: '👕',
            rockstar: '🎸',
            alien: '👽',
            chef: '👨‍🍳',
            superhero: '🦸‍♂️',
            sailor: '⚓'
        };
        
        if (this.costume !== 'default' && costumeSprites[this.costume]) {
            ctx.font = `${30 * proj.scale}px Arial`;
            ctx.fillText(costumeSprites[this.costume], proj.x, proj.y - 25 * proj.scale);
        }
    }
    
    reset() {
        this.x = 0;
        this.y = game.groundLevel;
        this.z = 0;
        this.lane = 1;
        this.targetX = 0;
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

// 3D Obstacle class with true 3D rendering
class Obstacle3D {
    constructor(x, y, z, type) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = type;
        this.canJumpOver = ['manhole', 'puddle'].includes(type);
        this.canRollUnder = ['fork', 'spoon'].includes(type);
        this.animationFrame = 0;
    }
    
    update(speed) {
        this.z -= speed;
        this.animationFrame++;
    }
    
    draw(ctx, game) {
        const proj = game.project3D(this.x, this.y, this.z);
        
        const obstacleSprites = {
            cone: '🚧',
            manhole: '🕳️',
            puddle: '💧',
            fork: '🍴',
            spoon: '🥄'
        };
        
        ctx.font = `${80 * proj.scale}px Arial`; // Bigger obstacles
        ctx.textAlign = 'center';
        ctx.fillText(obstacleSprites[this.type] || '❌', proj.x, proj.y);
    }
}

// Moving obstacles with true 3D
class MovingObstacle3D {
    constructor(x, y, z, type, endX) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = type;
        this.startX = x;
        this.endX = endX;
        this.speed = type === 'car' ? 4 : 2;
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
        } else {
            const feetAnimation = ['👟', '👠', '🥿', '👢'];
            sprite = feetAnimation[Math.floor(this.animationFrame / 10) % feetAnimation.length];
        }
        
        ctx.font = `${(this.type === 'car' ? 100 : 60) * proj.scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(sprite, proj.x, proj.y);
    }
}

// Other classes remain similar but with adjusted sizes and positions...
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
        
        ctx.save();
        ctx.shadowBlur = 15 * proj.scale;
        ctx.shadowColor = '#FFD700';
        
        const floatOffset = Math.sin(this.animationFrame * 0.1) * 5 * proj.scale;
        
        ctx.font = `${40 * proj.scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(collectibleSprites[this.type] || '⭐', proj.x, proj.y + floatOffset);
        
        ctx.restore();
    }
}

class LetterCollectible3D {
    constructor(x, y, z, letter) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.letter = letter;
        this.animationFrame = 0;
    }
    
    update(speed) {
        this.z -= speed;
        this.animationFrame++;
    }
    
    draw(ctx, game) {
        const proj = game.project3D(this.x, this.y, this.z);
        
        ctx.save();
        ctx.shadowBlur = 20 * proj.scale;
        ctx.shadowColor = '#FF00FF';
        
        const scale = (1 + Math.sin(this.animationFrame * 0.2) * 0.3) * proj.scale;
        
        ctx.fillStyle = '#FF00FF';
        ctx.font = `${60 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('⬜', proj.x, proj.y);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${40 * scale}px Arial`;
        ctx.fillText(this.letter, proj.x, proj.y);
        
        ctx.restore();
    }
}

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
            icing_gun: '🔫',
            honey_cluster: '🍯',
            glaze: '✨'
        };
        
        ctx.save();
        ctx.shadowBlur = 20 * proj.scale;
        ctx.shadowColor = '#00FFFF';
        
        const scale = (1 + Math.sin(this.animationFrame * 0.2) * 0.2) * proj.scale;
        ctx.font = `${50 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(powerUpSprites[this.type] || '⚡', proj.x, proj.y);
        
        ctx.restore();
    }
}

class Sprinkle3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = Math.random() * 2;
        this.vz = Math.random() * 2;
        this.life = 60;
        this.maxLife = 60;
        this.colors = ['#FF69B4', '#00FFFF', '#FFFF00', '#FF6347', '#32CD32'];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }
    
    update(gameSpeed) {
        this.z -= gameSpeed;
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;
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
        this.vy += 0.3;
        this.life--;
    }
    
    draw(ctx, game) {
        const proj = game.project3D(this.x, this.y, this.z);
        
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 4 * proj.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Initialize game
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new DonutEscapeGame();
});