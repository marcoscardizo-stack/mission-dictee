import { GameProvider } from './state/GameContext';
import { useHashRoute, type Route } from './hooks/useHashRoute';
import { StatsBar } from './components/StatsBar';
import { NavBar } from './components/NavBar';
import { Home } from './components/Home';
import { QuizMission } from './components/QuizMission';
import { Dictation } from './components/Dictation';
import { Trophies } from './components/Trophies';
import { Settings } from './components/Settings';
import { TrophyCelebration } from './components/TrophyCelebration';

function Screen({ route }: { route: Route }) {
  switch (route) {
    case 'homophones':
    case 'accords':
    case 'verbes':
      return <QuizMission key={route} mission={route} />;
    case 'dictee':
      return <Dictation />;
    case 'trophees':
      return <Trophies />;
    case 'parametres':
      return <Settings />;
    default:
      return <Home />;
  }
}

export default function App() {
  const { route } = useHashRoute();
  return (
    <GameProvider>
      <div className="app" data-route={route}>
        <header className="topbar">
          <StatsBar />
          <NavBar route={route} variant="top" />
        </header>
        <main className="screen" key={route} data-testid={`screen-${route}`}>
          <Screen route={route} />
        </main>
        <NavBar route={route} variant="bottom" />
        <TrophyCelebration />
      </div>
    </GameProvider>
  );
}
