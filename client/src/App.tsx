import { KeyboardControls } from "@react-three/drei";
import { useTankGame } from "./lib/stores/useTankGame";
import { StartScreen } from "./components/StartScreen";
import { QuizScreen } from "./components/QuizScreen";
import { GameModeSelection } from "./components/GameModeSelection";
import { TankSelection } from "./components/TankSelection";
import { DragonSelection } from "./components/DragonSelection";
import { TankBattle } from "./components/TankBattle";
import { SideScroller } from "./components/SideScroller";
import { CastleRaider } from "./components/CastleRaider";
import { CastleRaiderStore } from "./components/CastleRaiderStore";
import { LevelComplete } from "./components/LevelComplete";
import { GameOver } from "./components/GameOver";
import { Leaderboard } from "./components/Leaderboard";
import { SoundManager } from "./components/SoundManager";
import "@fontsource/inter";

export enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  shoot = 'shoot',
  missile = 'missile',
}

const controls = [
  { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
  { name: Controls.back, keys: ["ArrowDown", "KeyS"] },
  { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
  { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
  { name: Controls.shoot, keys: ["ArrowUp", "KeyW"] },
  { name: Controls.missile, keys: ["Space"] },
];

function App() {
  const { phase } = useTankGame();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <KeyboardControls map={controls}>
        {phase === 'menu' && <StartScreen />}
        {phase === 'quiz' && <QuizScreen />}
        {phase === 'game_mode_selection' && <GameModeSelection />}
        {phase === 'tank_selection' && <TankSelection />}
        {phase === 'dragon_selection' && <DragonSelection />}
        {phase === 'playing_tank' && <TankBattle />}
        {phase === 'playing_platformer' && <SideScroller />}
        {phase === 'playing_castle_raider' && <CastleRaider />}
        {phase === 'castle_raider_store' && <CastleRaiderStore />}
        {phase === 'level_complete' && <LevelComplete />}
        {phase === 'game_over' && <GameOver />}
        {phase === 'leaderboard' && <Leaderboard />}
        
        <SoundManager />
      </KeyboardControls>
    </div>
  );
}

export default App;
