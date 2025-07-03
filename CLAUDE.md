# Donut Escape Game - Development Instructions

## User Role & Responsibilities
- **User Role:** Strictly testing the game and providing feedback
- **User's Job:** Deploy project on Vercel via GitHub connection and test on internet
- **Developer Role:** Claude handles all code implementation, building, and GitHub commits

## Game Requirements & Design Specifications

### True 3D First-Person Design
- **Camera View:** First-person from donut's eyes (shows donut for 3 seconds at start)
- **3D Rendering:** True 3D objects without perspective distortion
- **Donut Position:** Bottom of screen initially, then first-person view
- **Lane Lines:** Completely removed
- **Main Screen Background:** Blue gradient (not black)
- **Game Background:** Simple ground plane, no perspective lines
- **Costumes:** Donut wearing costume items (e.g., donut wearing police coat, not policeman)
- **Obstacle Sizing:** Everything bigger than donut, proportionate to real life size
- **Depth Rendering:** Orthographic projection with scale-based depth

### Game Mechanics (Subway Surfers Style)
- **Movement:** Donut runs forward into screen depth, player moves left/right between lanes
- **Starting Speed:** Faster beginning speed (4)
- **Currency System:** Coins, strawberries, chocolates saved between sessions
- **Costume Unlocking:** Use currency to unlock new costumes (chef hat, superhero cape, sailor outfit)
- **DONUT Letters:** Collect all 5 letters for bonus (100 of each currency)
- **Sprinkle Trail:** Arnie sheds colorful sprinkles while running

### Obstacles
- **Static:** Construction cones (lane change only), manholes/puddles (jump), fork/spoon (roll under)
- **Moving:** Cars (drive across lanes, cannot be jumped/ducked), Feet (walk across screen)
- **Avoidance:** Jump over manholes/puddles, roll under forks/spoons, change lanes for cones/cars/feet

### Power-ups
- **Icing Gun:** Automatically collects all nearby coins/strawberries/chocolates
- **Strawberry Chocolate Honey Cluster:** Special bonus item
- **Glaze Invisibility:** Pass through obstacles temporarily
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