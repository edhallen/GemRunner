import { KeyboardControls } from "@react-three/drei";
import { useTankGame } from "./lib/stores/useTankGame";
import { NameEntry } from "./components/NameEntry";
import { MenuScreen } from "./components/MenuScreen";
import { QuizScreen } from "./components/QuizScreen";
import { TankSelection } from "./components/TankSelection";
import { TankBattle } from "./components/TankBattle";
import { LevelComplete } from "./components/LevelComplete";
import { GameOver } from "./components/GameOver";
import { SoundManager } from "./components/SoundManager";
import "@fontsource/inter";

export enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  shoot = 'shoot',
}

const controls = [
  { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
  { name: Controls.back, keys: ["ArrowDown", "KeyS"] },
  { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
  { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
  { name: Controls.shoot, keys: ["Space"] },
];

function App() {
  const { phase } = useTankGame();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <KeyboardControls map={controls}>
        {phase === 'name_entry' && <NameEntry />}
        {phase === 'menu' && <MenuScreen />}
        {phase === 'quiz' && <QuizScreen />}
        {phase === 'tank_selection' && <TankSelection />}
        {phase === 'playing' && <TankBattle />}
        {phase === 'level_complete' && <LevelComplete />}
        {phase === 'game_over' && <GameOver />}
        
        <SoundManager />
      </KeyboardControls>
    </div>
  );
}

export default App;
