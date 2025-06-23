# Interactive Snake Game

Create a classic Snake game using HTML5 Canvas and JavaScript that provides an engaging retro gaming experience.

## Game Mechanics

### Core Gameplay
- **Snake Movement**: Snake moves continuously in current direction
- **Direction Control**: Arrow keys change snake direction
- **Food System**: Random food appears on game board
- **Growth Mechanism**: Snake grows longer when eating food
- **Collision Detection**: Game ends when snake hits walls or itself
- **Score System**: Points awarded for each food eaten

### Game Controls
- **Arrow Keys**: Up, Down, Left, Right movement
- **Spacebar**: Pause/Resume game
- **Enter**: Start new game after game over
- **R Key**: Restart current game

## Visual Design

### Game Board
- **Canvas Size**: 600x600 pixels (scalable)
- **Grid System**: 20x20 pixel squares
- **Background**: Dark theme with subtle grid lines
- **Border**: Clear game area boundaries

### Game Elements
- **Snake**: Bright green segments with subtle gradient
- **Food**: Red/orange circular food items
- **Score Display**: Large, clear score counter
- **Game Over Screen**: Attractive overlay with final score

## Technical Implementation

### HTML Structure
- Canvas element for game rendering
- Score display area
- Game controls instructions
- Start/restart buttons

### CSS Styling
- Centered game layout
- Retro gaming color scheme
- Responsive design for mobile devices
- Smooth animations and transitions

### JavaScript Features
- **Game Loop**: Consistent frame rate (10-15 FPS)
- **State Management**: Game states (playing, paused, game over)
- **Input Handling**: Responsive keyboard controls
- **Collision System**: Accurate boundary and self-collision detection
- **Random Generation**: Food placement algorithm

## Game Features

### Basic Features
- **High Score**: Track and display best score
- **Speed Progression**: Game speeds up as score increases
- **Sound Effects**: Audio feedback for eating food and game over
- **Smooth Animation**: Fluid snake movement

### Enhanced Features
- **Multiple Difficulty Levels**: Easy, Medium, Hard
- **Power-ups**: Special food with bonus effects
- **Obstacles**: Static barriers on higher difficulty
- **Visual Effects**: Particle effects for food consumption

## User Experience

### Game Flow
1. Player sees start screen with instructions
2. Game begins when player presses any arrow key
3. Snake moves automatically, player controls direction
4. Score increases as snake eats food
5. Game ends on collision, shows game over screen
6. Player can restart or view high scores

### Responsive Design
- **Mobile Support**: Touch controls for mobile devices
- **Screen Adaptation**: Game scales to different screen sizes
- **Performance**: Optimized for smooth gameplay on all devices

## File Structure

- `index.html` - Game structure and UI elements
- `style.css` - Game styling and responsive layout
- `script.js` - Game logic, controls, and canvas rendering
- `README.md` - Game instructions and technical details

## Success Criteria

The game is successful when:
- Smooth, responsive snake movement
- Accurate collision detection
- Progressive difficulty increase
- Clear visual feedback for all actions
- Intuitive controls that feel natural
- Engaging gameplay that encourages replaying
- Bug-free experience across different browsers
- Mobile-friendly responsive design

## Optional Advanced Features

If development time allows:
- **Leaderboard**: Local storage of top 10 scores
- **Theme Selection**: Multiple visual themes
- **Custom Levels**: Pre-designed levels with obstacles
- **Multiplayer Mode**: Two-player competitive mode
- **Achievement System**: Unlock achievements for milestones
