import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Stage1Select.css";

import stage2Bg from "../assets/stage-levels/stage2/stage2-bg.png";

import level1Unlocked from "../assets/stage-levels/stage1/level-1-unlocked.png";
import level2Locked from "../assets/stage-levels/stage1/level-2-locked.png";
import level2Unlocked from "../assets/stage-levels/stage1/level-2-unlocked.png";
import level3Locked from "../assets/stage-levels/stage1/level-3-locked.png";
import level3Unlocked from "../assets/stage-levels/stage1/level-3-unlocked.png";
import level4Locked from "../assets/stage-levels/stage1/level-4-locked.png";
import level4Unlocked from "../assets/stage-levels/stage1/level-4-unlocked.png";
import level5Locked from "../assets/stage-levels/stage1/level-5-locked.png";
import level5Unlocked from "../assets/stage-levels/stage1/level-5-unlocked.png";

import level6Locked from "../assets/stage-levels/stage2/level-6-locked.png";
import level6Unlocked from "../assets/stage-levels/stage2/level-6-unlocked.png";
import level7Locked from "../assets/stage-levels/stage2/level-7-locked.png";
import level7Unlocked from "../assets/stage-levels/stage2/level-7-unlocked.png";

const STAGE1_PROGRESS_KEY = "stage1-progress";

const stage2Levels = [
  {
    displayLevel: 1,
    actualLevel: 6,
    title: "Level 1",
    signName: "Batas Kecepatan Maksimum",
    lockedImage: level1Unlocked,
    unlockedImage: level1Unlocked,
    left: "18.4%",
    top: "40.4%",
    delay: "0.1s",
  },
  {
    displayLevel: 2,
    actualLevel: 7,
    title: "Level 2",
    signName: "Dilarang Menyalip",
    lockedImage: level2Locked,
    unlockedImage: level2Unlocked,
    left: "29.7%",
    top: "55.8%",
    delay: "0.22s",
  },
  {
    displayLevel: 3,
    actualLevel: 8,
    title: "Level 3",
    signName: "Dilarang Masuk",
    lockedImage: level3Locked,
    unlockedImage: level3Unlocked,
    left: "41%",
    top: "37.5%",
    delay: "0.34s",
  },
  {
    displayLevel: 4,
    actualLevel: 9,
    title: "Level 4",
    signName: "Dilarang Berhenti",
    lockedImage: level4Locked,
    unlockedImage: level4Unlocked,
    left: "48%",
    top: "61%",
    delay: "0.46s",
  },
  {
    displayLevel: 5,
    actualLevel: 10,
    title: "Level 5",
    signName: "Beri Prioritas",
    lockedImage: level5Locked,
    unlockedImage: level5Unlocked,
    left: "63%",
    top: "39%",
    delay: "0.58s",
  },
  {
    displayLevel: 6,
    actualLevel: 11,
    title: "Level 6",
    signName: "Dilarang Belok Kanan / Kiri",
    lockedImage: level6Locked,
    unlockedImage: level6Unlocked,
    left: "75%",
    top: "53%",
    delay: "0.7s",
  },
  {
    displayLevel: 7,
    actualLevel: 12,
    title: "Level 7",
    signName: "Dilarang Putar Balik",
    lockedImage: level7Locked,
    unlockedImage: level7Unlocked,
    left: "86.1%",
    top: "45.2%",
    delay: "0.82s",
  },
];

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
    const savedProgress = localStorage.getItem(STAGE1_PROGRESS_KEY);
    const parsedProgress = savedProgress ? JSON.parse(savedProgress) : {};

    return parsedProgress && typeof parsedProgress === "object"
      ? parsedProgress
      : {};
  } catch (error) {
    console.error("Gagal membaca stage1-progress:", error);
    return {};
  }
};

const isStage1Finished = (completedLevels) => {
  return [1, 2, 3, 4, 5].every((level) =>
    completedLevels.map(Number).includes(level)
  );
};

export default function LevelMap() {
  const navigate = useNavigate();

  const [completedLevels, setCompletedLevels] = useState([]);
  const [unlockedLevels, setUnlockedLevels] = useState([6]);
  const [showPage, setShowPage] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    document.body.classList.add("stage1-no-scroll");

    const savedCompletedLevels = safeParseArray("completedLevels", []);
    const savedUnlockedLevels = safeParseArray("unlockedLevels", [1]);
    const stage1Progress = safeParseStage1Progress();

    const progressCompletedLevels = normalizeNumberArray(
      stage1Progress.completedLevels || [],
      []
    );

    const finalCompletedLevels = normalizeNumberArray(
      [...savedCompletedLevels, ...progressCompletedLevels],
      []
    );

    const stage1Done = isStage1Finished(finalCompletedLevels);

    if (!stage1Done) {
      localStorage.setItem("selectedStage", "1");
      navigate("/stage-select");
      return () => {
        document.body.classList.remove("stage1-no-scroll");
      };
    }

    const mergedUnlockedLevels = [...new Set([...savedUnlockedLevels, 6])];

    for (let level = 6; level <= 12; level += 1) {
      if (finalCompletedLevels.includes(level - 1)) {
        mergedUnlockedLevels.push(level);
      }
    }

    const finalUnlockedLevels = normalizeNumberArray(mergedUnlockedLevels, [6]);

    setUnlockedLevels(finalUnlockedLevels);
    setCompletedLevels(finalCompletedLevels);

    localStorage.setItem("selectedStage", "2");
    localStorage.setItem("unlockedLevels", JSON.stringify(finalUnlockedLevels));
    localStorage.setItem(
      "completedLevels",
      JSON.stringify(finalCompletedLevels)
    );

    const timer = setTimeout(() => {
      setShowPage(true);
    }, 120);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove("stage1-no-scroll");
    };
  }, [navigate]);

  const isLevelUnlocked = (actualLevel) => {
    const numberLevel = Number(actualLevel);

    if (numberLevel === 6) return true;

    return (
      unlockedLevels.includes(numberLevel) ||
      completedLevels.includes(numberLevel - 1)
    );
  };

  const isLevelCompleted = (actualLevel) => {
    const numberLevel = Number(actualLevel);
    return completedLevels.includes(numberLevel);
  };

  const handleLevelClick = (item) => {
    const actualLevel = Number(item.actualLevel);
    const displayLevel = Number(item.displayLevel);

    if (!Number.isFinite(actualLevel)) {
      console.error("Level tidak valid:", item);
      return;
    }

    const unlocked = isLevelUnlocked(actualLevel);

    if (!unlocked) {
      setPopupMessage(
        `Stage 2 Level ${displayLevel} masih terkunci. Selesaikan level sebelumnya dengan benar dulu ya!`
      );

      setTimeout(() => {
        setPopupMessage("");
      }, 2200);

      return;
    }

    localStorage.setItem("selectedStage", "2");
    localStorage.setItem("selectedLevel", String(actualLevel));
    localStorage.setItem("selectedStage2Level", String(displayLevel));

    navigate(`/simulation/${actualLevel}`);
  };

  return (
    <main className={`stage1-page ${showPage ? "show" : ""}`}>
      <img
        src={stage2Bg}
        alt="Stage 2 Rambu Larangan"
        className="stage1-bg"
        draggable="false"
      />

      <button
        type="button"
        className="stage1-back-button"
        onClick={() => navigate("/stage-select")}
      >
        ← Pilih Stage
      </button>

      <section className="stage1-levels-layer">
        {stage2Levels.map((item) => {
          const unlocked = isLevelUnlocked(item.actualLevel);
          const completed = isLevelCompleted(item.actualLevel);
          const imageSrc = unlocked ? item.unlockedImage : item.lockedImage;

          return (
            <button
              key={item.actualLevel}
              type="button"
              className={`stage1-level-btn ${
                showPage ? "fade-in-visible" : ""
              } ${unlocked ? "is-unlocked" : "is-locked"} ${
                completed ? "is-completed" : ""
              }`}
              style={{
                left: item.left,
                top: item.top,
                animationDelay: item.delay,
              }}
              onClick={() => handleLevelClick(item)}
              aria-label={
                unlocked
                  ? `Masuk ke Stage 2 Level ${item.displayLevel}`
                  : `Stage 2 Level ${item.displayLevel} masih terkunci`
              }
            >
              <img
                src={imageSrc}
                alt={item.title}
                className="stage1-level-sign"
                draggable="false"
              />

              <span className="stage1-level-tooltip">
                {unlocked
                  ? `Mulai Level ${item.displayLevel}`
                  : `Selesaikan Level ${item.displayLevel - 1} dulu`}
              </span>
            </button>
          );
        })}
      </section>

      <section className="stage1-info-card">
        <h2>Stage 2: Rambu Larangan</h2>
        <p>
          Level berikutnya akan terbuka setelah kamu menyelesaikan level
          sebelumnya dengan benar.
        </p>
      </section>

      {popupMessage && (
        <div className="stage1-popup-message">{popupMessage}</div>
      )}
    </main>
  );
}