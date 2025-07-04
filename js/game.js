// Magic Tiles - Rhythm Game
class MagicTilesGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.audio = document.getElementById('gameAudio');
        
        // Game state
        this.gameState = 'menu'; // menu, songSelect, playing, paused, gameOver, waitingToStart
        this.selectedSong = null;
        this.currentSong = null;
        this.hasStarted = false;
        
        // Game settings
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.lanes = 4;
        this.laneWidth = this.canvas.width / this.lanes;
        this.fallSpeed = 0.8; // Much slower fall speed
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
        this.speedMultiplier = 1.0; // For song repeats
        this.songRepeats = 0;
        this.gameOverReason = '';
        
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
            // Royalty-Free Pop Songs (inspired by current hits)
            {
                id: 'pop1',
                title: 'Summer Vibes',
                artist: 'Sunny Day',
                genre: 'Pop',
                difficulty: 'Easy',
                bpm: 120,
                duration: 180,
                audioFile: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // placeholder
                notes: this.getSummerVibesNotes()
            },
            {
                id: 'pop2',
                title: 'Electric Dreams',
                artist: 'Neon Lights',
                genre: 'Pop',
                difficulty: 'Medium',
                bpm: 128,
                duration: 200,
                audioFile: null,
                notes: this.getElectricDreamsNotes()
            },
            {
                id: 'pop3',
                title: 'Midnight City',
                artist: 'Urban Echo',
                genre: 'Pop',
                difficulty: 'Hard',
                bpm: 140,
                duration: 220,
                audioFile: null,
                notes: this.getMidnightCityNotes()
            },
            {
                id: 'pop4',
                title: 'Neon Nights',
                artist: 'Crystal Pop',
                genre: 'Pop',
                difficulty: 'Medium',
                bpm: 125,
                duration: 195,
                audioFile: null,
                notes: this.getNeonNightsNotes()
            },
            {
                id: 'pop5',
                title: 'Starlight Dance',
                artist: 'Pop Galaxy',
                genre: 'Pop',
                difficulty: 'Hard',
                bpm: 135,
                duration: 210,
                audioFile: null,
                notes: this.getStarlightDanceNotes()
            },
            
            // Hip-Hop Tracks (royalty-free style)
            {
                id: 'hiphop1',
                title: 'Street Rhythm',
                artist: 'Beat Master',
                genre: 'Hip-Hop',
                difficulty: 'Medium',
                bpm: 90,
                duration: 180,
                audioFile: null,
                notes: this.getStreetRhythmNotes()
            },
            {
                id: 'hiphop2',
                title: 'Underground Flow',
                artist: 'MC Freestyle',
                genre: 'Hip-Hop',
                difficulty: 'Hard',
                bpm: 95,
                duration: 200,
                audioFile: null,
                notes: this.getUndergroundFlowNotes()
            },
            {
                id: 'hiphop3',
                title: 'City Lights',
                artist: 'Urban Prophet',
                genre: 'Hip-Hop',
                difficulty: 'Easy',
                bpm: 88,
                duration: 175,
                audioFile: null,
                notes: this.getCityLightsNotes()
            },
            {
                id: 'hiphop4',
                title: 'Boom Bap Classic',
                artist: 'Old School MC',
                genre: 'Hip-Hop',
                difficulty: 'Medium',
                bpm: 92,
                duration: 190,
                audioFile: null,
                notes: this.getBoomBapClassicNotes()
            },
            
            // Electronic Dance Music
            {
                id: 'edm1',
                title: 'Digital Pulse',
                artist: 'Synth Wave',
                genre: 'Electronic',
                difficulty: 'Medium',
                bpm: 130,
                duration: 240,
                audioFile: null,
                notes: this.getDigitalPulseNotes()
            },
            {
                id: 'edm2',
                title: 'Bass Revolution',
                artist: 'Drop Zone',
                genre: 'Electronic',
                difficulty: 'Hard',
                bpm: 140,
                duration: 280,
                audioFile: null,
                notes: this.getBassRevolutionNotes()
            },
            {
                id: 'edm3',
                title: 'Cyber Dreams',
                artist: 'Neon Wave',
                genre: 'Electronic',
                difficulty: 'Easy',
                bpm: 120,
                duration: 220,
                audioFile: null,
                notes: this.getCyberDreamsNotes()
            },
            {
                id: 'edm4',
                title: 'Festival Anthem',
                artist: 'Main Stage',
                genre: 'Electronic',
                difficulty: 'Hard',
                bpm: 128,
                duration: 300,
                audioFile: null,
                notes: this.getFestivalAnthemNotes()
            },
            
            // Indie/Alternative (royalty-free)
            {
                id: 'indie1',
                title: 'Coffee Shop Dreams',
                artist: 'Acoustic Soul',
                genre: 'Indie',
                difficulty: 'Easy',
                bpm: 110,
                duration: 200,
                audioFile: null,
                notes: this.getCoffeeShopDreamsNotes()
            },
            {
                id: 'indie2',
                title: 'Road Trip Anthem',
                artist: 'Open Highway',
                genre: 'Indie',
                difficulty: 'Medium',
                bpm: 120,
                duration: 220,
                audioFile: null,
                notes: this.getRoadTripAnthemNotes()
            },
            {
                id: 'indie3',
                title: 'Sunset Boulevard',
                artist: 'Vintage Soul',
                genre: 'Indie',
                difficulty: 'Medium',
                bpm: 115,
                duration: 240,
                audioFile: null,
                notes: this.getSunsetBoulevardNotes()
            },
            {
                id: 'indie4',
                title: 'Midnight Train',
                artist: 'Folk Electric',
                genre: 'Indie',
                difficulty: 'Hard',
                bpm: 130,
                duration: 250,
                audioFile: null,
                notes: this.getMidnightTrainNotes()
            },
            
            // Rock (inspired by popular rock)
            {
                id: 'rock1',
                title: 'Thunder Strike',
                artist: 'Electric Storm',
                genre: 'Rock',
                difficulty: 'Medium',
                bpm: 125,
                duration: 200,
                audioFile: null,
                notes: this.getThunderStrikeNotes()
            },
            {
                id: 'rock2',
                title: 'Fire Mountain',
                artist: 'Metal Core',
                genre: 'Rock',
                difficulty: 'Hard',
                bpm: 160,
                duration: 240,
                audioFile: null,
                notes: this.getFireMountainNotes()
            },
            {
                id: 'rock3',
                title: 'Electric Highway',
                artist: 'Power Drive',
                genre: 'Rock',
                difficulty: 'Easy',
                bpm: 110,
                duration: 200,
                audioFile: null,
                notes: this.getElectricHighwayNotes()
            },
            {
                id: 'rock4',
                title: 'Metal Storm',
                artist: 'Iron Thunder',
                genre: 'Rock',
                difficulty: 'Hard',
                bpm: 150,
                duration: 260,
                audioFile: null,
                notes: this.getMetalStormNotes()
            },
            
            // World/Fusion Music
            {
                id: 'world1',
                title: 'Mystic Journey',
                artist: 'World Fusion',
                genre: 'World',
                difficulty: 'Medium',
                bpm: 115,
                duration: 250,
                audioFile: null,
                notes: this.getMysticJourneyNotes()
            },
            {
                id: 'world2',
                title: 'Desert Winds',
                artist: 'Ethnic Beats',
                genre: 'World',
                difficulty: 'Hard',
                bpm: 130,
                duration: 280,
                audioFile: null,
                notes: this.getDesertWindsNotes()
            },
            {
                id: 'world3',
                title: 'Temple Bells',
                artist: 'Sacred Sound',
                genre: 'World',
                difficulty: 'Easy',
                bpm: 100,
                duration: 230,
                audioFile: null,
                notes: this.getTempleBellsNotes()
            },
            {
                id: 'world4',
                title: 'Tribal Dance',
                artist: 'Ancient Rhythm',
                genre: 'World',
                difficulty: 'Medium',
                bpm: 125,
                duration: 270,
                audioFile: null,
                notes: this.getTribalDanceNotes()
            },
            
            // Lo-Fi Hip Hop (very popular genre)
            {
                id: 'lofi1',
                title: 'Study Session',
                artist: 'Chill Beats',
                genre: 'Lo-Fi',
                difficulty: 'Easy',
                bpm: 85,
                duration: 180,
                audioFile: null,
                notes: this.getStudySessionNotes()
            },
            {
                id: 'lofi2',
                title: 'Rainy Day Vibes',
                artist: 'Lazy Sunday',
                genre: 'Lo-Fi',
                difficulty: 'Medium',
                bpm: 90,
                duration: 200,
                audioFile: null,
                notes: this.getRainyDayVibesNotes()
            },
            {
                id: 'lofi3',
                title: 'Late Night Study',
                artist: 'Mellow Beats',
                genre: 'Lo-Fi',
                difficulty: 'Easy',
                bpm: 80,
                duration: 180,
                audioFile: null,
                notes: this.getLateNightStudyNotes()
            },
            {
                id: 'lofi4',
                title: 'Tokyo Nights',
                artist: 'City Chill',
                genre: 'Lo-Fi',
                difficulty: 'Medium',
                bpm: 95,
                duration: 220,
                audioFile: null,
                notes: this.getTokyoNightsNotes()
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
    
    // Royalty-Free Song Patterns
    getSummerVibesNotes() {
        // Easy pop song with random lane distribution
        const beat = 500; // 120 BPM
        const notes = [];
        
        // Create a basic rhythm pattern but randomize lanes
        for (let i = 0; i < 72; i++) {
            // Main beats (every beat)
            if (i % 4 === 0) {
                notes.push({ time: i * beat, lane: Math.floor(Math.random() * 4), type: 'normal', duration: 0 });
            }
            // Off-beats (every other beat)
            if (i % 4 === 2) {
                notes.push({ time: i * beat, lane: Math.floor(Math.random() * 4), type: 'normal', duration: 0 });
            }
            // Additional notes for complexity
            if (i % 8 === 5 && Math.random() > 0.3) {
                notes.push({ time: i * beat, lane: Math.floor(Math.random() * 4), type: 'normal', duration: 0 });
            }
            // Random hold notes
            if (i % 12 === 7 && Math.random() > 0.6) {
                notes.push({ time: i * beat, lane: Math.floor(Math.random() * 4), type: 'hold', duration: beat * 3 });
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    getElectricDreamsNotes() {
        // Medium synthwave with random lanes
        const beat = 468; // 128 BPM
        const notes = [];
        
        // Create rhythm pattern with random lane distribution
        for (let i = 0; i < 85; i++) {
            // Main beats
            if (i % 4 === 0) {
                notes.push({ time: i * beat, lane: Math.floor(Math.random() * 4), type: 'normal', duration: 0 });
            }
            // Backbeats
            if (i % 4 === 2) {
                notes.push({ time: i * beat, lane: Math.floor(Math.random() * 4), type: 'normal', duration: 0 });
            }
            // Sixteenth notes (more complex)
            if (i % 2 === 1 && Math.random() > 0.4) {
                notes.push({ time: i * beat, lane: Math.floor(Math.random() * 4), type: 'normal', duration: 0 });
            }
            // Random holds
            if (i % 16 === 11 && Math.random() > 0.5) {
                notes.push({ time: i * beat, lane: Math.floor(Math.random() * 4), type: 'hold', duration: beat * 2 });
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    getMidnightCityNotes() {
        // Hard pop with complex patterns
        const beat = 428; // 140 BPM
        const notes = [];
        
        for (let i = 0; i < 80; i++) {
            // Complex drum pattern
            if (i % 4 === 0) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 4 === 2) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            if (i % 8 === 3 || i % 8 === 7) notes.push({ time: i * beat, lane: 2, type: 'normal', duration: 0 });
            
            // Rapid synth patterns
            if (i >= 32 && i < 64 && i % 2 === 0) {
                notes.push({ time: i * beat + beat/2, lane: 3, type: 'normal', duration: 0 });
            }
            
            // Climax holds
            if (i % 16 === 15) {
                notes.push({ time: i * beat, lane: Math.floor(Math.random() * 4), type: 'hold', duration: beat * 2 });
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    getStreetRhythmNotes() {
        // Hip-hop with random lane distribution
        const beat = 666; // 90 BPM
        const notes = [];
        
        // Create hip-hop rhythm with random lanes
        for (let i = 0; i < 60; i++) {
            // Strong beats
            if (i % 4 === 0) {
                notes.push({ time: i * beat, lane: Math.floor(Math.random() * 4), type: 'normal', duration: 0 });
            }
            // Backbeats
            if (i % 4 === 2) {
                notes.push({ time: i * beat, lane: Math.floor(Math.random() * 4), type: 'normal', duration: 0 });
            }
            // Syncopated hits
            if (i % 8 === 5 && Math.random() > 0.3) {
                notes.push({ time: i * beat, lane: Math.floor(Math.random() * 4), type: 'normal', duration: 0 });
            }
            // Hi-hat patterns
            if (i % 2 === 1 && Math.random() > 0.5) {
                notes.push({ time: i * beat + beat/3, lane: Math.floor(Math.random() * 4), type: 'normal', duration: 0 });
            }
            // Random holds
            if (i % 16 === 13 && Math.random() > 0.7) {
                notes.push({ time: i * beat, lane: Math.floor(Math.random() * 4), type: 'hold', duration: beat * 2 });
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    getUndergroundFlowNotes() {
        // Complex hip-hop with triplets
        const beat = 631; // 95 BPM
        const notes = [];
        
        for (let i = 0; i < 60; i++) {
            // Heavy kick
            if (i % 4 === 0) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            
            // Snare with ghost notes
            if (i % 4 === 1 || i % 4 === 3) {
                notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
                if (i % 8 === 3) notes.push({ time: i * beat + beat/4, lane: 2, type: 'normal', duration: 0 });
            }
            
            // Rapid hi-hats and triplets
            if (i % 8 === 7) {
                for (let j = 0; j < 3; j++) {
                    notes.push({ time: i * beat + (beat/3) * j, lane: 3, type: 'normal', duration: 0 });
                }
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    // EDM Songs
    getDigitalPulseNotes() {
        const beat = 461; // 130 BPM
        const notes = [];
        
        // Ambient intro
        for (let i = 0; i < 16; i++) {
            if (i % 8 === 0) notes.push({ time: i * beat, lane: 1, type: 'hold', duration: beat * 4 });
            if (i % 6 === 3) notes.push({ time: i * beat, lane: 3, type: 'normal', duration: 0 });
        }
        
        // Build-up with increasing intensity
        for (let i = 16; i < 48; i++) {
            // Four on the floor kick
            if (i % 4 === 0) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            // Gradual addition of elements
            if (i >= 24 && i % 4 === 2) notes.push({ time: i * beat, lane: 2, type: 'normal', duration: 0 });
            if (i >= 32 && i % 2 === 1) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            if (i >= 40 && i % 2 === 0) notes.push({ time: i * beat + beat/2, lane: 3, type: 'normal', duration: 0 });
        }
        
        // Main drop - complex patterns
        for (let i = 48; i < 80; i++) {
            // Pumping bass
            if (i % 2 === 0) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            // Synth stabs
            if (i % 4 === 1) notes.push({ time: i * beat, lane: 2, type: 'normal', duration: 0 });
            // Melodic line
            const melodyPattern = [1, 3, 2, 1, 3, 1, 2, 3];
            if (i % 2 === 1) notes.push({ time: i * beat + beat/2, lane: melodyPattern[i % 8], type: 'normal', duration: 0 });
        }
        
        // Breakdown and rebuild
        for (let i = 80; i < 112; i++) {
            if (i < 88) {
                // Sparse breakdown
                if (i % 8 === 0) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
                if (i % 8 === 4) notes.push({ time: i * beat, lane: 2, type: 'normal', duration: 0 });
            } else {
                // Final buildup
                if (i % 2 === 0) notes.push({ time: i * beat, lane: (i % 4), type: 'normal', duration: 0 });
                if (i % 4 === 3) notes.push({ time: i * beat + beat/3, lane: 3, type: 'normal', duration: 0 });
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    getBassRevolutionNotes() {
        const beat = 428; // 140 BPM
        const notes = [];
        
        for (let i = 0; i < 112; i++) {
            // Heavy kick pattern
            if (i % 4 === 0) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            
            // Complex EDM patterns
            if (i % 8 === 2 || i % 8 === 6) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            
            // Rapid fire sections
            if (i >= 48 && i < 80 && i % 2 === 0) {
                notes.push({ time: i * beat + beat/2, lane: 2, type: 'normal', duration: 0 });
            }
            
            // Bass drops
            if (i % 32 === 31) {
                for (let j = 0; j < 4; j++) {
                    notes.push({ time: i * beat + (beat/4) * j, lane: j, type: 'normal', duration: 0 });
                }
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    // Indie Songs
    getCoffeeShopDreamsNotes() {
        const beat = 545; // 110 BPM
        const notes = [];
        
        // Gentle acoustic fingerpicking intro
        const fingerpickPattern = [0, 2, 1, 2, 0, 1, 2, 1];
        for (let i = 0; i < 16; i++) {
            if (i % 2 === 0) notes.push({ time: i * beat, lane: fingerpickPattern[i % 8], type: 'normal', duration: 0 });
        }
        
        // Verse with soft rhythm
        for (let i = 16; i < 32; i++) {
            // Bass notes
            if (i % 4 === 0) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            // Melody
            if (i % 6 === 2) notes.push({ time: i * beat, lane: 2, type: 'normal', duration: 0 });
            if (i % 8 === 5) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            // Sustained chords
            if (i % 8 === 7) notes.push({ time: i * beat, lane: 3, type: 'hold', duration: beat * 3 });
        }
        
        // Chorus with more energy
        for (let i = 32; i < 48; i++) {
            if (i % 2 === 0) notes.push({ time: i * beat, lane: (i % 4), type: 'normal', duration: 0 });
            if (i % 4 === 1) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            if (i % 8 === 6) notes.push({ time: i * beat, lane: 2, type: 'hold', duration: beat * 2 });
        }
        
        // Bridge - sparse and emotional
        for (let i = 48; i < 56; i++) {
            if (i % 4 === 0) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 6 === 3) notes.push({ time: i * beat + beat/2, lane: 2, type: 'normal', duration: 0 });
            if (i === 54) notes.push({ time: i * beat, lane: 1, type: 'hold', duration: beat * 4 });
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    getRoadTripAnthemNotes() {
        const beat = 500; // 120 BPM
        const notes = [];
        
        for (let i = 0; i < 56; i++) {
            // Driving indie rock pattern
            if (i % 4 === 0) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 4 === 2) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            if (i % 8 === 3 || i % 8 === 7) notes.push({ time: i * beat, lane: 2, type: 'normal', duration: 0 });
            
            // Guitar solos
            if (i >= 32 && i % 2 === 1) {
                notes.push({ time: i * beat + beat/3, lane: 3, type: 'normal', duration: 0 });
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    // Rock Songs
    getThunderStrikeNotes() {
        const beat = 480; // 125 BPM
        const notes = [];
        
        for (let i = 0; i < 50; i++) {
            // Rock pattern with power chords
            if (i % 4 === 0 || i % 4 === 2) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 4 === 1 || i % 4 === 3) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            
            // Guitar riffs
            if (i % 8 === 4 || i % 8 === 6) {
                notes.push({ time: i * beat, lane: 2, type: 'normal', duration: 0 });
                notes.push({ time: i * beat + beat/2, lane: 3, type: 'normal', duration: 0 });
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    getFireMountainNotes() {
        const beat = 375; // 160 BPM
        const notes = [];
        
        for (let i = 0; i < 96; i++) {
            // Fast metal patterns
            if (i % 2 === 0) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 4 === 1 || i % 4 === 3) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            
            // Double bass and rapid patterns
            if (i % 8 === 4) {
                for (let j = 0; j < 4; j++) {
                    notes.push({ time: i * beat + (beat/4) * j, lane: (2 + j % 2), type: 'normal', duration: 0 });
                }
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    // World Music
    getMysticJourneyNotes() {
        const beat = 521; // 115 BPM
        const notes = [];
        
        for (let i = 0; i < 60; i++) {
            // Ethnic rhythm patterns
            if (i % 6 === 0 || i % 6 === 2 || i % 6 === 4) {
                notes.push({ time: i * beat, lane: (i % 6) / 2, type: 'normal', duration: 0 });
            }
            // Sustained ethnic instruments
            if (i % 12 === 8) {
                notes.push({ time: i * beat, lane: 3, type: 'hold', duration: beat * 4 });
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    getDesertWindsNotes() {
        const beat = 461; // 130 BPM
        const notes = [];
        
        for (let i = 0; i < 84; i++) {
            // Complex world fusion
            if (i % 5 === 0) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 7 === 3) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            if (i % 9 === 6) notes.push({ time: i * beat, lane: 2, type: 'normal', duration: 0 });
            
            // Ornamental patterns
            if (i % 16 === 12) {
                for (let j = 0; j < 3; j++) {
                    notes.push({ time: i * beat + (beat/3) * j, lane: 3, type: 'normal', duration: 0 });
                }
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    // Lo-Fi Hip Hop
    getStudySessionNotes() {
        const beat = 705; // 85 BPM
        const notes = [];
        
        for (let i = 0; i < 36; i++) {
            // Chill lo-fi pattern
            if (i % 8 === 0 || i % 8 === 6) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 8 === 2) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            if (i % 16 === 10) notes.push({ time: i * beat, lane: 2, type: 'hold', duration: beat * 4 });
            
            // Vinyl crackle simulation
            if (i % 12 === 8) notes.push({ time: i * beat + beat/4, lane: 3, type: 'normal', duration: 0 });
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    getRainyDayVibesNotes() {
        const beat = 666; // 90 BPM
        const notes = [];
        
        for (let i = 0; i < 45; i++) {
            // Relaxed lo-fi with jazz influence
            if (i % 6 === 0 || i % 6 === 4) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 8 === 3) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            if (i % 12 === 7) notes.push({ time: i * beat + beat/3, lane: 2, type: 'normal', duration: 0 });
            
            // Ambient pads
            if (i % 16 === 15) notes.push({ time: i * beat, lane: 3, type: 'hold', duration: beat * 6 });
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    // Additional Pop Songs
    getNeonNightsNotes() {
        const beat = 480; // 125 BPM
        const notes = [];
        
        for (let i = 0; i < 58; i++) {
            // Synthwave-inspired pattern
            if (i % 8 === 0 || i % 8 === 4) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 8 === 2 || i % 8 === 6) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            if (i % 16 === 10 || i % 16 === 14) notes.push({ time: i * beat, lane: 2, type: 'normal', duration: 0 });
            
            // Neon arpeggios
            if (i >= 32 && i % 4 === 1) {
                notes.push({ time: i * beat + beat/4, lane: 3, type: 'normal', duration: 0 });
            }
            
            if (i % 32 === 31) notes.push({ time: i * beat, lane: 2, type: 'hold', duration: beat * 2 });
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    getStarlightDanceNotes() {
        const beat = 444; // 135 BPM
        const notes = [];
        
        for (let i = 0; i < 70; i++) {
            // Energetic dance pattern
            if (i % 4 === 0) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 4 === 2) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            if (i % 8 === 3 || i % 8 === 7) notes.push({ time: i * beat, lane: 2, type: 'normal', duration: 0 });
            
            // Fast synth runs
            if (i >= 48 && i % 2 === 0) {
                notes.push({ time: i * beat + beat/2, lane: 3, type: 'normal', duration: 0 });
            }
            
            // Build-up holds
            if (i % 16 === 15 && i >= 32) {
                notes.push({ time: i * beat, lane: Math.floor(Math.random() * 4), type: 'hold', duration: beat * 3 });
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    // Additional Hip-Hop Songs
    getCityLightsNotes() {
        const beat = 681; // 88 BPM
        const notes = [];
        
        for (let i = 0; i < 42; i++) {
            // Chill hip-hop pattern
            if (i % 8 === 0 || i % 8 === 6) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 8 === 2) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            if (i % 4 === 3) notes.push({ time: i * beat + beat/3, lane: 2, type: 'normal', duration: 0 });
            
            // Jazz samples
            if (i % 16 === 12) notes.push({ time: i * beat, lane: 3, type: 'hold', duration: beat * 2 });
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    getBoomBapClassicNotes() {
        const beat = 652; // 92 BPM
        const notes = [];
        
        for (let i = 0; i < 52; i++) {
            // Classic boom-bap
            if (i % 4 === 0) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 4 === 1 || i % 4 === 3) {
                notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
                notes.push({ time: i * beat, lane: 2, type: 'normal', duration: 0 });
            }
            
            // Scratch samples
            if (i % 16 === 8) {
                for (let j = 0; j < 2; j++) {
                    notes.push({ time: i * beat + (beat/2) * j, lane: 3, type: 'normal', duration: 0 });
                }
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    // Additional EDM Songs
    getCyberDreamsNotes() {
        const beat = 500; // 120 BPM
        const notes = [];
        
        for (let i = 0; i < 52; i++) {
            // Ambient EDM start
            if (i % 8 === 0) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 16 === 8) notes.push({ time: i * beat, lane: 1, type: 'hold', duration: beat * 4 });
            
            // Gradual build-up
            if (i >= 24) {
                if (i % 4 === 2) notes.push({ time: i * beat, lane: 2, type: 'normal', duration: 0 });
                if (i % 8 === 6) notes.push({ time: i * beat + beat/2, lane: 3, type: 'normal', duration: 0 });
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    getFestivalAnthemNotes() {
        const beat = 468; // 128 BPM
        const notes = [];
        
        for (let i = 0; i < 96; i++) {
            // Festival main stage energy
            if (i % 4 === 0) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            
            // Complex festival patterns
            if (i >= 32) {
                if (i % 2 === 1) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
                if (i % 8 === 4) notes.push({ time: i * beat, lane: 2, type: 'normal', duration: 0 });
            }
            
            // Festival drops
            if (i >= 64 && i % 4 === 0) {
                notes.push({ time: i * beat + beat/2, lane: 3, type: 'normal', duration: 0 });
            }
            
            // Epic holds
            if (i % 32 === 31) {
                notes.push({ time: i * beat, lane: 2, type: 'hold', duration: beat * 4 });
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    // Additional Indie Songs
    getSunsetBoulevardNotes() {
        const beat = 521; // 115 BPM
        const notes = [];
        
        for (let i = 0; i < 55; i++) {
            // Dreamy indie pattern
            if (i % 6 === 0 || i % 6 === 4) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 8 === 2) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            if (i % 12 === 8) notes.push({ time: i * beat, lane: 2, type: 'hold', duration: beat * 3 });
            
            // Guitar arpeggios
            if (i >= 32 && i % 4 === 1) {
                notes.push({ time: i * beat + beat/3, lane: 3, type: 'normal', duration: 0 });
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    getMidnightTrainNotes() {
        const beat = 461; // 130 BPM
        const notes = [];
        
        for (let i = 0; i < 65; i++) {
            // Folk-rock with electric elements
            if (i % 4 === 0 || i % 4 === 2) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 8 === 3 || i % 8 === 7) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            
            // Electric guitar solos
            if (i >= 40 && i % 2 === 1) {
                notes.push({ time: i * beat, lane: 2, type: 'normal', duration: 0 });
                notes.push({ time: i * beat + beat/2, lane: 3, type: 'normal', duration: 0 });
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    // Additional Rock Songs
    getElectricHighwayNotes() {
        const beat = 545; // 110 BPM
        const notes = [];
        
        for (let i = 0; i < 44; i++) {
            // Classic rock cruising pattern
            if (i % 4 === 0) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 8 === 4) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            if (i % 8 === 2 || i % 8 === 6) notes.push({ time: i * beat, lane: 2, type: 'normal', duration: 0 });
            
            // Guitar solos
            if (i % 16 === 12) {
                for (let j = 0; j < 3; j++) {
                    notes.push({ time: i * beat + (beat/3) * j, lane: 3, type: 'normal', duration: 0 });
                }
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    getMetalStormNotes() {
        const beat = 400; // 150 BPM
        const notes = [];
        
        for (let i = 0; i < 98; i++) {
            // Aggressive metal patterns
            if (i % 2 === 0) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 4 === 1) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            
            // Blast beats and complex patterns
            if (i % 8 === 4) {
                for (let j = 0; j < 4; j++) {
                    notes.push({ time: i * beat + (beat/4) * j, lane: (2 + j % 2), type: 'normal', duration: 0 });
                }
            }
            
            // Breakdown sections
            if (i % 32 >= 24 && i % 32 < 32) {
                notes.push({ time: i * beat, lane: 3, type: 'normal', duration: 0 });
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    // Additional World Music Songs
    getTempleBellsNotes() {
        const beat = 600; // 100 BPM
        const notes = [];
        
        for (let i = 0; i < 46; i++) {
            // Meditative temple pattern
            if (i % 8 === 0) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 12 === 4) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            if (i % 16 === 8) notes.push({ time: i * beat, lane: 2, type: 'hold', duration: beat * 6 });
            
            // Bell resonances
            if (i % 24 === 18) {
                notes.push({ time: i * beat + beat/2, lane: 3, type: 'normal', duration: 0 });
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    getTribalDanceNotes() {
        const beat = 480; // 125 BPM
        const notes = [];
        
        for (let i = 0; i < 68; i++) {
            // Tribal drum patterns
            if (i % 6 === 0 || i % 6 === 3) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 8 === 2 || i % 8 === 6) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            if (i % 12 === 8) notes.push({ time: i * beat, lane: 2, type: 'normal', duration: 0 });
            
            // Polyrhythmic elements
            if (i % 7 === 5) notes.push({ time: i * beat + beat/3, lane: 3, type: 'normal', duration: 0 });
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    // Additional Lo-Fi Songs
    getLateNightStudyNotes() {
        const beat = 750; // 80 BPM
        const notes = [];
        
        for (let i = 0; i < 32; i++) {
            // Very chill lo-fi
            if (i % 12 === 0) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 16 === 8) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            if (i % 20 === 16) notes.push({ time: i * beat, lane: 2, type: 'hold', duration: beat * 6 });
            
            // Minimal elements
            if (i % 24 === 20) notes.push({ time: i * beat + beat/2, lane: 3, type: 'normal', duration: 0 });
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    getTokyoNightsNotes() {
        const beat = 631; // 95 BPM
        const notes = [];
        
        for (let i = 0; i < 52; i++) {
            // Japanese-influenced lo-fi
            if (i % 8 === 0 || i % 8 === 5) notes.push({ time: i * beat, lane: 0, type: 'normal', duration: 0 });
            if (i % 10 === 3) notes.push({ time: i * beat, lane: 1, type: 'normal', duration: 0 });
            if (i % 14 === 9) notes.push({ time: i * beat + beat/4, lane: 2, type: 'normal', duration: 0 });
            
            // Koto-inspired patterns
            if (i % 16 === 12) {
                for (let j = 0; j < 3; j++) {
                    notes.push({ time: i * beat + (beat/5) * j, lane: 3, type: 'normal', duration: 0 });
                }
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    // Hip-Hop Patterns - Heavy on 2 and 4, with triplets
    getHipHopPattern(bpm, duration, difficulty) {
        const notes = [];
        const beatInterval = (60 / bpm) * 1000;
        const totalBeats = Math.floor((duration * 1000) / beatInterval);
        
        for (let beat = 0; beat < totalBeats; beat++) {
            const time = beat * beatInterval;
            
            // Heavy emphasis on 2 and 4 (snare pattern)
            if (beat % 4 === 1 || beat % 4 === 3) {
                notes.push({ time, lane: 1, type: 'normal', duration: 0 });
                notes.push({ time, lane: 2, type: 'normal', duration: 0 });
            }
            
            // Kick on 1 and 3
            if (beat % 4 === 0 || beat % 4 === 2) {
                notes.push({ time, lane: 0, type: 'normal', duration: 0 });
            }
            
            // Hi-hat and rapid patterns
            if (difficulty === 'hard') {
                for (let i = 0; i < 4; i++) {
                    if (Math.random() < 0.3) {
                        notes.push({ time: time + (beatInterval/4) * i, lane: 3, type: 'normal', duration: 0 });
                    }
                }
            }
            
            // Triplet flows
            if (beat % 8 === 7 && difficulty !== 'easy') {
                for (let i = 0; i < 3; i++) {
                    notes.push({ time: time + (beatInterval/3) * i, lane: (i + 1) % 4, type: 'normal', duration: 0 });
                }
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    // Jazz Patterns - Swing feel, complex rhythms
    getJazzPattern(bpm, duration, difficulty) {
        const notes = [];
        const beatInterval = (60 / bpm) * 1000;
        const totalBeats = Math.floor((duration * 1000) / beatInterval);
        const swingRatio = 2/3; // Swing eighth notes
        
        for (let beat = 0; beat < totalBeats; beat++) {
            const time = beat * beatInterval;
            
            // Walking bass line
            if (beat % 1 === 0) {
                notes.push({ time, lane: 0, type: 'normal', duration: 0 });
            }
            
            // Swing rhythm on 2 and 4
            if (beat % 4 === 1 || beat % 4 === 3) {
                notes.push({ time, lane: 1, type: 'normal', duration: 0 });
                // Off-beat swing
                notes.push({ time: time + beatInterval * swingRatio, lane: 2, type: 'normal', duration: 0 });
            }
            
            // Improvisation-style runs
            if (difficulty === 'hard' && beat % 16 >= 12) {
                for (let i = 0; i < 8; i++) {
                    if (Math.random() < 0.4) {
                        notes.push({ time: time + (beatInterval/8) * i, lane: Math.floor(Math.random() * 4), type: 'normal', duration: 0 });
                    }
                }
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    // Classical Patterns - Complex counterpoint and scales
    getClassicalPattern(bpm, duration, difficulty) {
        const notes = [];
        const beatInterval = (60 / bpm) * 1000;
        const totalBeats = Math.floor((duration * 1000) / beatInterval);
        
        // Scale patterns
        const scales = [
            [0, 1, 2, 3, 2, 1, 0, 1], // Ascending/descending
            [0, 2, 1, 3, 0, 2, 1, 3], // Arpeggios
            [1, 3, 0, 2, 1, 3, 0, 2]  // Counterpoint
        ];
        
        for (let beat = 0; beat < totalBeats; beat++) {
            const time = beat * beatInterval;
            const phrase = Math.floor(beat / 8);
            const scale = scales[phrase % scales.length];
            
            // Main melody
            notes.push({ time, lane: scale[beat % scale.length], type: 'normal', duration: 0 });
            
            // Accompaniment patterns
            if (beat % 4 === 0) {
                notes.push({ time, lane: (scale[0] + 2) % 4, type: 'normal', duration: 0 });
            }
            
            // Rapid passages for virtuoso pieces
            if (difficulty === 'hard' && beat % 16 >= 8 && beat % 16 < 12) {
                for (let i = 0; i < 4; i++) {
                    notes.push({ time: time + (beatInterval/4) * i, lane: (scale[i % scale.length] + i) % 4, type: 'normal', duration: 0 });
                }
            }
            
            // Sustained notes
            if (beat % 8 === 7) {
                notes.push({ time, lane: scale[0], type: 'hold', duration: beatInterval * 2 });
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    // Indo-Western Fusion Patterns - Mix of traditional and modern
    getFusionPattern(bpm, duration, difficulty) {
        const notes = [];
        const beatInterval = (60 / bpm) * 1000;
        const totalBeats = Math.floor((duration * 1000) / beatInterval);
        
        // Tabla-inspired patterns
        const tablaPattern = [0, 2, 1, 0, 3, 1, 2, 3];
        
        for (let beat = 0; beat < totalBeats; beat++) {
            const time = beat * beatInterval;
            const section = Math.floor(beat / 32);
            
            // Classical Indian rhythm patterns
            if (section % 2 === 0) {
                notes.push({ time, lane: tablaPattern[beat % tablaPattern.length], type: 'normal', duration: 0 });
            } else {
                // Western pop chorus
                if (beat % 4 === 0 || beat % 4 === 2) {
                    notes.push({ time, lane: Math.floor(Math.random() * 4), type: 'normal', duration: 0 });
                }
            }
            
            // Sitar-style ornaments
            if (difficulty !== 'easy' && beat % 8 === 5) {
                for (let i = 0; i < 3; i++) {
                    notes.push({ time: time + (beatInterval/6) * i, lane: (2 + i) % 4, type: 'normal', duration: 0 });
                }
            }
            
            // Modern EDM drops mixed with traditional
            if (beat % 64 === 63 && difficulty === 'hard') {
                for (let i = 0; i < 4; i++) {
                    notes.push({ time: time + (beatInterval/4) * i, lane: i, type: 'normal', duration: 0 });
                }
            }
        }
        
        return notes.sort((a, b) => a.time - b.time);
    }
    
    // EDM Patterns - Build-ups, drops, and electronic elements
    getEDMPattern(bpm, duration, difficulty) {
        const notes = [];
        const beatInterval = (60 / bpm) * 1000;
        const totalBeats = Math.floor((duration * 1000) / beatInterval);
        
        for (let beat = 0; beat < totalBeats; beat++) {
            const time = beat * beatInterval;
            const section = Math.floor(beat / 32); // 32-beat sections
            const sectionBeat = beat % 32;
            
            // Four on the floor kick pattern
            if (beat % 4 === 0) {
                notes.push({ time, lane: 0, type: 'normal', duration: 0 });
            }
            
            // Build-up sections (every other section)
            if (section % 4 === 2) {
                // Increasing intensity
                const intensity = sectionBeat / 32;
                if (Math.random() < intensity) {
                    notes.push({ time, lane: Math.floor(Math.random() * 4), type: 'normal', duration: 0 });
                }
            }
            
            // Drop sections (explosive)
            if (section % 4 === 3) {
                // Heavy pattern on drop
                notes.push({ time, lane: sectionBeat % 4, type: 'normal', duration: 0 });
                if (difficulty === 'hard') {
                    notes.push({ time: time + beatInterval/2, lane: (sectionBeat + 2) % 4, type: 'normal', duration: 0 });
                }
            }
            
            // Breakdown/quiet sections
            if (section % 4 === 1 && sectionBeat % 8 === 0) {
                notes.push({ time, lane: 1, type: 'hold', duration: beatInterval * 2 });
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
            const hit = this.checkTileHit(lane);
            if (!hit) {
                // Wrong tap - game over!
                this.gameOver('Wrong tap!');
                return;
            }
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
                <div class=\"song-genre\">${song.genre}</div>
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
        
        this.gameState = 'waitingToStart';
        this.showScreen('gameScreen');
        this.resetGame();
        this.loadSong(this.selectedSong);
        this.startAudio();
    }
    
    startActualGame() {
        this.gameState = 'playing';
        this.hasStarted = true;
        this.startTime = performance.now(); // Reset timing when actual game starts
        
        // Test immediate audio on user click
        this.testAudio();
        
        // NOW start the audio after game begins
        this.generateBackgroundMusic(this.currentSong);
    }
    
    testAudio() {
        console.log('=== AUDIO TEST STARTING ===');
        
        // Test if audio works immediately on user interaction
        try {
            console.log('Creating AudioContext...');
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            console.log('AudioContext created. State:', audioCtx.state);
            console.log('AudioContext sample rate:', audioCtx.sampleRate);
            
            // Force resume if needed
            if (audioCtx.state === 'suspended') {
                console.log('AudioContext suspended, attempting resume...');
                audioCtx.resume().then(() => {
                    console.log('AudioContext resumed. New state:', audioCtx.state);
                    this.playTestBeep(audioCtx);
                });
            } else {
                console.log('AudioContext already running, playing test beep...');
                this.playTestBeep(audioCtx);
            }
        } catch (e) {
            console.error('AUDIO TEST FAILED:', e);
        }
    }
    
    playTestBeep(audioCtx) {
        try {
            console.log('Creating test beep...');
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.frequency.value = 440; // A note
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 1);
            
            console.log('🔊 TEST BEEP SHOULD BE PLAYING NOW! (440Hz for 1 second)');
            console.log('If you cannot hear this, your browser is blocking audio');
        } catch (e) {
            console.error('Test beep creation failed:', e);
        }
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
        this.speedMultiplier = 1.0; // Reset speed
        this.songRepeats = 0;
        this.gameOverReason = '';
        this.updateUI();
    }
    
    loadSong(song) {
        this.currentSong = song;
        this.totalNotes = song.notes.length; // Don't count START tile in scoring
        this.hasStarted = false;
        
        // Create START tile that's stationary in the hit zone
        const startTile = new Tile(1, 0, 'start', 0); // Lane 1 (middle-left)
        startTile.y = this.hitZone; // Place directly in hit zone
        startTile.isStationary = true; // Mark as stationary
        this.tiles.push(startTile);
        
        // Create tiles from song notes (they won't appear until START is pressed)
        song.notes.forEach(note => {
            this.tiles.push(new Tile(note.lane, note.time + 5000, note.type, note.duration));
        });
        
        // DON'T generate background music yet - wait for START
    }
    
    generateBackgroundMusic(song) {
        // Create a simple audio context for background beats
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            console.log('Initial AudioContext state:', audioCtx.state);
            
            // FORCE resume if suspended
            if (audioCtx.state === 'suspended') {
                audioCtx.resume().then(() => {
                    console.log('AudioContext resumed, state:', audioCtx.state);
                    this.startBackgroundBeats(audioCtx, song);
                });
            } else {
                this.startBackgroundBeats(audioCtx, song);
            }
        } catch (e) {
            console.error('Audio context failed:', e);
        }
    }
    
    startBackgroundBeats(audioCtx, song) {
        const duration = song.duration;
        const bpm = song.bpm;
        const beatInterval = 60 / bpm;
        
        console.log(`Starting beats: ${song.title}, BPM: ${bpm}, Interval: ${beatInterval}s`);
        
        // Play first beat immediately to test
        this.playBeat(audioCtx, 440);
        
        // Then start the metronome
        this.playMetronome(audioCtx, beatInterval, duration);
    }
    
    playBeat(audioCtx, frequency) {
        try {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
            
            console.log('Beat played at', frequency, 'Hz');
        } catch (e) {
            console.error('Beat failed:', e);
        }
    }
    
    playMetronome(audioCtx, beatInterval, duration) {
        const totalBeats = Math.floor(duration / beatInterval);
        console.log(`Scheduling ${totalBeats} beats, interval: ${beatInterval}s`);
        
        for (let i = 0; i < totalBeats; i++) {
            setTimeout(() => {
                if (this.gameState === 'playing' && !this.isPaused) {
                    const frequency = i % 4 === 0 ? 800 : 400; // Accent every 4th beat
                    this.playBeat(audioCtx, frequency);
                }
            }, i * beatInterval * 1000);
        }
    }
    
    startAudio() {
        // In a real implementation, you would load and play the actual audio file here
        this.startTime = performance.now();
        
        // Try to resume audio context if suspended
        if (window.AudioContext || window.webkitAudioContext) {
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                if (audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
            } catch (e) {
                console.log('Could not resume audio context');
            }
        }
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
            if (bestTile.type === 'start') {
                // Start the game when START tile is hit
                this.startActualGame();
                bestTile.hit = true;
                // Remove START tile from tiles array
                this.tiles = this.tiles.filter(t => t !== bestTile);
                return true;
            } else {
                this.hitTile(bestTile, bestDistance);
                return true;
            }
        } else {
            // Wrong tap - only trigger game over if game has started
            if (this.hasStarted) {
                this.combo = 0; // Reset combo on wrong tap
                this.gameOver('Wrong tap!');
            }
        }
        
        return false; // No tile to hit
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
        
        // Calculate accuracy: only count actual game tiles (not START tile)
        const missedTiles = this.tiles.filter(t => t.missed && t.type !== 'start').length;
        const totalProcessed = this.hitNotes + missedTiles;
        const accuracy = totalProcessed > 0 ? Math.round((this.hitNotes / totalProcessed) * 100) : 100;
        document.getElementById('accuracy').textContent = accuracy + '%';
    }
    
    update() {
        if ((this.gameState !== 'playing' && this.gameState !== 'waitingToStart') || this.isPaused) return;
        
        this.gameTime = performance.now() - this.startTime;
        
        // Update tiles with speed multiplier
        for (const tile of this.tiles) {
            // Don't update stationary tiles
            if (!tile.isStationary) {
                const speedMult = this.hasStarted ? this.speedMultiplier : 1.0;
                tile.update(this.gameTime * speedMult, this.fallSpeed);
                
                // Check for missed tiles (only after game has started)
                if (this.hasStarted && !tile.hit && !tile.missed && tile.y > this.hitZone + this.hitTolerance && tile.type !== 'start') {
                    tile.missed = true;
                    this.combo = 0; // Reset combo on miss
                    this.gameOver('Missed a tile!');
                    return;
                }
            }
        }
        
        // Remove old tiles (but keep stationary ones)
        this.tiles = this.tiles.filter(tile => 
            tile.isStationary || 
            (tile.y < this.canvas.height + 100 && 
            (tile.time + tile.duration + 2000) > this.gameTime)
        );
        
        // Update UI
        this.updateUI();
        
        // Check for song completion (only after game has started)
        if (this.hasStarted && this.currentSong && this.gameTime > (this.currentSong.duration * 1000 / this.speedMultiplier) + 8000) {
            this.completeSong();
        }
    }
    
    gameOver(reason) {
        this.gameState = 'gameOver';
        this.gameOverReason = reason;
        this.showScreen('gameOverScreen');
        this.stopAudio();
        
        // Update game over screen
        document.querySelector('#gameOverScreen h2').textContent = `GAME OVER! ${reason}`;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('maxCombo').textContent = this.maxCombo;
        document.getElementById('finalAccuracy').textContent = '0%';
        
        // Hide the grade display
        const gradeDisplay = document.getElementById('gradeDisplay');
        if (gradeDisplay) {
            gradeDisplay.style.display = 'none';
        }
    }
    
    completeSong() {
        this.songRepeats++;
        this.speedMultiplier += 0.3; // Increase speed by 30% each repeat
        
        // Show completion message briefly
        this.showCompletionMessage();
        
        // Restart song with higher speed after 2 seconds
        setTimeout(() => {
            this.restartSongWithSpeed();
        }, 2000);
    }
    
    showCompletionMessage() {
        // Create temporary overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            color: #FFD700;
            font-size: 2em;
            font-weight: bold;
            text-align: center;
        `;
        overlay.innerHTML = `
            <div>
                <div>🎉 SONG COMPLETED! 🎉</div>
                <div style="font-size: 0.7em; margin-top: 20px;">Speed: ${(this.speedMultiplier * 100).toFixed(0)}% → ${((this.speedMultiplier + 0.3) * 100).toFixed(0)}%</div>
                <div style="font-size: 0.5em; margin-top: 10px;">Get ready for faster tiles!</div>
            </div>
        `;
        
        document.getElementById('gameScreen').appendChild(overlay);
        
        // Remove overlay after 2 seconds
        setTimeout(() => {
            overlay.remove();
        }, 2000);
    }
    
    restartSongWithSpeed() {
        // Reset game but keep speed multiplier
        this.tiles = [];
        this.score = 0;
        this.combo = 0;
        this.totalNotes = 0;
        this.hitNotes = 0;
        this.startTime = performance.now();
        this.gameTime = 0;
        this.isPaused = false;
        
        // Reload song with faster timing
        this.loadSongWithSpeed(this.currentSong);
        this.startAudio();
        this.updateUI();
    }
    
    loadSongWithSpeed(song) {
        this.currentSong = song;
        this.hasStarted = false;
        
        // Apply speed multiplier to note timing
        const speedAdjustedNotes = song.notes.map(note => ({
            ...note,
            time: note.time / this.speedMultiplier,
            duration: note.duration / this.speedMultiplier
        }));
        
        this.totalNotes = speedAdjustedNotes.length; // Don't count START tile in scoring
        
        // Create START tile that's stationary in the hit zone
        const startTile = new Tile(1, 0, 'start', 0); // Lane 1 (middle-left)
        startTile.y = this.hitZone; // Place directly in hit zone
        startTile.isStationary = true; // Mark as stationary
        this.tiles.push(startTile);
        
        // Create tiles from speed-adjusted notes
        speedAdjustedNotes.forEach(note => {
            this.tiles.push(new Tile(note.lane, note.time + 5000, note.type, note.duration));
        });
        
        // Generate background music at faster tempo
        this.generateBackgroundMusic({...song, bpm: song.bpm * this.speedMultiplier});
    }
    
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState !== 'playing' && this.gameState !== 'waitingToStart') return;
        
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
        this.type = type; // 'normal', 'hold', or 'start'
        this.duration = duration; // For hold notes (milliseconds)
        this.y = -50; // Start above screen
        this.hit = false;
        this.missed = false;
        this.holding = false; // For hold notes
        this.alpha = 1;
        this.isStationary = false; // For START tile
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
        // Don't render if tile is hit
        if (this.hit) return false;
        // Always render stationary tiles, otherwise use normal timing
        return this.isStationary || (gameTime >= this.time - 3000); // Show 3 seconds before hit time
    }
    
    draw(ctx, laneWidth) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Make tiles vertical (taller than wide)
        const x = this.lane * laneWidth + 30; // More padding for vertical tiles
        const width = laneWidth - 60; // Narrower for vertical appearance
        const height = this.type === 'hold' ? Math.max(80, (this.duration / 5) * 2.5) : 80; // Hold tiles 2.5x longer
        
        // Draw tile based on type
        if (this.type === 'start') {
            // START tile - special green gradient
            const gradient = ctx.createLinearGradient(x, this.y - height, x, this.y);
            gradient.addColorStop(0, '#00FF00');
            gradient.addColorStop(0.5, '#32CD32');
            gradient.addColorStop(1, '#228B22');
            ctx.fillStyle = gradient;
            
            // Draw START tile
            ctx.fillRect(x, this.y - height, width, height);
            
            // Draw border
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, this.y - height, width, height);
            
            // Draw START text
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('START', x + width/2, this.y - height/2 + 6);
        } else if (this.type === 'hold') {
            // Hold note - longer gradient tile (no HOLD text)
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