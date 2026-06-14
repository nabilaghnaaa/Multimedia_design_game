import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import StageSelectPage from "./pages/StageSelectPage";
import Stage1Select from "./pages/Stage1Select";
import LevelMap from "./pages/LevelMap";
import SimulationPage from "./pages/SimulationPage";
import SimulationLevel2 from "./pages/SimulationLevel2";
import SimulationLevel3 from "./pages/SimulationLevel3";
import SimulationLevel4 from "./pages/SimulationLevel4";
import SimulationLevel5 from "./pages/SimulationLevel5";
import SimulationStage2Level1 from "./pages/SimulationStage2Level1";
import SimulationStage2Level2 from "./pages/SimulationStage2Level2";
import ChallengePage from "./pages/ChallengePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/stage-select" element={<StageSelectPage />} />

        {/* MAP STAGE 1 */}
        <Route path="/stage1-select" element={<Stage1Select />} />

        {/* MAP STAGE 2 */}
        <Route path="/map" element={<LevelMap />} />

        {/* LEVEL KHUSUS HARUS DI ATAS ROUTE DINAMIS */}
        <Route path="/simulation/2" element={<SimulationLevel2 />} />
        <Route path="/simulation/3" element={<SimulationLevel3 />} />
        <Route path="/simulation/4" element={<SimulationLevel4 />} />
        <Route path="/simulation/5" element={<SimulationLevel5 />} />

        {/* STAGE 2 LEVEL 1 */}
        <Route path="/simulation/6" element={<SimulationStage2Level1 />} />

        {/* STAGE 2 LEVEL 2 */}
        <Route path="/simulation/7" element={<SimulationStage2Level2 />} />

        {/* LEVEL LAIN YANG MASIH PAKE FILE LAMA */}
        <Route path="/simulation/:levelNumber" element={<SimulationPage />} />

        <Route path="/challenge" element={<ChallengePage />} />
      </Routes>
    </Router>
  );
}

export default App;