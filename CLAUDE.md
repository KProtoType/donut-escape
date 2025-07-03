# Donut Escape Game - Development Instructions

## User Role & Responsibilities
- **User Role:** Strictly testing the game and providing feedback
- **User's Job:** Deploy project on Vercel via GitHub connection and test on internet
- **Developer Role:** Claude handles all code implementation, building, and GitHub commits

## Game Requirements & Design Specifications

### 3D Perspective & Visual Design
- **Camera View:** Behind donut (Subway Surfers style)
- **3D Perspective:** Pseudo-3D with perspective scaling and vanishing point
- **Main Screen Background:** Blue gradient (not black)
- **Game Background:** 3D sidewalk with perspective depth
- **Costumes:** Donut wearing costume items (e.g., donut wearing police coat, not policeman)
- **Obstacle Sizing:** Everything bigger than donut, proportionate to real life size
- **Depth Rendering:** Objects scale based on distance from camera

### Game Mechanics
- **Movement:** Donut runs forward into screen depth, player moves left/right between lanes
- **Starting Speed:** Faster beginning speed (4)
- **Jump/Roll Logic:** 
  - Jump over short obstacles (manholes, puddles, cones)
  - Roll under obstacles with gaps (static obstacles only)
  - Cars cannot be jumped over or ducked under - must be avoided by changing lanes
- **Obstacle Behavior:**
  - Static obstacles: spawn in lanes, move toward camera
  - Cars: drive horizontally across lanes and disappear
  - Feet: walk horizontally across screen
- **Pause Mechanic:** Spacebar pauses game for exactly 2 seconds with countdown

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
- Left/Right Arrow Keys: Move left/right between lanes
- Up Arrow: Jump over short obstacles
- Down Arrow: Roll under obstacles with gaps
- Spacebar: Pause game for exactly 2 seconds
- ESC: Pause game menu

## Priority Order for Implementation
1. Visual fixes (backgrounds, costumes, sizing)
2. Game mechanics (speed, jump/roll logic)
3. Animations (shoes, taxis)
4. Polish and testing