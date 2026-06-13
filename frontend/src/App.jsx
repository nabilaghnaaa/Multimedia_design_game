import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LevelMap from './pages/LevelMap';
import SimulationPage from './pages/SimulationPage';
import ChallengePage from './pages/ChallengePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/map" element={<LevelMap />} />
        <Route path="/simulation/:levelNumber" element={<SimulationPage />} />
        <Route path="/challenge" element={<ChallengePage />} />
      </Routes>
    </Router>
  );
}

export default App;