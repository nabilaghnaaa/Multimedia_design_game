import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import StageSelectPage from "./pages/StageSelectPage";
import Stage1Select from "./pages/Stage1Select";
import LevelMap from "./pages/LevelMap";
import SimulationPage from "./pages/SimulationPage";
import SimulationLevel2 from "./pages/SimulationLevel2";
import SimulationLevel3 from "./pages/SimulationLevel3";
import SimulationLevel4 from "./pages/SimulationLevel4";
import ChallengePage from "./pages/ChallengePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/stage-select" element={<StageSelectPage />} />

        {/* MAP STAGE 1 YANG KAMU MAU */}
        <Route path="/stage1-select" element={<Stage1Select />} />

        {/* BIAR ROUTE LAMA TETAP AMAN */}
        <Route path="/map" element={<LevelMap />} />

        {/* LEVEL KHUSUS HARUS DI ATAS ROUTE DINAMIS */}
        <Route path="/simulation/2" element={<SimulationLevel2 />} />
        <Route path="/simulation/3" element={<SimulationLevel3 />} />
        <Route path="/simulation/4" element={<SimulationLevel4 />} />

        {/* LEVEL 1 DAN LEVEL LAIN YANG MASIH PAKE FILE LAMA */}
        <Route path="/simulation/:levelNumber" element={<SimulationPage />} />

        <Route path="/challenge" element={<ChallengePage />} />
      </Routes>
    </Router>
  );
}

export default App;