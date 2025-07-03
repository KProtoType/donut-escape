// Magic Tiles - Rhythm Game
class MagicTilesGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.audio = document.getElementById('gameAudio');
        
        // Game state
        this.gameState = 'menu'; // menu, songSelect, playing, paused, gameOver
        this.selectedSong = null;
        this.currentSong = null;
        
        // Game settings
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.lanes = 4;
        this.laneWidth = this.canvas.width / this.lanes;
        this.fallSpeed = 3;
        this.hitZone = this.canvas.height - 100;
        this.hitTolerance = 40;
        
        // Game data
        this.tiles = [];
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.totalNotes = 0;
        this.hitNotes = 0;
        this.startTime = 0;
        this.gameTime = 0;
        this.isPaused = false;
        
        // Input handling
        this.activeTouches = new Set();
        this.keyPressed = new Set();
        
        // Load songs database
        this.songs = this.initializeSongs();
        
        // Initialize everything
        this.initializeEventListeners();
        this.populateSongList();
        this.gameLoop();
    }
    
    initializeSongs() {
        return [
            {
                id: 'sample1',
                title: 'Rhythmic Beats',
                artist: 'Magic Tiles Studio',
                difficulty: 'Easy',
                bpm: 120,
                duration: 60, // seconds
                audioFile: null, // We'll use a generated beat
                notes: this.generateSampleNotes(120, 60) // BPM, duration
            },
            {
                id: 'sample2',
                title: 'Electronic Dance',
                artist: 'Digital Harmony',
                difficulty: 'Medium',
                bpm: 140,
                duration: 45,
                audioFile: null,
                notes: this.generateSampleNotes(140, 45, 'medium')
            },
            {
                id: 'sample3',
                title: 'Speed Challenge',
                artist: 'Tempo Masters',
                difficulty: 'Hard',
                bpm: 180,
                duration: 30,
                audioFile: null,
                notes: this.generateSampleNotes(180, 30, 'hard')
            }
        ];
    }
    
    generateSampleNotes(bpm, duration, difficulty = 'easy') {
        const notes = [];
        const beatInterval = (60 / bpm) * 1000; // milliseconds per beat
        const totalBeats = Math.floor((duration * 1000) / beatInterval);
        
        let densityMultiplier = 1;
        if (difficulty === 'medium') densityMultiplier = 1.5;
        if (difficulty === 'hard') densityMultiplier = 2;
        
        for (let beat = 0; beat < totalBeats; beat++) {
            const time = beat * beatInterval;
            
            // Add notes based on beat patterns
            if (beat % 4 === 0) { // Strong beats
                notes.push({
                    time: time,
                    lane: Math.floor(Math.random() * this.lanes),
                    type: 'normal',
                    duration: 0
                });
            }
            
            if (difficulty !== 'easy' && beat % 2 === 1) { // Off-beats for medium/hard
                notes.push({
                    time: time,
                    lane: Math.floor(Math.random() * this.lanes),
                    type: 'normal',
                    duration: 0
                });
            }
            
            if (difficulty === 'hard' && Math.random() < 0.3) { // Extra notes for hard
                notes.push({
                    time: time + beatInterval / 2,
                    lane: Math.floor(Math.random() * this.lanes),
                    type: 'normal',
                    duration: 0
                });
            }
            
            // Add some hold notes
            if (Math.random() < 0.1 * densityMultiplier) {
                notes.push({
                    time: time,
                    lane: Math.floor(Math.random() * this.lanes),
                    type: 'hold',
                    duration: beatInterval * (1 + Math.floor(Math.random() * 3))
                });
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    initializeEventListeners() {
        // Menu buttons
        document.getElementById('playBtn').addEventListener('click', () => {
            if (this.selectedSong) {
                this.startGame();
            } else {
                this.showSongSelect();
            }
        });
        
        document.getElementById('songsBtn').addEventListener('click', () => this.showSongSelect());
        document.getElementById('backToMainBtn').addEventListener('click', () => this.showMainMenu());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('mainMenuBtn').addEventListener('click', () => this.showMainMenu());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('backToSongsBtn').addEventListener('click', () => this.showSongSelect());
        document.getElementById('backToMainMenuBtn').addEventListener('click', () => this.showMainMenu());
        
        // Touch/Click events for tap zones
        const tapZones = document.querySelectorAll('.tap-zone');
        tapZones.forEach((zone, index) => {
            // Mouse events
            zone.addEventListener('mousedown', (e) => this.handleTap(index, true));
            zone.addEventListener('mouseup', (e) => this.handleTap(index, false));
            
            // Touch events
            zone.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleTap(index, true);
            });
            zone.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleTap(index, false);
            });
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Prevent context menu on touch
        document.addEventListener('contextmenu', e => e.preventDefault());
    }
    
    handleKeyDown(e) {
        if (this.gameState !== 'playing') return;
        
        const keyMap = { 'KeyD': 0, 'KeyF': 1, 'KeyJ': 2, 'KeyK': 3 };
        if (keyMap[e.code] !== undefined && !this.keyPressed.has(e.code)) {
            this.keyPressed.add(e.code);
            this.handleTap(keyMap[e.code], true);
        }
        
        if (e.code === 'Space') {
            e.preventDefault();
            this.pauseGame();
        }
    }
    
    handleKeyUp(e) {
        if (this.gameState !== 'playing') return;
        
        const keyMap = { 'KeyD': 0, 'KeyF': 1, 'KeyJ': 2, 'KeyK': 3 };
        if (keyMap[e.code] !== undefined) {
            this.keyPressed.delete(e.code);
            this.handleTap(keyMap[e.code], false);
        }
    }
    
    handleTap(lane, isPressed) {
        if (this.gameState !== 'playing' || this.isPaused) return;
        
        const tapZone = document.querySelectorAll('.tap-zone')[lane];
        
        if (isPressed) {
            tapZone.classList.add('active');
            this.checkTileHit(lane);
        } else {
            tapZone.classList.remove('active');
            this.checkTileRelease(lane);
        }
    }
    
    populateSongList() {
        const songList = document.getElementById('songList');
        songList.innerHTML = '';
        
        this.songs.forEach(song => {
            const card = document.createElement('div');
            card.className = 'song-card';
            card.innerHTML = `
                <div class=\"song-title\">${song.title}</div>
                <div class=\"song-artist\">${song.artist}</div>
                <div class=\"song-difficulty\">Difficulty: ${song.difficulty} | BPM: ${song.bpm}</div>
            `;
            
            card.addEventListener('click', () => {
                document.querySelectorAll('.song-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedSong = song;
            });
            
            songList.appendChild(card);
        });
        
        // Select first song by default
        if (this.songs.length > 0) {
            songList.firstChild.classList.add('selected');
            this.selectedSong = this.songs[0];
        }
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
        this.stopAudio();
    }
    
    showSongSelect() {
        this.gameState = 'songSelect';
        this.showScreen('songMenu');
    }
    
    startGame() {
        if (!this.selectedSong) return;
        
        this.gameState = 'playing';
        this.showScreen('gameScreen');
        this.resetGame();
        this.loadSong(this.selectedSong);
        this.startAudio();
    }
    
    resetGame() {
        this.tiles = [];
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.totalNotes = 0;
        this.hitNotes = 0;
        this.startTime = performance.now();
        this.gameTime = 0;
        this.isPaused = false;
        this.updateUI();
    }
    
    loadSong(song) {
        this.currentSong = song;
        this.totalNotes = song.notes.length;
        
        // Create tiles from song notes
        song.notes.forEach(note => {
            this.tiles.push(new Tile(note.lane, note.time, note.type, note.duration));
        });
        
        // Generate background music (simple beep pattern)
        this.generateBackgroundMusic(song);
    }
    
    generateBackgroundMusic(song) {
        // Create a simple audio context for background beats
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const duration = song.duration;
            const bpm = song.bpm;
            const beatInterval = 60 / bpm;
            
            // This is a simplified version - in a real game you'd load actual audio files\n            this.playMetronome(audioCtx, beatInterval, duration);
        } catch (e) {
            console.log('Audio context not supported, playing without background music');
        }
    }
    
    playMetronome(audioCtx, beatInterval, duration) {
        let time = 0;
        const totalBeats = Math.floor(duration / beatInterval);
        
        for (let i = 0; i < totalBeats; i++) {
            setTimeout(() => {
                if (this.gameState === 'playing' && !this.isPaused) {
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    
                    oscillator.frequency.value = i % 4 === 0 ? 800 : 400; // Accent every 4th beat
                    oscillator.type = 'square';
                    
                    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
                    
                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 0.1);
                }
            }, i * beatInterval * 1000);
        }
    }
    
    startAudio() {
        // In a real implementation, you would load and play the actual audio file here
        this.startTime = performance.now();
    }
    
    stopAudio() {
        if (this.audio && !this.audio.paused) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
    }
    
    pauseGame() {
        if (this.gameState !== 'playing') return;
        this.isPaused = true;
        this.showScreen('pauseMenu');
        this.stopAudio();
    }
    
    resumeGame() {
        if (this.gameState !== 'playing') return;
        this.isPaused = false;
        this.showScreen('gameScreen');
        this.startTime = performance.now() - this.gameTime;
        this.startAudio();
    }
    
    restartGame() {
        this.startGame();
    }
    
    checkTileHit(lane) {
        const hitWindow = this.hitTolerance;
        let bestTile = null;
        let bestDistance = Infinity;
        
        // Find the closest tile in the hit zone for this lane
        for (const tile of this.tiles) {
            if (tile.lane === lane && !tile.hit && !tile.missed) {
                const distance = Math.abs(tile.y - this.hitZone);
                if (distance <= hitWindow && distance < bestDistance) {
                    bestTile = tile;
                    bestDistance = distance;
                }
            }
        }
        
        if (bestTile) {
            this.hitTile(bestTile, bestDistance);
        }
    }
    
    checkTileRelease(lane) {
        // Check for hold tile releases
        for (const tile of this.tiles) {
            if (tile.lane === lane && tile.type === 'hold' && tile.holding && !tile.missed) {
                if (performance.now() - this.startTime >= tile.time + tile.duration) {
                    tile.holding = false;
                    tile.hit = true;
                    this.addScore(100, 'Perfect Hold');
                    this.combo++;
                }
            }
        }
    }
    
    hitTile(tile, distance) {
        tile.hit = true;
        this.hitNotes++;
        
        // Calculate score based on accuracy
        let accuracy = 'Perfect';
        let points = 100;
        
        if (distance <= 10) {
            accuracy = 'Perfect';
            points = 100;
        } else if (distance <= 25) {
            accuracy = 'Great';
            points = 75;
        } else {
            accuracy = 'Good';
            points = 50;
        }
        
        if (tile.type === 'hold') {
            tile.holding = true;
            points *= 2; // Hold notes are worth more
        }
        
        this.addScore(points, accuracy);
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        
        // Visual feedback
        this.createHitEffect(tile.lane, accuracy);
    }
    
    createHitEffect(lane, accuracy) {
        // Add visual feedback for hits
        const effect = {
            lane: lane,
            accuracy: accuracy,
            time: performance.now(),
            duration: 500
        };
        
        // This would typically create a particle effect or animation
        console.log(`${accuracy} hit in lane ${lane}!`);
    }
    
    addScore(points, reason) {
        const comboMultiplier = Math.floor(this.combo / 10) + 1;
        this.score += points * comboMultiplier;
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('combo').textContent = this.combo;
        
        const accuracy = this.totalNotes > 0 ? Math.round((this.hitNotes / this.totalNotes) * 100) : 100;
        document.getElementById('accuracy').textContent = accuracy + '%';
    }
    
    update() {
        if (this.gameState !== 'playing' || this.isPaused) return;
        
        this.gameTime = performance.now() - this.startTime;
        
        // Update tiles
        for (const tile of this.tiles) {
            tile.update(this.gameTime, this.fallSpeed);
            
            // Check for missed tiles
            if (!tile.hit && !tile.missed && tile.y > this.hitZone + this.hitTolerance) {
                tile.missed = true;
                this.combo = 0; // Reset combo on miss
                console.log(`Missed tile in lane ${tile.lane}`);
            }
        }
        
        // Remove old tiles
        this.tiles = this.tiles.filter(tile => 
            tile.y < this.canvas.height + 100 && 
            (tile.time + tile.duration + 2000) > this.gameTime
        );
        
        // Check for game end
        if (this.currentSong && this.gameTime > this.currentSong.duration * 1000 + 3000) {
            this.endGame();
        }
    }
    
    endGame() {
        this.gameState = 'gameOver';
        this.showScreen('gameOverScreen');
        this.stopAudio();
        
        // Calculate final stats
        const finalAccuracy = this.totalNotes > 0 ? Math.round((this.hitNotes / this.totalNotes) * 100) : 0;
        const grade = this.calculateGrade(finalAccuracy);
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('maxCombo').textContent = this.maxCombo;
        document.getElementById('finalAccuracy').textContent = finalAccuracy + '%';
        
        const gradeElement = document.getElementById('grade');
        gradeElement.textContent = grade;
        gradeElement.className = `grade-${grade}`;
    }
    
    calculateGrade(accuracy) {
        if (accuracy >= 95) return 'S';
        if (accuracy >= 90) return 'A';
        if (accuracy >= 80) return 'B';
        if (accuracy >= 70) return 'C';
        if (accuracy >= 60) return 'D';
        return 'F';
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState !== 'playing') return;
        
        // Draw lane dividers
        this.drawLanes();
        
        // Draw hit zone
        this.drawHitZone();
        
        // Draw tiles
        for (const tile of this.tiles) {
            if (tile.shouldRender(this.gameTime)) {
                tile.draw(this.ctx, this.laneWidth);
            }
        }
        
        // Draw UI effects
        this.drawEffects();
    }
    
    drawLanes() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        
        for (let i = 1; i < this.lanes; i++) {
            const x = i * this.laneWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
    }
    
    drawHitZone() {
        // Draw the target line where tiles should be tapped
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.hitZone);
        this.ctx.lineTo(this.canvas.width, this.hitZone);
        this.ctx.stroke();
        
        // Draw hit zone background
        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
        this.ctx.fillRect(0, this.hitZone - this.hitTolerance, this.canvas.width, this.hitTolerance * 2);
    }
    
    drawEffects() {
        // Draw combo text
        if (this.combo > 5) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${this.combo} COMBO!`, this.canvas.width / 2, 100);
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Tile class representing falling notes
class Tile {
    constructor(lane, time, type = 'normal', duration = 0) {
        this.lane = lane;
        this.time = time; // When the tile should be hit (milliseconds)
        this.type = type; // 'normal' or 'hold'
        this.duration = duration; // For hold notes (milliseconds)
        this.y = -50; // Start above screen
        this.hit = false;
        this.missed = false;
        this.holding = false; // For hold notes
        this.alpha = 1;
    }
    
    update(gameTime, fallSpeed) {
        // Calculate position based on timing
        const timeUntilHit = this.time - gameTime;
        const fallDistance = 600; // Distance from spawn to hit zone
        const fallTime = fallDistance / fallSpeed; // Time to fall (roughly)
        
        this.y = 500 - (timeUntilHit / fallTime) * fallDistance;
        
        // Fade out if missed
        if (this.missed) {
            this.alpha = Math.max(0, this.alpha - 0.05);
        }
    }
    
    shouldRender(gameTime) {
        return gameTime >= this.time - 3000 && !this.hit; // Show 3 seconds before hit time
    }
    
    draw(ctx, laneWidth) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        const x = this.lane * laneWidth + 10;
        const width = laneWidth - 20;
        const height = this.type === 'hold' ? Math.max(40, this.duration / 10) : 40;
        
        // Draw tile based on type
        if (this.type === 'hold') {
            // Hold note - longer gradient tile
            const gradient = ctx.createLinearGradient(x, this.y - height, x, this.y);
            gradient.addColorStop(0, '#00BFFF');
            gradient.addColorStop(0.5, '#0080FF');
            gradient.addColorStop(1, '#0040FF');
            ctx.fillStyle = gradient;
            
            // Draw hold note body
            ctx.fillRect(x, this.y - height, width, height);
            
            // Draw hold note borders
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, this.y - height, width, height);
            
            // Draw hold indicator
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('HOLD', x + width/2, this.y - height/2 + 5);
        } else {
            // Normal note - gradient blue tile
            const gradient = ctx.createLinearGradient(x, this.y - height, x, this.y);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(0.5, '#4682B4');
            gradient.addColorStop(1, '#191970');
            ctx.fillStyle = gradient;
            
            // Draw normal tile
            ctx.fillRect(x, this.y - height, width, height);
            
            // Draw border
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, this.y - height, width, height);
        }
        
        // Draw hit/miss feedback
        if (this.hit || this.missed) {
            ctx.fillStyle = this.hit ? '#00FF00' : '#FF0000';
            ctx.globalAlpha = 0.7;
            ctx.fillRect(x, this.y - height, width, height);
        }
        
        ctx.restore();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MagicTilesGame();
});