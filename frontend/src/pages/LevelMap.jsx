import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import bgStage1 from "../assets/backgrounds/backgrounds.png";
import bgStage2 from "../assets/backgrounds/baground2.png";

import sign1 from "../assets/signs/rambu_1-removebg-preview.png";
import sign21 from "../assets/signs/rambu 2.1.png";
import sign22 from "../assets/signs/rambu 2.2.png";
import sign23 from "../assets/signs/rambu 2.3.png";
import sign24 from "../assets/signs/rambu 2.4.png";
import sign25 from "../assets/signs/rambu 2.5.png";
import sign26 from "../assets/signs/rambu 2.6.png";
import sign3 from "../assets/signs/rambu 3.png";
import sign4 from "../assets/signs/rambu 4 .png";
import sign5 from "../assets/signs/rambu 5.png";
import sign7 from "../assets/signs/rambu 7.png";
import sign8 from "../assets/signs/rambu 8.png";

import motorCowok from "../assets/characters/asetmotor.png";
import motorCewek from "../assets/characters/asetmotorcwek.png";

import level3Unlocked from "../assets/stage-levels/stage1/level-3-unlocked.png";

const STAGE1_PROGRESS_KEY = "stage1-progress";

const signImages = {
  1: sign1,
  2: sign21,
  3: sign22,
  4: sign23,
  5: sign24,
  6: sign3,
  7: sign4,
  8: sign25,
  9: sign26,
  10: sign7,
  11: sign5,
  12: sign8,
};

const defaultLevels = [
  {
    id: 1,
    stage: 1,
    level: 1,
    sign_name: "Tikungan Tajam",
  },
  {
    id: 2,
    stage: 1,
    level: 2,
    sign_name: "Jalan Licin / Bergelombang / Berlubang",
  },
  {
    id: 3,
    stage: 1,
    level: 3,
    sign_name: "Penyeberangan Pejalan Kaki",
  },
  {
    id: 4,
    stage: 1,
    level: 4,
    sign_name: "Persimpangan",
  },
  {
    id: 5,
    stage: 1,
    level: 5,
    sign_name: "Lalu Lintas Dua Arah",
  },
  {
    id: 6,
    stage: 2,
    level: 6,
    sign_name: "Batas Kecepatan Maksimum",
  },
  {
    id: 7,
    stage: 2,
    level: 7,
    sign_name: "Dilarang Menyalip",
  },
  {
    id: 8,
    stage: 2,
    level: 8,
    sign_name: "Dilarang Masuk",
  },
  {
    id: 9,
    stage: 2,
    level: 9,
    sign_name: "Dilarang Berhenti",
  },
  {
    id: 10,
    stage: 2,
    level: 10,
    sign_name: "Beri Prioritas",
  },
  {
    id: 11,
    stage: 2,
    level: 11,
    sign_name: "Dilarang Belok Kanan / Kiri",
  },
  {
    id: 12,
    stage: 2,
    level: 12,
    sign_name: "Dilarang Putar Balik",
  },
];

const stageData = {
  1: {
    title: "STAGE 1 : RAMBU PERINGATAN",
    subtitle: "Pilih level untuk mulai belajar rambu peringatan.",
    background: bgStage1,
    character: motorCowok,
    firstLevel: 1,
    lastLevel: 5,
  },
  2: {
    title: "STAGE 2 : RAMBU LARANGAN",
    subtitle: "Pilih level untuk mulai belajar rambu larangan.",
    background: bgStage2,
    character: motorCewek,
    firstLevel: 6,
    lastLevel: 12,
  },
};

/*
  Posisi karakter mengikuti gambar peta.
  Kalau karakter kurang pas, ubah bagian left/top ini saja.
*/
const characterPositions = {
  1: { left: "14%", top: "50%" },
  2: { left: "31%", top: "56%" },
  3: { left: "47%", top: "48%" },
  4: { left: "65%", top: "56%" },
  5: { left: "82%", top: "48%" },

  6: { left: "17%", top: "52%" },
  7: { left: "31%", top: "58%" },
  8: { left: "45%", top: "49%" },
  9: { left: "55%", top: "58%" },
  10: { left: "66%", top: "48%" },
  11: { left: "77%", top: "56%" },
  12: { left: "88%", top: "48%" },
};

/*
  Area klik transparan di atas papan level.
*/
const levelClickAreas = {
  1: { left: "14%", top: "35%", width: "10%", height: "25%" },
  2: { left: "30%", top: "43%", width: "10%", height: "25%" },
  3: { left: "45%", top: "35%", width: "10%", height: "25%" },
  4: { left: "63%", top: "43%", width: "10%", height: "25%" },
  5: { left: "79%", top: "35%", width: "10%", height: "25%" },

  6: { left: "15%", top: "35%", width: "10%", height: "25%" },
  7: { left: "28%", top: "43%", width: "10%", height: "25%" },
  8: { left: "41%", top: "35%", width: "10%", height: "25%" },
  9: { left: "52%", top: "43%", width: "10%", height: "25%" },
  10: { left: "63%", top: "35%", width: "10%", height: "25%" },
  11: { left: "74%", top: "43%", width: "10%", height: "25%" },
  12: { left: "85%", top: "35%", width: "10%", height: "25%" },
};

/*
  Posisi gambar level-3-unlocked.png.
  Kalau kurang pas, ubah left/top/width di sini saja.
*/
const level3UnlockedPosition = {
  left: "50.1%",
  top: "43.3%",
  width: "112px",
};

const normalizeNumberArray = (data, fallback = []) => {
  if (!Array.isArray(data)) return fallback;

  return [
    ...new Set(
      data
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item))
    ),
  ].sort((a, b) => a - b);
};

const isStage1Finished = (completedLevels) => {
  return [1, 2, 3, 4, 5].every((level) =>
    completedLevels.map(Number).includes(level)
  );
};

const safeParseArray = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;

    const parsed = JSON.parse(saved);
    return normalizeNumberArray(parsed, fallback);
  } catch (error) {
    console.error(`Gagal membaca ${key}:`, error);
    return fallback;
  }
};

const safeParseStage1Progress = () => {
  try {
    const savedStage1Progress = localStorage.getItem(STAGE1_PROGRESS_KEY);
    const parsedProgress = savedStage1Progress
      ? JSON.parse(savedStage1Progress)
      : {};

    return parsedProgress && typeof parsedProgress === "object"
      ? parsedProgress
      : {};
  } catch (error) {
    console.error("Gagal membaca stage1-progress:", error);
    return {};
  }
};

const LevelMap = () => {
  const navigate = useNavigate();

  const [levels, setLevels] = useState(defaultLevels);
  const [activeStage, setActiveStage] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [openingLevel, setOpeningLevel] = useState(null);
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const [completedLevels, setCompletedLevels] = useState([]);

  useEffect(() => {
    const loadLevels = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/levels");

        if (Array.isArray(res.data) && res.data.length > 0) {
          setLevels(res.data);
        } else {
          setLevels(defaultLevels);
        }
      } catch (error) {
        console.log("Backend level belum aktif, pakai data lokal dulu.");
        setLevels(defaultLevels);
      }
    };

    const savedUnlocked = safeParseArray("unlockedLevels", [1]);
    const savedCompleted = safeParseArray("completedLevels", []);
    const stage1Progress = safeParseStage1Progress();

    const progressCompletedLevels = normalizeNumberArray(
      stage1Progress.completedLevels || [],
      []
    );

    const progressUnlockedLevel = Number(stage1Progress.unlockedLevel || 1);

    const mergedUnlockedLevels = [...new Set([...savedUnlocked, 1])];

    if (Number.isFinite(progressUnlockedLevel)) {
      for (let level = 1; level <= progressUnlockedLevel; level += 1) {
        mergedUnlockedLevels.push(level);
      }
    }

    const finalUnlockedLevels = normalizeNumberArray(mergedUnlockedLevels, [1]);

    const finalCompletedLevels = normalizeNumberArray(
      [...savedCompleted, ...progressCompletedLevels],
      []
    );

    setUnlockedLevels(finalUnlockedLevels);
    setCompletedLevels(finalCompletedLevels);

    localStorage.setItem("unlockedLevels", JSON.stringify(finalUnlockedLevels));
    localStorage.setItem(
      "completedLevels",
      JSON.stringify(finalCompletedLevels)
    );

    const selectedStage = Number(localStorage.getItem("selectedStage") || 1);
    const stage1Done = isStage1Finished(finalCompletedLevels);

    /*
      Pengaman:
      Kalau user belum selesai Stage 1 tapi maksa masuk Stage 2,
      langsung balikin ke halaman pilih stage.
    */
    if (selectedStage === 2 && !stage1Done) {
      alert("Stage 2 masih terkunci. Selesaikan semua level di Stage 1 dulu ya!");
      localStorage.setItem("selectedStage", "1");
      navigate("/stage-select");
      return;
    }

    setActiveStage(selectedStage === 2 ? 2 : 1);

    loadLevels();
  }, [navigate]);

  const currentStage = stageData[activeStage];

  const currentLevels = levels.filter(
    (item) =>
      Number(item.stage) === activeStage &&
      Number(item.level) >= currentStage.firstLevel &&
      Number(item.level) <= currentStage.lastLevel
  );

  const handleLevelClick = (level) => {
    const levelNumber = Number(level);
    const isUnlocked = unlockedLevels.includes(levelNumber);

    if (!isUnlocked) {
      alert("Level ini belum terbuka. Selesaikan level sebelumnya dulu ya.");
      return;
    }

    setSelectedLevel(levelNumber);
    setOpeningLevel(levelNumber);

    setTimeout(() => {
      navigate(`/simulation/${levelNumber}`);
    }, 500);
  };

  const selectedCharacterPosition =
    characterPositions[selectedLevel || currentStage.firstLevel];

  const isLevel3Unlocked = unlockedLevels.includes(3);

  return (
    <div className="map-photo-page">
      <img
        src={currentStage.background}
        alt={currentStage.title}
        className="map-photo-bg"
        draggable="false"
      />

      <div className="map-photo-overlay"></div>

      <button
        type="button"
        className="map-back-btn"
        onClick={() => navigate("/stage-select")}
      >
        ← Pilih Stage
      </button>

      <div className="map-title-card">
        <h1>{currentStage.title}</h1>
        <p>{currentStage.subtitle}</p>
      </div>

      {activeStage === 1 && isLevel3Unlocked && (
  <img
    src={level3Unlocked}
    alt="Level 3 terbuka"
    draggable="false"
    style={{
      position: "absolute",
      zIndex: 999,
      left: "50.1%",
      top: "43.3%",
      width: "112px",
      height: "auto",
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
      userSelect: "none",
      filter: "drop-shadow(0 8px 8px rgba(0, 0, 0, 0.28))",
    }}
  />
)}

      <img
        src={currentStage.character}
        alt="Karakter pemain"
        className="map-character"
        draggable="false"
        style={{
          left: selectedCharacterPosition.left,
          top: selectedCharacterPosition.top,
        }}
      />

      {currentLevels.map((level) => {
        const levelNumber = Number(level.level);
        const area = levelClickAreas[levelNumber];
        const isUnlocked = unlockedLevels.includes(levelNumber);

        if (!area) return null;

        return (
          <button
            key={levelNumber}
            type="button"
            className={`level-hotspot ${isUnlocked ? "unlocked" : "locked"} ${
              levelNumber === 3 && isUnlocked ? "level-3-unlocked" : ""
            }`}
            style={{
              left: area.left,
              top: area.top,
              width: area.width,
              height: area.height,
            }}
            onClick={() => handleLevelClick(levelNumber)}
            title={level.sign_name}
            aria-label={`Level ${levelNumber}: ${level.sign_name}`}
          >
            <span className="level-tooltip">
              Level {levelNumber}: {level.sign_name}
            </span>
          </button>
        );
      })}

      <div className="level-info-card">
        {selectedLevel ? (
          <>
            <img
              src={signImages[selectedLevel]}
              alt="Rambu level"
              className="level-info-sign"
              draggable="false"
            />
            <div>
              <h2>Level {selectedLevel}</h2>
              <p>
                {
                  levels.find((item) => Number(item.level) === selectedLevel)
                    ?.sign_name
                }
              </p>
            </div>
          </>
        ) : (
          <>
            <h2>
              Stage {activeStage}:{" "}
              {activeStage === 1 ? "Rambu Peringatan" : "Rambu Larangan"}
            </h2>
            <p>
              Level berikutnya akan terbuka setelah kamu menyelesaikan level
              sebelumnya dengan benar.
            </p>
          </>
        )}
      </div>

      {openingLevel && (
        <div className="opening-level-modal">
          Masuk ke Level {openingLevel}...
        </div>
      )}
    </div>
  );
};

export default LevelMap;