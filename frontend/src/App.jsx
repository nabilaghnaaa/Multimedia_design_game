import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import StageSelectPage from "./pages/StageSelectPage";
import Stage1Select from "./pages/Stage1Select";
import LevelMap from "./pages/LevelMap";
import SimulationPage from "./pages/SimulationPage";
import ChallengePage from "./pages/ChallengePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/stage-select" element={<StageSelectPage />} />
        <Route path="/stage1-select" element={<Stage1Select />} />
        <Route path="/map" element={<LevelMap />} />
        <Route path="/simulation/:levelNumber" element={<SimulationPage />} />
        <Route path="/challenge" element={<ChallengePage />} />
      </Routes>
    </Router>
  );
}

export default App;