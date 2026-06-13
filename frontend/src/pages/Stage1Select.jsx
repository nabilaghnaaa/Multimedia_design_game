import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Stage1Select.css";

import stage1Bg from "../assets/stage-levels/stage1/stage1-bg.png";

import level1Unlocked from "../assets/stage-levels/stage1/level-1-unlocked.png";
import level2Locked from "../assets/stage-levels/stage1/level-2-locked.png";
import level2Unlocked from "../assets/stage-levels/stage1/level-2-unlocked.png";
import level3Locked from "../assets/stage-levels/stage1/level-3-locked.png";
import level3Unlocked from "../assets/stage-levels/stage1/level-3-unlocked.png";
import level4Locked from "../assets/stage-levels/stage1/level-4-locked.png";
import level4Unlocked from "../assets/stage-levels/stage1/level-4-unlocked.png";
import level5Locked from "../assets/stage-levels/stage1/level-5-locked.png";
import level5Unlocked from "../assets/stage-levels/stage1/level-5-unlocked.png";

const STAGE1_PROGRESS_KEY = "stage1-progress";

const stage1Levels = [
  {
    level: 1,
    title: "Level 1",
    lockedImage: level1Unlocked,
    unlockedImage: level1Unlocked,
    left: "19.5%",
    top: "42.5%",
    delay: "0.1s",
  },
  {
    level: 2,
    title: "Level 2",
    lockedImage: level2Locked,
    unlockedImage: level2Unlocked,
    left: "35.3%",
    top: "56.8%",
    delay: "0.25s",
  },
  {
    level: 3,
    title: "Level 3",
    lockedImage: level3Locked,
    unlockedImage: level3Unlocked,
    left: "51%",
    top: "42.5%",
    delay: "0.4s",
  },
  {
    level: 4,
    title: "Level 4",
    lockedImage: level4Locked,
    unlockedImage: level4Unlocked,
    left: "67.4%",
    top: "56.8%",
    delay: "0.55s",
  },
  {
    level: 5,
    title: "Level 5",
    lockedImage: level5Locked,
    unlockedImage: level5Unlocked,
    left: "82.2%",
    top: "42.5%",
    delay: "0.7s",
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

const Stage1Select = () => {
  const navigate = useNavigate();

  const [completedLevels, setCompletedLevels] = useState([]);
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
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

    const progressUnlockedLevel = Number(stage1Progress.unlockedLevel || 1);

    const mergedUnlockedLevels = [...new Set([...savedUnlockedLevels, 1])];

    if (Number.isFinite(progressUnlockedLevel)) {
      for (let level = 1; level <= progressUnlockedLevel; level += 1) {
        mergedUnlockedLevels.push(level);
      }
    }

    const finalUnlockedLevels = normalizeNumberArray(mergedUnlockedLevels, [1]);

    const finalCompletedLevels = normalizeNumberArray(
      [...savedCompletedLevels, ...progressCompletedLevels],
      []
    );

    setUnlockedLevels(finalUnlockedLevels);
    setCompletedLevels(finalCompletedLevels);

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
  }, []);

  const isLevelUnlocked = (levelNumber) => {
    const numberLevel = Number(levelNumber);

    if (numberLevel === 1) return true;

    return (
      unlockedLevels.includes(numberLevel) ||
      completedLevels.includes(numberLevel - 1)
    );
  };

  const isLevelCompleted = (levelNumber) => {
    return completedLevels.includes(Number(levelNumber));
  };

  const handleLevelClick = (levelNumber) => {
    const numberLevel = Number(levelNumber);
    const unlocked = isLevelUnlocked(numberLevel);

    if (!unlocked) {
      setPopupMessage(
        `Level ${numberLevel} masih terkunci. Selesaikan Level ${
          numberLevel - 1
        } dengan benar dulu ya!`
      );

      setTimeout(() => {
        setPopupMessage("");
      }, 2200);

      return;
    }

    localStorage.setItem("selectedStage", "1");
    localStorage.setItem("selectedLevel", String(numberLevel));

    navigate(`/simulation/${numberLevel}`);
  };

  return (
    <main className={`stage1-page ${showPage ? "show" : ""}`}>
      <img
        src={stage1Bg}
        alt="Stage 1 Rambu Peringatan"
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
        {stage1Levels.map((item) => {
          const unlocked = isLevelUnlocked(item.level);
          const completed = isLevelCompleted(item.level);
          const imageSrc = unlocked ? item.unlockedImage : item.lockedImage;

          return (
            <button
              key={item.level}
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
              onClick={() => handleLevelClick(item.level)}
              aria-label={
                unlocked
                  ? `Masuk ke Level ${item.level}`
                  : `Level ${item.level} masih terkunci`
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
                  ? `Mulai Level ${item.level}`
                  : `Selesaikan Level ${item.level - 1} dulu`}
              </span>
            </button>
          );
        })}
      </section>

      <section className="stage1-info-card">
        <h2>Stage 1: Rambu Peringatan</h2>
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
};

export default Stage1Select;