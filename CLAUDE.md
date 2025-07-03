# Donut Escape Game - Development Instructions

## User Role & Responsibilities
- **User Role:** Strictly testing the game and providing feedback
- **User's Job:** Deploy project on Vercel via GitHub connection and test on internet
- **Developer Role:** Claude handles all code implementation, building, and GitHub commits

## Game Requirements & Design Specifications

### Visual Design
- **Main Screen Background:** Blue (not black)
- **Game Background:** Sidewalk (not field/grass)
- **Costumes:** Donut wearing costume items (e.g., donut wearing police coat, not policeman)
- **Obstacle Sizing:** Everything bigger than donut, proportionate to real life size

### Game Mechanics
- **Starting Speed:** Faster beginning speed
- **Jump/Roll Logic:** 
  - Jump over short obstacles only
  - Roll under obstacles with gaps
  - Both jump and roll should be available actions
- **Obstacle Behavior:**
  - Footsteps: Actual animated shoes walking
  - Taxis: Moving/animated vehicles

### Technical Workflow
1. User provides feedback
2. Claude implements changes
3. Claude tests and builds code
4. Claude commits to GitHub
5. Vercel automatically deploys
6. User tests deployed version
7. Repeat cycle

## Current GitHub Repository
- **Repo:** https://github.com/KProtoType/donut-escape
- **Owner:** kprototype
- **Auto-deploy:** Connected to Vercel

## Development Commands
- **Test:** Open index.html in browser (static HTML/CSS/JS)
- **Build:** No build step needed (static files)
- **Deploy:** Git push to master branch (auto-deploys to Vercel)

## Game Controls
- Arrow Keys: Move left/right between lanes
- Spacebar: Jump over obstacles
- Down Arrow: Roll under obstacles
- ESC: Pause game

## Priority Order for Implementation
1. Visual fixes (backgrounds, costumes, sizing)
2. Game mechanics (speed, jump/roll logic)
3. Animations (shoes, taxis)
4. Polish and testing